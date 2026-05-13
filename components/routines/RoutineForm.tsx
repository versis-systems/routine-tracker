'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Routine, TimeOfDay } from '@/lib/types'
import Button from '@/components/ui/Button'
import { useCreateRoutine, useUpdateRoutine, useDeleteRoutine } from '@/lib/hooks/useRoutines'

interface RoutineFormProps {
  routine?: Partial<Routine>
  onSuccess?: () => void
}

const timeOptions: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Ochtend' },
  { value: 'afternoon', label: 'Middag' },
  { value: 'evening', label: 'Avond' },
  { value: 'free', label: 'Vrij' },
]

export default function RoutineForm({ routine, onSuccess }: RoutineFormProps) {
  const router = useRouter()
  const createRoutine = useCreateRoutine()
  const updateRoutine = useUpdateRoutine()
  const deleteRoutine = useDeleteRoutine()

  const [name, setName] = useState(routine?.name || '')
  const [description, setDescription] = useState(routine?.description || '')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(routine?.time_of_day || 'morning')
  const [isActive, setIsActive] = useState(routine?.is_active !== false)

  const isEditing = !!routine?.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditing && routine?.id) {
      await updateRoutine.mutateAsync({
        id: routine.id,
        name,
        description: description || null,
        time_of_day: timeOfDay,
        is_active: isActive,
      })
    } else {
      await createRoutine.mutateAsync({
        name,
        description: description || null,
        time_of_day: timeOfDay,
        is_active: isActive,
        sort_order: 0,
      })
    }

    onSuccess?.()
    router.push('/routines')
  }

  const handleDelete = async () => {
    if (!routine?.id || !confirm('Weet je zeker dat je deze routine wilt verwijderen?')) return
    await deleteRoutine.mutateAsync(routine.id)
    router.push('/routines')
  }

  const isPending = createRoutine.isPending || updateRoutine.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Naam <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Bijv. Ochtend Skincare"
          className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Beschrijving
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optionele beschrijving..."
          rows={3}
          className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Tijdstip
        </label>
        <div className="grid grid-cols-2 gap-2">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTimeOfDay(option.value)}
              className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                timeOfDay === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface-elevated text-text-muted hover:border-primary/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 py-2">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-primary rounded border-border"
        />
        <label htmlFor="is_active" className="text-sm text-text">
          Actieve routine
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending} fullWidth>
          {isEditing ? 'Opslaan' : 'Aanmaken'}
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            loading={deleteRoutine.isPending}
          >
            Verwijder
          </Button>
        )}
      </div>
    </form>
  )
}
