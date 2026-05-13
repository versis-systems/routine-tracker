'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { startOfDay } from 'date-fns'
import { useRoutineGroups } from '@/lib/hooks/useRoutines'
import { useCompletions, useToggleCompletion } from '@/lib/hooks/useCompletions'
import { isStepActiveToday } from '@/lib/utils/phaseUtils'
import DaySelector from '@/components/dashboard/DaySelector'
import RoutineCard from '@/components/dashboard/RoutineCard'
import ThemeToggle from '@/components/ui/ThemeToggle'
import ProgressBar from '@/components/ui/ProgressBar'
import ImportRoutineButton from '@/components/ui/ImportRoutineButton'
import { Routine, Step } from '@/lib/types'

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()))
  const { data: groups, isLoading } = useRoutineGroups()
  const { data: completions = [] } = useCompletions(selectedDate)
  const toggleCompletion = useToggleCompletion()

  const handleToggleStep = (stepId: string, isCompleted: boolean) => {
    toggleCompletion.mutate({ stepId, date: selectedDate, isCompleted })
  }

  const allRoutines = groups?.flatMap((g) => (g.routines ?? []) as (Routine & { steps: Step[] })[]) ?? []
  const allActiveSteps = allRoutines.flatMap((r) =>
    r.steps.filter((s) => isStepActiveToday(s, selectedDate))
  )
  const completedStepIds = new Set(completions.map((c) => c.step_id))
  const completedCount = allActiveSteps.filter((s) => completedStepIds.has(s.id)).length
  const totalCount = allActiveSteps.length
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const showGroupHeaders = (groups?.length ?? 0) > 1

  return (
    <div className="px-4 pb-32">
      {/* Large title header */}
      <div className="flex items-end justify-between pt-14 pb-2">
        <h1 className="text-[34px] font-bold tracking-tight" style={{ color: 'var(--color-text)', lineHeight: 1.1 }}>
          Vandaag
        </h1>
        <ThemeToggle />
      </div>

      {/* Date selector */}
      <div className="mt-3 mb-5">
        <DaySelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Overall progress card */}
      {totalCount > 0 && (
        <div
          className="mb-5 rounded-2xl p-4"
          style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[15px] font-medium" style={{ color: 'var(--color-text)' }}>
              Voortgang
            </span>
            <span className="text-[15px] font-semibold" style={{ color: 'var(--color-primary)' }}>
              {completedCount}/{totalCount}
            </span>
          </div>
          <ProgressBar value={overallProgress} height={6} />
          {overallProgress === 100 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-[14px] font-semibold mt-2.5"
              style={{ color: 'var(--color-success)' }}
            >
              Alles gedaan! 🎉
            </motion.p>
          )}
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--color-surface)' }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      {!isLoading && groups && (
        <AnimatePresence>
          <div className="space-y-3">
            {groups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center py-16 gap-5"
              >
                <p className="text-6xl">✨</p>
                <div>
                  <p className="text-[17px] font-semibold" style={{ color: 'var(--color-text)' }}>
                    Welkom! Je hebt nog geen routines.
                  </p>
                  <p className="text-[15px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Importeer de skincare routine als startpunt, of maak er zelf een aan via Routines.
                  </p>
                </div>
                <ImportRoutineButton />
              </motion.div>
            ) : (
              groups.map((group, groupIndex) => {
                const routines = (group.routines ?? []) as (Routine & { steps: Step[] })[]
                const activeRoutines = routines.filter((r) =>
                  r.steps.some((s) => isStepActiveToday(s, selectedDate))
                )
                if (activeRoutines.length === 0) return null

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="space-y-3"
                  >
                    {showGroupHeaders && (
                      <p
                        className="text-[13px] font-semibold uppercase tracking-wide px-1"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {group.name}
                      </p>
                    )}
                    {activeRoutines.map((routine, routineIndex) => (
                      <motion.div
                        key={routine.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.06 + routineIndex * 0.04 }}
                      >
                        <RoutineCard
                          routine={routine}
                          completions={completions}
                          date={selectedDate}
                          onToggleStep={handleToggleStep}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )
              })
            )}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
