import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  variant?: 'empty' | 'error' | 'loading'
  className?: string
}

const VARIANT_CLASS = {
  empty: 'text-text-muted',
  error: 'text-error-text',
  loading: 'text-text-muted',
}

/**
 * Единый шаблон пусто/ошибка/загрузка (DS v4.0 §12.2, ИА §6.2).
 */
export function EmptyState({ icon, title, description, action, variant = 'empty', className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-10 px-4',
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {icon && <div className="mb-3 opacity-80">{icon}</div>}
      <div className="text-base font-medium text-text-primary">{title}</div>
      {description && <div className="mt-1.5 text-sm text-text-muted max-w-md">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/**
 * Skeleton-блок для loading state.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-md bg-bg-hover animate-pulse', className)} />
}
