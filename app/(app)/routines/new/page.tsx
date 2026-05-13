'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useCreateRoutineGroup } from '@/lib/hooks/useRoutines'

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
        <button
          form="new-routine-form"
          type="submit"
          disabled={createGroup.isPending || !name.trim()}
          className="text-[17px] font-semibold focus:outline-none disabled:opacity-40"
          style={{ color: 'var(--color-primary)' }}
        >
          {createGroup.isPending ? '…' : 'Aanmaken'}
        </button>
      </div>

      {/* Large title */}
      <h1
        className="text-[34px] font-bold tracking-tight mb-6"
        style={{ color: 'var(--color-text)', lineHeight: 1.1 }}
      >
        Nieuwe routine
      </h1>

      <form id="new-routine-form" onSubmit={handleSubmit} className="space-y-5">
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
            required
            placeholder="Bijv. Skincare, Workout…"
            autoFocus
            className="w-full rounded-xl px-4 py-3 text-[15px] focus:outline-none"
            style={{
              backgroundColor: 'var(--color-fill)',
              color: 'var(--color-text)',
              border: 'none',
            }}
          />
        </div>

        <div>
          <label
            className="block text-[13px] font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Beschrijving
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optionele beschrijving…"
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-[15px] focus:outline-none resize-none"
            style={{
              backgroundColor: 'var(--color-fill)',
              color: 'var(--color-text)',
              border: 'none',
            }}
          />
        </div>
      </form>
    </div>
  )
}
