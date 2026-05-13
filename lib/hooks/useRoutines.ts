'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Routine, RoutineGroup, Step } from '@/lib/types'

const supabase = createClient()

export function useRoutineGroups() {
  return useQuery({
    queryKey: ['routine-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routine_groups')
        .select(`
          *,
          routines (
            *,
            steps (*)
          )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('sort_order', { ascending: true, foreignTable: 'routines' })
        .order('sort_order', { ascending: true, foreignTable: 'steps' })
      if (error) throw error
      return data as RoutineGroup[]
    },
  })
}

export function useRoutineGroup(id: string) {
  return useQuery({
    queryKey: ['routine-groups', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routine_groups')
        .select(`*, routines(*, steps(*))`)
        .eq('id', id)
        .order('sort_order', { ascending: true, foreignTable: 'routines' })
        .order('sort_order', { ascending: true, foreignTable: 'steps' })
        .single()
      if (error) throw error
      return data as RoutineGroup
    },
    enabled: !!id,
  })
}

export function useCreateRoutineGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (group: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('routine_groups')
        .insert({ ...group, user_id: user.id })
        .select().single()
      if (error) throw error
      return data as RoutineGroup
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routine-groups'] }),
  })
}

export function useUpdateRoutineGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RoutineGroup> & { id: string }) => {
      const { data, error } = await supabase
        .from('routine_groups')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['routine-groups'] })
      queryClient.invalidateQueries({ queryKey: ['routine-groups', v.id] })
    },
  })
}

export function useDeleteRoutineGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('routine_groups').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routine-groups'] }),
  })
}

export function useRoutines() {
  return useQuery({
    queryKey: ['routines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          steps (*)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('sort_order', { ascending: true, foreignTable: 'steps' })

      if (error) throw error
      return data as (Routine & { steps: Step[] })[]
    },
  })
}

export function useRoutine(id: string) {
  return useQuery({
    queryKey: ['routines', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          steps (*)
        `)
        .eq('id', id)
        .order('sort_order', { ascending: true, foreignTable: 'steps' })
        .single()

      if (error) throw error
      return data as Routine & { steps: Step[] }
    },
    enabled: !!id,
  })
}

export function useCreateRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (routine: Omit<Routine, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('routines')
        .insert({ ...routine, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      queryClient.invalidateQueries({ queryKey: ['routine-groups'] })
    },
  })
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Routine> & { id: string }) => {
      const { data, error } = await supabase
        .from('routines')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      queryClient.invalidateQueries({ queryKey: ['routines', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['routine-groups'] })
    },
  })
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      queryClient.invalidateQueries({ queryKey: ['routine-groups'] })
    },
  })
}

export function useCreateStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (step: Omit<Step, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('steps')
        .insert(step)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routines', data.routine_id] })
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      queryClient.invalidateQueries({ queryKey: ['routine-groups'] })
    },
  })
}

export function useUpdateStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Step> & { id: string }) => {
      const { data, error } = await supabase
        .from('steps')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routines', data.routine_id] })
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      queryClient.invalidateQueries({ queryKey: ['routine-groups'] })
    },
  })
}

export function useDeleteStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, routineId }: { id: string; routineId: string }) => {
      const { error } = await supabase
        .from('steps')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { routineId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routines', data.routineId] })
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      queryClient.invalidateQueries({ queryKey: ['routine-groups'] })
    },
  })
}

export function useReorderSteps() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (steps: { id: string; sort_order: number }[]) => {
      const updates = steps.map(({ id, sort_order }) =>
        supabase.from('steps').update({ sort_order }).eq('id', id)
      )
      await Promise.all(updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      queryClient.invalidateQueries({ queryKey: ['routine-groups'] })
    },
  })
}
