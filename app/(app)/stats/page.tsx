'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStreak } from '@/lib/hooks/useStreak'

import StreakDisplay from '@/components/stats/StreakDisplay'
import WeekView from '@/components/stats/WeekView'
import { createClient } from '@/lib/supabase/client'
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
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
        ))}
      </div>
    )
  }

  if (!routines) return null

  const allProducts: { step: StepProduct; routineName: string }[] = []
  for (const routine of routines) {
    for (const step of routine.steps) {
      if (step.product_name) allProducts.push({ step, routineName: routine.name })
    }
  }

  const owned = allProducts.filter((p) => ownedMap[p.step.id])
  const notOwned = allProducts.filter((p) => !ownedMap[p.step.id])

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl px-4 py-3.5"
        style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <p className="text-[15px]" style={{ color: 'var(--color-text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{owned.length}</span>{' '}
          van{' '}
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{allProducts.length}</span>{' '}
          producten in bezit
        </p>
      </div>

      {notOwned.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '0.5px solid var(--color-separator)' }}>
            <p className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Nog te kopen
            </p>
          </div>
          <div>
            {notOwned.map(({ step, routineName }, index) => (
              <div key={step.id}>
                {index > 0 && (
                  <div className="ml-12" style={{ height: '0.5px', backgroundColor: 'var(--color-separator)' }} />
                )}
                <div className="flex items-center gap-3 px-4 py-3" onClick={() => toggleOwned(step.id)}>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center cursor-pointer"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                  <Package size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium" style={{ color: 'var(--color-text)' }}>
                      {step.product_name}
                    </p>
                    {step.product_brand && (
                      <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>{step.product_brand}</p>
                    )}
                    <p className="text-[12px]" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>{routineName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {owned.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', opacity: 0.7 }}>
          <div className="px-4 py-3" style={{ borderBottom: '0.5px solid var(--color-separator)' }}>
            <p className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              In bezit
            </p>
          </div>
          <div>
            {owned.map(({ step, routineName }, index) => (
              <div key={step.id}>
                {index > 0 && (
                  <div className="ml-12" style={{ height: '0.5px', backgroundColor: 'var(--color-separator)' }} />
                )}
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => toggleOwned(step.id)}>
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-success)' }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <Package size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium line-through" style={{ color: 'var(--color-text-muted)' }}>
                      {step.product_name}
                    </p>
                    {step.product_brand && (
                      <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>{step.product_brand}</p>
                    )}
                  </div>
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
  const [activeTab, setActiveTab] = useState<'stats' | 'products'>('stats')

  return (
    <div className="px-4 pb-32">
      {/* Large title header */}
      <div className="pt-14 pb-2">
        <h1 className="text-[34px] font-bold tracking-tight" style={{ color: 'var(--color-text)', lineHeight: 1.1 }}>
          {activeTab === 'products' ? 'Producten' : 'Statistieken'}
        </h1>
      </div>

      {/* iOS-style segmented control */}
      <div
        className="flex gap-1 rounded-xl p-1 mt-4 mb-5"
        style={{ backgroundColor: 'var(--color-fill)' }}
      >
        <button
          onClick={() => setActiveTab('stats')}
          className="flex-1 py-1.5 rounded-lg text-[13px] font-semibold transition-all focus:outline-none"
          style={{
            backgroundColor: activeTab === 'stats' ? 'var(--color-surface)' : 'transparent',
            color: 'var(--color-text)',
            boxShadow: activeTab === 'stats' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          Statistieken
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className="flex-1 py-1.5 rounded-lg text-[13px] font-semibold transition-all focus:outline-none"
          style={{
            backgroundColor: activeTab === 'products' ? 'var(--color-surface)' : 'transparent',
            color: 'var(--color-text)',
            boxShadow: activeTab === 'products' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          Producten
        </button>
      </div>

      {activeTab === 'products' && <ProductsTab />}

      {activeTab === 'stats' && (
        <>
          {isLoading && (
            <div className="space-y-3">
              <div className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
              <div className="h-40 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
            </div>
          )}

          {!isLoading && streak && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <StreakDisplay data={streak} />

              <div
                className="rounded-2xl p-4"
                style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <WeekView weeklyData={streak.weeklyData} />
              </div>

              {/* Motivational card */}
              <div
                className="rounded-2xl p-4 text-center"
                style={{ backgroundColor: 'var(--color-fill)' }}
              >
                {streak.currentStreak >= 7 ? (
                  <>
                    <p className="text-2xl mb-1">🔥</p>
                    <p className="text-[15px] font-semibold" style={{ color: 'var(--color-text)' }}>
                      Geweldig! {streak.currentStreak} dagen op rij!
                    </p>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Blijf zo doorgaan!</p>
                  </>
                ) : streak.currentStreak >= 1 ? (
                  <>
                    <p className="text-2xl mb-1">⚡</p>
                    <p className="text-[15px] font-semibold" style={{ color: 'var(--color-text)' }}>
                      {streak.currentStreak} dag{streak.currentStreak !== 1 ? 'en' : ''} streak
                    </p>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Je bent op weg naar een week!</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl mb-1">🌱</p>
                    <p className="text-[15px] font-semibold" style={{ color: 'var(--color-text)' }}>Begin vandaag</p>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Voltooi je routine om een streak te starten</p>
                  </>
                )}
              </div>


            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
