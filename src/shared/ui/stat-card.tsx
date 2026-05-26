import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface StatCardProps {
  label: string
  value: ReactNode
  meta?: ReactNode
  featured?: boolean
  className?: string
}

/**
 * Stat Card — ключевой показатель. DS v4.0 §9.8.
 * Featured-вариант — одна карточка в группе акцентного цвета.
 */
export function StatCard({ label, value, meta, featured = false, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        featured
          ? 'bg-accent text-white border-accent'
          : 'bg-bg-surface border-border-subtle',
        className,
      )}
    >
      <div
        className={cn(
          'text-sm font-medium',
          featured ? 'text-white/85' : 'text-text-secondary',
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'mt-2 text-[34px] leading-none font-semibold tracking-tight tabular-nums',
          featured ? 'text-white' : 'text-text-primary',
        )}
      >
        {value}
      </div>
      {meta && (
        <div
          className={cn(
            'mt-2 text-xs',
            featured ? 'text-white/80' : 'text-text-muted',
          )}
        >
          {meta}
        </div>
      )}
    </div>
  )
}
