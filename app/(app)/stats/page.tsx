'use client'

import { motion } from 'framer-motion'
import { useStreak } from '@/lib/hooks/useStreak'
import StreakDisplay from '@/components/stats/StreakDisplay'
import WeekView from '@/components/stats/WeekView'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

const supabase = createClient()

export default function StatsPage() {
  const { data: streak, isLoading } = useStreak()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="px-4">
      <div className="flex items-center justify-between pt-12 pb-6">
        <h1 className="text-2xl font-bold text-text">Statistieken</h1>
        <ThemeToggle />
      </div>

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
    </div>
  )
}
