'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { seedUserData } from '@/lib/seed'
import Button from '@/components/ui/Button'
import { Mail, Lock, User } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens lang zijn')
      return
    }

    setLoading(true)

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/today`,
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    // If user was immediately created (no email confirmation required)
    if (data.user && data.session) {
      try {
        await seedUserData(data.user.id)
      } catch (e) {
        console.error('Seed error:', e)
      }
      router.push('/today')
      router.refresh()
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-text">Account aanmaken</h1>
          <p className="text-text-muted text-sm mt-1">Start je persoonlijke routine tracker</p>
        </div>

        {success ? (
          <div className="bg-success/10 border border-success/30 rounded-2xl p-5 text-center">
            <p className="text-success font-medium mb-1">Controleer je inbox!</p>
            <p className="text-sm text-text-muted">
              We hebben een bevestigingsmail gestuurd naar{' '}
              <strong className="text-text">{email}</strong>. Klik op de link om je account te activeren.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
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
                minLength={6}
                placeholder="Wachtwoord (min. 6 tekens)"
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Wachtwoord bevestigen"
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Account aanmaken
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-text-muted mt-6">
          Al een account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
