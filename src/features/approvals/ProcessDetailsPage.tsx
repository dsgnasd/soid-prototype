import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Download, FileText, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Skeleton, EmptyState } from '@/shared/ui/empty-state'
import { ProcessStatusChip } from '@/shared/ui/process-status-chip'
import { useProcessDetails } from './api'
import { formatDateTime } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'

export function ProcessDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useProcessDetails(id)

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-96 mb-4" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!data) {
    return (
      <EmptyState
        variant="error"
        icon={<AlertCircle size={48} className="text-error" />}
        title="Процесс не найден"
        action={
          <Link to={routes.myProcesses}>
            <Button variant="secondary" icon={<ChevronLeft size={16} />}>
              К моим процессам
            </Button>
          </Link>
        }
      />
    )
  }

  const isReadOnly = data.status !== 'in_progress'

  return (
    <div className="max-w-[1200px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Работа' },
          { label: 'Мои процессы', to: routes.myProcesses },
          { label: data.name },
        ]}
        title={
          <span className="flex items-center gap-3 flex-wrap">
            {data.name}
            <ProcessStatusChip status={data.status} />
          </span>
        }
        subtitle={data.templateName}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Download size={14} />}>
              Выгрузить PDF
            </Button>
            {!isReadOnly && (
              <Button variant="danger" size="sm">
                Отозвать
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div className="space-y-5">
          {/* Этапы */}
          <Panel title="Этапы">
            <ol className="relative border-l border-border-default ml-2 space-y-4">
              {data.participants.map((p) => (
                <li key={`${p.userId}-${p.stageOrder}`} className="ml-4">
                  <div
                    className={cn(
                      'absolute -left-1.5 w-3 h-3 rounded-full',
                      p.stageOrder === data.currentStageOrder ? 'bg-accent ring-4 ring-accent-subtle' : 'bg-border-strong',
                    )}
                  />
                  <div className="text-sm font-medium text-text-primary">
                    Этап {p.stageOrder} · {p.userId}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {p.status === 'pending' && 'Ожидает решения'}
                    {p.status === 'approved' && `Согласовано · ${formatDateTime(p.decidedAt)}`}
                    {p.status === 'rejected' && `Отклонено · ${formatDateTime(p.decidedAt)}`}
                    {p.status === 'returned' && `Возвращено на доработку · ${formatDateTime(p.decidedAt)}`}
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          {/* История */}
          <Panel title="История">
            {data.history.length === 0 ? (
              <div className="text-sm text-text-muted">История пуста.</div>
            ) : (
              <ol className="relative border-l border-border-default ml-2 space-y-3">
                {data.history.map((h) => (
                  <li key={h.id} className="ml-4">
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-accent" />
                    <div className="text-xs text-text-muted tabular-nums">
                      {formatDateTime(h.timestamp)}
                    </div>
                    <div className="text-sm text-text-primary">
                      <span className="font-medium">{h.actorId}</span> · {actionLabel(h.action)}
                    </div>
                    {h.comment && (
                      <div className="mt-1 text-xs text-text-secondary bg-bg-subtle rounded-md p-2">
                        {h.comment}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Информация">
            <dl className="text-sm space-y-2">
              <Row label="Шаблон" value={data.templateName} />
              <Row label="Статус" value={statusLabel(data.status)} />
              <Row label="Этап" value={String(data.currentStageOrder)} />
              <Row label="Запущен" value={formatDateTime(data.startedAt)} />
              {data.finishedAt && <Row label="Завершён" value={formatDateTime(data.finishedAt)} />}
              {data.deadline && <Row label="Срок" value={formatDateTime(data.deadline)} />}
            </dl>
          </Panel>

          <Panel title="Документы">
            {data.documents.length === 0 ? (
              <EmptyState title="Нет документов" />
            ) : (
              <ul className="space-y-2">
                {data.documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 text-sm">
                    <FileText size={14} className="text-text-muted shrink-0" />
                    <span className="flex-1 min-w-0 truncate">{d.fileName}</span>
                    <span className="text-text-muted text-xs">
                      {Math.round(d.sizeKb / 102.4) / 10} МБ
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    started: 'запустил процесс',
    approved: 'согласовал',
    rejected: 'отклонил',
    returned: 'вернул на доработку',
    withdrawn: 'отозвал процесс',
    attached_file: 'прикрепил файл',
    commented: 'оставил комментарий',
  }
  return map[action] ?? action
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    in_progress: 'В работе',
    approved: 'Согласован',
    rejected: 'Отклонён',
    completed: 'Завершён',
    withdrawn: 'Отозван',
    draft: 'Черновик',
  }
  return map[status] ?? status
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary text-right">{value}</dd>
    </div>
  )
}
