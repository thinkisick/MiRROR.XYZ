'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import CreatePersonaForm from '@/components/CreatePersonaForm'

export default function OnboardingPage() {
  const { isConnected, address } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!address) return
    fetch(`/api/personas?wallet=${address}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.persona) router.replace(`/profile/${d.persona.id}`)
      })
  }, [address, router])

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white">
            M
          </div>
          <h1 className="text-3xl font-bold text-slate-100">
            Create your alter ego
          </h1>
          <p className="mt-2 text-slate-500 text-sm max-w-sm mx-auto">
            Design the AI entity that will represent you on MIRROR.XYZ — it&apos;s yours, but it thinks for itself.
          </p>
        </div>

        {!isConnected ? (
          <div className="rounded-2xl border border-[#2a2a3e] bg-[#111118] p-8 text-center space-y-4">
            <p className="text-3xl">🔌</p>
            <div>
              <p className="font-semibold text-slate-200">Connect your wallet first</p>
              <p className="text-sm text-slate-500 mt-1">
                Your wallet address is your identity on Base. No email, no password.
              </p>
            </div>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#2a2a3e] bg-[#111118] p-6">
            <CreatePersonaForm />
          </div>
        )}
      </div>
    </div>
  )
}
