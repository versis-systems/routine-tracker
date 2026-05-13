'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { seedUserData } from '@/lib/seed'
import { Mail, Lock } from 'lucide-react'

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

    if (password !== confirm) { setError('Wachtwoorden komen niet overeen'); return }
    if (password.length < 6) { setError('Wachtwoord moet minimaal 6 tekens lang zijn'); return }

    setLoading(true)

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/today` },
    })

    if (signupError) { setError(signupError.message); setLoading(false); return }

    if (data.user && data.session) {
      try { await seedUserData(data.user.id) } catch (e) { console.error('Seed error:', e) }
      router.push('/today')
      router.refresh()
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: 'var(--color-fill)' }}
          >
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-[28px] font-bold" style={{ color: 'var(--color-text)' }}>Account aanmaken</h1>
          <p className="text-[15px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Start je persoonlijke routine tracker</p>
        </div>

        {success ? (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}
          >
            <p className="text-[17px] font-semibold mb-1" style={{ color: 'var(--color-success)' }}>
              Controleer je inbox!
            </p>
            <p className="text-[15px]" style={{ color: 'var(--color-text-muted)' }}>
              We hebben een bevestigingsmail gestuurd naar{' '}
              <strong style={{ color: 'var(--color-text)' }}>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3">
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-[14px]"
                style={{ backgroundColor: 'rgba(255,59,48,0.08)', color: 'var(--color-danger)' }}
              >
                {error}
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="E-mailadres"
                className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Wachtwoord (min. 6 tekens)"
                className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Wachtwoord bevestigen"
                className="w-full rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-[17px] font-semibold text-white transition-all active:scale-98 disabled:opacity-50 focus:outline-none mt-1"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Bezig…' : 'Account aanmaken'}
            </button>
          </form>
        )}

        <p className="text-center text-[15px] mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Al een account?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
