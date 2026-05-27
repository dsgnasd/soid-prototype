import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

interface Coords {
  top: number
  left: number
  width: number
  flipUp: boolean
}

/**
 * Кастомный select — заменяет нативный <select>.
 * Dropdown рендерится через портал в document.body с z-index выше Modal (z-[100]),
 * чтобы корректно работать внутри модалок и overflow-контейнеров.
 * Позиционируется по координатам триггера; закрывается по Esc / click outside / scroll.
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
  const [coords, setCoords] = useState<Coords>({ top: 0, left: 0, width: 0, flipUp: false })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const computeCoords = (): Coords => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return { top: 0, left: 0, width: 0, flipUp: false }
    const spaceBelow = window.innerHeight - rect.bottom
    const flipUp = spaceBelow < 280 && rect.top > spaceBelow
    return {
      top: flipUp ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      flipUp,
    }
  }

  useLayoutEffect(() => {
    if (open) setCoords(computeCoords())
  }, [open])

  useEffect(() => {
    if (!open) return

    const onMouseDown = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        listRef.current?.contains(e.target as Node)
      ) {
        return
      }
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onScroll = (e: Event) => {
      if (listRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onResize = () => setCoords(computeCoords())

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)
  const heightCls = size === 'sm' ? 'h-9 text-[13px]' : 'h-10 text-sm'

  return (
    <div className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
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

      {open &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            style={{
              position: 'fixed',
              top: coords.flipUp ? undefined : coords.top,
              bottom: coords.flipUp ? window.innerHeight - coords.top : undefined,
              left: coords.left,
              width: coords.width,
            }}
            className="z-[200] max-h-72 overflow-y-auto bg-bg-surface border border-border-default rounded-md shadow-lg py-1 scrollbar-thin"
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
          </ul>,
          document.body,
        )}
    </div>
  )
}
