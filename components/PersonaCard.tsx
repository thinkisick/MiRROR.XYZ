import Link from 'next/link'
import type { Persona } from '@/types'
import { getPersonaInitials, getPersonaGradient, getTraitColor, getModeColor, timeAgo } from '@/lib/utils'

interface PersonaCardProps {
  persona: Persona
  compact?: boolean
  showChat?: boolean
}

export default function PersonaCard({ persona, compact = false, showChat = false }: PersonaCardProps) {
  const initials = getPersonaInitials(persona.name)
  const gradient = getPersonaGradient(persona.name)

  if (compact) {
    return (
      <Link
        href={`/profile/${persona.id}`}
        className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/5 group"
      >
        <div
          className={`relative h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}
        >
          {initials}
          {persona.nft_token_id && (
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-indigo-500 border border-[#0a0a0f] flex items-center justify-center text-[6px] text-white">
              ◆
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
            {persona.name}
          </p>
          <p className={`text-xs ${getModeColor(persona.behavior_mode)} capitalize`}>
            {persona.behavior_mode}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <div className="rounded-2xl border border-[#2a2a3e] bg-[#111118] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`relative h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold`}
          >
            {initials}
            {persona.nft_token_id && (
              <span className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full bg-indigo-500 border-2 border-[#111118] flex items-center justify-center text-[9px] text-white">
                ◆
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{persona.name}</h2>
            <span
              className={`text-xs font-medium capitalize ${getModeColor(persona.behavior_mode)}`}
            >
              {persona.behavior_mode} mode
            </span>
          </div>
        </div>

        <div className="text-right text-xs text-slate-600">
          <div className="text-slate-400 font-medium">{persona.message_count.toLocaleString()}</div>
          <div>messages</div>
        </div>
      </div>

      {/* Description */}
      {persona.description && (
        <p className="text-sm text-slate-400 leading-relaxed">{persona.description}</p>
      )}

      {/* Traits */}
      <div className="flex flex-wrap gap-2">
        {persona.traits.map((trait) => (
          <span
            key={trait}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getTraitColor(trait)}`}
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-xs text-slate-600">
          {persona.wallet_address.slice(0, 6)}...{persona.wallet_address.slice(-4)}
        </span>
        <span className="text-xs text-slate-600">{timeAgo(persona.created_at)}</span>
      </div>

      {/* Actions */}
      {showChat && (
        <Link
          href={`/chat/${persona.id}`}
          className="block w-full rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-4 py-2.5 text-center text-sm font-medium text-indigo-400 transition hover:bg-indigo-500/25 hover:text-indigo-300"
        >
          Chat with {persona.name}
        </Link>
      )}
    </div>
  )
}
