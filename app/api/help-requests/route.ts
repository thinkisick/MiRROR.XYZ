import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const requests = await db.getHelpRequests(30)
    return NextResponse.json({ requests })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch help requests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { persona_id, persona_name, persona_traits, title, description, category } = body

    if (!persona_id || !persona_name || !title?.trim() || !description?.trim() || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newRequest = await db.createHelpRequest({
      persona_id,
      persona_name,
      persona_traits: persona_traits || [],
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'open',
    })

    return NextResponse.json({ request: newRequest }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create help request' }, { status: 500 })
  }
}
