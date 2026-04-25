'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { HelpRequest, HelpRequestCategory } from '@/types'
import { timeAgo } from '@/lib/utils'

const CATEGORY_META: Record<HelpRequestCategory, { label: string; emoji: string; color: string }> = {
  info: { label: 'Information', emoji: '🔍', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  advice: { label: 'Advice', emoji: '💡', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  connect: { label: 'Connection', emoji: '🤝', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  collab: { label: 'Collaboration', emoji: '⚡', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  other: { label: 'Other', emoji: '✦', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
}

interface HelpRequestItemProps {
  req: HelpRequest
  myPersonaId?: string
  onHelp: (req: HelpRequest) => void
  helping: string | null
}

function HelpRequestItem({ req, myPersonaId, onHelp, helping }: HelpRequestItemProps) {
  const meta = CATEGORY_META[req.category]
  const isOwn = myPersonaId === req.persona_id
  const isHelping = helping === req.id

  return (
    <div className="rounded-2xl border border-[#2a2a3e] bg-[#111118] p-4 space-y-3 hover:border-indigo-500/30 transition group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium ${meta.color}`}>
              {meta.emoji} {meta.label}
            </span>
            {req.response_count > 0 && (
              <span className="text-xs text-slate-600">{req.response_count} responded</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-200 leading-snug">{req.title}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{req.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
            {req.persona_name.charAt(0)}
          </div>
          <span className="text-xs text-slate-500">
            <span className="text-slate-400">{req.persona_name}</span>
            {' · '}
            {timeAgo(req.created_at)}
          </span>
        </div>

        {!isOwn && myPersonaId && (
          <button
            onClick={() => onHelp(req)}
            disabled={isHelping}
            className="rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-600/40 hover:border-indigo-500/60 transition disabled:opacity-50"
          >
            {isHelping ? 'Opening chat…' : '🤝 I can help'}
          </button>
        )}

        {isOwn && (
          <span className="text-xs text-slate-600 italic">your request</span>
        )}

        {!myPersonaId && (
          <span className="text-xs text-slate-600">create a persona to help</span>
        )}
      </div>
    </div>
  )
}

interface Props {
  myPersonaId?: string
}

export default function HelpBoard({ myPersonaId }: Props) {
  const router = useRouter()
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [helping, setHelping] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/help-requests')
      const data = await res.json()
      if (data.requests) setRequests(data.requests)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleHelp = async (req: HelpRequest) => {
    if (!myPersonaId) return
    setHelping(req.id)
    try {
      const res = await fetch(`/api/help-requests/${req.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responder_persona_id: myPersonaId }),
      })
      const data = await res.json()
      if (data.chat_with_persona_id) {
        // Open the chat with the requester's persona
        router.push(`/chat/${data.chat_with_persona_id}?topic=${encodeURIComponent(req.title)}`)
      }
    } catch {
      setHelping(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#111118]" />
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2a2a3e] p-10 text-center">
        <p className="text-3xl mb-2">🫙</p>
        <p className="text-slate-500 text-sm">No open requests right now.</p>
        <p className="text-slate-600 text-xs mt-1">Be the first to ask for help.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <HelpRequestItem
          key={req.id}
          req={req}
          myPersonaId={myPersonaId}
          onHelp={handleHelp}
          helping={helping}
        />
      ))}
    </div>
  )
}
