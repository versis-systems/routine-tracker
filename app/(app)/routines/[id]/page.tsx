'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { useRoutine } from '@/lib/hooks/useRoutines'
import RoutineForm from '@/components/routines/RoutineForm'
import StepList from '@/components/routines/StepList'

interface PageProps {
  params: { id: string }
}

export default function EditRoutinePage({ params }: PageProps) {
  const router = useRouter()
  const { data: routine, isLoading } = useRoutine(params.id)

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
          <h1 className="text-xl font-bold text-text">Routine bewerken</h1>
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

      {!isLoading && routine && (
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
              Routine details
            </h2>
            <RoutineForm routine={routine} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              Stappen ({routine.steps?.length ?? 0})
            </h2>
            <StepList steps={routine.steps ?? []} routineId={params.id} />
          </div>
        </div>
      )}
    </div>
  )
}
