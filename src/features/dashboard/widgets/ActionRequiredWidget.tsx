import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Lock,
  Clock,
  ServerCrash,
  ShieldAlert,
  ArrowUpRightFromSquare,
  KeyRound,
} from 'lucide-react'
import { Panel } from '@/shared/ui/panel'
import { EmptyState } from '@/shared/ui/empty-state'
import { cn } from '@/shared/lib/utils'
import type { DashboardActionItem } from '@/shared/types'

const ICON: Record<DashboardActionItem['kind'], typeof Inbox> = {
  task: Inbox,
  migration_error: ServerCrash,
  access_request: KeyRound,
  blocked_user: Lock,
  password_expiring: Clock,
  integration_down: ServerCrash,
  security_anomaly: ShieldAlert,
  escalation: ArrowUpRightFromSquare,
}

const SEVERITY_BORDER: Record<DashboardActionItem['severity'], string> = {
  critical: 'border-l-error',
  warning: 'border-l-warning',
  info: 'border-l-info',
}

const SEVERITY_ICON_BG: Record<DashboardActionItem['severity'], string> = {
  critical: 'bg-error-bg text-error-text',
  warning: 'bg-warning-bg text-warning-text',
  info: 'bg-info-bg text-info-text',
}

interface ActionRequiredWidgetProps {
  items: DashboardActionItem[]
  loading?: boolean
}

export function ActionRequiredWidget({ items, loading }: ActionRequiredWidgetProps) {
  if (loading) {
    return (
      <Panel title="Требует моего действия">
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-md bg-bg-hover animate-pulse" />
          ))}
        </div>
      </Panel>
    )
  }

  if (items.length === 0) {
    return (
      <Panel title="Требует моего действия">
        <EmptyState
          icon={<CheckCircle2 size={48} className="text-success" />}
          title="Всё под контролем"
          description="Сейчас нет задач, требующих вашего внимания."
        />
      </Panel>
    )
  }

  // Сводка-чипы по severity
  const counts = items.reduce<Record<DashboardActionItem['severity'], number>>(
    (acc, item) => {
      acc[item.severity] += 1
      return acc
    },
    { critical: 0, warning: 0, info: 0 },
  )

  return (
    <Panel title="Требует моего действия">
      <div className="flex flex-wrap gap-2 mb-4">
        {counts.critical > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-bg text-error-text text-xs font-medium">
            <AlertTriangle size={14} />
            {counts.critical} критично
          </span>
        )}
        {counts.warning > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-bg text-warning-text text-xs font-medium">
            <Clock size={14} />
            {counts.warning} с приближающимся сроком
          </span>
        )}
        {counts.info > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-info-bg text-info-text text-xs font-medium">
            <Inbox size={14} />
            {counts.info} информационных
          </span>
        )}
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const Icon = ICON[item.kind] ?? Inbox
          return (
            <li key={item.id}>
              <Link
                to={item.link}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-md border border-border-subtle bg-bg-subtle hover:bg-bg-hover hover:border-border-strong transition-colors',
                  'border-l-4',
                  SEVERITY_BORDER[item.severity],
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-md grid place-items-center shrink-0',
                    SEVERITY_ICON_BG[item.severity],
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5 truncate">
                    {item.subtitle}
                  </div>
                </div>
                <span className="shrink-0 self-center text-xs text-accent font-medium">
                  Открыть →
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
