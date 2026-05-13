'use client'

import { useState } from 'react'
import { Step, RepeatRule } from '@/lib/types'
import Button from '@/components/ui/Button'
import Toggle from '@/components/ui/Toggle'
import { useCreateStep, useUpdateStep, useDeleteStep } from '@/lib/hooks/useRoutines'
import { X, Trash2 } from 'lucide-react'

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[13px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
      {children}
    </label>
  )
}

function TextInput({ value, onChange, placeholder, required }: { value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full rounded-xl px-4 py-3 text-[15px] focus:outline-none"
      style={{
        backgroundColor: 'var(--color-fill)',
        color: 'var(--color-text)',
        border: 'none',
      }}
    />
  )
}

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
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto rounded-t-3xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '0.5px solid var(--color-separator)' }}
        >
          <button
            onClick={onClose}
            className="text-[15px] font-medium focus:outline-none"
            style={{ color: 'var(--color-primary)' }}
          >
            Annuleren
          </button>
          <h3 className="text-[17px] font-semibold" style={{ color: 'var(--color-text)' }}>
            {isEditing ? 'Stap bewerken' : 'Stap toevoegen'}
          </h3>
          <button
            form="step-form"
            type="submit"
            disabled={isPending}
            className="text-[15px] font-semibold focus:outline-none disabled:opacity-50"
            style={{ color: 'var(--color-primary)' }}
          >
            {isPending ? '…' : isEditing ? 'Opslaan' : 'Voeg toe'}
          </button>
        </div>

        <form id="step-form" onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          <div>
            <FieldLabel>Naam *</FieldLabel>
            <TextInput value={name} onChange={setName} placeholder="Bijv. Vitamine C serum" required />
          </div>

          <div>
            <FieldLabel>Notitie</FieldLabel>
            <TextInput value={note} onChange={setNote} placeholder="Bijv. op droge huid aanbrengen" />
          </div>

          <div>
            <FieldLabel>Instructies</FieldLabel>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Bijv. Breng een kleine hoeveelheid aan, vermijd het ooggebied…"
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-[15px] focus:outline-none resize-none"
              style={{ backgroundColor: 'var(--color-fill)', color: 'var(--color-text)', border: 'none' }}
            />
          </div>

          <div>
            <FieldLabel>Productnaam</FieldLabel>
            <TextInput value={productName} onChange={setProductName} placeholder="Bijv. Retinol 0.5% in Squalane" />
          </div>

          <div>
            <FieldLabel>Merk</FieldLabel>
            <TextInput value={productBrand} onChange={setProductBrand} placeholder="Bijv. The Ordinary" />
          </div>

          <div>
            <FieldLabel>Herhaling</FieldLabel>
            <div className="flex gap-2">
              {repeatRuleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRepeatRule(opt.value)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all focus:outline-none"
                  style={{
                    backgroundColor: repeatRule === opt.value ? 'var(--color-primary)' : 'var(--color-fill)',
                    color: repeatRule === opt.value ? '#fff' : 'var(--color-text)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {repeatRule === 'specific_days' && (
            <div>
              <FieldLabel>Dagen</FieldLabel>
              <div className="flex gap-1.5">
                {dayNames.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all focus:outline-none"
                    style={{
                      backgroundColor: repeatDays.includes(i) ? 'var(--color-primary)' : 'var(--color-fill)',
                      color: repeatDays.includes(i) ? '#fff' : 'var(--color-text)',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {repeatRule === 'x_per_week' && (
            <div>
              <FieldLabel>Keer per week</FieldLabel>
              <input
                type="number"
                min={1}
                max={7}
                value={repeatCount}
                onChange={(e) => setRepeatCount(Number(e.target.value))}
                className="w-24 rounded-xl px-4 py-3 text-[15px] focus:outline-none"
                style={{ backgroundColor: 'var(--color-fill)', color: 'var(--color-text)', border: 'none' }}
              />
            </div>
          )}

          <div
            className="flex items-center justify-between py-3 px-4 rounded-xl"
            style={{ backgroundColor: 'var(--color-fill)' }}
          >
            <div>
              <p className="text-[15px] font-medium" style={{ color: 'var(--color-text)' }}>Opbouwfase</p>
              <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>Bijv. retinol schema</p>
            </div>
            <Toggle checked={phaseEnabled} onChange={setPhaseEnabled} />
          </div>

          {phaseEnabled && (
            <div>
              <FieldLabel>Startdatum opbouwfase</FieldLabel>
              <input
                type="date"
                value={phaseStartDate}
                onChange={(e) => setPhaseStartDate(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-[15px] focus:outline-none"
                style={{ backgroundColor: 'var(--color-fill)', color: 'var(--color-text)', border: 'none' }}
              />
            </div>
          )}

          <div
            className="flex items-center justify-between py-3 px-4 rounded-xl"
            style={{ backgroundColor: 'var(--color-fill)' }}
          >
            <p className="text-[15px] font-medium" style={{ color: 'var(--color-text)' }}>Actief</p>
            <Toggle checked={isActive} onChange={setIsActive} />
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteStep.isPending}
              className="w-full py-3.5 rounded-xl text-[15px] font-medium focus:outline-none active:opacity-60 transition-opacity disabled:opacity-40"
              style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--color-danger)' }}
            >
              Stap verwijderen
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
