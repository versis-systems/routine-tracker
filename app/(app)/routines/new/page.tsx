'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useCreateRoutineGroup } from '@/lib/hooks/useRoutines'
import Button from '@/components/ui/Button'

export default function NewRoutinePage() {
  const router = useRouter()
  const createGroup = useCreateRoutineGroup()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const newGroup = await createGroup.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
    })
    router.push(`/routines/${newGroup.id}`)
  }

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
            placeholder="Bijv. Skincare, Workout…"
            autoFocus
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
            placeholder="Optionele beschrijving…"
            rows={3}
            className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <Button type="submit" loading={createGroup.isPending} fullWidth size="lg">
          Aanmaken
        </Button>
      </form>
    </div>
  )
}
