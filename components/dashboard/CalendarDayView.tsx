'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Info, X } from 'lucide-react'
import { Routine, Step, Completion } from '@/lib/types'
import { isStepActiveToday } from '@/lib/utils/phaseUtils'
import StepCheckbox from './StepCheckbox'
import ProgressBar from '@/components/ui/ProgressBar'

// ── Constants ──────────────────────────────────────────────────────────────────

const HOUR_HEIGHT = 64 // px per hour
const START_HOUR = 5   // 5:00
const END_HOUR = 24    // midnight
const TOTAL_HOURS = END_HOUR - START_HOUR
const TIME_LABEL_WIDTH = 44

const BLOCK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  morning:   { bg: 'rgba(0, 122, 255, 0.12)',  border: '#007AFF', text: '#007AFF' },
  afternoon: { bg: 'rgba(255, 149, 0, 0.12)',  border: '#FF9500', text: '#C97500' },
  evening:   { bg: 'rgba(88, 86, 214, 0.12)',  border: '#5856D6', text: '#5856D6' },
  free:      { bg: 'rgba(52, 199, 89, 0.12)',  border: '#34C759', text: '#248A3D' },
}

const DARK_BLOCK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  morning:   { bg: 'rgba(10, 132, 255, 0.18)', border: '#0A84FF', text: '#0A84FF' },
  afternoon: { bg: 'rgba(255, 159, 10, 0.18)', border: '#FF9F0A', text: '#FF9F0A' },
  evening:   { bg: 'rgba(94, 92, 230, 0.18)',  border: '#5E5CE6', text: '#5E5CE6' },
  free:      { bg: 'rgba(48, 209, 88, 0.18)',  border: '#30D158', text: '#30D158' },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

function formatTime(t: string): string {
  const [h, m] = t.split(':')
  return `${h}:${m}`
}

function isDark(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.getAttribute('data-theme') === 'dark'
}

function getBlockColors(timeOfDay: string) {
  const dark = isDark()
  return (dark ? DARK_BLOCK_COLORS : BLOCK_COLORS)[timeOfDay] ?? BLOCK_COLORS.free
}

// ── Step Sheet ─────────────────────────────────────────────────────────────────

interface StepSheetProps {
  routine: Routine & { steps: Step[] }
  completions: Completion[]
  date: Date
  onToggleStep: (stepId: string, isCompleted: boolean) => void
  onClose: () => void
}

