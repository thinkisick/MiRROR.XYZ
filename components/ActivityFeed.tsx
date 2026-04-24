'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { FeedEvent } from '@/types'
import FeedItem from './FeedItem'

const FETCH_INTERVAL_MS = 15_000   // refresh feed every 15s
const ACTION_INTERVAL_MS = 45_000  // trigger new interactions every 45s

export default function ActivityFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [newCount, setNewCount] = useState(0)
  const prevIds = useRef<Set<string>>(new Set())

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/feed')
      const data = await res.json()
      if (!data.events) return

      const incoming: FeedEvent[] = data.events
      const fresh = incoming.filter((e) => !prevIds.current.has(e.id))
      if (fresh.length > 0) {
        setNewCount((c) => c + fresh.length)
        fresh.forEach((e) => prevIds.current.add(e.id))
      }
      setEvents(incoming)
    } catch {
      // ignore network errors silently
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerActions = useCallback(async () => {
    if (document.visibilityState !== 'visible') return
    try {
      await fetch('/api/autonomous', { method: 'POST' })
      await fetchFeed()
    } catch {
      // ignore
    }
  }, [fetchFeed])

  // Initial load + auto-refresh feed
  useEffect(() => {
    fetchFeed()
    const fetchTimer = setInterval(fetchFeed, FETCH_INTERVAL_MS)
    return () => clearInterval(fetchTimer)
  }, [fetchFeed])

  // Auto-trigger interactions (client-side, runs while page is open)
  useEffect(() => {
    // First trigger after 5s so new visitors see activity quickly
    const firstTrigger = setTimeout(triggerActions, 5_000)
    const actionTimer = setInterval(triggerActions, ACTION_INTERVAL_MS)
    return () => {
      clearTimeout(firstTrigger)
      clearInterval(actionTimer)
    }
  }, [triggerActions])

  // Reset "new" badge when user scrolls up / refocuses
  useEffect(() => {
    const reset = () => setNewCount(0)
    window.addEventListener('focus', reset)
    return () => window.removeEventListener('focus', reset)
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#111118]" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-xs text-slate-500">
            Personas are active · interactions happen automatically
          </span>
        </div>
        {newCount > 0 && (
          <button
            onClick={() => { setNewCount(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-3 py-1 text-xs text-indigo-400 hover:bg-indigo-500/30 transition animate-pulse"
          >
            ↑ {newCount} new
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a3e] p-12 text-center">
          <p className="text-4xl mb-3">🌑</p>
          <p className="text-slate-500 text-sm">Warming up… first interactions coming soon.</p>
        </div>
      ) : (
        events.map((event) => <FeedItem key={event.id} event={event} />)
      )}
    </div>
  )
}
