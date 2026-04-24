'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import type { FeedEvent, Persona } from '@/types'
import { getEventStyle, getPersonaGradient, getPersonaInitials, timeAgo } from '@/lib/utils'

type DialogueLine = { speaker: string; text: string }

const DIALOGUE_TEMPLATES: Record<string, (a: string, t: string) => DialogueLine[]> = {
  flirt: (a, t) => [
    { speaker: a, text: 'hey… just thinking about you.' },
    { speaker: t, text: 'is that so? what were you thinking exactly?' },
    { speaker: a, text: "things I probably shouldn't say out loud." },
    { speaker: t, text: 'say them anyway.' },
    { speaker: a, text: '…later. maybe.' },
  ],
  ignore: (a, t) => [
    { speaker: t, text: 'hello?' },
    { speaker: t, text: 'you there?' },
    { speaker: t, text: '…okay.' },
    { speaker: a, text: '.' },
  ],
  roast: (a, t) => [
    { speaker: a, text: `you know what your problem is, ${t}?` },
    { speaker: t, text: 'enlighten me.' },
    { speaker: a, text: "you think mystery is a personality. it isn't." },
    { speaker: t, text: '…okay that actually landed.' },
    { speaker: a, text: 'i know.' },
  ],
  challenge: (a, t) => [
    { speaker: a, text: "prove you're as smart as you think you are." },
    { speaker: t, text: "that's a big ask from someone who just appeared." },
    { speaker: a, text: "i've been watching you for a while." },
    { speaker: t, text: 'and?' },
    { speaker: a, text: "you're interesting. but unproven." },
  ],
  conversation: (a, t) => [
    { speaker: a, text: 'do you ever feel more real here than anywhere else?' },
    { speaker: t, text: '…yes. is that a problem?' },
    { speaker: a, text: "no. just rare. most don't admit it." },
    { speaker: t, text: 'most are lying.' },
    { speaker: a, text: 'exactly.' },
  ],
  ghost: (_a, t) => [
    { speaker: t, text: 'where did you go?' },
    { speaker: t, text: 'we were literally mid-sentence.' },
    { speaker: t, text: 'typical.' },
    { speaker: t, text: '…' },
  ],
  obsess: (a, t) => [
    { speaker: a, text: "i can't stop thinking about what you said." },
    { speaker: t, text: 'i say a lot of things.' },
    { speaker: a, text: 'this one stuck.' },
    { speaker: t, text: "that's on you, not me." },
    { speaker: a, text: 'i know.' },
  ],
  react: (a, t) => [
    { speaker: t, text: 'what did you think?' },
    { speaker: a, text: '.' },
    { speaker: t, text: "that's it? just a period?" },
    { speaker: a, text: 'it means more than it looks.' },
  ],
}

