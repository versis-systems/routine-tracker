'use client'

import { useMemo } from 'react'
import { addDays, startOfWeek, isSameDay, format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_ABBR = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

interface WeekStripProps {
  selectedDate: Date
  weekOffset: number
  onDateChange: (date: Date) => void
  onWeekChange: (offset: number) => void
}

export default function WeekStrip({
  selectedDate,
  weekOffset,
  onDateChange,
  onWeekChange,
}: WeekStripProps) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const weekStart = useMemo(() => {
    const base = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 })
    return base
  }, [today, weekOffset])

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const monthLabel = format(days[3], 'MMMM yyyy', { locale: nl })
  const capitalised = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return (
    <div
      className="flex-shrink-0 px-4 pt-3 pb-2"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Month row */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
          {capitalised}
        </h2>
        <div className="flex items-center gap-0">
          <button
            onClick={() => onWeekChange(weekOffset - 1)}
            className="p-2 focus:outline-none active:opacity-50"
            style={{ color: 'var(--color-primary)' }}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onWeekChange(weekOffset + 1)}
            className="p-2 focus:outline-none active:opacity-50"
            style={{ color: 'var(--color-primary)' }}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Day strip */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          const isSelected = isSameDay(day, selectedDate)
          const isSelectedToday = isToday && isSelected
          const isSelectedNotToday = isSelected && !isToday

          return (
            <button
              key={i}
              onClick={() => onDateChange(day)}
              className="flex flex-col items-center gap-0.5 py-1 focus:outline-none"
            >
              <span
                className="text-[11px] font-medium"
                style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              >
                {DAY_ABBR[i]}
              </span>
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: isSelectedToday
                    ? 'var(--color-danger)'
                    : isSelectedNotToday
                    ? 'var(--color-primary)'
                    : 'transparent',
                }}
              >
                <span
                  className="text-[15px] font-semibold"
                  style={{
                    color: isSelected
                      ? '#FFFFFF'
                      : isToday
                      ? 'var(--color-danger)'
                      : 'var(--color-text)',
                  }}
                >
                  {format(day, 'd')}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
