'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Info, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import {
  useRoutineGroup,
  useUpdateRoutineGroup,
  useCreateRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
} from '@/lib/hooks/useRoutines'
import { Routine, Step, TimeOfDay } from '@/lib/types'
import StepList from '@/components/routines/StepList'
import TimeSlotPicker from '@/components/ui/TimeSlotPicker'

interface PageProps {
  params: { id: string }
}

// Derive time_of_day from start_time so the calendar colors stay correct
function deriveTimeOfDay(startTime: string | null): TimeOfDay {
  if (!startTime) return 'free'
  const h = parseInt(startTime.split(':')[0])
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 23) return 'evening'
  return 'free'
}

const accentColors: Record<TimeOfDay, string> = {
  morning:   '#007AFF',
  afternoon: '#FF9500',
  evening:   '#5856D6',
  free:      '#34C759',
}

// ── Block Modal (shared add / edit) ──────────────────────────────────────────

interface BlockModalProps {
  groupId?: string
  routine?: Routine
  onClose: () => void
}

function BlockModal({ groupId, routine, onClose }: BlockModalProps) {
  const createRoutine = useCreateRoutine()
  const updateRoutine = useUpdateRoutine()
  const isEditing = !!routine

  const [name, setName] = useState(routine?.name ?? '')
  const [startTime, setStartTime] = useState<string | null>(routine?.start_time?.slice(0, 5) ?? null)
  const [endTime, setEndTime] = useState<string | null>(routine?.end_time?.slice(0, 5) ?? null)

  const timeOfDay = deriveTimeOfDay(startTime)
  const accent = accentColors[timeOfDay]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && routine) {
      await updateRoutine.mutateAsync({
        id: routine.id,
        name: name.trim() || 'Routine',
        time_of_day: timeOfDay,
        start_time: startTime,
        end_time: endTime,
      })
    } else if (groupId) {
      await createRoutine.mutateAsync({
        group_id: groupId,
        name: name.trim() || 'Routine',
        time_of_day: timeOfDay,
        description: null,
        notes: null,
        is_active: true,
        sort_order: 0,
        start_time: startTime,
        end_time: endTime,
      })
    }
    onClose()
  }

  const isPending = createRoutine.isPending || updateRoutine.isPending

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto rounded-t-3xl flex flex-col"
        style={{ backgroundColor: 'var(--color-surface)', maxHeight: '88dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed header */}
        <div className="flex-shrink-0 px-5 pt-3 pb-4">
          {/* Drag handle */}
          <div className="flex justify-center mb-3">
            <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'var(--color-fill)' }} />
          </div>
          {/* Title row */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-[15px] font-medium focus:outline-none"
              style={{ color: 'var(--color-primary)' }}
            >
              Annuleren
            </button>
            <h2 className="text-[17px] font-semibold" style={{ color: 'var(--color-text)' }}>
              {isEditing ? 'Blok bewerken' : 'Blok toevoegen'}
            </h2>
            <button
              type="submit"
              form="block-form"
              disabled={isPending}
              className="text-[15px] font-semibold focus:outline-none disabled:opacity-40"
              style={{ color: accent }}
            >
              {isPending ? '…' : isEditing ? 'Opslaan' : 'Voeg toe'}
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <form id="block-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                className="block text-[13px] font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Naam
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bijv. Ochtend Routine"
                className="w-full rounded-xl px-4 py-3 text-[15px] focus:outline-none"
                style={{ backgroundColor: 'var(--color-fill)', color: 'var(--color-text)', border: 'none' }}
              />
            </div>

            {/* Time slot picker */}
            <div>
              <p
                className="text-[13px] font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Tijdslot
              </p>
              <TimeSlotPicker
                startTime={startTime}
                endTime={endTime}
                onChange={(s, e) => { setStartTime(s); setEndTime(e) }}
                accentColor={accent}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Block Card ─────────────────────────────────────────────────────────────────

const timeIcons: Record<TimeOfDay, string> = {
  morning: '🌅', afternoon: '☀️', evening: '🌙', free: '✨',
}

interface BlockCardProps {
  routine: Routine & { steps: Step[] }
}

function BlockCard({ routine }: BlockCardProps) {
  const deleteRoutine = useDeleteRoutine()
  const [showEdit, setShowEdit] = useState(false)
  const icon = timeIcons[routine.time_of_day] ?? '✨'
  const accent = accentColors[routine.time_of_day] ?? accentColors.free

  const handleDelete = async () => {
    if (!confirm(`Weet je zeker dat je "${routine.name}" wilt verwijderen?`)) return
    await deleteRoutine.mutateAsync(routine.id)
  }

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '0.5px solid var(--color-separator)' }}
        >
          <span className="text-xl leading-none">{icon}</span>
          <div className="flex-1 min-w-0">
            <span className="text-[17px] font-semibold block leading-tight" style={{ color: 'var(--color-text)' }}>
              {routine.name}
            </span>
            {routine.start_time && routine.end_time ? (
              <span className="text-[13px] font-medium" style={{ color: accent }}>
                {routine.start_time.slice(0, 5)} – {routine.end_time.slice(0, 5)}
              </span>
            ) : (
              <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                Geen tijdslot
              </span>
            )}
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="p-2 rounded-full focus:outline-none active:opacity-60"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteRoutine.isPending}
            className="p-2 rounded-full focus:outline-none active:opacity-60 disabled:opacity-40"
            style={{ color: 'var(--color-danger)' }}
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Steps */}
        <div className="p-4">
          <StepList steps={routine.steps ?? []} routineId={routine.id} />
        </div>
      </div>

      {showEdit && (
        <BlockModal routine={routine} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}

// ── Inline group name edit ─────────────────────────────────────────────────────

function InlineNameEdit({ groupId, currentName }: { groupId: string; currentName: string }) {
  const updateGroup = useUpdateRoutineGroup()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentName)

  const save = async () => {
    if (value.trim() && value.trim() !== currentName) {
      await updateGroup.mutateAsync({ id: groupId, name: value.trim() })
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setValue(currentName); setEditing(false) } }}
          className="text-[28px] font-bold rounded-xl px-3 py-1 focus:outline-none"
          style={{ color: 'var(--color-text)', backgroundColor: 'var(--color-fill)', border: 'none' }}
        />
        <button onClick={save} className="p-1 focus:outline-none" style={{ color: 'var(--color-success)' }}>
          <Check size={18} />
        </button>
        <button onClick={() => { setValue(currentName); setEditing(false) }} className="p-1 focus:outline-none" style={{ color: 'var(--color-text-muted)' }}>
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-[34px] font-bold tracking-tight text-left focus:outline-none active:opacity-60"
      style={{ color: 'var(--color-text)', lineHeight: 1.1 }}
    >
      {currentName}
    </button>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function GroupDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { data: group, isLoading } = useRoutineGroup(params.id)
  const [showAddBlock, setShowAddBlock] = useState(false)

  const routines = (group?.routines ?? []) as (Routine & { steps: Step[] })[]

  return (
    <div className="px-4 pb-32">
      {/* Nav bar */}
      <div className="flex items-center justify-between pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 -ml-1 focus:outline-none active:opacity-60"
          style={{ color: 'var(--color-primary)' }}
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
          <span className="text-[17px]">Terug</span>
        </button>
        <Link
          href={`/routines/${params.id}/info`}
          className="p-2 rounded-full focus:outline-none active:opacity-60"
          style={{ color: 'var(--color-primary)' }}
        >
          <Info size={20} />
        </Link>
      </div>

      {/* Large title */}
      <div className="mb-5">
        {group ? (
          <InlineNameEdit groupId={group.id} currentName={group.name} />
        ) : (
          <h1 className="text-[34px] font-bold tracking-tight" style={{ color: 'var(--color-text)', lineHeight: 1.1 }}>
            Routine
          </h1>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          ))}
        </div>
      )}

      {!isLoading && group && (
        <div className="space-y-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide px-1" style={{ color: 'var(--color-text-muted)' }}>
            Blokken
          </p>

          {routines.map((routine) => (
            <BlockCard key={routine.id} routine={routine} />
          ))}

          <button
            onClick={() => setShowAddBlock(true)}
            className="w-full py-3.5 rounded-2xl text-[15px] font-medium flex items-center justify-center gap-2 focus:outline-none active:opacity-60"
            style={{ border: '1.5px dashed var(--color-border)', color: 'var(--color-primary)', backgroundColor: 'transparent' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Blok toevoegen
          </button>
        </div>
      )}

      {showAddBlock && group && (
        <BlockModal groupId={group.id} onClose={() => setShowAddBlock(false)} />
      )}
    </div>
  )
}
