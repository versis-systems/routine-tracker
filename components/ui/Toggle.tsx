'use client'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export default function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className="relative flex-shrink-0 transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          width: 51,
          height: 31,
          borderRadius: 31,
          backgroundColor: checked ? 'var(--color-success)' : 'var(--color-fill)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <span
          className="absolute top-0.5 bg-white rounded-full shadow-md"
          style={{
            width: 27,
            height: 27,
            left: checked ? 'calc(100% - 29px)' : 2,
            transition: 'left 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          }}
        />
      </button>
      {label && <span className="text-sm text-text">{label}</span>}
    </label>
  )
}
