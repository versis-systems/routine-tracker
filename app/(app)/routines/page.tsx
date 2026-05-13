'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, ChevronRight, Moon, Sun, Sunset, Star } from 'lucide-react'
import { useRoutines } from '@/lib/hooks/useRoutines'
import { Routine } from '@/lib/types'

const timeIcons: Record<string, React.ElementType> = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
  free: Star,
}

const timeLabels: Record<string, string> = {
  morning: 'Ochtend',
  afternoon: 'Middag',
  evening: 'Avond',
  free: 'Vrij',
}

function RoutineItem({ routine }: { routine: Routine & { steps: any[] } }) {
  const Icon = timeIcons[routine.time_of_day] || Star
  const activeStepCount = routine.steps?.filter((s) => s.is_active)?.length ?? 0

  return (
    <Link href={`/routines/${routine.id}`}>
      <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border hover:border-primary/50 transition-all active:scale-98">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text truncate">{routine.name}</p>
          <p className="text-xs text-text-muted">
            {timeLabels[routine.time_of_day]} · {activeStepCount} stap{activeStepCount !== 1 ? 'pen' : ''}
          </p>
        </div>
        <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
      </div>
    </Link>
  )
}

export default function RoutinesPage() {
  const { data: routines, isLoading } = useRoutines()

  return (
    <div className="px-4">
      <div className="flex items-center justify-between pt-12 pb-6">
        <h1 className="text-2xl font-bold text-text">Routines</h1>
        <Link
          href="/routines/new"
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-light transition-colors"
        >
          <Plus size={16} />
          Nieuw
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && routines && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {routines.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-text font-medium">Geen routines</p>
              <p className="text-text-muted text-sm mt-1">Maak je eerste routine aan</p>
            </div>
          ) : (
            routines.map((routine, i) => (
              <motion.div
                key={routine.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <RoutineItem routine={routine} />
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  )
}
