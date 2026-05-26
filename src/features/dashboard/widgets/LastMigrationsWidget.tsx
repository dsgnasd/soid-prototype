import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, RefreshCcw, AlertCircle, Loader2, Pause } from 'lucide-react'
import { Panel } from '@/shared/ui/panel'
import { EmptyState } from '@/shared/ui/empty-state'
import { formatDate } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import type { MigrationPackage, MigrationStatus } from '@/shared/types'

const STATUS_META: Record<
  MigrationStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  created: { label: 'Создан', icon: CheckCircle2, className: 'text-success-text' },
  updated: { label: 'Обновлён', icon: RefreshCcw, className: 'text-info-text' },
  in_progress: { label: 'В работе', icon: Loader2, className: 'text-info-text' },
  error: { label: 'Ошибка', icon: XCircle, className: 'text-error-text' },
  partial: { label: 'Частично', icon: AlertCircle, className: 'text-warning-text' },
  stopped: { label: 'Остановлена', icon: Pause, className: 'text-text-muted' },
}

interface LastMigrationsWidgetProps {
  items: MigrationPackage[]
}

export function LastMigrationsWidget({ items }: LastMigrationsWidgetProps) {
  return (
    <Panel
      title="Последние миграции"
      action={
        <Link
          to={routes.migrationStatus}
          className="text-sm font-medium text-accent hover:text-accent-hover"
        >
          Все →
        </Link>
      }
      bodyClassName="px-0 pb-2"
    >
      {items.length === 0 ? (
        <EmptyState
          title="Нет миграций"
          description="Запустите первую миграцию из раздела «Сервисы»."
          className="py-6"
        />
      ) : (
        <ul>
          {items.map((m) => {
            const meta = STATUS_META[m.status]
            const Icon = meta.icon
            return (
              <li key={m.id}>
                <Link
                  to={routes.migrationDetails(m.id)}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-2.5 hover:bg-bg-subtle transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {m.designation} · {m.name}
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {m.packageName}
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.className}`}>
                    <Icon size={14} />
                    {meta.label}
                  </div>
                  <div className="text-xs text-text-muted tabular-nums shrink-0">
                    {formatDate(m.createdAt)}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
