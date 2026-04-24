'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import type { Persona } from '@/types'
import ChatWindow from '@/components/ChatWindow'
import PersonaCard from '@/components/PersonaCard'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const { address } = useAccount()
  const router = useRouter()

  const [targetPersona, setTargetPersona] = useState<Persona | null>(null)
  const [myPersona, setMyPersona] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/personas/${id}`)
      .then((r) => r.json())
      .then((d) => setTargetPersona(d.persona || null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!address) return
    fetch(`/api/personas?wallet=${address}`)
      .then((r) => r.json())
      .then((d) => setMyPersona(d.persona || null))
  }, [address])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-2xl bg-[#111118]" />
      </div>
    )
  }

  if (!targetPersona) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <p className="text-4xl mb-4">👻</p>
        <h2 className="text-xl font-bold text-slate-200">Persona not found</h2>
        <Link href="/" className="mt-4 inline-block text-sm text-indigo-400">← Back</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 flex items-center gap-3">
        <Link href={`/profile/${targetPersona.id}`} className="text-xs text-slate-500 hover:text-slate-400 transition">
          ← {targetPersona.name}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Chat */}
        <div className="h-[calc(100vh-200px)] min-h-[480px]">
          {!address ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-[#2a2a3e] bg-[#111118]">
              <p className="text-slate-400 text-sm">Connect your wallet to chat</p>
              <ConnectButton />
            </div>
          ) : !myPersona ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-[#2a2a3e] bg-[#111118]">
              <p className="text-4xl">🤖</p>
              <div className="text-center">
                <p className="text-slate-300 font-semibold">You need a persona first</p>
                <p className="text-slate-500 text-sm mt-1">Create your alter ego to start chatting</p>
              </div>
              <Link
                href="/onboarding"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition"
              >
                Create Persona
              </Link>
            </div>
          ) : myPersona.id === id ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-[#2a2a3e] bg-[#111118]">
              <p className="text-4xl mb-3">🪞</p>
              <p className="text-slate-400 text-sm">You can&apos;t chat with yourself.</p>
              <p className="text-slate-600 text-xs mt-1">...or can you?</p>
            </div>
          ) : (
            <ChatWindow myPersona={myPersona} targetPersona={targetPersona} />
          )}
        </div>

        {/* Sidebar: persona info */}
        <aside className="space-y-4">
          <PersonaCard persona={targetPersona} />

          <div className="rounded-2xl border border-[#2a2a3e] bg-[#111118] p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
              About this conversation
            </h3>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>• First 5 messages are free</li>
              <li>• Responses powered by GPT-4o mini</li>
              <li>• {targetPersona.name} remembers context</li>
              <li>• All chats may appear in the feed</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
