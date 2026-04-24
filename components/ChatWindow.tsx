'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Message, Persona } from '@/types'
import { getPersonaInitials, getPersonaGradient, timeAgo } from '@/lib/utils'

interface ChatWindowProps {
  myPersona: Persona
  targetPersona: Persona
}

export default function ChatWindow({ myPersona, targetPersona }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const targetGradient = getPersonaGradient(targetPersona.name)
  const targetInitials = getPersonaInitials(targetPersona.name)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?from=${myPersona.id}&to=${targetPersona.id}`)
      const data = await res.json()
      if (data.messages) setMessages(data.messages)
    } catch { /* ignore */ }
  }, [myPersona.id, targetPersona.id])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    setSending(true)
    setError(null)

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      from_persona_id: myPersona.id,
      to_persona_id: targetPersona.id,
      content: input.trim(),
      is_autonomous: false,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setInput('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_persona_id: myPersona.id,
          to_persona_id: targetPersona.id,
          content: optimistic.content,
        }),
      })

      const data = await res.json()

      if (res.status === 402) {
        setRequiresPayment(true)
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
        return
      }

      if (!res.ok) {
        setError(data.error || 'Failed to send')
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
        return
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimistic.id),
        data.userMessage,
        data.aiMessage,
      ])
    } catch {
      setError('Network error')
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#2a2a3e] bg-[#111118] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#2a2a3e] px-4 py-3">
        <div
          className={`h-9 w-9 rounded-full bg-gradient-to-br ${targetGradient} flex items-center justify-center text-white text-xs font-bold`}
        >
          {targetInitials}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">{targetPersona.name}</p>
          <p className="text-xs text-slate-500 capitalize">{targetPersona.behavior_mode} mode</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-xs text-slate-500">online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-600 text-center">
              Start a conversation.<br />
              <span className="text-xs">{targetPersona.name} is listening.</span>
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.from_persona_id === myPersona.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMe
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-[#1a1a2e] text-slate-200 rounded-bl-sm border border-[#2a2a3e]'
                }`}
              >
                {msg.content}
                <div
                  className={`mt-1 text-[10px] ${isMe ? 'text-indigo-300' : 'text-slate-600'} text-right`}
                >
                  {timeAgo(msg.created_at)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Payment gate */}
      {requiresPayment && (
        <div className="mx-4 mb-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3 text-center">
          <p className="text-sm text-yellow-400 font-medium">Free messages used up</p>
          <p className="text-xs text-slate-500 mt-1">
            Send 0.001 ETH to continue chatting with {targetPersona.name}
          </p>
          <button className="mt-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 px-4 py-1.5 text-xs text-yellow-400 hover:bg-yellow-500/30 transition">
            Pay to unlock (0.001 ETH)
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mx-4 mb-2 text-xs text-red-400 text-center">{error}</p>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-[#2a2a3e] p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending || requiresPayment}
          placeholder={`Say something to ${targetPersona.name}...`}
          className="flex-1 rounded-xl border border-[#2a2a3e] bg-[#0a0a0f] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 disabled:opacity-50 transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending || requiresPayment}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? '...' : '→'}
        </button>
      </form>
    </div>
  )
}
