export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'free'
export type RepeatRule = 'daily' | 'specific_days' | 'x_per_week'

export interface PhaseItem {
  week_start: number
  week_end: number | null
  active: boolean
  days: number[]
  label: string
}

export interface PhaseConfig {
  phases: PhaseItem[]
}

export interface ProductInfo {
  name: string
  brand: string
  when: string
  owned: boolean
}

export interface ExpectedResult {
  label: string
  timeframe: string
}

export interface RoutineGroup {
  id: string
  user_id: string
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  routines?: (Routine & { steps: Step[] })[]
}

export interface Routine {
  id: string
  user_id: string
  name: string
  description: string | null
  time_of_day: TimeOfDay
  is_active: boolean
  sort_order: number
  notes: string | null
  group_id: string | null
  created_at: string
  updated_at: string
  steps?: Step[]
}

export interface Step {
  id: string
  routine_id: string
  name: string
  note: string | null
  repeat_rule: RepeatRule
  repeat_days: number[]
  repeat_count: number
  is_active: boolean
  sort_order: number
  phase_enabled: boolean
  phase_start_date: string | null
  phase_config: PhaseConfig | null
  instructions: string | null
  product_name: string | null
  product_brand: string | null
  created_at: string
}

export interface Completion {
  id: string
  user_id: string
  step_id: string
  completed_date: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  routine_id: string
  notify_time: string
  is_active: boolean
  created_at: string
}

export interface RoutineInfo {
  id: string
  routine_id: string
  expected_results: ExpectedResult[]
  rules: string[]
  products: ProductInfo[]
  free_text: string | null
  created_at: string
  updated_at: string
}

export interface PhaseStatus {
  isActive: boolean
  activeDays: number[]
  label: string
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  completionRate30Days: number
  weeklyData: DayData[]
}

export interface DayData {
  date: string
  isComplete: boolean
  completedCount: number
  totalCount: number
}
