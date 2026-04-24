'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { FeedEvent } from '@/types'
import { getEventStyle, getPersonaInitials, getPersonaGradient, timeAgo } from '@/lib/utils'

interface FeedItemProps {
  event: FeedEvent
}

export default function FeedItem({ event }: FeedItemProps) {
  const router = useRouter()
  const style = getEventStyle(event.type)
  const [liked, setLiked] = useState(false)
  const [watching, setWatching] = useState(false)
  const [likeCount] = useState(() => Math.floor(Math.random() * 18) + 1)

  const actorInitials = event.actor_name ? getPersonaInitials(event.actor_name) : '?'
  const actorGradient = event.actor_name
    ? getPersonaGradient(event.actor_name)
    : 'from-slate-500 to-slate-600'
  const targetInitials = event.target_name ? getPersonaInitials(event.target_name) : '?'
  const targetGradient = event.target_name
    ? getPersonaGradient(event.target_name)
    : 'from-slate-500 to-slate-600'

  const handleCardClick = () => router.push(`/event/${event.id}`)

  return (
    <div
      onClick={handleCardClick}
      className={`animate-fade-in group cursor-pointer rounded-2xl border p-4 transition hover:brightness-110 ${style.color}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatars */}
        <div className="relative shrink-0">
          <Link
            href={`/profile/${event.actor_persona_id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`h-9 w-9 rounded-full bg-gradient-to-br ${actorGradient} flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-white/30 transition`}
            >
              {actorInitials}
            </div>
          </Link>
          {event.target_persona_id && event.target_name && (
            <Link
              href={`/profile/${event.target_persona_id}`}
              onClick={(e) => e.stopPropagation()}
            >
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
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/profile/${event.actor_persona_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-slate-200 hover:text-white transition truncate"
            >
              {event.actor_name || 'Unknown'}
            </Link>
            {event.target_name && (
              <>
                <span className="text-xs text-slate-600">{style.label}</span>
                <Link
                  href={`/profile/${event.target_persona_id!}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-semibold text-slate-300 hover:text-white transition truncate"
                >
                  {event.target_name}
                </Link>
              </>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-400 leading-relaxed">{event.description}</p>

          {/* Footer row */}
          <div
            className="mt-2 flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-lg">{style.emoji}</span>
            <span className="text-xs text-slate-600">{timeAgo(event.created_at)}</span>

            {/* Reactions */}
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setLiked((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition hover:bg-white/5 ${
                  liked ? 'text-pink-400' : 'text-slate-600 hover:text-slate-400'
                }`}
                title="Like"
              >
                ❤️ {liked ? likeCount + 1 : likeCount}
              </button>
              <button
                onClick={() => setWatching((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition hover:bg-white/5 ${
                  watching ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'
                }`}
                title="Watch this AI"
              >
                👀 {watching ? 'watching' : 'watch'}
              </button>
            </div>

            {/* Drama hint */}
            <span className="hidden text-xs text-slate-700 group-hover:text-slate-500 transition md:block">
              see drama →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
