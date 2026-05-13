'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, ChevronRight } from 'lucide-react'
import { useRoutineGroups } from '@/lib/hooks/useRoutines'
import { RoutineGroup, Routine, Step } from '@/lib/types'
import ImportRoutineButton from '@/components/ui/ImportRoutineButton'

const timeConfig: Record<string, { label: string; icon: string }> = {
  morning: { label: 'Ochtend', icon: '🌅' },
  afternoon: { label: 'Middag', icon: '☀️' },
  evening: { label: 'Avond', icon: '🌙' },
  free: { label: 'Extra', icon: '✨' },
}

function GroupCard({ group }: { group: RoutineGroup }) {
  const router = useRouter()
  const routines = (group.routines ?? []) as (Routine & { steps: Step[] })[]

  return (
    <div
      className="bg-surface rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-all active:scale-98"
      onClick={() => router.push(`/routines/${group.id}`)}
    >
      {/* Group header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text text-base">{group.name}</p>
          {group.description && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{group.description}</p>
          )}
        </div>
        <ChevronRight size={18} className="text-text-muted flex-shrink-0 ml-2" />
      </div>

      {/* Block rows */}
      {routines.length > 0 && (
        <div className="border-t border-border divide-y divide-border/50">
          {routines.map((routine) => {
            const config = timeConfig[routine.time_of_day] ?? { label: routine.time_of_day, icon: '✨' }
            const activeStepCount = routine.steps?.filter((s) => s.is_active)?.length ?? 0
            return (
              <div key={routine.id} className="flex items-center gap-2.5 px-4 py-2.5">
                <span className="text-base leading-none">{config.icon}</span>
                <span className="text-sm text-text-muted flex-1">
                  {routine.name || config.label}
                </span>
                <span className="text-xs text-text-muted">
                  {activeStepCount} stap{activeStepCount !== 1 ? 'pen' : ''}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function RoutinesPage() {
  const { data: groups, isLoading } = useRoutineGroups()

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
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-surface rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && groups && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {groups.length === 0 ? (
            <div className="flex flex-col items-center text-center py-12 gap-4">
              <p className="text-5xl">🌿</p>
              <div>
                <p className="text-text font-semibold text-base">Geen routines</p>
                <p className="text-text-muted text-sm mt-1">
                  Start met de vooraf ingevulde skincare routine, of maak zelf een nieuwe aan.
                </p>
              </div>
              <ImportRoutineButton />
              <p className="text-text-muted text-xs">of gebruik de knop rechtsboven</p>
            </div>
          ) : (
            groups.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GroupCard group={group} />
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  )
}
