'use client'

import { useState } from 'react'
import { startOfDay } from 'date-fns'
import { motion } from 'framer-motion'
import { useRoutineGroups } from '@/lib/hooks/useRoutines'
import { useCompletions, useToggleCompletion } from '@/lib/hooks/useCompletions'
import { isStepActiveToday } from '@/lib/utils/phaseUtils'
import WeekStrip from '@/components/dashboard/WeekStrip'
import CalendarDayView from '@/components/dashboard/CalendarDayView'
import ThemeToggle from '@/components/ui/ThemeToggle'
import ImportRoutineButton from '@/components/ui/ImportRoutineButton'
import { Routine, Step } from '@/lib/types'

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()))
  const [weekOffset, setWeekOffset] = useState(0)
  const { data: groups, isLoading } = useRoutineGroups()
  const { data: completions = [] } = useCompletions(selectedDate)
  const toggleCompletion = useToggleCompletion()

  const handleToggleStep = (stepId: string, isCompleted: boolean) => {
    toggleCompletion.mutate({ stepId, date: selectedDate, isCompleted })
  }

  const allRoutines =
    groups?.flatMap((g) => (g.routines ?? []) as (Routine & { steps: Step[] })[]) ?? []
  const activeRoutines = allRoutines.filter((r) =>
    r.steps.some((s) => isStepActiveToday(s, selectedDate))
  )

  const timedRoutines = activeRoutines
    .filter((r) => r.start_time && r.end_time)
    .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))
  const untimedRoutines = activeRoutines.filter((r) => !r.start_time || !r.end_time)

  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}
    >
      {/* Fixed top: safe area + header */}
      <div
        className="flex-shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 44px)' }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-end px-4 pt-2 pb-1">
          <ThemeToggle />
        </div>

        {/* Week strip */}
        <WeekStrip
          selectedDate={selectedDate}
          weekOffset={weekOffset}
          onDateChange={setSelectedDate}
          onWeekChange={setWeekOffset}
        />

        {/* Separator */}
        <div style={{ height: '0.5px', backgroundColor: 'var(--color-separator)' }} />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex flex-col gap-3 px-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl animate-pulse"
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
          className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5"
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

      {/* Calendar */}
      {!isLoading && groups && groups.length > 0 && (
        <CalendarDayView
          timedRoutines={timedRoutines}
          untimedRoutines={untimedRoutines}
          completions={completions}
          date={selectedDate}
          onToggleStep={handleToggleStep}
        />
      )}

      {/* Bottom nav safe area spacer */}
      <div
        className="flex-shrink-0"
        style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 70px)' }}
      />
    </div>
  )
}
