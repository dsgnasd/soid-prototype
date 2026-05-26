import { cn } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

export type ChipVariant = 'success' | 'info' | 'warning' | 'error' | 'neutral'

const VARIANT_CLASS: Record<ChipVariant, string> = {
  success: 'bg-success-bg text-success-text',
  info: 'bg-info-bg text-info-text',
  warning: 'bg-warning-bg text-warning-text',
  error: 'bg-error-bg text-error-text',
  neutral: 'bg-bg-hover text-text-muted',
}

interface ChipProps {
  variant?: ChipVariant
  icon?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Chip — статус сущности (DS v4.0 §9.4).
 * Цвет всегда дублирован иконкой/dot и текстом — никогда только цветом.
 */
export function Chip({ variant = 'neutral', icon, children, className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium leading-none whitespace-nowrap',
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {icon ?? <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  )
}
