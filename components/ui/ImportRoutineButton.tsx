'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { seedUserData } from '@/lib/seed'

export default function ImportRoutineButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const queryClient = useQueryClient()

  const handleImport = async () => {
    setStatus('loading')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      await seedUserData(user.id)
      await queryClient.invalidateQueries({ queryKey: ['routines'] })
      await queryClient.invalidateQueries({ queryKey: ['routine-groups'] })
      setStatus('done')
    } catch (e) {
      console.error('Import error:', e)
      setStatus('error')
    }
  }

  return (
    <AnimatePresence mode="wait">
      {status === 'done' ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-success text-sm font-medium"
        >
          <CheckCircle size={16} />
          Skincare routine geïmporteerd!
        </motion.div>
      ) : (
        <motion.button
          key="btn"
          onClick={handleImport}
          disabled={status === 'loading'}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-5 py-3 rounded-2xl text-sm font-medium transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {status === 'loading' ? 'Importeren…' : 'Importeer skincare routine'}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
