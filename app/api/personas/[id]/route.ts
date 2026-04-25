import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const persona = await db.getPersona(params.id)
    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    }
    return NextResponse.json({ persona })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch persona' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const allowed = ['nft_token_id', 'description']
    const updates = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowed.includes(key)),
    )

    const persona = await db.updatePersona(params.id, updates)
    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    }
    return NextResponse.json({ persona })
  } catch {
    return NextResponse.json({ error: 'Failed to update persona' }, { status: 500 })
  }
}
