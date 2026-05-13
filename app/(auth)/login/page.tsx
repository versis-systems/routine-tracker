'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/today')
      router.refresh()
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Vul je e-mailadres in')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/today`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMagicLinkSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-2xl font-bold text-text">Welkom terug</h1>
          <p className="text-text-muted text-sm mt-1">Log in op je routine tracker</p>
        </div>

        {magicLinkSent ? (
          <div className="bg-success/10 border border-success/30 rounded-2xl p-5 text-center">
            <p className="text-success font-medium mb-1">Check je inbox!</p>
            <p className="text-sm text-text-muted">
              We hebben een inloglink gestuurd naar <strong className="text-text">{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="E-mailadres"
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Wachtwoord"
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Inloggen
            </Button>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="px-3 text-xs text-text-muted">of</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={handleMagicLink}
              loading={loading}
              fullWidth
            >
              Inloggen met e-maillink
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-text-muted mt-6">
          Nog geen account?{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Aanmelden
          </Link>
        </p>
      </div>
    </div>
  )
}
