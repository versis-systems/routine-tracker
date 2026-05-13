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
import Button from '@/components/ui/Button'

interface PageProps {
  params: { id: string }
}

const timeConfig: Record<TimeOfDay, { label: string; icon: string }> = {
  morning: { label: 'Ochtend', icon: '🌅' },
  afternoon: { label: 'Middag', icon: '☀️' },
  evening: { label: 'Avond', icon: '🌙' },
  free: { label: 'Extra', icon: '✨' },
}

const timeOptions: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'free']

// ── Add Block Modal ────────────────────────────────────────────────────────────

interface AddBlockModalProps {
  groupId: string
  onClose: () => void
}

function AddBlockModal({ groupId, onClose }: AddBlockModalProps) {
  const createRoutine = useCreateRoutine()
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>('morning')
  const [customName, setCustomName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cfg = timeConfig[selectedTime]
    await createRoutine.mutateAsync({
      group_id: groupId,
      time_of_day: selectedTime,
      name: customName.trim() || cfg.label,
      description: null,
      notes: null,
      is_active: true,
      sort_order: 0,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6 space-y-5"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center -mt-1">
          <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'var(--color-fill)' }} />
        </div>
        <h2 className="text-[17px] font-semibold text-center" style={{ color: 'var(--color-text)' }}>
          Blok toevoegen
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Tijdstip
            </p>
            <div className="grid grid-cols-2 gap-2">
              {timeOptions.map((t) => {
                const cfg = timeConfig[t]
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className="py-3 px-3 rounded-xl text-[15px] font-medium transition-all text-left flex items-center gap-2.5 focus:outline-none"
                    style={{
                      backgroundColor: selectedTime === t ? 'var(--color-primary)' : 'var(--color-fill)',
                      color: selectedTime === t ? '#fff' : 'var(--color-text)',
                    }}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label
              className="block text-[13px] font-semibold uppercase tracking-wide mb-1.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Naam (optioneel)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={timeConfig[selectedTime].label}
              className="w-full rounded-xl px-4 py-3 text-[15px] focus:outline-none"
              style={{
                backgroundColor: 'var(--color-fill)',
                color: 'var(--color-text)',
                border: 'none',
              }}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Annuleren
            </Button>
            <Button type="submit" loading={createRoutine.isPending} fullWidth>
              Toevoegen
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit Block Modal ───────────────────────────────────────────────────────────

interface EditBlockModalProps {
  routine: Routine
  onClose: () => void
}

function EditBlockModal({ routine, onClose }: EditBlockModalProps) {
  const updateRoutine = useUpdateRoutine()
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>(routine.time_of_day)
  const [name, setName] = useState(routine.name)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateRoutine.mutateAsync({
      id: routine.id,
      time_of_day: selectedTime,
      name: name.trim() || timeConfig[selectedTime].label,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6 space-y-5"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center -mt-1">
          <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'var(--color-fill)' }} />
        </div>
        <h2 className="text-[17px] font-semibold text-center" style={{ color: 'var(--color-text)' }}>
          Blok bewerken
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Tijdstip
            </p>
            <div className="grid grid-cols-2 gap-2">
              {timeOptions.map((t) => {
                const cfg = timeConfig[t]
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className="py-3 px-3 rounded-xl text-[15px] font-medium transition-all text-left flex items-center gap-2.5 focus:outline-none"
                    style={{
                      backgroundColor: selectedTime === t ? 'var(--color-primary)' : 'var(--color-fill)',
                      color: selectedTime === t ? '#fff' : 'var(--color-text)',
                    }}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Naam
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={timeConfig[selectedTime].label}
              className="w-full rounded-xl px-4 py-3 text-[15px] focus:outline-none"
              style={{ backgroundColor: 'var(--color-fill)', color: 'var(--color-text)', border: 'none' }}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Annuleren
            </Button>
            <Button type="submit" loading={updateRoutine.isPending} fullWidth>
              Opslaan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Block Card ─────────────────────────────────────────────────────────────────

interface BlockCardProps {
  routine: Routine & { steps: Step[] }
}

function BlockCard({ routine }: BlockCardProps) {
  const deleteRoutine = useDeleteRoutine()
  const [showEdit, setShowEdit] = useState(false)
  const cfg = timeConfig[routine.time_of_day] ?? { label: routine.time_of_day, icon: '✨' }

  const handleDelete = async () => {
    if (!confirm(`Weet je zeker dat je het blok "${routine.name}" wilt verwijderen?`)) return
    await deleteRoutine.mutateAsync(routine.id)
  }

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {/* Block header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: '0.5px solid var(--color-separator)' }}
        >
          <span className="text-xl leading-none">{cfg.icon}</span>
          <span className="text-[17px] font-semibold flex-1" style={{ color: 'var(--color-text)' }}>
            {routine.name}
          </span>
          <button
            onClick={() => setShowEdit(true)}
            className="p-2 rounded-full focus:outline-none active:opacity-60 transition-opacity"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteRoutine.isPending}
            className="p-2 rounded-full focus:outline-none active:opacity-60 transition-opacity disabled:opacity-40"
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
        <EditBlockModal routine={routine} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}

// ── Inline group name edit ─────────────────────────────────────────────────────

interface InlineNameEditProps {
  groupId: string
  currentName: string
}

function InlineNameEdit({ groupId, currentName }: InlineNameEditProps) {
  const updateGroup = useUpdateRoutineGroup()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentName)

  const save = async () => {
    if (value.trim() && value.trim() !== currentName) {
      await updateGroup.mutateAsync({ id: groupId, name: value.trim() })
    }
    setEditing(false)
  }

  const cancel = () => {
    setValue(currentName)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') cancel()
          }}
          className="text-[20px] font-bold rounded-xl px-3 py-1 focus:outline-none"
          style={{
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-fill)',
            border: 'none',
          }}
        />
        <button onClick={save} className="p-1 focus:outline-none" style={{ color: 'var(--color-success)' }}>
          <Check size={18} />
        </button>
        <button onClick={cancel} className="p-1 focus:outline-none" style={{ color: 'var(--color-text-muted)' }}>
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-[20px] font-bold text-left focus:outline-none transition-opacity active:opacity-60"
      style={{ color: 'var(--color-text)' }}
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
      {/* iOS-style navigation bar */}
      <div className="flex items-center justify-between pt-14 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 -ml-1 focus:outline-none active:opacity-60 transition-opacity"
            style={{ color: 'var(--color-primary)' }}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
            <span className="text-[17px]">Terug</span>
          </button>
        </div>
        <Link
          href={`/routines/${params.id}/info`}
          className="p-2 rounded-full focus:outline-none active:opacity-60 transition-opacity"
          style={{ color: 'var(--color-primary)' }}
          aria-label="Info sectie"
        >
          <Info size={20} />
        </Link>
      </div>

      {/* Page title */}
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
          <div className="h-48 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          <div className="h-32 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
        </div>
      )}

      {!isLoading && group && (
        <div className="space-y-3">
          {/* Section label */}
          <p
            className="text-[13px] font-semibold uppercase tracking-wide px-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Blokken
          </p>

          {routines.map((routine) => (
            <BlockCard key={routine.id} routine={routine} />
          ))}

          {/* Add block button */}
          <button
            onClick={() => setShowAddBlock(true)}
            className="w-full py-3.5 rounded-2xl text-[15px] font-medium flex items-center justify-center gap-2 focus:outline-none active:opacity-60 transition-opacity"
            style={{
              border: '1.5px dashed var(--color-border)',
              color: 'var(--color-primary)',
              backgroundColor: 'transparent',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Blok toevoegen
          </button>
        </div>
      )}

      {showAddBlock && group && (
        <AddBlockModal groupId={group.id} onClose={() => setShowAddBlock(false)} />
      )}
    </div>
  )
}
