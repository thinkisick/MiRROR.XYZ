import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { CreatePersonaInput } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get('wallet')

  try {
    if (wallet) {
      const persona = await db.getPersonaByWallet(wallet)
      return NextResponse.json({ persona })
    }
    const personas = await db.getPersonas()
    return NextResponse.json({ personas })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch personas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: CreatePersonaInput = await request.json()

    if (!body.wallet_address || !body.name || !body.traits?.length || !body.behavior_mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (body.traits.length < 2 || body.traits.length > 3) {
      return NextResponse.json({ error: 'Select 2-3 traits' }, { status: 400 })
    }

    const existing = await db.getPersonaByWallet(body.wallet_address)
    if (existing) {
      return NextResponse.json({ error: 'Wallet already has a persona' }, { status: 409 })
    }

    const persona = await db.createPersona({
      wallet_address: body.wallet_address.toLowerCase(),
      name: body.name.trim(),
      description: body.description?.trim() || '',
      traits: body.traits,
      behavior_mode: body.behavior_mode,
      nft_token_id: null,
    })

    return NextResponse.json({ persona }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create persona' }, { status: 500 })
  }
}
