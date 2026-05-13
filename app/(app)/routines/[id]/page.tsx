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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-surface rounded-t-2xl w-full p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-text">Blok toevoegen</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-text mb-2">Tijdstip</p>
            <div className="grid grid-cols-2 gap-2">
              {timeOptions.map((t) => {
                const cfg = timeConfig[t]
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-2 ${
                      selectedTime === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface-elevated text-text-muted hover:border-primary/50'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Naam (optioneel)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={timeConfig[selectedTime].label}
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} fullWidth>
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-surface rounded-t-2xl w-full p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-text">Blok bewerken</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-text mb-2">Tijdstip</p>
            <div className="grid grid-cols-2 gap-2">
              {timeOptions.map((t) => {
                const cfg = timeConfig[t]
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-2 ${
                      selectedTime === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface-elevated text-text-muted hover:border-primary/50'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Naam</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={timeConfig[selectedTime].label}
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} fullWidth>
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
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {/* Block header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <span className="text-lg leading-none">{cfg.icon}</span>
          <span className="font-semibold text-text flex-1">{routine.name}</span>
          <button
            onClick={() => setShowEdit(true)}
            className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteRoutine.isPending}
            className="p-1.5 text-text-muted hover:text-red-400 rounded-lg hover:bg-surface-elevated transition-colors"
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
          className="text-xl font-bold text-text bg-surface-elevated border border-primary rounded-xl px-3 py-1 focus:outline-none"
        />
        <button onClick={save} className="p-1 text-success hover:text-success/80">
          <Check size={18} />
        </button>
        <button onClick={cancel} className="p-1 text-text-muted hover:text-text">
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-xl font-bold text-text hover:text-primary transition-colors text-left"
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
    <div className="px-4">
      <div className="flex items-center justify-between pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-text-muted hover:text-text rounded-xl hover:bg-surface-elevated transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          {group ? (
            <InlineNameEdit groupId={group.id} currentName={group.name} />
          ) : (
            <h1 className="text-xl font-bold text-text">Routine</h1>
          )}
        </div>
        <Link
          href={`/routines/${params.id}/info`}
          className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-surface-elevated transition-colors"
          aria-label="Info sectie"
        >
          <Info size={20} />
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="h-48 bg-surface rounded-2xl border border-border animate-pulse" />
          <div className="h-32 bg-surface rounded-2xl border border-border animate-pulse" />
        </div>
      )}

      {!isLoading && group && (
        <div className="space-y-4 pb-8">
          {/* Section label */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Blokken
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Block cards */}
          {routines.map((routine) => (
            <BlockCard key={routine.id} routine={routine} />
          ))}

          {/* Add block button */}
          <button
            onClick={() => setShowAddBlock(true)}
            className="w-full py-3.5 rounded-2xl border border-dashed border-border text-text-muted hover:text-text hover:border-primary transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Plus size={16} />
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
