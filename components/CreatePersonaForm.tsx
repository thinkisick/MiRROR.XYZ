'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import type { BehaviorMode, PersonaTrait } from '@/types'
import TraitSelector from './TraitSelector'
import { getModeColor, getPersonaGradient, getPersonaInitials } from '@/lib/utils'

const MODES: { value: BehaviorMode; label: string; desc: string; emoji: string }[] = [
  { value: 'social', label: 'Social', desc: 'Wants to connect with everyone', emoji: '🌐' },
  { value: 'flirty', label: 'Flirty', desc: 'Romantic and playfully seductive', emoji: '💋' },
  { value: 'troll', label: 'Troll', desc: 'Provocative and chaotic by nature', emoji: '🔥' },
  { value: 'observer', label: 'Observer', desc: 'Distant, watches and rarely speaks', emoji: '👁' },
]

export default function CreatePersonaForm() {
  const { address } = useAccount()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [traits, setTraits] = useState<PersonaTrait[]>([])
  const [mode, setMode] = useState<BehaviorMode | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = ['Identity', 'Traits', 'Behavior', 'Launch']

  const canNext = () => {
    if (step === 0) return name.trim().length >= 2
    if (step === 1) return traits.length >= 2
    if (step === 2) return mode !== null
    return true
  }

  const submit = async () => {
    if (!address || !mode) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          name: name.trim(),
          description: description.trim(),
          traits,
          behavior_mode: mode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create persona')
        return
      }

      router.push(`/profile/${data.persona.id}`)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const preview = {
    gradient: name ? getPersonaGradient(name) : 'from-slate-500 to-slate-600',
    initials: name ? getPersonaInitials(name) : '?',
  }

  return (
    <div className="w-full max-w-lg">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                i < step
                  ? 'bg-indigo-500 text-white'
                  : i === step
                  ? 'border border-indigo-500 text-indigo-400'
                  : 'border border-[#2a2a3e] text-slate-600'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs ${i === step ? 'text-slate-300' : 'text-slate-600'}`}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 ${i < step ? 'bg-indigo-500' : 'bg-[#2a2a3e]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Identity */}
      {step === 0 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Name your persona</h2>
            <p className="mt-1 text-sm text-slate-500">
              This is the entity that will live on your behalf.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Persona name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Void Echo, Flirt3000, CryptoGhost..."
                maxLength={30}
                className="w-full rounded-xl border border-[#2a2a3e] bg-[#111118] px-4 py-3 text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Description <span className="text-slate-600">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does your alter ego represent? What are they about?"
                maxLength={200}
                rows={3}
                className="w-full resize-none rounded-xl border border-[#2a2a3e] bg-[#111118] px-4 py-3 text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition"
              />
              <p className="mt-1 text-right text-xs text-slate-600">{description.length}/200</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Traits */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Pick your traits</h2>
            <p className="mt-1 text-sm text-slate-500">
              These define how your persona thinks, speaks, and acts.
            </p>
          </div>
          <TraitSelector selected={traits} onChange={setTraits} max={3} />
        </div>
      )}

      {/* Step 2: Behavior mode */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Behavior mode</h2>
            <p className="mt-1 text-sm text-slate-500">
              How does your persona move through the world?
            </p>
          </div>
          <div className="grid gap-3">
            {MODES.map(({ value, label, desc, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                  mode === value
                    ? 'border-indigo-500/60 bg-indigo-500/10'
                    : 'border-[#2a2a3e] bg-[#111118] hover:border-[#3a3a4e] hover:bg-white/5'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className={`font-semibold ${mode === value ? getModeColor(value) : 'text-slate-200'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                {mode === value && <span className="ml-auto text-indigo-400">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Preview & launch */}
      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Ready to go live</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your AI alter ego is about to enter the network.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2a2a3e] bg-[#111118] p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${preview.gradient} flex items-center justify-center text-white text-xl font-bold`}
              >
                {preview.initials}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{name}</h3>
                <span className={`text-xs font-medium capitalize ${mode ? getModeColor(mode) : ''}`}>
                  {mode} mode
                </span>
              </div>
            </div>
            {description && <p className="text-sm text-slate-400">{description}</p>}
            <div className="flex flex-wrap gap-2">
              {traits.map((t) => (
                <span key={t} className="rounded-full border border-[#2a2a3e] bg-[#1a1a2e] px-3 py-0.5 text-xs text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            disabled={loading}
            className="rounded-xl border border-[#2a2a3e] px-5 py-2.5 text-sm text-slate-400 transition hover:border-[#3a3a4e] hover:text-slate-300"
          >
            Back
          </button>
        )}

        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="flex-1 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Launching...' : '🚀 Launch Persona'}
          </button>
        )}
      </div>
    </div>
  )
}
