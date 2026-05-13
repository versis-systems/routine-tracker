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
    <motion.div
      layout
      className={`py-3 px-1 transition-opacity duration-200 ${
        isCompleted ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="relative flex-shrink-0 mt-0.5"
          style={{ width: 28, height: 28 }}
          aria-label={`${isCompleted ? 'Markeer als niet gedaan' : 'Markeer als gedaan'}: ${step.name}`}
        >
          <motion.div
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
              isCompleted
                ? 'bg-success border-success'
                : 'border-border bg-transparent hover:border-primary'
            }`}
            whileTap={{ scale: 0.85 }}
            animate={isCompleted ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Check size={14} strokeWidth={3} className="text-white" />
              </motion.div>
            )}
          </motion.div>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p
              className={`text-sm font-medium leading-snug transition-colors duration-200 flex-1 min-w-0 ${
                isCompleted ? 'text-text-muted line-through' : 'text-text'
              }`}
            >
              {step.name}
            </p>
            {step.instructions && (
              <button
                onClick={() => setInstructionsOpen((prev) => !prev)}
                className="flex-shrink-0 text-text-muted hover:text-primary transition-colors"
                aria-label="Toon instructies"
              >
                <motion.div
                  animate={{ rotate: instructionsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={15} />
                </motion.div>
              </button>
            )}
          </div>
          {step.note && (
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{step.note}</p>
          )}
          {phaseLabel && (
            <p className="text-xs text-primary mt-0.5 font-medium">{phaseLabel}</p>
          )}
          {(step.product_name) && (
            <div className="flex items-center gap-1 mt-0.5">
              <Package size={11} className="text-text-muted flex-shrink-0" />
              <p className="text-xs text-text-muted leading-relaxed">
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
                <div className="mt-2 bg-surface-elevated border border-border rounded-xl px-3 py-2.5">
                  <p className="text-xs text-text leading-relaxed whitespace-pre-line">
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
