'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import RoutineForm from '@/components/routines/RoutineForm'

export default function NewRoutinePage() {
  const router = useRouter()

  return (
    <div className="px-4">
      <div className="flex items-center gap-3 pt-12 pb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-text-muted hover:text-text rounded-xl hover:bg-surface-elevated transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-text">Nieuwe routine</h1>
      </div>

      <RoutineForm />
    </div>
  )
}
