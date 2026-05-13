'use client'

import { useRef, useEffect, useState } from 'react'

const HOUR_HEIGHT = 22     // px per hour
const START_HOUR = 5
const END_HOUR = 23
const TOTAL_HOURS = END_HOUR - START_HOUR
const LABEL_WIDTH = 42

function snap(decimal: number): number {
  // Snap to nearest 15 minutes
  return Math.round(decimal * 4) / 4
}

function decToStr(dec: number): string {
  const h = Math.floor(dec)
  const m = Math.round((dec % 1) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function strToDec(s: string): number {
  const [h, m] = s.split(':').map(Number)
  return h + m / 60
}

function formatDisplay(dec: number): string {
  const h = Math.floor(dec)
  const m = Math.round((dec % 1) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

interface TimeSlotPickerProps {
  startTime: string | null
  endTime: string | null
  onChange: (start: string | null, end: string | null) => void
  accentColor?: string
}

type Phase = 'idle' | 'awaiting-end'

export default function TimeSlotPicker({
  startTime,
  endTime,
  onChange,
  accentColor = '#007AFF',
}: TimeSlotPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selStart, setSelStart] = useState<number | null>(startTime ? strToDec(startTime) : null)
  const [selEnd, setSelEnd] = useState<number | null>(endTime ? strToDec(endTime) : null)
  const [phase, setPhase] = useState<Phase>('idle')

  // Scroll to show selection or 7am on mount
  useEffect(() => {
    if (!containerRef.current) return
    const target = selStart ?? 7
    containerRef.current.scrollTop = Math.max(0, (target - START_HOUR - 1.5) * HOUR_HEIGHT)
  }, [])

  const getTimeFromEvent = (e: React.MouseEvent<HTMLDivElement>): number => {
    const rect = containerRef.current!.getBoundingClientRect()
    const y = e.clientY - rect.top + containerRef.current!.scrollTop
    return Math.max(START_HOUR, Math.min(END_HOUR - 0.25, snap(START_HOUR + y / HOUR_HEIGHT)))
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const t = getTimeFromEvent(e)

    if (phase === 'idle') {
      // First tap → set start, wait for end
      setSelStart(t)
      setSelEnd(null)
      setPhase('awaiting-end')
    } else {
      // Second tap → set end
      if (t > selStart!) {
        setSelEnd(t)
        setPhase('idle')
        onChange(decToStr(selStart!), decToStr(t))
      } else if (t < selStart!) {
        // Tapped above → move start up
        setSelStart(t)
      } else {
        // Same spot → default 1 hour
        const end = Math.min(selStart! + 1, END_HOUR)
        setSelEnd(end)
        setPhase('idle')
        onChange(decToStr(selStart!), decToStr(end))
      }
    }
  }

  const clear = () => {
    setSelStart(null)
    setSelEnd(null)
    setPhase('idle')
    onChange(null, null)
  }

  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i)
  const hasRange = selStart !== null && selEnd !== null
  const blockTop = hasRange ? (selStart! - START_HOUR) * HOUR_HEIGHT : null
  const blockH = hasRange ? (selEnd! - selStart!) * HOUR_HEIGHT : null
  const startLineTop = phase === 'awaiting-end' && selStart !== null
    ? (selStart - START_HOUR) * HOUR_HEIGHT
    : null

  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
          {phase === 'awaiting-end'
            ? `${formatDisplay(selStart!)} → tik eindtijd`
            : hasRange
              ? `${formatDisplay(selStart!)} – ${formatDisplay(selEnd!)}`
              : 'Tik starttijd aan'}
        </p>
        {(hasRange || phase === 'awaiting-end') && (
          <button
            type="button"
            onClick={clear}
            className="text-[13px] focus:outline-none"
            style={{ color: 'var(--color-danger)' }}
          >
            Wissen
          </button>
        )}
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        className="relative overflow-y-auto rounded-2xl"
        style={{
          height: 280,
          backgroundColor: 'var(--color-fill)',
          cursor: 'crosshair',
          WebkitOverflowScrolling: 'touch',
        }}
        onClick={handleClick}
      >
        <div className="relative select-none" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>

          {/* Hour lines */}
          {hours.map((hour) => {
            const top = (hour - START_HOUR) * HOUR_HEIGHT
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-center pointer-events-none"
                style={{ top }}
              >
                <span
                  className="flex-shrink-0 text-right text-[10px] font-medium"
                  style={{
                    width: LABEL_WIDTH,
                    paddingRight: 8,
                    color: 'var(--color-text-muted)',
                    marginTop: hour === START_HOUR ? 0 : -6,
                  }}
                >
                  {hour < END_HOUR ? `${String(hour).padStart(2, '0')}:00` : ''}
                </span>
                <div
                  className="flex-1"
                  style={{ height: '0.5px', backgroundColor: 'var(--color-separator)' }}
                />
              </div>
            )
          })}

          {/* Half-hour markers */}
          {Array.from({ length: TOTAL_HOURS }, (_, i) => i).map((i) => {
            const top = (i + 0.5) * HOUR_HEIGHT
            return (
              <div
                key={`h-${i}`}
                className="absolute pointer-events-none"
                style={{
                  top,
                  left: LABEL_WIDTH,
                  right: 0,
                  height: '0.5px',
                  backgroundColor: 'var(--color-separator)',
                  opacity: 0.4,
                }}
              />
            )
          })}

          {/* Selected range block */}
          {blockTop !== null && blockH !== null && (
            <div
              className="absolute rounded-xl pointer-events-none"
              style={{
                top: blockTop + 1,
                height: Math.max(blockH - 2, 12),
                left: LABEL_WIDTH + 4,
                right: 4,
                backgroundColor: `${accentColor}20`,
                border: `1.5px solid ${accentColor}`,
              }}
            >
              {/* Time labels inside block if tall enough */}
              {blockH >= 30 && (
                <div className="flex flex-col justify-between h-full px-2 py-1">
                  <span className="text-[10px] font-semibold" style={{ color: accentColor }}>
                    {formatDisplay(selStart!)}
                  </span>
                  {blockH >= 44 && (
                    <span className="text-[10px] font-semibold" style={{ color: accentColor }}>
                      {formatDisplay(selEnd!)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Start-tap indicator (awaiting end) */}
          {startLineTop !== null && (
            <div
              className="absolute flex items-center pointer-events-none"
              style={{ top: startLineTop, left: LABEL_WIDTH + 4, right: 4 }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
              <div className="flex-1" style={{ height: 1.5, backgroundColor: accentColor }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
