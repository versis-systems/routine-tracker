'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Layers, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { href: '/today',    label: 'Vandaag',   icon: CalendarDays },
  { href: '/routines', label: 'Routines',  icon: Layers },
  { href: '/stats',    label: 'Stats',     icon: BarChart2 },
  { href: '/settings', label: 'Instellingen', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'rgba(var(--color-surface-rgb, 255,255,255), 0.85)',
        borderTop: '0.5px solid var(--color-separator)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="flex items-center justify-around max-w-lg mx-auto"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          paddingTop: 8,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/today' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 focus:outline-none active:opacity-60"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.3 : 1.6}
                style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              />
              <span
                className="text-[10px] tracking-tight"
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