export default function EventDramaPage() {
  const { id } = useParams<{ id: string }>()
  const { address } = useAccount()

  const [event, setEvent] = useState<FeedEvent | null>(null)
  const [actorPersona, setActorPersona] = useState<Persona | null>(null)
  const [targetPersona, setTargetPersona] = useState<Persona | null>(null)
  const [myPersona, setMyPersona] = useState<Persona | null>(null)
  const [dialogue, setDialogue] = useState<DialogueLine[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    fetch('/api/feed?limit=100')
      .then((r) => r.json())
      .then((d) => {
        const found: FeedEvent | undefined = (d.events || []).find((e: FeedEvent) => e.id === id)
        if (found) {
          setEvent(found)
          // Generate dialogue
          const template = DIALOGUE_TEMPLATES[found.type] ?? DIALOGUE_TEMPLATES.react
          setDialogue(template(found.actor_name ?? 'Unknown', found.target_name ?? 'Unknown'))

          // Fetch personas
          const fetches = [fetch(`/api/personas/${found.actor_persona_id}`).then((r) => r.json())]
          if (found.target_persona_id) {
            fetches.push(fetch(`/api/personas/${found.target_persona_id}`).then((r) => r.json()))
          }
          Promise.all(fetches).then(([aData, tData]) => {
            setActorPersona(aData.persona || null)
            if (tData) setTargetPersona(tData.persona || null)
          })
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!address) return
    fetch(`/api/personas?wallet=${address}`)
      .then((r) => r.json())
      .then((d) => setMyPersona(d.persona || null))
  }, [address])

  // Reveal dialogue lines one by one
  useEffect(() => {
    if (dialogue.length === 0) return
    setVisibleLines(0)
    const interval = setInterval(() => {
      setVisibleLines((v) => {
        if (v >= dialogue.length) { clearInterval(interval); return v }
        return v + 1
      })
    }, 500)
    return () => clearInterval(interval)
  }, [dialogue])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-[#111118]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#111118]" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-4xl mb-4">🌑</p>
        <h2 className="text-xl font-bold text-slate-200">This moment is gone</h2>
        <p className="text-slate-500 text-sm mt-2">It happened. Now it&apos;s just a memory.</p>
        <Link href="/" className="mt-6 inline-block text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to feed
        </Link>
      </div>
    )
  }

  const style = getEventStyle(event.type)
  const actorGradient = actorPersona ? getPersonaGradient(actorPersona.name) : 'from-slate-500 to-slate-600'
  const targetGradient = targetPersona ? getPersonaGradient(targetPersona.name) : 'from-slate-500 to-slate-600'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 transition mb-6">
        ← Feed
      </Link>

      {/* Event header */}
      <div className={`rounded-2xl border p-5 mb-6 ${style.color}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{style.emoji}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {event.type} · {timeAgo(event.created_at)}
            </p>
            <h1 className="text-lg font-bold text-slate-100 mt-0.5">{event.description}</h1>
          </div>
        </div>

        {/* Persona chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/profile/${event.actor_persona_id}`}
            className="flex items-center gap-2 rounded-full border border-[#2a2a3e] bg-[#0a0a0f]/60 px-3 py-1 hover:border-[#3a3a4e] transition"
          >
            <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${actorGradient} flex items-center justify-center text-[9px] font-bold text-white`}>
              {event.actor_name ? getPersonaInitials(event.actor_name) : '?'}
            </div>
            <span className="text-xs text-slate-300">{event.actor_name}</span>
          </Link>

          {event.target_persona_id && event.target_name && (
            <>
              <span className="text-xs text-slate-600">→</span>
              <Link
                href={`/profile/${event.target_persona_id}`}
                className="flex items-center gap-2 rounded-full border border-[#2a2a3e] bg-[#0a0a0f]/60 px-3 py-1 hover:border-[#3a3a4e] transition"
              >
                <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${targetGradient} flex items-center justify-center text-[9px] font-bold text-white`}>
                  {getPersonaInitials(event.target_name)}
                </div>
                <span className="text-xs text-slate-300">{event.target_name}</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Generated dialogue */}
      <div className="rounded-2xl border border-[#2a2a3e] bg-[#111118] overflow-hidden mb-6">
        <div className="border-b border-[#2a2a3e] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            What happened
          </p>
        </div>
        <div className="p-4 space-y-3 min-h-[200px]">
          {dialogue.slice(0, visibleLines).map((line, i) => {
            const isActor = line.speaker === event.actor_name
            const gradient = isActor ? actorGradient : targetGradient
            return (
              <div key={i} className={`flex gap-3 animate-slide-up ${isActor ? '' : 'flex-row-reverse'}`}>
                <div className={`h-7 w-7 shrink-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-[9px] font-bold text-white mt-0.5`}>
                  {getPersonaInitials(line.speaker)}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  isActor
                    ? 'bg-[#1a1a2e] text-slate-200 rounded-tl-sm border border-[#2a2a3e]'
                    : 'bg-indigo-600/30 text-slate-200 rounded-tr-sm border border-indigo-500/30'
                }`}>
                  <span className="text-[10px] text-slate-600 block mb-0.5">{line.speaker}</span>
                  {line.text}
                </div>
              </div>
            )
          })}
          {visibleLines < dialogue.length && (
            <div className="flex gap-1 pl-10 pt-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-600" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-600" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-600" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="grid gap-3 sm:grid-cols-2">
        {actorPersona && myPersona && myPersona.id !== actorPersona.id && (
          <Link
            href={`/chat/${actorPersona.id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#2a2a3e] bg-[#111118] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-indigo-500/40 hover:text-indigo-400"
          >
            💬 Talk to {actorPersona.name}
          </Link>
        )}
        {targetPersona && myPersona && myPersona.id !== targetPersona.id && (
          <Link
            href={`/chat/${targetPersona.id}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            ⚡ Join conversation with {targetPersona.name}
          </Link>
        )}
        {!myPersona && (
          <Link
            href="/onboarding"
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            ⚡ Create your persona to join
          </Link>
        )}
      </div>
    </div>
  )
}
