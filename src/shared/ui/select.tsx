import { useEffect, useRef, useState, useId } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  description?: string
}

interface SelectProps<T extends string = string> {
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
  placeholder?: string
  className?: string
  size?: 'sm' | 'md'
  ariaLabel?: string
  disabled?: boolean
}

/**
 * Кастомный select — заменяет нативный <select>.
 * Управляемый, с поддержкой клавиатуры (Esc, Enter/Space на trigger), закрытием по клику вне.
 */
export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Выберите…',
  className,
  size = 'md',
  ariaLabel,
  disabled,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)
  const heightCls = size === 'sm' ? 'h-9 text-[13px]' : 'h-10 text-sm'

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-between gap-2 w-full px-3 rounded-md border border-border-default bg-bg-subtle text-text-primary transition-colors',
          'hover:bg-bg-hover hover:border-border-strong',
          'disabled:bg-bg-disabled disabled:text-text-disabled disabled:cursor-not-allowed',
          open && 'bg-bg-surface border-accent',
          heightCls,
        )}
      >
        <span className={cn('truncate text-left', !selected && 'text-text-muted')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto bg-bg-surface border border-border-default rounded-md shadow-md py-1 scrollbar-thin"
        >
          {options.map((o) => {
            const isSelected = o.value === value
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-accent-subtle text-accent-text font-medium'
                      : 'text-text-primary hover:bg-bg-hover',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{o.label}</div>
                    {o.description && (
                      <div className="text-xs text-text-muted truncate">{o.description}</div>
                    )}
                  </div>
                  {isSelected && <Check size={14} className="text-accent shrink-0" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
