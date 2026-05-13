'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Routine, Step, Completion } from '@/lib/types'
import { isStepActiveToday } from '@/lib/utils/phaseUtils'
import StepCheckbox from './StepCheckbox'
import ProgressBar from '@/components/ui/ProgressBar'

const timeOfDayLabels: Record<string, string> = {
  morning: '🌅 Ochtend',
  afternoon: '☀️ Middag',
  evening: '🌙 Avond',
  free: '✨ Extra',
}

interface RoutineCardProps {
  routine: Routine & { steps: Step[] }
  completions: Completion[]
  date: Date
  onToggleStep: (stepId: string, isCompleted: boolean) => void
}

export default function RoutineCard({
  routine,
  completions,
  date,
  onToggleStep,
}: RoutineCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const activeSteps = routine.steps.filter((step) => isStepActiveToday(step, date))
  const completedStepIds = new Set(completions.map((c) => c.step_id))
  const completedCount = activeSteps.filter((s) => completedStepIds.has(s.id)).length
  const totalCount = activeSteps.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const isAllDone = totalCount > 0 && completedCount === totalCount

  if (totalCount === 0) return null

  return (
    <motion.div
      layout
      className={`rounded-2xl border overflow-hidden transition-colors duration-300 ${
        isAllDone
          ? 'border-success/30 bg-success/5'
          : 'border-border bg-surface'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-text-muted">
              {timeOfDayLabels[routine.time_of_day] || routine.time_of_day}
            </span>
            {isAllDone && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full"
              >
                Klaar!
              </motion.span>
            )}
          </div>
          <p className="text-base font-semibold text-text">{routine.name}</p>
          <div className="mt-2">
            <ProgressBar value={progress} />
          </div>
          <p className="text-xs text-text-muted mt-1">
            {completedCount}/{totalCount} stappen
          </p>
        </div>
        <ChevronDown
          size={18}
          className={`text-text-muted flex-shrink-0 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Steps */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border divide-y divide-border/50">
              {activeSteps.map((step) => (
                <StepCheckbox
                  key={step.id}
                  step={step}
                  isCompleted={completedStepIds.has(step.id)}
                  onToggle={() => onToggleStep(step.id, completedStepIds.has(step.id))}
                  date={date}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
