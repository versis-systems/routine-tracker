import { Step, PhaseStatus } from '@/lib/types'
import { getWeeksFromDate, getDayOfWeek } from './dateUtils'

export function getPhaseStatus(step: Step, today: Date): PhaseStatus {
  // If phase is not enabled, use normal repeat logic
  if (!step.phase_enabled || !step.phase_config || !step.phase_start_date) {
    return {
      isActive: true,
      activeDays: step.repeat_days,
      label: '',
    }
  }

  const startDate = new Date(step.phase_start_date)
  const weekNumber = getWeeksFromDate(startDate, today)
  const dayOfWeek = getDayOfWeek(today)

  const { phases } = step.phase_config

  // Find the current phase
  let currentPhase = phases[phases.length - 1] // Default to last phase
  for (const phase of phases) {
    const withinStart = weekNumber >= phase.week_start
    const withinEnd = phase.week_end === null || weekNumber <= phase.week_end
    if (withinStart && withinEnd) {
      currentPhase = phase
      break
    }
  }

  if (!currentPhase.active) {
    return {
      isActive: false,
      activeDays: [],
      label: currentPhase.label,
    }
  }

  const isActiveToday =
    currentPhase.days.length === 0 || currentPhase.days.includes(dayOfWeek)

  return {
    isActive: isActiveToday,
    activeDays: currentPhase.days,
    label: currentPhase.label,
  }
}

export function isStepActiveToday(step: Step, today: Date): boolean {
  if (!step.is_active) return false

  const dayOfWeek = getDayOfWeek(today)

  // Handle phase logic
  if (step.phase_enabled && step.phase_config && step.phase_start_date) {
    const phaseStatus = getPhaseStatus(step, today)
    return phaseStatus.isActive
  }

  // Handle repeat rules
  switch (step.repeat_rule) {
    case 'daily':
      return true
    case 'specific_days':
      return step.repeat_days.includes(dayOfWeek)
    case 'x_per_week':
      // For x_per_week, we show it every day but track the count
      // The UI will handle showing completion count vs target
      return true
    default:
      return true
  }
}
