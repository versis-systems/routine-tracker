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
      className="rounded-2xl overflow-hidden cursor-pointer active:opacity-70 transition-opacity"
      style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      onClick={() => router.push(`/routines/${group.id}`)}
    >
      {/* Header */}
      <div className="flex items-center px-4 py-3.5">
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-semibold" style={{ color: 'var(--color-text)' }}>
            {group.name}
          </p>
          {group.description && (
            <p className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
              {group.description}
            </p>
          )}
        </div>
        <ChevronRight size={17} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginLeft: 8 }} />
      </div>

      {/* Block rows */}
      {routines.length > 0 && (
        <div style={{ borderTop: '0.5px solid var(--color-separator)' }}>
          {routines.map((routine, index) => {
            const config = timeConfig[routine.time_of_day] ?? { label: routine.time_of_day, icon: '✨' }
            const activeStepCount = routine.steps?.filter((s) => s.is_active)?.length ?? 0
            return (
              <div key={routine.id}>
                {index > 0 && (
                  <div
                    className="ml-11"
                    style={{ height: '0.5px', backgroundColor: 'var(--color-separator)' }}
                  />
                )}
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-[17px] leading-none w-6 text-center">{config.icon}</span>
                  <span className="text-[15px] flex-1" style={{ color: 'var(--color-text)' }}>
                    {routine.name || config.label}
                  </span>
                  <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    {activeStepCount} stap{activeStepCount !== 1 ? 'pen' : ''}
                  </span>
                </div>
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
    <div className="px-4 pb-32">
      {/* Large title header */}
      <div className="flex items-end justify-between pt-14 pb-2">
        <h1 className="text-[34px] font-bold tracking-tight" style={{ color: 'var(--color-text)', lineHeight: 1.1 }}>
          Routines
        </h1>
        <Link
          href="/routines/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[15px] font-semibold transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Nieuw
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3 mt-5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--color-surface)' }}
            />
          ))}
        </div>
      )}

      {!isLoading && groups && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3 mt-5"
        >
          {groups.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 gap-5">
              <p className="text-6xl">🌿</p>
              <div>
                <p className="text-[17px] font-semibold" style={{ color: 'var(--color-text)' }}>
                  Geen routines
                </p>
                <p className="text-[15px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Start met de vooraf ingevulde skincare routine, of maak zelf een nieuwe aan.
                </p>
              </div>
              <ImportRoutineButton />
              <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                of gebruik de knop rechtsboven
              </p>
            </div>
          ) : (
            groups.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
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
