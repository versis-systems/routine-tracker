'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Info } from 'lucide-react'
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

export default function RoutineCard({ routine, completions, date, onToggleStep }: RoutineCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [notesOpen, setNotesOpen] = useState(false)

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
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: isAllDone ? '1px solid rgba(52, 199, 89, 0.3)' : 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 min-w-0 text-left focus:outline-none"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[13px]" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {timeOfDayLabels[routine.time_of_day] || routine.time_of_day}
              </span>
              <AnimatePresence>
                {isAllDone && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: 'var(--color-success)', backgroundColor: 'rgba(52, 199, 89, 0.12)' }}
                  >
                    Klaar ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className="text-[17px] font-semibold" style={{ color: 'var(--color-text)' }}>
              {routine.name}
            </p>
          </button>

          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            {routine.notes && (
              <button
                onClick={() => setNotesOpen((prev) => !prev)}
                className="p-1.5 rounded-full transition-colors focus:outline-none"
                style={{
                  color: notesOpen ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  backgroundColor: notesOpen ? 'var(--color-fill)' : 'transparent',
                }}
                aria-label="Toon notities"
              >
                <Info size={17} />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-full transition-all focus:outline-none"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <ProgressBar value={progress} height={3} />
          <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
            {completedCount} van {totalCount}
          </p>
        </div>
      </div>

      {/* Notes panel */}
      <AnimatePresence>
        {notesOpen && routine.notes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mx-4 mb-3 rounded-xl px-3.5 py-3"
              style={{ backgroundColor: 'var(--color-fill)', border: 'none' }}
            >
              <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text)' }}>
                {routine.notes}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps — iOS inset grouped list style */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mx-3 mb-3 rounded-xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-fill-secondary)' }}
            >
              {activeSteps.map((step, index) => (
                <div key={step.id}>
                  {index > 0 && (
                    <div
                      className="ml-12"
                      style={{ height: '0.5px', backgroundColor: 'var(--color-separator)' }}
                    />
                  )}
                  <div className="px-3">
                    <StepCheckbox
                      step={step}
                      isCompleted={completedStepIds.has(step.id)}
                      onToggle={() => onToggleStep(step.id, completedStepIds.has(step.id))}
                      date={date}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
