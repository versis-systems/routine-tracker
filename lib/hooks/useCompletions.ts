'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Completion } from '@/lib/types'
import { toDateString } from '@/lib/utils/dateUtils'

const supabase = createClient()

export function useCompletions(date: Date) {
  const dateStr = toDateString(date)

  return useQuery({
    queryKey: ['completions', dateStr],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_date', dateStr)

      if (error) throw error
      return data as Completion[]
    },
  })
}

export function useCompletionsForRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['completions', 'range', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_date', startDate)
        .lte('completed_date', endDate)

      if (error) throw error
      return data as Completion[]
    },
  })
}

export function useToggleCompletion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      stepId,
      date,
      isCompleted,
    }: {
      stepId: string
      date: Date
      isCompleted: boolean
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const dateStr = toDateString(date)

      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from('completions')
          .delete()
          .eq('user_id', user.id)
          .eq('step_id', stepId)
          .eq('completed_date', dateStr)

        if (error) throw error
        return { stepId, date: dateStr, completed: false }
      } else {
        // Add completion
        const { data, error } = await supabase
          .from('completions')
          .insert({
            user_id: user.id,
            step_id: stepId,
            completed_date: dateStr,
          })
          .select()
          .single()

        if (error) throw error
        return { stepId, date: dateStr, completed: true, data }
      }
    },
    onMutate: async ({ stepId, date, isCompleted }) => {
      const dateStr = toDateString(date)
      const queryKey = ['completions', dateStr]

      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Completion[]>(queryKey)

      // Optimistic update
      queryClient.setQueryData<Completion[]>(queryKey, (old) => {
        if (!old) return []
        if (isCompleted) {
          return old.filter((c) => c.step_id !== stepId)
        } else {
          return [
            ...old,
            {
              id: `optimistic-${stepId}`,
              user_id: 'optimistic',
              step_id: stepId,
              completed_date: dateStr,
              created_at: new Date().toISOString(),
            },
          ]
        }
      })

      return { previous, dateStr }
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['completions', context.dateStr], context.previous)
      }
    },
    onSettled: (_, __, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['completions', toDateString(date)] })
      queryClient.invalidateQueries({ queryKey: ['completions', 'range'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}