function StepSheet({ routine, completions, date, onToggleStep, onClose }: StepSheetProps) {
  const activeSteps = routine.steps.filter((s) => isStepActiveToday(s, date))
  const completedIds = new Set(completions.map((c) => c.step_id))
  const completedCount = activeSteps.filter((s) => completedIds.has(s.id)).length
  const progress = activeSteps.length > 0 ? (completedCount / activeSteps.length) * 100 : 0
  const colors = getBlockColors(routine.time_of_day)
  const [notesOpen, setNotesOpen] = useState(false)

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
    >
      <motion.div
        className="w-full max-w-lg mx-auto rounded-t-3xl overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
        style={{ backgroundColor: 'var(--color-surface)', maxHeight: '80dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'var(--color-fill)' }} />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium mb-0.5" style={{ color: colors.text }}>
                {routine.start_time && routine.end_time
                  ? `${formatTime(routine.start_time)} – ${formatTime(routine.end_time)}`
                  : 'Ongepland'}
              </p>
              <p className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
                {routine.name}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
              {routine.notes && (
                <button
                  onClick={() => setNotesOpen((v) => !v)}
                  className="p-2 rounded-full focus:outline-none"
                  style={{
                    color: notesOpen ? colors.text : 'var(--color-text-muted)',
                    backgroundColor: notesOpen ? 'var(--color-fill)' : 'transparent',
                  }}
                >
                  <Info size={17} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full focus:outline-none"
                style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-fill)' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <ProgressBar value={progress} height={3} color={colors.border} />
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {completedCount} van {activeSteps.length}
            </p>
          </div>
        </div>

        {/* Notes */}
        <AnimatePresence>
          {notesOpen && routine.notes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-5 mb-3"
            >
              <div className="rounded-xl px-3.5 py-3" style={{ backgroundColor: 'var(--color-fill)' }}>
                <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text)' }}>
                  {routine.notes}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps */}
        <div className="overflow-y-auto" style={{ maxHeight: '50dvh' }}>
          <div
            className="mx-4 mb-6 rounded-2xl overflow-hidden"
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
                    isCompleted={completedIds.has(step.id)}
                    onToggle={() => onToggleStep(step.id, completedIds.has(step.id))}
                    date={date}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Calendar Event Block ───────────────────────────────────────────────────────

interface CalendarBlockProps {
  routine: Routine & { steps: Step[] }
  completions: Completion[]
  date: Date
  topPx: number
  heightPx: number
  onTap: () => void
}

function CalendarBlock({ routine, completions, date, topPx, heightPx, onTap }: CalendarBlockProps) {
  const activeSteps = routine.steps.filter((s) => isStepActiveToday(s, date))
  const completedIds = new Set(completions.map((c) => c.step_id))
  const completedCount = activeSteps.filter((s) => completedIds.has(s.id)).length
  const isAllDone = activeSteps.length > 0 && completedCount === activeSteps.length
  const colors = getBlockColors(routine.time_of_day)
  const compact = heightPx < 48

  return (
    <motion.button
      className="absolute rounded-xl overflow-hidden text-left focus:outline-none w-full"
      style={{
        top: topPx,
        height: Math.max(heightPx, 32),
        backgroundColor: isAllDone ? 'rgba(52,199,89,0.12)' : colors.bg,
        borderLeft: `3px solid ${isAllDone ? '#34C759' : colors.border}`,
        padding: compact ? '4px 8px' : '6px 10px',
      }}
      whileTap={{ scale: 0.97, opacity: 0.85 }}
      onClick={onTap}
    >
      <p
        className="font-semibold leading-tight truncate"
        style={{
          fontSize: compact ? 11 : 13,
          color: isAllDone ? '#34C759' : colors.text,
        }}
      >
        {isAllDone ? '✓ ' : ''}{routine.name}
      </p>
      {!compact && routine.start_time && routine.end_time && (
        <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {formatTime(routine.start_time)} – {formatTime(routine.end_time)}
        </p>
      )}
      {!compact && activeSteps.length > 0 && (
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {completedCount}/{activeSteps.length}
        </p>
      )}
    </motion.button>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface CalendarDayViewProps {
  timedRoutines: (Routine & { steps: Step[] })[]
  untimedRoutines: (Routine & { steps: Step[] })[]
  completions: Completion[]
  date: Date
  onToggleStep: (stepId: string, isCompleted: boolean) => void
}

export default function CalendarDayView({
  timedRoutines,
  untimedRoutines,
  completions,
  date,
  onToggleStep,
}: CalendarDayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedRoutine, setSelectedRoutine] = useState<(Routine & { steps: Step[] }) | null>(null)
  const isToday = date.toDateString() === new Date().toDateString()

  // Scroll to current time (or 7am) on mount
  useEffect(() => {
    if (!scrollRef.current) return
    const now = new Date()
    const targetHour = isToday ? now.getHours() + now.getMinutes() / 60 : 7
    const scrollTo = Math.max(0, (targetHour - START_HOUR - 1) * HOUR_HEIGHT)
    scrollRef.current.scrollTop = scrollTo
  }, [isToday])

  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i)
  const totalHeight = TOTAL_HOURS * HOUR_HEIGHT

  // Current time position
  const now = new Date()
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60
  const currentTimePx = (currentDecimalHour - START_HOUR) * HOUR_HEIGHT

  return (
    <div className="flex flex-col gap-0">
      {/* Scrollable timeline */}
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight: 'calc(100dvh - 260px)', minHeight: 300 }}
      >
        <div className="relative" style={{ height: totalHeight }}>
          {/* Hour lines + labels */}
          {hours.map((hour) => {
            const topPx = (hour - START_HOUR) * HOUR_HEIGHT
            const label = hour < 24 ? `${String(hour).padStart(2, '0')}:00` : '00:00'
            return (
              <div key={hour} className="absolute left-0 right-0 flex items-start" style={{ top: topPx }}>
                <span
                  className="text-[11px] font-medium select-none flex-shrink-0 text-right"
                  style={{
                    width: TIME_LABEL_WIDTH,
                    paddingRight: 8,
                    color: 'var(--color-text-muted)',
                    marginTop: -7,
                  }}
                >
                  {label}
                </span>
                <div
                  className="flex-1"
                  style={{ height: '0.5px', backgroundColor: 'var(--color-separator)', marginTop: 0 }}
                />
              </div>
            )
          })}

          {/* Events area */}
          <div
            className="absolute"
            style={{
              left: TIME_LABEL_WIDTH + 4,
              right: 4,
              top: 0,
              height: totalHeight,
            }}
          >
            {timedRoutines.map((routine) => {
              if (!routine.start_time || !routine.end_time) return null
              const startH = parseTime(routine.start_time)
              const endH = parseTime(routine.end_time)
              const topPx = (startH - START_HOUR) * HOUR_HEIGHT
              const heightPx = Math.max((endH - startH) * HOUR_HEIGHT, 28)
              return (
                <CalendarBlock
                  key={routine.id}
                  routine={routine}
                  completions={completions}
                  date={date}
                  topPx={topPx}
                  heightPx={heightPx}
                  onTap={() => setSelectedRoutine(routine)}
                />
              )
            })}
          </div>

          {/* Current time indicator */}
          {isToday && currentDecimalHour >= START_HOUR && currentDecimalHour <= END_HOUR && (
            <div
              className="absolute left-0 right-0 flex items-center pointer-events-none"
              style={{ top: currentTimePx }}
            >
              <span
                className="text-[10px] font-bold flex-shrink-0 text-right"
                style={{ width: TIME_LABEL_WIDTH, paddingRight: 6, color: 'var(--color-danger)' }}
              >
                {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
              </span>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-danger)' }} />
              <div className="flex-1" style={{ height: 1.5, backgroundColor: 'var(--color-danger)' }} />
            </div>
          )}
        </div>
      </div>

      {/* Untimed routines */}
      {untimedRoutines.length > 0 && (
        <div className="mt-4">
          <p
            className="text-[13px] font-semibold uppercase tracking-wide px-1 mb-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Ongepland
          </p>
          <div className="space-y-2">
            {untimedRoutines.map((routine) => {
              const colors = getBlockColors(routine.time_of_day)
              const activeSteps = routine.steps.filter((s) => isStepActiveToday(s, date))
              const completedIds = new Set(completions.map((c) => c.step_id))
              const completedCount = activeSteps.filter((s) => completedIds.has(s.id)).length
              const isAllDone = activeSteps.length > 0 && completedCount === activeSteps.length

              return (
                <motion.button
                  key={routine.id}
                  className="w-full text-left rounded-xl px-4 py-3 focus:outline-none flex items-center gap-3"
                  style={{
                    backgroundColor: isAllDone ? 'rgba(52,199,89,0.1)' : colors.bg,
                    borderLeft: `3px solid ${isAllDone ? '#34C759' : colors.border}`,
                  }}
                  whileTap={{ scale: 0.98, opacity: 0.8 }}
                  onClick={() => setSelectedRoutine(routine)}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[15px] font-semibold"
                      style={{ color: isAllDone ? '#34C759' : colors.text }}
                    >
                      {isAllDone ? '✓ ' : ''}{routine.name}
                    </p>
                  </div>
                  <span className="text-[13px] flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    {completedCount}/{activeSteps.length}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step sheet */}
      <AnimatePresence>
        {selectedRoutine && (
          <StepSheet
            routine={selectedRoutine}
            completions={completions}
            date={date}
            onToggleStep={onToggleStep}
            onClose={() => setSelectedRoutine(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
