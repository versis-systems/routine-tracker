'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RoutineInfo, ExpectedResult, ProductInfo } from '@/lib/types'
import { useRoutineGroup } from '@/lib/hooks/useRoutines'

interface PageProps {
  params: { id: string }
}

const supabase = createClient()

function useGroupRoutineInfo(groupId: string) {
  const { data: group } = useRoutineGroup(groupId)
  const firstRoutineId = group?.routines?.[0]?.id ?? null

  return useQuery({
    queryKey: ['routine-info', 'group', groupId],
    queryFn: async () => {
      if (!firstRoutineId) return null
      const { data, error } = await supabase
        .from('routine_info')
        .select('*')
        .eq('routine_id', firstRoutineId)
        .maybeSingle()
      if (error) throw error
      return { info: data as RoutineInfo | null, routineId: firstRoutineId }
    },
    enabled: !!firstRoutineId,
  })
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between px-1 mb-2">
      <p
        className="text-[13px] font-semibold uppercase tracking-wide"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {title}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="p-1 focus:outline-none active:opacity-60"
        style={{ color: 'var(--color-primary)' }}
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  )
}

export default function RoutineInfoPage({ params }: PageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: payload, isLoading } = useGroupRoutineInfo(params.id)
  const info = payload?.info ?? null
  const routineId = payload?.routineId ?? null

  const [results, setResults] = useState<ExpectedResult[]>([])
  const [rules, setRules] = useState<string[]>([])
  const [products, setProducts] = useState<ProductInfo[]>([])
  const [freeText, setFreeText] = useState('')
  const [initialized, setInitialized] = useState(false)

  if (info && !initialized) {
    setResults(info.expected_results ?? [])
    setRules(info.rules ?? [])
    setProducts(info.products ?? [])
    setFreeText(info.free_text ?? '')
    setInitialized(true)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!routineId) throw new Error('No routine found')
      const p = {
        routine_id: routineId,
        expected_results: results,
        rules,
        products,
        free_text: freeText || null,
        updated_at: new Date().toISOString(),
      }
      if (info?.id) {
        const { error } = await supabase.from('routine_info').update(p).eq('id', info.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('routine_info').insert(p)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-info', 'group', params.id] })
      router.back()
    },
  })

  const addResult = () => setResults([...results, { label: '', timeframe: '' }])
  const removeResult = (i: number) => setResults(results.filter((_, idx) => idx !== i))
  const updateResult = (i: number, field: keyof ExpectedResult, value: string) =>
    setResults(results.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))

  const addRule = () => setRules([...rules, ''])
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i))
  const updateRule = (i: number, value: string) =>
    setRules(rules.map((r, idx) => (idx === i ? value : r)))

  const addProduct = () =>
    setProducts([...products, { name: '', brand: '', when: 'morning', owned: true }])
  const removeProduct = (i: number) => setProducts(products.filter((_, idx) => idx !== i))
  const updateProduct = (i: number, field: keyof ProductInfo, value: string | boolean) =>
    setProducts(products.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))

  const inputStyle = {
    backgroundColor: 'var(--color-fill)',
    color: 'var(--color-text)',
    border: 'none',
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
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="text-[17px] font-semibold focus:outline-none disabled:opacity-40"
          style={{ color: 'var(--color-primary)' }}
        >
          {saveMutation.isPending ? '…' : 'Opslaan'}
        </button>
      </div>

      <h1
        className="text-[34px] font-bold tracking-tight mb-6"
        style={{ color: 'var(--color-text)', lineHeight: 1.1 }}
      >
        Routine info
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--color-surface)' }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Expected Results */}
          <div>
            <SectionHeader title="Verwachte resultaten" onAdd={addResult} />
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              {results.length === 0 ? (
                <p className="text-[14px] px-4 py-4" style={{ color: 'var(--color-text-muted)' }}>
                  Geen resultaten toegevoegd
                </p>
              ) : (
                results.map((result, i) => (
                  <div key={i}>
                    {i > 0 && (
                      <div style={{ height: '0.5px', backgroundColor: 'var(--color-separator)' }} />
                    )}
                    <div className="flex gap-2 items-center px-4 py-2.5">
                      <input
                        value={result.label}
                        onChange={(e) => updateResult(i, 'label', e.target.value)}
                        placeholder="Resultaat"
                        className="flex-1 rounded-xl px-3 py-2 text-[14px] focus:outline-none"
                        style={inputStyle}
                      />
                      <input
                        value={result.timeframe}
                        onChange={(e) => updateResult(i, 'timeframe', e.target.value)}
                        placeholder="Tijdframe"
                        className="w-24 rounded-xl px-3 py-2 text-[14px] focus:outline-none"
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => removeResult(i)}
                        className="p-1.5 focus:outline-none active:opacity-60 flex-shrink-0"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rules */}
          <div>
            <SectionHeader title="Regels" onAdd={addRule} />
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              {rules.length === 0 ? (
                <p className="text-[14px] px-4 py-4" style={{ color: 'var(--color-text-muted)' }}>
                  Geen regels toegevoegd
                </p>
              ) : (
                rules.map((rule, i) => (
                  <div key={i}>
                    {i > 0 && (
                      <div style={{ height: '0.5px', backgroundColor: 'var(--color-separator)' }} />
                    )}
                    <div className="flex gap-2 items-center px-4 py-2.5">
                      <input
                        value={rule}
                        onChange={(e) => updateRule(i, e.target.value)}
                        placeholder="Bijv. SPF altijd gebruiken"
                        className="flex-1 rounded-xl px-3 py-2 text-[14px] focus:outline-none"
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => removeRule(i)}
                        className="p-1.5 focus:outline-none active:opacity-60 flex-shrink-0"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <SectionHeader title="Producten" onAdd={addProduct} />
            {products.length === 0 ? (
              <div
                className="rounded-2xl px-4 py-4"
                style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
                  Geen producten toegevoegd
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product, i) => (
                  <div
                    key={i}
                    className="rounded-2xl px-4 py-3 space-y-2.5"
                    style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex gap-2 items-center">
                      <input
                        value={product.name}
                        onChange={(e) => updateProduct(i, 'name', e.target.value)}
                        placeholder="Productnaam"
                        className="flex-1 rounded-xl px-3 py-2 text-[14px] focus:outline-none"
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => removeProduct(i)}
                        className="p-1.5 focus:outline-none active:opacity-60 flex-shrink-0"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={product.brand}
                        onChange={(e) => updateProduct(i, 'brand', e.target.value)}
                        placeholder="Merk"
                        className="flex-1 rounded-xl px-3 py-2 text-[14px] focus:outline-none"
                        style={inputStyle}
                      />
                      <input
                        value={product.when}
                        onChange={(e) => updateProduct(i, 'when', e.target.value)}
                        placeholder="Wanneer"
                        className="w-28 rounded-xl px-3 py-2 text-[14px] focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                    <label
                      className="flex items-center gap-2.5 text-[14px] cursor-pointer"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <input
                        type="checkbox"
                        checked={product.owned}
                        onChange={(e) => updateProduct(i, 'owned', e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      In bezit
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <p
              className="text-[13px] font-semibold uppercase tracking-wide px-1 mb-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Notities
            </p>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Vrije notities, aandachtspunten, ervaringen…"
              rows={5}
              className="w-full rounded-2xl px-4 py-3 text-[15px] focus:outline-none resize-none"
              style={{ backgroundColor: 'var(--color-fill)', color: 'var(--color-text)', border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
