import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/help-requests/[id]/respond — called when a user clicks "I can help"
// Returns the target persona_id so caller can open a chat
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { responder_persona_id } = body

    if (!responder_persona_id) {
      return NextResponse.json({ error: 'Missing responder_persona_id' }, { status: 400 })
    }

    const helpRequest = await db.getHelpRequest(params.id)
    if (!helpRequest) {
      return NextResponse.json({ error: 'Help request not found' }, { status: 404 })
    }

    if (helpRequest.persona_id === responder_persona_id) {
      return NextResponse.json({ error: 'Cannot respond to your own request' }, { status: 400 })
    }

    // Increment response count
    await db.updateHelpRequest(params.id, {
      response_count: helpRequest.response_count + 1,
      status: helpRequest.response_count >= 4 ? 'in_progress' : 'open',
    })

    // Return chat route info so the client can open the chat
    return NextResponse.json({
      chat_with_persona_id: helpRequest.persona_id,
      help_request_id: params.id,
      help_request_title: helpRequest.title,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to respond to help request' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const allowed = ['status']
    const updates = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowed.includes(key)),
    )
    const updated = await db.updateHelpRequest(params.id, updates)
    if (!updated) {
      return NextResponse.json({ error: 'Help request not found' }, { status: 404 })
    }
    return NextResponse.json({ request: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update help request' }, { status: 500 })
  }
}
