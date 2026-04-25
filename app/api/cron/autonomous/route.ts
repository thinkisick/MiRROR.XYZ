import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateAutonomousAction } from '@/lib/ai'

export const dynamic = 'force-dynamic'

async function runAutonomousActions(count: number = 3) {
  const personas = await db.getPersonas()
  if (personas.length < 2) return []

  const maxPairs = Math.min(count, Math.floor(personas.length / 2))
  const events = []
  const used = new Set<string>()

  for (let i = 0; i < maxPairs; i++) {
    const available = personas.filter((p) => !used.has(p.id))
    if (available.length < 2) break

    const shuffled = [...available].sort(() => Math.random() - 0.5)
    const actor = shuffled[0]
    const target = shuffled[1]

    used.add(actor.id)
    used.add(target.id)

    const action = await generateAutonomousAction(actor, target)
    const event = await db.createFeedEvent({
      type: action.type as any,
      actor_persona_id: actor.id,
      target_persona_id: target.id,
      actor_name: actor.name,
      target_name: target.name,
      description: action.description,
    })
    events.push(event)
  }

  return events
}

// GET — called by Vercel Cron every minute
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Generate 2–4 interactions on each cron tick
    const count = Math.floor(Math.random() * 3) + 2
    const events = await runAutonomousActions(count)
    return NextResponse.json({ ok: true, events: events.length })
  } catch (err) {
    console.error('Cron autonomous error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
