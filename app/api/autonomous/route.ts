import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateAutonomousAction } from '@/lib/ai'

// Protect this endpoint in production with a cron secret
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // allow in dev
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const personas = await db.getPersonas()

    if (personas.length < 2) {
      return NextResponse.json({ message: 'Not enough personas for autonomous actions' })
    }

    // Pick 1–3 random pairs
    const count = Math.min(Math.floor(Math.random() * 3) + 1, Math.floor(personas.length / 2))
    const events = []
    const used = new Set<string>()

    for (let i = 0; i < count; i++) {
      const available = personas.filter((p) => !used.has(p.id))
      if (available.length < 2) break

      const shuffled = available.sort(() => Math.random() - 0.5)
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

    return NextResponse.json({ events, count: events.length })
  } catch (error) {
    console.error('Autonomous action error:', error)
    return NextResponse.json({ error: 'Failed to generate autonomous actions' }, { status: 500 })
  }
}
