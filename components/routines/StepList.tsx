'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Edit2 } from 'lucide-react'
import { Step } from '@/lib/types'
import { useReorderSteps } from '@/lib/hooks/useRoutines'
import StepForm from './StepForm'

interface SortableStepProps {
  step: Step
  onEdit: () => void
}

function SortableStep({ step, onEdit }: SortableStepProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : step.is_active ? 1 : 0.4,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="flex items-center gap-3 py-3 px-3 rounded-xl transition-all"
        style={{
          backgroundColor: isDragging ? 'var(--color-fill)' : 'var(--color-surface)',
          border: isDragging ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
        }}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none focus:outline-none"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <GripVertical size={17} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium truncate" style={{ color: 'var(--color-text)' }}>
            {step.name}
          </p>
          {step.note && (
            <p className="text-[13px] truncate" style={{ color: 'var(--color-text-muted)' }}>
              {step.note}
            </p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              {step.repeat_rule === 'daily' && 'Dagelijks'}
              {step.repeat_rule === 'specific_days' &&
                `${step.repeat_days.length} dag${step.repeat_days.length !== 1 ? 'en' : ''}/week`}
              {step.repeat_rule === 'x_per_week' && `${step.repeat_count}×/week`}
            </span>
            {step.phase_enabled && (
              <span
                className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-fill)', color: 'var(--color-primary)' }}
              >
                Opbouw
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onEdit}
          className="p-1.5 rounded-full focus:outline-none active:opacity-60 transition-opacity"
          style={{ color: 'var(--color-primary)' }}
        >
          <Edit2 size={15} />
        </button>
      </div>
    </div>
  )
}

interface StepListProps {
  steps: Step[]
  routineId: string
}

export default function StepList({ steps: initialSteps, routineId }: StepListProps) {
  const [steps, setSteps] = useState(initialSteps)
  const [editingStep, setEditingStep] = useState<Step | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const reorderSteps = useReorderSteps()

  useEffect(() => {
    setSteps(initialSteps)
  }, [initialSteps])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = steps.findIndex((s) => s.id === active.id)
    const newIndex = steps.findIndex((s) => s.id === over.id)
    const newOrder = arrayMove(steps, oldIndex, newIndex)

    setSteps(newOrder)
    await reorderSteps.mutateAsync(
      newOrder.map((step, index) => ({ id: step.id, sort_order: index }))
    )
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {steps.map((step) => (
            <SortableStep
              key={step.id}
              step={step}
              onEdit={() => setEditingStep(step)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={() => setShowAddForm(true)}
        className="w-full py-3 rounded-xl text-[15px] font-medium flex items-center justify-center gap-1.5 focus:outline-none active:opacity-60 transition-opacity"
        style={{
          border: '1.5px dashed var(--color-border)',
          color: 'var(--color-primary)',
          backgroundColor: 'transparent',
        }}
      >
        + Stap toevoegen
      </button>

      {editingStep && (
        <StepForm
          routineId={routineId}
          step={editingStep}
          onClose={() => setEditingStep(null)}
        />
      )}

      {showAddForm && (
        <StepForm
          routineId={routineId}
          sortOrder={steps.length}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}
