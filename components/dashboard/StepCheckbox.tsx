'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Package } from 'lucide-react'
import { Step } from '@/lib/types'
import { getPhaseStatus } from '@/lib/utils/phaseUtils'

interface StepCheckboxProps {
  step: Step
  isCompleted: boolean
  onToggle: () => void
  date: Date
}

export default function StepCheckbox({ step, isCompleted, onToggle, date }: StepCheckboxProps) {
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  const phaseStatus = step.phase_enabled && step.phase_config && step.phase_start_date
    ? getPhaseStatus(step, date)
    : null
  const phaseLabel = phaseStatus?.label

  return (
    <motion.div layout className="py-2.5">
      <div className="flex items-center gap-3">
        {/* iOS-style circle checkbox */}
        <button
          onClick={onToggle}
          className="flex-shrink-0 focus:outline-none"
          style={{ width: 26, height: 26 }}
          aria-label={`${isCompleted ? 'Markeer als niet gedaan' : 'Markeer als gedaan'}: ${step.name}`}
        >
          <motion.div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              backgroundColor: isCompleted ? 'var(--color-primary)' : 'transparent',
              border: isCompleted ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
            }}
            whileTap={{ scale: 0.85 }}
            animate={isCompleted ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 400, damping: 20 }}
          >
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check size={13} strokeWidth={3} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p
              className="text-[15px] leading-snug flex-1 min-w-0 transition-all duration-200"
              style={{
                color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
                textDecoration: isCompleted ? 'line-through' : 'none',
                fontWeight: 400,
              }}
            >
              {step.name}
            </p>
            {step.instructions && (
              <button
                onClick={() => setInstructionsOpen((prev) => !prev)}
                className="flex-shrink-0 transition-colors focus:outline-none"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Toon instructies"
              >
                <motion.div
                  animate={{ rotate: instructionsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
            )}
          </div>
          {step.note && (
            <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {step.note}
            </p>
          )}
          {phaseLabel && (
            <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'var(--color-primary)' }}>
              {phaseLabel}
            </p>
          )}
          {step.product_name && (
            <div className="flex items-center gap-1 mt-0.5">
              <Package size={11} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {step.product_name}{step.product_brand ? ` — ${step.product_brand}` : ''}
              </p>
            </div>
          )}
          <AnimatePresence>
            {instructionsOpen && step.instructions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div
                  className="mt-2 rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: 'var(--color-fill)', border: 'none' }}
                >
                  <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text)' }}>
                    {step.instructions}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
