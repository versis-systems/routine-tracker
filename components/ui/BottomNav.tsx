'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, BarChart2 } from 'lucide-react'

const navItems = [
  { href: '/today', label: 'Vandaag', icon: Home },
  { href: '/routines', label: 'Routines', icon: List },
  { href: '/stats', label: 'Stats', icon: BarChart2 },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass" style={{ backgroundColor: 'rgba(var(--color-surface-rgb, 255,255,255), 0.85)', borderTop: '0.5px solid var(--color-separator)' }}>
      <div className="flex items-center justify-around max-w-lg mx-auto px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)', height: 'calc(50px + env(safe-area-inset-bottom, 0px))' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-all duration-150"
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              />
              <span
                className="text-[10px] font-medium tracking-tight"
                style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
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
