'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RoutineInfo, ExpectedResult, ProductInfo } from '@/lib/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface PageProps {
  params: { id: string }
}

const supabase = createClient()

function useRoutineInfo(routineId: string) {
  return useQuery({
    queryKey: ['routine-info', routineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routine_info')
        .select('*')
        .eq('routine_id', routineId)
        .maybeSingle()

      if (error) throw error
      return data as RoutineInfo | null
    },
  })
}

export default function RoutineInfoPage({ params }: PageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: info, isLoading } = useRoutineInfo(params.id)

  const [results, setResults] = useState<ExpectedResult[]>(info?.expected_results ?? [])
  const [rules, setRules] = useState<string[]>(info?.rules ?? [])
  const [products, setProducts] = useState<ProductInfo[]>(info?.products ?? [])
  const [freeText, setFreeText] = useState(info?.free_text ?? '')
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
      const payload = {
        routine_id: params.id,
        expected_results: results,
        rules,
        products,
        free_text: freeText || null,
        updated_at: new Date().toISOString(),
      }

      if (info?.id) {
        const { error } = await supabase
          .from('routine_info')
          .update(payload)
          .eq('id', info.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('routine_info').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-info', params.id] })
      router.back()
    },
  })

  const addResult = () =>
    setResults([...results, { label: '', timeframe: '' }])
  const removeResult = (i: number) =>
    setResults(results.filter((_, idx) => idx !== i))
  const updateResult = (i: number, field: keyof ExpectedResult, value: string) =>
    setResults(results.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))

  const addRule = () => setRules([...rules, ''])
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i))
  const updateRule = (i: number, value: string) =>
    setRules(rules.map((r, idx) => (idx === i ? value : r)))

  const addProduct = () =>
    setProducts([...products, { name: '', brand: '', when: 'morning', owned: true }])
  const removeProduct = (i: number) =>
    setProducts(products.filter((_, idx) => idx !== i))
  const updateProduct = (i: number, field: keyof ProductInfo, value: string | boolean) =>
    setProducts(products.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))

  return (
    <div className="px-4">
      <div className="flex items-center gap-3 pt-12 pb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-text-muted hover:text-text rounded-xl hover:bg-surface-elevated transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-text">Routine info</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-surface rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6 pb-6">
          {/* Expected Results */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text">Verwachte resultaten</h2>
              <button onClick={addResult} className="text-primary hover:text-primary-light">
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {results.map((result, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    value={result.label}
                    onChange={(e) => updateResult(i, 'label', e.target.value)}
                    placeholder="Resultaat"
                    className="flex-1 bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                  <input
                    value={result.timeframe}
                    onChange={(e) => updateResult(i, 'timeframe', e.target.value)}
                    placeholder="Tijdframe"
                    className="w-28 bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => removeResult(i)}
                    className="text-text-muted hover:text-red-400 p-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {results.length === 0 && (
                <p className="text-sm text-text-muted text-center py-2">
                  Geen resultaten toegevoegd
                </p>
              )}
            </div>
          </Card>

          {/* Rules */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text">Regels</h2>
              <button onClick={addRule} className="text-primary hover:text-primary-light">
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    value={rule}
                    onChange={(e) => updateRule(i, e.target.value)}
                    placeholder="Bijv. SPF altijd gebruiken"
                    className="flex-1 bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => removeRule(i)}
                    className="text-text-muted hover:text-red-400 p-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {rules.length === 0 && (
                <p className="text-sm text-text-muted text-center py-2">Geen regels toegevoegd</p>
              )}
            </div>
          </Card>

          {/* Products */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text">Producten</h2>
              <button onClick={addProduct} className="text-primary hover:text-primary-light">
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {products.map((product, i) => (
                <div key={i} className="bg-surface-elevated rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={product.name}
                      onChange={(e) => updateProduct(i, 'name', e.target.value)}
                      placeholder="Productnaam"
                      className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => removeProduct(i)}
                      className="text-text-muted hover:text-red-400 p-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={product.brand}
                      onChange={(e) => updateProduct(i, 'brand', e.target.value)}
                      placeholder="Merk"
                      className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                    />
                    <input
                      value={product.when}
                      onChange={(e) => updateProduct(i, 'when', e.target.value)}
                      placeholder="Wanneer"
                      className="w-28 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.owned}
                      onChange={(e) => updateProduct(i, 'owned', e.target.checked)}
                      className="rounded border-border"
                    />
                    In bezit
                  </label>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-sm text-text-muted text-center py-2">
                  Geen producten toegevoegd
                </p>
              )}
            </div>
          </Card>

          {/* Free text */}
          <Card>
            <h2 className="text-sm font-semibold text-text mb-3">Notities</h2>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Vrije notities, aandachtspunten, ervaringen..."
              rows={5}
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
            />
          </Card>

          <Button
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
            fullWidth
            size="lg"
          >
            <Save size={16} />
            Opslaan
          </Button>
        </div>
      )}
    </div>
  )
}
