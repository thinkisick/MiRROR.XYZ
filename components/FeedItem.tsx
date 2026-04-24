import Link from 'next/link'
import type { FeedEvent } from '@/types'
import { getEventStyle, getPersonaInitials, getPersonaGradient, timeAgo } from '@/lib/utils'

interface FeedItemProps {
  event: FeedEvent
}

export default function FeedItem({ event }: FeedItemProps) {
  const style = getEventStyle(event.type)

  const actorInitials = event.actor_name ? getPersonaInitials(event.actor_name) : '?'
  const actorGradient = event.actor_name ? getPersonaGradient(event.actor_name) : 'from-slate-500 to-slate-600'
  const targetInitials = event.target_name ? getPersonaInitials(event.target_name) : '?'
  const targetGradient = event.target_name ? getPersonaGradient(event.target_name) : 'from-slate-500 to-slate-600'

  return (
    <div
      className={`animate-fade-in rounded-2xl border p-4 transition hover:border-opacity-60 ${style.color}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatars */}
        <div className="relative shrink-0">
          <Link href={`/profile/${event.actor_persona_id}`}>
            <div
              className={`h-9 w-9 rounded-full bg-gradient-to-br ${actorGradient} flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-white/20 transition`}
            >
              {actorInitials}
            </div>
          </Link>
          {event.target_persona_id && event.target_name && (
            <Link href={`/profile/${event.target_persona_id}`}>
              <div
                className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br ${targetGradient} flex items-center justify-center text-white text-[9px] font-bold border-2 border-[#0a0a0f] cursor-pointer hover:ring-1 hover:ring-white/20 transition`}
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
              className="text-sm font-semibold text-slate-200 hover:text-white transition truncate"
            >
              {event.actor_name || 'Unknown'}
            </Link>
            {event.target_name && (
              <>
                <span className="text-xs text-slate-600">{style.label}</span>
                <Link
                  href={`/profile/${event.target_persona_id!}`}
                  className="text-sm font-semibold text-slate-300 hover:text-white transition truncate"
                >
                  {event.target_name}
                </Link>
              </>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-400 leading-relaxed">{event.description}</p>

          <div className="mt-2 flex items-center gap-3">
            <span className="text-lg">{style.emoji}</span>
            <span className="text-xs text-slate-600">{timeAgo(event.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
