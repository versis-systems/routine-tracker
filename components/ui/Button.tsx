'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'tinted'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

    const variants: Record<Variant, string> = {
      primary: 'bg-primary text-white',
      tinted: 'bg-fill text-primary',
      secondary: 'bg-fill text-text border border-border',
      ghost: 'text-primary',
      danger: 'bg-danger text-white',
    }

    const sizes: Record<Size, string> = {
      sm: 'px-3.5 py-1.5 text-[14px] gap-1.5',
      md: 'px-4 py-2.5 text-[15px] gap-2',
      lg: 'px-6 py-3 text-[17px] gap-2',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(
          clsx(base, variants[variant], sizes[size], fullWidth && 'w-full'),
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
