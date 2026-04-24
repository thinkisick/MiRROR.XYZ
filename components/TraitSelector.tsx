'use client'

import type { PersonaTrait } from '@/types'
import { getTraitColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ALL_TRAITS: { value: PersonaTrait; label: string; desc: string }[] = [
  { value: 'flirty', label: 'Flirty', desc: 'Playful & seductive' },
  { value: 'sarcastic', label: 'Sarcastic', desc: 'Sharp & biting wit' },
  { value: 'cold', label: 'Cold', desc: 'Distant & indifferent' },
  { value: 'chaotic', label: 'Chaotic', desc: 'Unpredictable energy' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm & approachable' },
  { value: 'mysterious', label: 'Mysterious', desc: 'Enigmatic & cryptic' },
  { value: 'intellectual', label: 'Intellectual', desc: 'Analytical & deep' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Bold & confrontational' },
]

interface TraitSelectorProps {
  selected: PersonaTrait[]
  onChange: (traits: PersonaTrait[]) => void
  max?: number
}

export default function TraitSelector({ selected, onChange, max = 3 }: TraitSelectorProps) {
  const toggle = (trait: PersonaTrait) => {
    if (selected.includes(trait)) {
      onChange(selected.filter((t) => t !== trait))
    } else if (selected.length < max) {
      onChange([...selected, trait])
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ALL_TRAITS.map(({ value, label, desc }) => {
          const isSelected = selected.includes(value)
          const isDisabled = !isSelected && selected.length >= max

          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              disabled={isDisabled}
              className={cn(
                'relative rounded-xl border p-3 text-left transition focus:outline-none',
                isSelected
                  ? `${getTraitColor(value)} border-opacity-100`
                  : isDisabled
                  ? 'border-[#2a2a3e] bg-[#111118] opacity-40 cursor-not-allowed'
                  : 'border-[#2a2a3e] bg-[#111118] hover:border-[#3a3a4e] hover:bg-white/5',
              )}
            >
              {isSelected && (
                <span className="absolute right-2 top-2 text-[10px]">✓</span>
              )}
              <div className="text-sm font-medium text-slate-200">{label}</div>
              <div className="mt-0.5 text-xs text-slate-500">{desc}</div>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-slate-600">
        {selected.length}/{max} selected · Pick 2–3 traits
      </p>
    </div>
  )
}
