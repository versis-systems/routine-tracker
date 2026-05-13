'use client'

import { useState } from 'react'
import { Step, RepeatRule } from '@/lib/types'
import Button from '@/components/ui/Button'
import Toggle from '@/components/ui/Toggle'
import { useCreateStep, useUpdateStep, useDeleteStep } from '@/lib/hooks/useRoutines'
import { X } from 'lucide-react'

interface StepFormProps {
  routineId: string
  step?: Step
  sortOrder?: number
  onClose: () => void
}

const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

const repeatRuleOptions: { value: RepeatRule; label: string }[] = [
  { value: 'daily', label: 'Dagelijks' },
  { value: 'specific_days', label: 'Specifieke dagen' },
  { value: 'x_per_week', label: 'X per week' },
]

export default function StepForm({ routineId, step, sortOrder = 0, onClose }: StepFormProps) {
  const createStep = useCreateStep()
  const updateStep = useUpdateStep()
  const deleteStep = useDeleteStep()

  const [name, setName] = useState(step?.name || '')
  const [note, setNote] = useState(step?.note || '')
  const [instructions, setInstructions] = useState(step?.instructions || '')
  const [productName, setProductName] = useState(step?.product_name || '')
  const [productBrand, setProductBrand] = useState(step?.product_brand || '')
  const [repeatRule, setRepeatRule] = useState<RepeatRule>(step?.repeat_rule || 'daily')
  const [repeatDays, setRepeatDays] = useState<number[]>(step?.repeat_days || [])
  const [repeatCount, setRepeatCount] = useState(step?.repeat_count || 1)
  const [isActive, setIsActive] = useState(step?.is_active !== false)
  const [phaseEnabled, setPhaseEnabled] = useState(step?.phase_enabled || false)
  const [phaseStartDate, setPhaseStartDate] = useState(
    step?.phase_start_date || new Date().toISOString().split('T')[0]
  )

  const toggleDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const isEditing = !!step?.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      routine_id: routineId,
      name,
      note: note || null,
      instructions: instructions || null,
      product_name: productName || null,
      product_brand: productBrand || null,
      repeat_rule: repeatRule,
      repeat_days: repeatRule === 'specific_days' ? repeatDays : [],
      repeat_count: repeatRule === 'x_per_week' ? repeatCount : 1,
      is_active: isActive,
      sort_order: step?.sort_order ?? sortOrder,
      phase_enabled: phaseEnabled,
      phase_start_date: phaseEnabled ? phaseStartDate : null,
      phase_config: step?.phase_config ?? null,
    }

    if (isEditing && step?.id) {
      await updateStep.mutateAsync({ id: step.id, ...data })
    } else {
      await createStep.mutateAsync(data)
    }

    onClose()
  }

  const handleDelete = async () => {
    if (!step?.id || !confirm('Stap verwijderen?')) return
    await deleteStep.mutateAsync({ id: step.id, routineId })
    onClose()
  }

  const isPending = createStep.isPending || updateStep.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-text">
            {isEditing ? 'Stap bewerken' : 'Stap toevoegen'}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
              Naam *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Bijv. Vitamine C serum"
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
              Notitie
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bijv. op droge huid aanbrengen"
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
              Instructies
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Bijv. Breng een kleine hoeveelheid aan op droge huid, vermijd het ooggebied. Wacht 1 minuut voor de volgende stap."
              rows={3}
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
              Productnaam
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Bijv. Retinol 0.5% in Squalane"
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
              Merk
            </label>
            <input
              type="text"
              value={productBrand}
              onChange={(e) => setProductBrand(e.target.value)}
              placeholder="Bijv. The Ordinary"
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
              Herhaling
            </label>
            <div className="flex gap-2">
              {repeatRuleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRepeatRule(opt.value)}
                  className={`flex-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                    repeatRule === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface-elevated text-text-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {repeatRule === 'specific_days' && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                Dagen
              </label>
              <div className="flex gap-2">
                {dayNames.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                      repeatDays.includes(i)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface-elevated text-text-muted'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {repeatRule === 'x_per_week' && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                Keer per week
              </label>
              <input
                type="number"
                min={1}
                max={7}
                value={repeatCount}
                onChange={(e) => setRepeatCount(Number(e.target.value))}
                className="w-24 bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-text">Opbouwfase</p>
              <p className="text-xs text-text-muted">Bijv. retinol schema</p>
            </div>
            <Toggle checked={phaseEnabled} onChange={setPhaseEnabled} />
          </div>

          {phaseEnabled && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                Startdatum opbouwfase
              </label>
              <input
                type="date"
                value={phaseStartDate}
                onChange={(e) => setPhaseStartDate(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Toggle checked={isActive} onChange={setIsActive} label="Actief" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending} fullWidth>
              {isEditing ? 'Opslaan' : 'Toevoegen'}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                loading={deleteStep.isPending}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
