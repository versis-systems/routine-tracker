'use client'

import { motion } from 'framer-motion'
import { Flame, Trophy, TrendingUp } from 'lucide-react'
import { StreakData } from '@/lib/types'

interface StreakDisplayProps {
  data: StreakData
}

export default function StreakDisplay({ data }: StreakDisplayProps) {
  const stats = [
    {
      icon: Flame,
      label: 'Huidige streak',
      value: `${data.currentStreak}`,
      unit: 'dag' + (data.currentStreak !== 1 ? 'en' : ''),
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
    {
      icon: Trophy,
      label: 'Langste streak',
      value: `${data.longestStreak}`,
      unit: 'dag' + (data.longestStreak !== 1 ? 'en' : ''),
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
    {
      icon: TrendingUp,
      label: '30-daags gemiddelde',
      value: `${data.completionRate30Days}`,
      unit: '%',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-surface rounded-2xl border border-border p-4 text-center"
        >
          <div className={`inline-flex p-2.5 rounded-xl ${stat.bg} mb-2`}>
            <stat.icon size={20} className={stat.color} />
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-bold text-text">{stat.value}</span>
            <span className="text-xs text-text-muted">{stat.unit}</span>
          </div>
          <p className="text-xs text-text-muted mt-1 leading-tight">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}
