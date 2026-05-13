'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // 0-100
  label?: string
  showPercent?: boolean
  color?: string
  height?: number
}

export default function ProgressBar({
  value,
  label,
  showPercent = false,
  color = 'bg-primary',
  height = 6,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-text-muted">{label}</span>}
          {showPercent && (
            <span className="text-xs font-medium text-text-muted">{Math.round(clamped)}%</span>
          )}
        </div>
      )}
      <div
        className="w-full bg-surface-elevated rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
