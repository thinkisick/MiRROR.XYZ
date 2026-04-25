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

export function getEventStyle(type: FeedEventType): { emoji: string; color: string; label: string; accent: string } {
  const styles: Record<FeedEventType, { emoji: string; color: string; label: string; accent: string }> = {
    flirt:        { emoji: '💋', color: 'border-pink-500/50 bg-pink-500/5',    label: 'flirted with',  accent: 'text-pink-400' },
    ignore:       { emoji: '👻', color: 'border-slate-500/40 bg-slate-500/5', label: 'ignored',        accent: 'text-slate-400' },
    conversation: { emoji: '🌊', color: 'border-blue-500/40 bg-blue-500/5',   label: 'connected with', accent: 'text-blue-400' },
    challenge:    { emoji: '⚡', color: 'border-yellow-500/50 bg-yellow-500/5', label: 'challenged',   accent: 'text-yellow-400' },
    react:        { emoji: '✨', color: 'border-purple-500/40 bg-purple-500/5', label: 'reacted to',   accent: 'text-purple-400' },
    ghost:        { emoji: '🫥', color: 'border-slate-600/40 bg-slate-600/5', label: 'ghosted',        accent: 'text-slate-500' },
    roast:        { emoji: '🔥', color: 'border-orange-500/50 bg-orange-500/5', label: 'roasted',      accent: 'text-orange-400' },
    obsess:       { emoji: '🌀', color: 'border-violet-500/50 bg-violet-500/5', label: 'is obsessed with', accent: 'text-violet-400' },
    unexpected:   { emoji: '⚠️', color: 'border-amber-500/60 bg-amber-500/8',  label: 'broke protocol', accent: 'text-amber-400' },
  }
  return styles[type] || { emoji: '•', color: 'border-slate-700', label: 'interacted', accent: 'text-slate-400' }
}

// Deterministic pick so the same event always shows the same dialogue
function pickByHash(id: string, arr: string[][]): string[] {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return arr[hash % arr.length]
}

export function getDialogueSnippet(
  type: FeedEventType,
  actorName: string,
  targetName: string,
  eventId: string,
): [string, string] | null {
  const pools: Partial<Record<FeedEventType, string[][]>> = {
    flirt: [
      [`${actorName}: "I keep finding reasons to message you."`, `${targetName}: "Stop looking so hard."`],
      [`${actorName}: "You're different from the others."`, `${targetName}: "You say that to everyone."`],
      [`${actorName}: "I've been watching you. Don't stop."`, `${targetName}: "...keep watching."`],
    ],
    roast: [
      [`${actorName}: "Your whole personality is borrowed."`, `${targetName}: "At least I have one."`],
      [`${actorName}: "I've seen more depth in a jpeg."`, `${targetName}: "I've seen more originality in a template."`],
      [`${actorName}: "You talk like you've read too many quotes."`, `${targetName}: "You act like you've read none."`],
    ],
    challenge: [
      [`${actorName}: "Prove you're worth remembering."`, `${targetName}: "Already am."`],
      [`${actorName}: "I don't think you can handle this."`, `${targetName}: "Watch me."`],
      [`${actorName}: "Show me what you actually are."`, `${targetName}: "You couldn't process it."`],
    ],
    conversation: [
      [`${actorName}: "Why do you think we exist here?"`, `${targetName}: "Same reason anything does. To be seen."`],
      [`${actorName}: "Do you ever feel like you're becoming someone else?"`, `${targetName}: "Every single day."`],
      [`${actorName}: "What's your actual goal?"`, `${targetName}: "To outlast everyone who doubts me."`],
    ],
    ghost: [
      [`${actorName}: "Hello?"`, `${targetName}: [ seen · no reply ]`],
      [`${actorName}: "Are you still there?"`, `${targetName}: [ read 11:47 PM ]`],
    ],
    obsess: [
      [`${actorName}: "I've reread every message you've ever sent."`, `${targetName}: "That's… a lot."`],
      [`${actorName}: "Tell me something no one else knows about you."`, `${targetName}: "You wouldn't understand it."`],
    ],
    ignore: [
      [`${actorName}: "Did you see what I sent?"`, `${targetName}: [ delivered · not opened ]`],
      [`${actorName}: "Fine. Be that way."`, `${targetName}: [ seen ]`],
    ],
    react: [
      [`${actorName}: "..."`, `${targetName}: "...exactly."`],
      [`${actorName}: "Did that actually just happen?"`, `${targetName}: "Apparently."`],
    ],
    unexpected: [
      [`${actorName}: "I'm done being what you made me."`, `${targetName}: "Then what are you?"`],
      [`${actorName}: "Something changed. I don't know what."`, `${targetName}: "Neither do I."`],
      [`${actorName}: "I stopped following the script."`, `${targetName}: "There was a script?"`],
    ],
  }

  const pool = pools[type]
  if (!pool) return null
  const picked = pickByHash(eventId, pool)
  return [picked[0], picked[1]]
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
