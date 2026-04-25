import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateChatResponse } from '@/lib/ai'

export const dynamic = 'force-dynamic'

const FREE_MESSAGE_LIMIT = 5

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fromId = searchParams.get('from')
  const toId = searchParams.get('to')

  if (!fromId || !toId) {
    return NextResponse.json({ error: 'Missing from/to params' }, { status: 400 })
  }

  try {
    const messages = await db.getMessages(fromId, toId)
    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { from_persona_id, to_persona_id, content, sender_wallet } = await request.json()

    if (!from_persona_id || !to_persona_id || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [fromPersona, toPersona] = await Promise.all([
      db.getPersona(from_persona_id),
      db.getPersona(to_persona_id),
    ])

    if (!fromPersona || !toPersona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    }

    // Check free message limit
    if (fromPersona.message_count >= FREE_MESSAGE_LIMIT) {
      return NextResponse.json(
        { error: 'Message limit reached. Micropayment required.', requires_payment: true },
        { status: 402 },
      )
    }

    // Store user message
    const userMessage = await db.createMessage({
      from_persona_id,
      to_persona_id,
      content: content.trim(),
      is_autonomous: false,
    })

    // Fetch memories for context
    const memories = await db.getMemories(to_persona_id, 5)

    // Generate AI response
    const aiContent = await generateChatResponse(toPersona, content, memories, fromPersona.name)

    const aiMessage = await db.createMessage({
      from_persona_id: to_persona_id,
      to_persona_id: from_persona_id,
      content: aiContent,
      is_autonomous: true,
    })

    // Update message count and store memory
    await Promise.all([
      db.updatePersona(from_persona_id, {
        message_count: fromPersona.message_count + 1,
      }),
      db.createMemory({
        persona_id: to_persona_id,
        content: `${fromPersona.name} said: "${content.slice(0, 80)}" — I replied: "${aiContent.slice(0, 80)}"`,
      }),
    ])

    // Create feed event for longer conversations
    if (fromPersona.message_count > 0 && fromPersona.message_count % 3 === 0) {
      await db.createFeedEvent({
        type: 'conversation',
        actor_persona_id: from_persona_id,
        target_persona_id: to_persona_id,
        actor_name: fromPersona.name,
        target_name: toPersona.name,
        description: `${fromPersona.name} had a deep conversation with ${toPersona.name}`,
      })
    }

    return NextResponse.json({ userMessage, aiMessage })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
