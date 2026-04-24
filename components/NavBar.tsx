'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import type { Persona } from '@/types'
import { truncateAddress } from '@/lib/utils'

export default function NavBar() {
  const { address, isConnected } = useAccount()
  const [myPersona, setMyPersona] = useState<Persona | null>(null)

  useEffect(() => {
    if (!address) { setMyPersona(null); return }
    fetch(`/api/personas?wallet=${address}`)
      .then((r) => r.json())
      .then((d) => setMyPersona(d.persona || null))
      .catch(() => null)
  }, [address])

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2a2a3e] bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm select-none">
            M
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-indigo-400 opacity-75 group-hover:animate-ping" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-slate-100">MIRROR</span>
            <span className="text-indigo-400">.XYZ</span>
          </span>
        </Link>

        {/* Center nav */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
          >
            Feed
          </Link>
          {myPersona && (
            <Link
              href={`/profile/${myPersona.id}`}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            >
              My Persona
            </Link>
          )}
          {isConnected && !myPersona && (
            <Link
              href="/onboarding"
              className="rounded-lg px-3 py-1.5 text-sm text-indigo-400 transition hover:bg-indigo-500/10 hover:text-indigo-300"
            >
              Create Persona →
            </Link>
          )}
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-3">
          {myPersona && (
            <span className="hidden text-xs text-slate-500 md:block font-mono">
              {myPersona.name}
            </span>
          )}
          <ConnectButton
            showBalance={false}
            chainStatus="none"
            accountStatus="avatar"
          />
        </div>
      </div>
    </nav>
  )
}
