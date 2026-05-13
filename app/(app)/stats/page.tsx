'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStreak } from '@/lib/hooks/useStreak'
import StreakDisplay from '@/components/stats/StreakDisplay'
import WeekView from '@/components/stats/WeekView'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'

const supabase = createClient()

interface StepProduct {
  id: string
  name: string
  product_name: string
  product_brand: string | null
  is_active: boolean
}

interface RoutineWithSteps {
  id: string
  name: string
  steps: StepProduct[]
}

function ProductsTab() {
  const { data: routines, isLoading } = useQuery({
    queryKey: ['all-routines-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('routines')
        .select('id, name, steps(id, name, product_name, product_brand, is_active)')
        .eq('is_active', true)
      return data as RoutineWithSteps[] | null
    },
  })

  const [ownedMap, setOwnedMap] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    const result: Record<string, boolean> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('product_owned_')) {
        result[key.replace('product_owned_', '')] = localStorage.getItem(key) === 'true'
      }
    }
    return result
  })

  const toggleOwned = (stepId: string) => {
    const next = !ownedMap[stepId]
    setOwnedMap((prev) => ({ ...prev, [stepId]: next }))
    localStorage.setItem(`product_owned_${stepId}`, String(next))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-surface rounded-2xl border border-border animate-pulse" />
        <div className="h-40 bg-surface rounded-2xl border border-border animate-pulse" />
      </div>
    )
  }

  if (!routines) return null

  const allProducts: { step: StepProduct; routineName: string }[] = []
  for (const routine of routines) {
    for (const step of routine.steps) {
      if (step.product_name) {
        allProducts.push({ step, routineName: routine.name })
      }
    }
  }

  const owned = allProducts.filter((p) => ownedMap[p.step.id])
  const notOwned = allProducts.filter((p) => !ownedMap[p.step.id])

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-2xl border border-border p-4">
        <p className="text-sm text-text-muted">
          <span className="font-semibold text-text">{owned.length}</span> van{' '}
          <span className="font-semibold text-text">{allProducts.length}</span> producten in bezit
        </p>
      </div>

      {notOwned.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Nog te kopen</p>
          </div>
          <div className="divide-y divide-border/50">
            {notOwned.map(({ step, routineName }) => (
              <div key={step.id} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleOwned(step.id)}
                  className="w-4 h-4 text-primary rounded border-border flex-shrink-0"
                />
                <Package size={14} className="text-text-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text">{step.product_name}</p>
                  {step.product_brand && (
                    <p className="text-xs text-text-muted">{step.product_brand}</p>
                  )}
                  <p className="text-xs text-text-muted opacity-60">{routineName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {owned.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">In bezit</p>
          </div>
          <div className="divide-y divide-border/50">
            {owned.map(({ step, routineName }) => (
              <div key={step.id} className="flex items-center gap-3 px-4 py-3 opacity-60">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => toggleOwned(step.id)}
                  className="w-4 h-4 text-primary rounded border-border flex-shrink-0"
                />
                <Package size={14} className="text-text-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text line-through">{step.product_name}</p>
                  {step.product_brand && (
                    <p className="text-xs text-text-muted">{step.product_brand}</p>
                  )}
                  <p className="text-xs text-text-muted opacity-60">{routineName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function StatsPage() {
  const { data: streak, isLoading } = useStreak()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'stats' | 'products'>('stats')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="px-4">
      <div className="flex items-center justify-between pt-12 pb-4">
        <h1 className="text-2xl font-bold text-text">Statistieken</h1>
        <ThemeToggle />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5 bg-surface border border-border rounded-xl p-1">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'stats'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Statistieken
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'products'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Producten
        </button>
      </div>

      {activeTab === 'products' && <ProductsTab />}

      {activeTab === 'stats' && (
        <>
          {isLoading && (
            <div className="space-y-4">
              <div className="h-24 bg-surface rounded-2xl border border-border animate-pulse" />
              <div className="h-40 bg-surface rounded-2xl border border-border animate-pulse" />
            </div>
          )}

          {!isLoading && streak && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <StreakDisplay data={streak} />

              <div className="bg-surface rounded-2xl border border-border p-4">
                <WeekView weeklyData={streak.weeklyData} />
              </div>

              {/* Motivational section */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                {streak.currentStreak >= 7 ? (
                  <>
                    <p className="text-2xl mb-1">🔥</p>
                    <p className="font-semibold text-text">Geweldig! {streak.currentStreak} dagen op rij!</p>
                    <p className="text-sm text-text-muted mt-1">Blijf zo doorgaan!</p>
                  </>
                ) : streak.currentStreak >= 1 ? (
                  <>
                    <p className="text-2xl mb-1">⚡</p>
                    <p className="font-semibold text-text">{streak.currentStreak} dag{streak.currentStreak !== 1 ? 'en' : ''} streak</p>
                    <p className="text-sm text-text-muted mt-1">Je bent op weg naar een week!</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl mb-1">🌱</p>
                    <p className="font-semibold text-text">Begin vandaag</p>
                    <p className="text-sm text-text-muted mt-1">Voltooi je routine om een streak te starten</p>
                  </>
                )}
              </div>

              {/* Sign out */}
              <div className="pt-2 pb-4">
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  fullWidth
                  className="text-text-muted hover:text-red-400"
                >
                  Uitloggen
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
