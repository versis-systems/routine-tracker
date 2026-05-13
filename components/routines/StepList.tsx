'use client'

import { useState } from 'react'
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
import { GripVertical, Edit2, ChevronRight } from 'lucide-react'
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
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
        isDragging ? 'bg-surface-elevated border-primary shadow-lg' : 'bg-surface border-border'
      } ${!step.is_active ? 'opacity-40' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-text-muted hover:text-text cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{step.name}</p>
        {step.note && (
          <p className="text-xs text-text-muted truncate">{step.note}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-muted">
            {step.repeat_rule === 'daily' && 'Dagelijks'}
            {step.repeat_rule === 'specific_days' &&
              `${step.repeat_days.length} dag${step.repeat_days.length !== 1 ? 'en' : ''}/week`}
            {step.repeat_rule === 'x_per_week' && `${step.repeat_count}×/week`}
          </span>
          {step.phase_enabled && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              Opbouw
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onEdit}
        className="text-text-muted hover:text-text p-1 rounded-lg hover:bg-surface-elevated transition-colors"
      >
        <Edit2 size={16} />
      </button>
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

  // Keep local state in sync with props
  if (initialSteps.length !== steps.length ||
      initialSteps.some((s, i) => s.id !== steps[i]?.id)) {
    setSteps(initialSteps)
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
        className="w-full py-3 rounded-xl border border-dashed border-border text-text-muted hover:text-text hover:border-primary transition-colors text-sm flex items-center justify-center gap-2"
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
