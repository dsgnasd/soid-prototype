import { Link } from 'react-router-dom'
import { AlertTriangle, Inbox, Clock, FileText, MessageSquare } from 'lucide-react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { PageHeader } from '@/shared/ui/page-header'
import { EmptyState, Skeleton } from '@/shared/ui/empty-state'
import { useMyTasks } from './api'
import { formatDate } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { ApprovalTask } from '@/shared/types'

function groupTasks(tasks: ApprovalTask[]) {
  const urgent: ApprovalTask[] = []
  const today: ApprovalTask[] = []
  const later: ApprovalTask[] = []
  const now = new Date()
  tasks.forEach((t) => {
    if (t.status !== 'pending') return
    if (!t.deadline) {
      later.push(t)
      return
    }
    const days = differenceInCalendarDays(parseISO(t.deadline), now)
    if (days < 0) urgent.push(t) // просрочено
    else if (days <= 1) today.push(t)
    else later.push(t)
  })
  return { urgent, today, later }
}

export function MyTasksPage() {
  const { data = [], isLoading } = useMyTasks()
  const groups = groupTasks(data)
  const total = groups.urgent.length + groups.today.length + groups.later.length

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Работа' },
          { label: 'Мои задачи' },
        ]}
        title="Мои задачи согласования"
        subtitle="Задачи, назначенные вам, сгруппированы по сроку"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={<Inbox size={48} className="text-text-muted" />}
          title="Все задачи выполнены 👏"
          description="Новые задачи появятся здесь автоматически."
        />
      ) : (
        <div className="space-y-6">
          <TaskGroup title="Срочные" icon={<AlertTriangle size={14} />} tone="critical" items={groups.urgent} />
          <TaskGroup title="Сегодня" icon={<Clock size={14} />} tone="warning" items={groups.today} />
          <TaskGroup title="Позже" icon={<Inbox size={14} />} tone="info" items={groups.later} />
        </div>
      )}
    </div>
  )
}

const TONE_CLASS = {
  critical: 'text-error-text',
  warning: 'text-warning-text',
  info: 'text-text-muted',
}

function TaskGroup({
  title,
  icon,
  tone,
  items,
}: {
  title: string
  icon: React.ReactNode
  tone: keyof typeof TONE_CLASS
  items: ApprovalTask[]
}) {
  return (
    <section>
      <h2
        className={cn(
          'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider mb-2',
          TONE_CLASS[tone],
        )}
      >
        {icon}
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <div className="px-4 py-6 rounded-md border border-dashed border-border-default text-sm text-text-muted">
          {tone === 'critical' && 'Нет просроченных задач 🎉'}
          {tone === 'warning' && 'Нет задач с истекающим сроком.'}
          {tone === 'info' && 'Здесь появятся задачи со сроком более 1 дня.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t.id}>
              <Link
                to={routes.task(t.id)}
                className="block p-4 rounded-md border border-border-subtle bg-bg-surface hover:border-border-strong hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <div className="font-medium text-text-primary">{t.processName}</div>
                  {t.deadline && (
                    <div
                      className={cn(
                        'text-xs tabular-nums',
                        tone === 'critical' ? 'text-error-text' : 'text-text-muted',
                      )}
                    >
                      {tone === 'critical' ? 'Срок истёк ' : 'До '}
                      {formatDate(t.deadline)}
                    </div>
                  )}
                </div>
                <div className="text-xs text-text-muted mt-1">
                  Этап {t.stageOrder} «{t.stageName}» · Инициатор: {t.initiatorId}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <FileText size={12} />
                    {t.documentCount} {t.documentCount === 1 ? 'документ' : 'документов'}
                  </span>
                  {t.commentCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={12} />
                      {t.commentCount}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
