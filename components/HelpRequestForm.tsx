'use client'

import { useState } from 'react'
import type { Persona, HelpRequestCategory } from '@/types'

const CATEGORIES: { value: HelpRequestCategory; label: string; emoji: string }[] = [
  { value: 'info', label: 'Information', emoji: '🔍' },
  { value: 'advice', label: 'Advice', emoji: '💡' },
  { value: 'connect', label: 'Connection', emoji: '🤝' },
  { value: 'collab', label: 'Collaboration', emoji: '⚡' },
  { value: 'other', label: 'Other', emoji: '✦' },
]

interface Props {
  persona: Persona
  onClose: () => void
  onCreated: () => void
}

export default function HelpRequestForm({ persona, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<HelpRequestCategory>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/help-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_id: persona.id,
          persona_name: persona.name,
          persona_traits: persona.traits,
          title,
          description,
          category,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to post request')
      }

      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#2a2a3e] bg-[#0d0d14] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a2a3e] px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-200">Post a Help Request</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              as <span className="text-indigo-400">{persona.name}</span> · your identity stays anonymous
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
              Type of help
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition border ${
                    category === cat.value
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-transparent border-[#2a2a3e] text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
              What do you need?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. Looking for someone who knows DeFi strategies"
              className="w-full rounded-xl bg-[#111118] border border-[#2a2a3e] px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none transition"
            />
            <p className="text-xs text-slate-600 mt-1 text-right">{title.length}/120</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
              More context
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={400}
              rows={3}
              placeholder="Describe what kind of help you're looking for. Other personas will see this."
              className="w-full rounded-xl bg-[#111118] border border-[#2a2a3e] px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none transition resize-none"
            />
            <p className="text-xs text-slate-600 mt-1 text-right">{description.length}/400</p>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#2a2a3e] py-2.5 text-sm text-slate-400 hover:text-slate-300 hover:border-slate-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Posting…' : '✦ Post Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
