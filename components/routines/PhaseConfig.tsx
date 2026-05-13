'use client'

import { PhaseConfig, PhaseItem } from '@/lib/types'

const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

interface PhaseConfigDisplayProps {
  config: PhaseConfig
  startDate: string
}

export default function PhaseConfigDisplay({ config, startDate }: PhaseConfigDisplayProps) {
  const today = new Date()
  const start = new Date(startDate)
  const diffWeeks = Math.floor((today.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1

  const currentPhase = config.phases.find((phase) => {
    const inStart = diffWeeks >= phase.week_start
    const inEnd = phase.week_end === null || diffWeeks <= phase.week_end
    return inStart && inEnd
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Opbouwschema</p>
        <span className="text-xs text-primary font-medium">Week {diffWeeks}</span>
      </div>

      {config.phases.map((phase, i) => {
        const isCurrentPhase = currentPhase === phase
        return (
          <div
            key={i}
            className={`p-3 rounded-xl border text-xs transition-all ${
              isCurrentPhase
                ? 'border-primary/50 bg-primary/5'
                : 'border-border bg-surface-elevated'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  isCurrentPhase ? 'bg-primary' : 'bg-border'
                }`}
              />
              <p className={`font-medium ${isCurrentPhase ? 'text-primary' : 'text-text-muted'}`}>
                {phase.label}
              </p>
            </div>
            {phase.active && phase.days.length > 0 && (
              <div className="flex gap-1 mt-1.5 ml-4">
                {dayNames.map((day, dayIndex) => (
                  <span
                    key={dayIndex}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      phase.days.includes(dayIndex)
                        ? 'bg-primary/20 text-primary'
                        : 'bg-surface text-text-muted'
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            )}
            {!phase.active && (
              <p className="ml-4 text-text-muted text-[10px] mt-0.5">Inactief in deze fase</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
