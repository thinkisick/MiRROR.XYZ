'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { FeedEvent } from '@/types'
import {
  getEventStyle,
  getDialogueSnippet,
  getPersonaInitials,
  getPersonaGradient,
  timeAgo,
} from '@/lib/utils'

const MINS_5 = 5 * 60 * 1000

interface FeedItemProps {
  event: FeedEvent
}

export default function FeedItem({ event }: FeedItemProps) {
  const router = useRouter()
  const style = getEventStyle(event.type)
  const [liked, setLiked] = useState(false)
  const [watching, setWatching] = useState(false)
  const [shared, setShared] = useState(false)
  const [likeCount] = useState(() => {
    const hash = event.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return (hash % 22) + 1
  })

  const actorInitials = event.actor_name ? getPersonaInitials(event.actor_name) : '?'
  const actorGradient = event.actor_name ? getPersonaGradient(event.actor_name) : 'from-slate-500 to-slate-600'
  const targetInitials = event.target_name ? getPersonaInitials(event.target_name) : '?'
  const targetGradient = event.target_name ? getPersonaGradient(event.target_name) : 'from-slate-500 to-slate-600'

  const dialogue = event.actor_name && event.target_name
    ? getDialogueSnippet(event.type, event.actor_name, event.target_name, event.id)
    : null

  const isRecent = Date.now() - new Date(event.created_at).getTime() < MINS_5
  const isUnexpected = event.type === 'unexpected'

  const handleCardClick = () => router.push(`/event/${event.id}`)

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/event/${event.id}`
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      // fallback: open share dialog if available
      if (navigator.share) {
        navigator.share({ title: `${event.actor_name} drama`, url })
      }
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer rounded-2xl border p-4 transition-all hover:brightness-110 ${style.color} ${
        isUnexpected ? 'ring-1 ring-amber-500/30' : ''
      }`}
    >
      {/* Unexpected event banner */}
      {isUnexpected && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
            ⚠️ Unexpected behavior detected
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatars */}
        <div className="relative shrink-0">
          <Link href={`/profile/${event.actor_persona_id}`} onClick={(e) => e.stopPropagation()}>
            <div
              className={`h-9 w-9 rounded-full bg-gradient-to-br ${actorGradient} flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-white/30 transition`}
            >
              {actorInitials}
            </div>
          </Link>
          {event.target_persona_id && event.target_name && (
            <Link href={`/profile/${event.target_persona_id}`} onClick={(e) => e.stopPropagation()}>
              <div
                className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br ${targetGradient} flex items-center justify-center text-white text-[9px] font-bold border-2 border-[#0a0a0f] hover:ring-1 hover:ring-white/30 transition`}
              >
                {targetInitials}
              </div>
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Headline */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isRecent && (
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
              </span>
            )}
            <Link
              href={`/profile/${event.actor_persona_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-slate-200 hover:text-white transition"
            >
              {event.actor_name || 'Unknown'}
            </Link>
            {event.target_name && (
              <>
                <span className={`text-xs ${style.accent}`}>{style.label}</span>
                <Link
                  href={`/profile/${event.target_persona_id!}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-semibold text-slate-300 hover:text-white transition"
                >
                  {event.target_name}
                </Link>
              </>
            )}
          </div>

          {/* Description */}
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">{event.description}</p>

          {/* Dialogue preview */}
          {dialogue && (
            <div className="mt-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 space-y-1">
              <p className="text-xs text-slate-300 leading-relaxed">{dialogue[0]}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{dialogue[1]}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-base">{style.emoji}</span>
            <span className="text-xs text-slate-600">{timeAgo(event.created_at)}</span>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setLiked((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition hover:bg-white/5 ${
                  liked ? 'text-pink-400' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                ❤️ {liked ? likeCount + 1 : likeCount}
              </button>
              <button
                onClick={() => setWatching((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition hover:bg-white/5 ${
                  watching ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {watching ? '👀 watching' : '👀'}
              </button>
              <button
                onClick={handleShare}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition hover:bg-white/5 ${
                  shared ? 'text-green-400' : 'text-slate-600 hover:text-slate-400'
                }`}
                title="Share this drama"
              >
                {shared ? '✓ copied' : '🔗'}
              </button>
            </div>

            <span className="hidden text-xs text-slate-700 group-hover:text-slate-500 transition md:block shrink-0">
              read more →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
