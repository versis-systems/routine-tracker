'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Info, X } from 'lucide-react'
import { Routine, Step, Completion } from '@/lib/types'
import { isStepActiveToday } from '@/lib/utils/phaseUtils'
import StepCheckbox from './StepCheckbox'
import ProgressBar from '@/components/ui/ProgressBar'

// ── Constants ──────────────────────────────────────────────────────────────────

const HOUR_HEIGHT = 56
const START_HOUR = 5
const END_HOUR = 24
const TOTAL_HOURS = END_HOUR - START_HOUR
const TIME_LABEL_WIDTH = 48

const BLOCK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  morning:   { bg: 'rgba(0, 122, 255, 0.10)',  border: '#007AFF', text: '#007AFF' },
  afternoon: { bg: 'rgba(255, 149, 0, 0.10)',  border: '#FF9500', text: '#C97500' },
  evening:   { bg: 'rgba(88, 86, 214, 0.10)',  border: '#5856D6', text: '#5856D6' },
  free:      { bg: 'rgba(52, 199, 89, 0.10)',  border: '#34C759', text: '#248A3D' },
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
      className="fixed inset-0 z-[60] flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
    >
      <motion.div
        className="w-full max-w-lg mx-auto rounded-t-3xl overflow-hidden flex flex-col"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
        style={{ backgroundColor: 'var(--color-surface)', maxHeight: '92dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'var(--color-fill)' }} />
        </div>

        {/* Header */}
        <div className="px-5 pt-1 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {routine.start_time && routine.end_time && (
                <div className="flex items-center gap-1 mb-1">
                  <Clock size={11} style={{ color: colors.border }} />
                  <p className="text-[12px] font-medium" style={{ color: colors.border }}>
                    {formatTime(routine.start_time)} – {formatTime(routine.end_time)}
                  </p>
                </div>
              )}
              <p className="text-[22px] font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
                {routine.name}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
              {routine.notes && (
                <button
                  onClick={() => setNotesOpen((v) => !v)}
                  className="p-2 rounded-full focus:outline-none"
                  style={{
                    color: notesOpen ? colors.border : 'var(--color-text-muted)',
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
              className="overflow-hidden px-5 mb-3 flex-shrink-0"
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
        <div className="overflow-y-auto flex-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
          <div
            className="mx-4 mb-6 rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-fill)' }}
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
            {activeSteps.length === 0 && (
              <p className="text-[14px] px-4 py-4" style={{ color: 'var(--color-text-muted)' }}>
                Geen stappen voor vandaag.
              </p>
            )}
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
  const clampedH = Math.max(heightPx, 28)
  const compact = clampedH < 44

  return (
    <motion.button
      className="absolute rounded-xl overflow-hidden text-left focus:outline-none"
      style={{
        top: topPx + 1,
        height: clampedH - 2,
        left: 0,
        right: 0,
        backgroundColor: isAllDone
          ? 'rgba(52,199,89,0.10)'
          : isDark()
          ? (DARK_BLOCK_COLORS[routine.time_of_day] ?? DARK_BLOCK_COLORS.free).bg
          : (BLOCK_COLORS[routine.time_of_day] ?? BLOCK_COLORS.free).bg,
        borderLeft: `3.5px solid ${isAllDone ? '#34C759' : colors.border}`,
        paddingLeft: 8,
        paddingRight: 6,
        paddingTop: compact ? 4 : 6,
        paddingBottom: compact ? 4 : 6,
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
        {isAllDone && '✓ '}{routine.name}
      </p>
      {!compact && routine.start_time && routine.end_time && (
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={9} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
            {formatTime(routine.start_time)} – {formatTime(routine.end_time)}
          </p>
        </div>
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

  useEffect(() => {
    if (!scrollRef.current) return
    const now = new Date()
    const targetHour = isToday ? now.getHours() + now.getMinutes() / 60 : 7
    scrollRef.current.scrollTop = Math.max(0, (targetHour - START_HOUR - 1.5) * HOUR_HEIGHT)
  }, [isToday])

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i)
  const totalHeight = TOTAL_HOURS * HOUR_HEIGHT

  const now = new Date()
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60
  const currentTimePx = (currentDecimalHour - START_HOUR) * HOUR_HEIGHT
  const currentTimeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Hele dag strip for untimed routines */}
      {untimedRoutines.length > 0 && (
        <div
          className="flex-shrink-0 border-b px-4 py-2 flex items-center gap-2 flex-wrap"
          style={{ borderColor: 'var(--color-separator)' }}
        >
          <span
            className="text-[11px] font-medium flex-shrink-0"
            style={{ width: TIME_LABEL_WIDTH - 8, color: 'var(--color-text-muted)', textAlign: 'right' }}
          >
            Hele dag
          </span>
          <div className="flex gap-2 flex-wrap flex-1">
            {untimedRoutines.map((routine) => {
              const colors = getBlockColors(routine.time_of_day)
              const activeSteps = routine.steps.filter((s) => isStepActiveToday(s, date))
              const completedIds = new Set(completions.map((c) => c.step_id))
              const completedCount = activeSteps.filter((s) => completedIds.has(s.id)).length
              const isAllDone = activeSteps.length > 0 && completedCount === activeSteps.length

              return (
                <motion.button
                  key={routine.id}
                  className="rounded-md px-2.5 py-1 text-left focus:outline-none"
                  style={{
                    backgroundColor: isAllDone ? 'rgba(52,199,89,0.10)' : colors.bg,
                    borderLeft: `3px solid ${isAllDone ? '#34C759' : colors.border}`,
                  }}
                  whileTap={{ scale: 0.96, opacity: 0.8 }}
                  onClick={() => setSelectedRoutine(routine)}
                >
                  <p
                    className="text-[12px] font-semibold truncate max-w-[120px]"
                    style={{ color: isAllDone ? '#34C759' : colors.text }}
                  >
                    {routine.name}
                  </p>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* Scrollable timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="relative" style={{ height: totalHeight }}>
          {/* Hour lines + labels */}
          {hours.map((hour) => {
            const topPx = (hour - START_HOUR) * HOUR_HEIGHT
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-start pointer-events-none"
                style={{ top: topPx }}
              >
                <span
                  className="flex-shrink-0 text-right select-none"
                  style={{
                    width: TIME_LABEL_WIDTH,
                    paddingRight: 8,
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                    marginTop: hour === START_HOUR ? 0 : -7,
                    lineHeight: 1,
                  }}
                >
                  {`${String(hour).padStart(2, '0')}:00`}
                </span>
                <div
                  className="flex-1"
                  style={{ height: '0.5px', backgroundColor: 'var(--color-separator)' }}
                />
              </div>
            )
          })}

          {/* Events column */}
          <div
            className="absolute"
            style={{ left: TIME_LABEL_WIDTH + 6, right: 6, top: 0, height: totalHeight }}
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
              style={{ top: currentTimePx - 9 }}
            >
              {/* Red pill with time */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full"
                style={{
                  width: TIME_LABEL_WIDTH,
                  paddingRight: 4,
                  paddingLeft: 4,
                }}
              >
                <span
                  className="text-[10px] font-bold rounded-full px-1.5 py-0.5"
                  style={{
                    color: '#FFFFFF',
                    backgroundColor: 'var(--color-danger)',
                    lineHeight: 1.4,
                  }}
                >
                  {currentTimeLabel}
                </span>
              </div>
              {/* Red dot + line */}
              <div className="flex items-center flex-1" style={{ marginTop: 9 }}>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-danger)', marginLeft: 2 }}
                />
                <div
                  className="flex-1"
                  style={{ height: 1.5, backgroundColor: 'var(--color-danger)' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

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
