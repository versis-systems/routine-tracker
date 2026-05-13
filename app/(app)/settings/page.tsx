'use client'

import { useRouter } from 'next/navigation'
import { Moon, Sun, LogOut, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const supabase = createClient()

function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const resolved = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setThemeState(resolved)
  }, [])

  const setTheme = (next: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setThemeState(next)
  }

  return { theme, setTheme }
}

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="px-4 pb-32">
      {/* Large title */}
      <div className="pt-14 pb-6">
        <h1
          className="text-[34px] font-bold tracking-tight"
          style={{ color: 'var(--color-text)', lineHeight: 1.1 }}
        >
          Instellingen
        </h1>
      </div>

      {/* Appearance */}
      <p
        className="text-[13px] font-semibold uppercase tracking-wide px-1 mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Weergave
      </p>
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <button
          onClick={() => setTheme('light')}
          className="w-full flex items-center gap-4 px-4 py-3.5 focus:outline-none active:opacity-60"
          style={{ borderBottom: '0.5px solid var(--color-separator)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#FFD60A' }}
          >
            <Sun size={17} color="#FFFFFF" strokeWidth={2} />
          </div>
          <span className="flex-1 text-[17px] text-left" style={{ color: 'var(--color-text)' }}>
            Licht
          </span>
          {!isDark && (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </button>
        <button
          onClick={() => setTheme('dark')}
          className="w-full flex items-center gap-4 px-4 py-3.5 focus:outline-none active:opacity-60"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#5E5CE6' }}
          >
            <Moon size={17} color="#FFFFFF" strokeWidth={2} />
          </div>
          <span className="flex-1 text-[17px] text-left" style={{ color: 'var(--color-text)' }}>
            Donker
          </span>
          {isDark && (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Account */}
      <p
        className="text-[13px] font-semibold uppercase tracking-wide px-1 mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Account
      </p>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 px-4 py-3.5 focus:outline-none active:opacity-60"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-danger)' }}
          >
            <LogOut size={17} color="#FFFFFF" strokeWidth={2} />
          </div>
          <span className="flex-1 text-[17px] text-left" style={{ color: 'var(--color-danger)' }}>
            Uitloggen
          </span>
          <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        </button>
      </div>
    </div>
  )
}
