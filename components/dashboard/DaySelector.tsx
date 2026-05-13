'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateDisplay, toDateString } from '@/lib/utils/dateUtils'
import { isToday, subDays, addDays, startOfDay } from 'date-fns'

interface DaySelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export default function DaySelector({ selectedDate, onDateChange }: DaySelectorProps) {
  const today = startOfDay(new Date())
  const isCurrentDay = toDateString(selectedDate) === toDateString(today)

  const goBack = () => onDateChange(subDays(selectedDate, 1))
  const goForward = () => onDateChange(addDays(selectedDate, 1))
  const goToday = () => onDateChange(today)

  return (
    <div className="flex items-center gap-3 justify-between">
      <button
        onClick={goBack}
        className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
        aria-label="Vorige dag"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={goToday}
        className="flex-1 text-center"
      >
        <span className="text-lg font-semibold text-text capitalize">
          {formatDateDisplay(selectedDate)}
        </span>
        {!isCurrentDay && (
          <span className="block text-xs text-primary mt-0.5">Tik voor vandaag</span>
        )}
      </button>

      <button
        onClick={goForward}
        disabled={isCurrentDay}
        className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Volgende dag"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
