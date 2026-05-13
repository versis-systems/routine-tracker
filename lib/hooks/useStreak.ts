'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Step, StreakData, DayData } from '@/lib/types'
import { getLast30Days, getLast7Days, toDateString } from '@/lib/utils/dateUtils'
import { isStepActiveToday } from '@/lib/utils/phaseUtils'

const supabase = createClient()

export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: async (): Promise<StreakData> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          completionRate30Days: 0,
          weeklyData: [],
        }
      }

      // Get all active steps
      const { data: routines } = await supabase
        .from('routines')
        .select('*, steps(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)

      const allSteps: Step[] = routines?.flatMap((r) => r.steps || []) ?? []

      // Get completions for last 30 days
      const last30Days = getLast30Days()
      const startDate = toDateString(last30Days[0])
      const endDate = toDateString(last30Days[last30Days.length - 1])

      const { data: completions } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_date', startDate)
        .lte('completed_date', endDate)

      const completionsByDate = new Map<string, Set<string>>()
      completions?.forEach((c) => {
        if (!completionsByDate.has(c.completed_date)) {
          completionsByDate.set(c.completed_date, new Set())
        }
        completionsByDate.get(c.completed_date)!.add(c.step_id)
      })

      // Calculate daily completion status
      const dayDataList: DayData[] = last30Days.map((day) => {
        const dateStr = toDateString(day)
        const activeSteps = allSteps.filter((step) => isStepActiveToday(step, day))
        const completedStepIds = completionsByDate.get(dateStr) || new Set()
        const completedCount = activeSteps.filter((s) => completedStepIds.has(s.id)).length
        const totalCount = activeSteps.length

        return {
          date: dateStr,
          isComplete: totalCount > 0 && completedCount >= totalCount,
          completedCount,
          totalCount,
        }
      })

      // Current streak (from today backwards)
      let currentStreak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = dayDataList.length - 1; i >= 0; i--) {
        const day = dayDataList[i]
        if (day.totalCount === 0) continue // Skip days with no active steps

        if (day.isComplete) {
          currentStreak++
        } else {
          // Allow today to be incomplete without breaking streak
          const dayDate = new Date(day.date + 'T00:00:00')
          if (dayDate.getTime() === today.getTime() && i === dayDataList.length - 1) {
            continue
          }
          break
        }
      }

      // Longest streak
      let longestStreak = 0
      let tempStreak = 0
      for (const day of dayDataList) {
        if (day.totalCount === 0) continue
        if (day.isComplete) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          tempStreak = 0
        }
      }

      // 30-day completion rate
      const daysWithSteps = dayDataList.filter((d) => d.totalCount > 0)
      const completedDays = daysWithSteps.filter((d) => d.isComplete)
      const completionRate30Days =
        daysWithSteps.length > 0
          ? Math.round((completedDays.length / daysWithSteps.length) * 100)
          : 0

      // Weekly data (last 7 days)
      const weeklyData = dayDataList.slice(-7)

      return {
        currentStreak,
        longestStreak,
        completionRate30Days,
        weeklyData,
      }
    },
    staleTime: 60 * 1000, // 1 minute
  })
}
