'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  label?: string
  showPercent?: boolean
  color?: string
  height?: number
}

export default function ProgressBar({
  value,
  label,
  showPercent = false,
  color,
  height = 4,
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
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: 'var(--color-fill)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color ?? 'var(--color-primary)' }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  )
}
