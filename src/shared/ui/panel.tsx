import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface PanelProps {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/**
 * Panel — карточка с заголовком и опциональным action в правом верхнем углу.
 * По DS v4.0 §9.9.
 */
export function Panel({ title, action, children, className, bodyClassName }: PanelProps) {
  return (
    <section
      className={cn(
        'bg-bg-surface border border-border-subtle rounded-xl overflow-hidden',
        className,
      )}
    >
      {(title || action) && (
        <header className="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-base font-semibold tracking-tight text-text-primary">{title}</h2>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn('px-5 pb-5', bodyClassName)}>{children}</div>
    </section>
  )
}
