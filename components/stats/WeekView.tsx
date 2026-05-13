'use client'

import { motion } from 'framer-motion'
import { DayData } from '@/lib/types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

const dayLetters = ['Z', 'M', 'D', 'W', 'D', 'V', 'Z']

interface WeekViewProps {
  weeklyData: DayData[]
}

export default function WeekView({ weeklyData }: WeekViewProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-3">Afgelopen week</h3>
      <div className="flex items-end justify-between gap-2">
        {weeklyData.map((day, i) => {
          const date = new Date(day.date + 'T00:00:00')
          const dayLetter = dayLetters[date.getDay()]
          const completionRate =
            day.totalCount > 0 ? (day.completedCount / day.totalCount) * 100 : 0

          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-full flex flex-col items-center">
                <div className="w-full bg-surface-elevated rounded-lg overflow-hidden" style={{ height: 60 }}>
                  <motion.div
                    className={`w-full rounded-lg transition-colors ${
                      day.isComplete
                        ? 'bg-success'
                        : completionRate > 0
                        ? 'bg-primary/50'
                        : 'bg-transparent'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${completionRate}%` }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
                    style={{ marginTop: 'auto' }}
                  />
                </div>
              </div>
              <span
                className={`text-[10px] font-medium ${
                  day.isComplete ? 'text-success' : 'text-text-muted'
                }`}
              >
                {dayLetter}
              </span>
              {day.totalCount > 0 && (
                <span className="text-[9px] text-text-muted">
                  {day.completedCount}/{day.totalCount}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
