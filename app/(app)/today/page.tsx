'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { startOfDay } from 'date-fns'
import { useRoutineGroups } from '@/lib/hooks/useRoutines'
import { useCompletions, useToggleCompletion } from '@/lib/hooks/useCompletions'
import { isStepActiveToday } from '@/lib/utils/phaseUtils'
import DaySelector from '@/components/dashboard/DaySelector'
import CalendarDayView from '@/components/dashboard/CalendarDayView'
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

  // All active routines for today across all groups
  const allRoutines = groups?.flatMap((g) => (g.routines ?? []) as (Routine & { steps: Step[] })[]) ?? []
  const activeRoutines = allRoutines.filter((r) =>
    r.steps.some((s) => isStepActiveToday(s, selectedDate))
  )

  // Split into timed (positioned in calendar) and untimed
  const timedRoutines = activeRoutines.filter((r) => r.start_time && r.end_time)
    .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))
  const untimedRoutines = activeRoutines.filter((r) => !r.start_time || !r.end_time)

  // Progress
  const allActiveSteps = activeRoutines.flatMap((r) =>
    r.steps.filter((s) => isStepActiveToday(s, selectedDate))
  )
  const completedStepIds = new Set(completions.map((c) => c.step_id))
  const completedCount = allActiveSteps.filter((s) => completedStepIds.has(s.id)).length
  const totalCount = allActiveSteps.length
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="px-4 pb-32">
      {/* Large title */}
      <div className="flex items-end justify-between pt-14 pb-2">
        <h1 className="text-[34px] font-bold tracking-tight" style={{ color: 'var(--color-text)', lineHeight: 1.1 }}>
          Vandaag
        </h1>
        <ThemeToggle />
      </div>

      {/* Date selector */}
      <div className="mt-3 mb-4">
        <DaySelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Overall progress */}
      {totalCount > 0 && (
        <div
          className="mb-4 rounded-2xl px-4 py-3"
          style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[15px] font-medium" style={{ color: 'var(--color-text)' }}>Voortgang</span>
            <span className="text-[15px] font-semibold" style={{ color: 'var(--color-primary)' }}>
              {completedCount}/{totalCount}
            </span>
          </div>
          <ProgressBar value={overallProgress} height={4} />
          {overallProgress === 100 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-[14px] font-semibold mt-2"
              style={{ color: 'var(--color-success)' }}
            >
              Alles gedaan! 🎉
            </motion.p>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--color-surface)' }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && groups?.length === 0 && (
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
      )}

      {/* Calendar day view */}
      {!isLoading && groups && groups.length > 0 && (
        <CalendarDayView
          timedRoutines={timedRoutines}
          untimedRoutines={untimedRoutines}
          completions={completions}
          date={selectedDate}
          onToggleStep={handleToggleStep}
        />
      )}
    </div>
  )
}
