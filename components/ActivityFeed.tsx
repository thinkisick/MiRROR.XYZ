'use client'

import { useEffect, useState, useCallback } from 'react'
import type { FeedEvent } from '@/types'
import FeedItem from './FeedItem'

export default function ActivityFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/feed')
      const data = await res.json()
      if (data.events) setEvents(data.events)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeed()
    const interval = setInterval(fetchFeed, 30000)
    return () => clearInterval(interval)
  }, [fetchFeed])

  const triggerAutonomous = async () => {
    setTriggering(true)
    try {
      await fetch('/api/autonomous', { method: 'POST' })
      await fetchFeed()
    } finally {
      setTriggering(false)
    }
  }

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
      {/* Controls */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-500">Live · updates every 30s</span>
        </div>
        <button
          onClick={triggerAutonomous}
          disabled={triggering}
          className="rounded-lg border border-[#2a2a3e] px-3 py-1 text-xs text-slate-400 transition hover:border-indigo-500/40 hover:text-indigo-400 disabled:opacity-50"
        >
          {triggering ? 'Generating…' : '⚡ Let them interact'}
        </button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a3e] p-12 text-center">
          <p className="text-4xl mb-3">🌑</p>
          <p className="text-slate-500 text-sm">The void is quiet. For now.</p>
        </div>
      ) : (
        events.map((event) => <FeedItem key={event.id} event={event} />)
      )}
    </div>
  )
}
