import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

  try {
    const events = await db.getFeedEvents(limit)
    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
  }
}
