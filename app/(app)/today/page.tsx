'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { startOfDay } from 'date-fns'
import { useRoutines } from '@/lib/hooks/useRoutines'
import { useCompletions, useToggleCompletion } from '@/lib/hooks/useCompletions'
import { isStepActiveToday } from '@/lib/utils/phaseUtils'
import DaySelector from '@/components/dashboard/DaySelector'
import RoutineCard from '@/components/dashboard/RoutineCard'
import ThemeToggle from '@/components/ui/ThemeToggle'
import ProgressBar from '@/components/ui/ProgressBar'
import ImportRoutineButton from '@/components/ui/ImportRoutineButton'

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()))
  const { data: routines, isLoading } = useRoutines()
  const { data: completions = [] } = useCompletions(selectedDate)
  const toggleCompletion = useToggleCompletion()

  const handleToggleStep = (stepId: string, isCompleted: boolean) => {
    toggleCompletion.mutate({ stepId, date: selectedDate, isCompleted })
  }

  // Calculate overall progress
  const allActiveSteps =
    routines?.flatMap((r) =>
      r.steps.filter((s) => isStepActiveToday(s, selectedDate))
    ) ?? []
  const completedStepIds = new Set(completions.map((c) => c.step_id))
  const completedCount = allActiveSteps.filter((s) => completedStepIds.has(s.id)).length
  const totalCount = allActiveSteps.length
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="px-4 pt-safe">
      {/* Header */}
      <div className="flex items-center justify-between pt-12 pb-4">
        <h1 className="text-2xl font-bold text-text">Dagboek</h1>
        <ThemeToggle />
      </div>

      {/* Date selector */}
      <div className="mb-5">
        <DaySelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Overall progress */}
      {totalCount > 0 && (
        <div className="mb-5 bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text">Totale voortgang</span>
            <span className="text-sm font-semibold text-primary">
              {completedCount}/{totalCount}
            </span>
          </div>
          <ProgressBar value={overallProgress} height={8} />
          {overallProgress === 100 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm font-medium text-success mt-2"
            >
              Alles gedaan! 🎉
            </motion.p>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-surface rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      )}

      {/* Routines */}
      {!isLoading && routines && (
        <AnimatePresence>
          <div className="space-y-4">
            {routines.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center py-12 gap-4"
              >
                <p className="text-5xl">✨</p>
                <div>
                  <p className="text-text font-semibold text-base">Welkom! Je hebt nog geen routines.</p>
                  <p className="text-text-muted text-sm mt-1">
                    Importeer de skincare routine als startpunt, of maak er zelf een aan via Routines.
                  </p>
                </div>
                <ImportRoutineButton />
              </motion.div>
            ) : (
              routines.map((routine, index) => (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                >
                  <RoutineCard
                    routine={routine}
                    completions={completions}
                    date={selectedDate}
                    onToggleStep={handleToggleStep}
                  />
                </motion.div>
              ))
            )}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
