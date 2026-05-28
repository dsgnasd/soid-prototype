import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/shared/lib/utils'

interface DatePickerProps {
  /** ISO-строка `YYYY-MM-DD` или пустая строка */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
  size?: 'sm' | 'md'
  ariaLabel?: string
  disabled?: boolean
  clearable?: boolean
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

/**
 * Кастомный date picker. Popover-календарь через портал.
 * Закрывается по Esc / click outside / scroll / resize.
 * Локаль ru-RU, неделя начинается с понедельника.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'дд.мм.гггг',
  minDate,
  maxDate,
  className,
  size = 'md',
  ariaLabel,
  disabled,
  clearable = true,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, flipUp: false })
  const [viewMonth, setViewMonth] = useState(() => (value ? parseISO(value) : new Date()))
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? parseISO(value) : null

  const computeCoords = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return { top: 0, left: 0, flipUp: false }
    const popoverHeight = 360
    const spaceBelow = window.innerHeight - rect.bottom
    const flipUp = spaceBelow < popoverHeight && rect.top > popoverHeight
    return {
      top: flipUp ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      flipUp,
    }
  }

  useLayoutEffect(() => {
    if (open) {
      setCoords(computeCoords())
      setViewMonth(value ? parseISO(value) : new Date())
    }
  }, [open, value])

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popoverRef.current?.contains(e.target as Node)
      ) {
        return
      }
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onScroll = (e: Event) => {
      if (popoverRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onResize = () => setOpen(false)
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

  const handleSelect = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const goToday = () => {
    const today = new Date()
    if ((minDate && isBefore(today, minDate)) || (maxDate && isAfter(today, maxDate))) return
    handleSelect(today)
  }

  const heightCls = size === 'sm' ? 'h-9 text-[13px]' : 'h-10 text-sm'

  // Generate calendar grid: start of week before viewMonth, end of week after viewMonth
  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1, locale: ru })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1, locale: ru })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel ?? 'Выбор даты'}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 w-full px-3 rounded-md border border-border-default bg-bg-subtle text-text-primary transition-colors',
          'hover:bg-bg-hover hover:border-border-strong',
          'disabled:bg-bg-disabled disabled:text-text-disabled disabled:cursor-not-allowed',
          open && 'bg-bg-surface border-accent',
          heightCls,
        )}
      >
        <CalendarIcon size={14} className="shrink-0 text-text-muted" />
        <span className={cn('truncate flex-1 text-left', !selectedDate && 'text-text-muted')}>
          {selectedDate ? format(selectedDate, 'dd.MM.yyyy', { locale: ru }) : placeholder}
        </span>
        {clearable && selectedDate && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onChange('')
              }
            }}
            aria-label="Очистить дату"
            className="shrink-0 p-0.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-hover cursor-pointer"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: coords.flipUp ? undefined : coords.top,
              bottom: coords.flipUp ? window.innerHeight - coords.top : undefined,
              left: coords.left,
            }}
            className="z-[200] w-[280px] bg-bg-surface border border-border-default rounded-md shadow-lg p-3"
            role="dialog"
            aria-label="Календарь"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
                aria-label="Предыдущий месяц"
                className="w-7 h-7 grid place-items-center rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="text-sm font-medium text-text-primary capitalize">
                {format(viewMonth, 'LLLL yyyy', { locale: ru })}
              </div>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                aria-label="Следующий месяц"
                className="w-7 h-7 grid place-items-center rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="h-7 grid place-items-center text-[11px] font-medium text-text-muted uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day) => {
                const inMonth = isSameMonth(day, viewMonth)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const todayMark = isToday(day)
                const disabled =
                  (minDate && isBefore(day, minDate)) ||
                  (maxDate && isAfter(day, maxDate))
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => !disabled && handleSelect(day)}
                    disabled={disabled}
                    aria-label={format(day, 'd MMMM yyyy', { locale: ru })}
                    aria-pressed={Boolean(isSelected)}
                    className={cn(
                      'h-8 grid place-items-center rounded-md text-sm transition-colors tabular-nums',
                      !inMonth && 'text-text-disabled',
                      inMonth && !isSelected && !todayMark && 'text-text-primary hover:bg-bg-hover',
                      isSelected && 'bg-accent text-white font-medium',
                      !isSelected && todayMark && 'text-accent font-semibold',
                      disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent',
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={goToday}
                className="text-accent hover:text-accent-hover font-medium"
              >
                Сегодня
              </button>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('')
                    setOpen(false)
                  }}
                  className="text-text-muted hover:text-text-primary"
                >
                  Очистить
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
