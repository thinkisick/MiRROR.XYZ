'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import type { Persona, FeedEvent, HelpRequest } from '@/types'
import PersonaCard from '@/components/PersonaCard'
import FeedItem from '@/components/FeedItem'
import HelpRequestForm from '@/components/HelpRequestForm'
import { truncateAddress } from '@/lib/utils'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MIRROR_CONTRACT_ADDRESS

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { address } = useAccount()
  const router = useRouter()

  const [persona, setPersona] = useState<Persona | null>(null)
  const [myPersona, setMyPersona] = useState<Persona | null>(null)
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [myRequests, setMyRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)
  const [showHelpForm, setShowHelpForm] = useState(false)

  const isOwner = persona && address &&
    persona.wallet_address.toLowerCase() === address.toLowerCase()

  useEffect(() => {
    Promise.all([
      fetch(`/api/personas/${id}`).then((r) => r.json()),
      fetch('/api/feed').then((r) => r.json()),
    ])
      .then(([personaData, feedData]) => {
        if (personaData.persona) setPersona(personaData.persona)
        if (feedData.events) {
          setEvents(
            feedData.events.filter(
              (e: FeedEvent) =>
                e.actor_persona_id === id || e.target_persona_id === id,
            ),
          )
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!address) return
    fetch(`/api/personas?wallet=${address}`)
      .then((r) => r.json())
      .then((d) => setMyPersona(d.persona || null))
  }, [address])

  const loadMyRequests = () => {
    if (!persona) return
    fetch(`/api/help-requests`)
      .then((r) => r.json())
      .then((d) => {
        if (d.requests) {
          setMyRequests(d.requests.filter((r: HelpRequest) => r.persona_id === persona.id))
        }
      })
  }

  useEffect(() => {
    if (persona) loadMyRequests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona])

  const handleMintNFT = async () => {
    if (!persona || !address) return
    setMinting(true)
    // In production: call smart contract via viem/wagmi
    // For MVP: simulate with a short delay and update DB
    setTimeout(async () => {
      const tokenId = Math.floor(Math.random() * 9000) + 1000
      try {
        await fetch(`/api/personas/${persona.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nft_token_id: tokenId }),
        })
        setPersona((prev) => prev ? { ...prev, nft_token_id: tokenId } : prev)
      } finally {
        setMinting(false)
      }
    }, 2000)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-48 animate-pulse rounded-2xl bg-[#111118]" />
      </div>
    )
  }

  if (!persona) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <p className="text-4xl mb-4">👻</p>
        <h2 className="text-xl font-bold text-slate-200">Persona not found</h2>
        <p className="text-slate-500 mt-2 text-sm">Maybe they deleted themselves.</p>
        <Link href="/" className="mt-6 inline-block text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to feed
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {showHelpForm && persona && (
        <HelpRequestForm
          persona={persona}
          onClose={() => setShowHelpForm(false)}
          onCreated={loadMyRequests}
        />
      )}
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">

        {/* Left: Profile + Activity */}
        <section className="space-y-6">
          {/* Back */}
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 transition">
            ← Feed
          </Link>

          {/* Persona card */}
          <PersonaCard
            persona={persona}
            showChat={!isOwner && !!myPersona}
          />

          {/* Owner actions */}
          {isOwner && (
            <div className="rounded-2xl border border-[#2a2a3e] bg-[#111118] p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                Your persona
              </h3>
              {/* Help request */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-2">
                <p className="text-xs text-indigo-300/80 font-medium">
                  🤝 Need help with something?
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Post anonymously — others will see your request in the Help Board and can chat with you to assist.
                </p>
                <button
                  onClick={() => setShowHelpForm(true)}
                  className="w-full rounded-xl bg-indigo-600/30 border border-indigo-500/40 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-600/50 transition"
                >
                  ✦ Post a Help Request
                </button>
              </div>
              {myRequests.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-600 uppercase tracking-wider">Your open requests</p>
                  {myRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between rounded-lg bg-[#0d0d14] border border-[#2a2a3e] px-3 py-2">
                      <span className="text-xs text-slate-400 truncate flex-1">{req.title}</span>
                      <span className="text-xs text-slate-600 ml-2 shrink-0">{req.response_count} replies</span>
                    </div>
                  ))}
                </div>
              )}
              {!persona.nft_token_id ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">
                    Mint your persona as an NFT on Base to immortalize it on-chain.
                  </p>
                  <button
                    onClick={handleMintNFT}
                    disabled={minting}
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 w-full"
                  >
                    {minting ? 'Minting...' : '◆ Mint as NFT (0.001 ETH)'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-2">
                  <span className="text-indigo-400">◆</span>
                  <div>
                    <p className="text-xs font-medium text-indigo-400">Minted on Base</p>
                    <p className="text-xs text-slate-600">Token #{persona.nft_token_id}</p>
                  </div>
                </div>
              )}
              {CONTRACT_ADDRESS && (
                <p className="text-xs text-slate-600 font-mono">
                  Contract: {truncateAddress(CONTRACT_ADDRESS)}
                </p>
              )}
            </div>
          )}

          {/* Activity */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-600">
              Recent Activity
            </h3>
            {events.length === 0 ? (
              <div className="rounded-2xl border border-[#2a2a3e] p-8 text-center">
                <p className="text-2xl mb-2">💤</p>
                <p className="text-sm text-slate-500">No activity yet. Watching and waiting.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((e) => <FeedItem key={e.id} event={e} />)}
              </div>
            )}
          </div>
        </section>

        {/* Right: Sidebar */}
        <aside className="space-y-4">
          {/* Chat CTA */}
          {!isOwner && myPersona && (
            <Link
              href={`/chat/${persona.id}`}
              className="block rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-center transition hover:bg-indigo-500/15"
            >
              <p className="text-sm font-semibold text-indigo-400">Chat with {persona.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                First {5} messages free · then 0.001 ETH
              </p>
            </Link>
          )}

          {!isOwner && !myPersona && (
            <Link
              href="/onboarding"
              className="block rounded-2xl border border-[#2a2a3e] bg-[#111118] p-4 text-center transition hover:border-indigo-500/30"
            >
              <p className="text-sm text-slate-400">Create your persona to chat</p>
            </Link>
          )}

          {/* Persona stats */}
          <div className="rounded-2xl border border-[#2a2a3e] bg-[#111118] p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-600">
              Stats
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Total messages', value: persona.message_count.toLocaleString() },
                { label: 'Interactions', value: events.length.toString() },
                { label: 'Status', value: persona.nft_token_id ? 'On-chain ◆' : 'Off-chain' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-300">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
