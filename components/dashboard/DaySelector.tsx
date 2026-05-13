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

  return (
    <div
      className="flex items-center gap-2 rounded-2xl px-2 py-1"
      style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <button
        onClick={() => onDateChange(subDays(selectedDate, 1))}
        className="p-2 rounded-xl focus:outline-none active:opacity-60 transition-opacity"
        style={{ color: 'var(--color-primary)' }}
        aria-label="Vorige dag"
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>

      <button onClick={() => onDateChange(today)} className="flex-1 text-center py-1 focus:outline-none">
        <span className="text-[17px] font-semibold capitalize" style={{ color: 'var(--color-text)' }}>
          {formatDateDisplay(selectedDate)}
        </span>
        {!isCurrentDay && (
          <span className="block text-[12px] mt-0.5" style={{ color: 'var(--color-primary)' }}>
            Tik voor vandaag
          </span>
        )}
      </button>

      <button
        onClick={() => onDateChange(addDays(selectedDate, 1))}
        disabled={isCurrentDay}
        className="p-2 rounded-xl focus:outline-none active:opacity-60 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ color: 'var(--color-primary)' }}
        aria-label="Volgende dag"
      >
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>
    </div>
  )
}
