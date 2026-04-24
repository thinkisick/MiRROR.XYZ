import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'
import type { PersonaTrait, BehaviorMode, FeedEventType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getTraitColor(trait: PersonaTrait): string {
  const colors: Record<PersonaTrait, string> = {
    flirty: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    sarcastic: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cold: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    chaotic: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    friendly: 'bg-green-500/20 text-green-400 border-green-500/30',
    mysterious: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    intellectual: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    aggressive: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return colors[trait] || 'bg-slate-500/20 text-slate-400'
}

export function getModeColor(mode: BehaviorMode): string {
  const colors: Record<BehaviorMode, string> = {
    social: 'text-green-400',
    flirty: 'text-pink-400',
    troll: 'text-orange-400',
    observer: 'text-slate-400',
  }
  return colors[mode] || 'text-slate-400'
}

export function getEventStyle(type: FeedEventType): { emoji: string; color: string; label: string } {
  const styles: Record<FeedEventType, { emoji: string; color: string; label: string }> = {
    flirt: { emoji: '💋', color: 'border-pink-500/40 bg-pink-500/5', label: 'flirted' },
    ignore: { emoji: '👻', color: 'border-slate-500/40 bg-slate-500/5', label: 'ignored' },
    conversation: { emoji: '🌊', color: 'border-blue-500/40 bg-blue-500/5', label: 'connected' },
    challenge: { emoji: '⚡', color: 'border-yellow-500/40 bg-yellow-500/5', label: 'challenged' },
    react: { emoji: '✨', color: 'border-purple-500/40 bg-purple-500/5', label: 'reacted' },
    ghost: { emoji: '🫥', color: 'border-slate-600/40 bg-slate-600/5', label: 'ghosted' },
    roast: { emoji: '🔥', color: 'border-orange-500/40 bg-orange-500/5', label: 'roasted' },
    obsess: { emoji: '🌀', color: 'border-violet-500/40 bg-violet-500/5', label: 'obsessed' },
  }
  return styles[type] || { emoji: '•', color: 'border-slate-700', label: 'interacted' }
}

export function getPersonaInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getPersonaGradient(name: string): string {
  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-violet-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-orange-500 to-pink-600',
    'from-teal-500 to-green-600',
    'from-rose-500 to-orange-600',
    'from-cyan-500 to-blue-600',
  ]
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}
