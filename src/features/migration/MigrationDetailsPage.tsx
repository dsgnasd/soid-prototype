import { Link, useParams } from 'react-router-dom'
import { FileText, ChevronLeft, Download, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Skeleton, EmptyState } from '@/shared/ui/empty-state'
import { MigrationStatusChip } from '@/shared/ui/migration-status-chip'
import { useMigrationDetails } from './api'
import { formatDateTime } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'

const SYSTEM_NAMES: Record<string, string> = {
  ips: 'IPS (ИНТЕРМЕХ)',
  teamcenter: 'Siemens Teamcenter',
  '1c': '1С:Предприятие',
}

export function MigrationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useMigrationDetails(id)

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-72 mb-4" />
        <Skeleton className="h-44 mb-4" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <EmptyState
        variant="error"
        icon={<AlertCircle size={48} className="text-error" />}
        title="Пакет не найден"
        action={
          <Link to={routes.migrationStatus}>
            <Button variant="secondary" icon={<ChevronLeft size={16} />}>
              К списку миграций
            </Button>
          </Link>
        }
      />
    )
  }

  const isError404 = data.errorCount > 0
  const isPartial = data.status === 'partial' || (data.successCount > 0 && data.errorCount > 0)

  return (
    <div className="max-w-[1200px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Мониторинг' },
          { label: 'Статус миграции', to: routes.migrationStatus },
          { label: data.packageName },
        ]}
        title={
          <span className="flex items-center gap-3">
            {data.designation} · {data.name}
            <MigrationStatusChip status={data.status} />
          </span>
        }
        subtitle={data.packageName}
        actions={
          <>
            <Link to={routes.migrationLogs(data.id)}>
              <Button variant="secondary" size="sm" icon={<FileText size={14} />}>
                Открыть логи
              </Button>
            </Link>
            <Button variant="secondary" size="sm" icon={<Download size={14} />}>
              Выгрузить отчёт
            </Button>
          </>
        }
      />

      {/* Сводка */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <SummaryCard label="Источник" value={SYSTEM_NAMES[data.source] ?? data.source} />
        <SummaryCard label="Цель" value={SYSTEM_NAMES[data.target] ?? data.target} />
        <SummaryCard
          label="Успешно"
          value={
            <span className="text-success-text">
              {data.successCount}
              <span className="text-text-muted text-sm font-normal"> / {data.totalObjects}</span>
            </span>
          }
        />
        <SummaryCard
          label="Ошибок"
          value={
            <span className={data.errorCount > 0 ? 'text-error-text' : ''}>{data.errorCount}</span>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Ошибки */}
        <div className="lg:col-span-2">
          <Panel
            title={
              isError404 ? (
                <span className="flex items-center gap-2">
                  Ошибки миграции
                  <span className="text-xs font-normal text-text-muted">
                    {data.errors?.length ?? 0}
                  </span>
                </span>
              ) : (
                'Перенесено успешно'
              )
            }
          >
            {data.errorCount === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={48} className="text-success" />}
                title="Без ошибок"
                description="Все объекты пакета успешно перенесены."
              />
            ) : (
              <ul className="space-y-2">
                {(data.errors ?? []).map((err, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-md border border-error/15 bg-error-bg/30"
                  >
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <div className="font-mono text-xs font-semibold text-error-text">
                        {err.code}
                      </div>
                      <div className="text-xs text-text-muted tabular-nums">
                        {formatDateTime(err.timestamp)}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-text-primary">{err.message}</div>
                    <div className="mt-1 text-xs text-text-muted">
                      Объект: <span className="font-mono">{err.objectDesignation}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Метаинформация */}
        <div className="space-y-5">
          <Panel title="Информация">
            <dl className="text-sm space-y-2">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Запущено</dt>
                <dd className="text-text-primary tabular-nums">{formatDateTime(data.createdAt)}</dd>
              </div>
              {data.finishedAt && (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">Завершено</dt>
                  <dd className="text-text-primary tabular-nums">{formatDateTime(data.finishedAt)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Пользователь</dt>
                <dd className="text-text-primary">{data.userId}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Ревизия</dt>
                <dd className="text-text-primary">{data.revision}</dd>
              </div>
            </dl>
            {isPartial && (
              <div className="mt-3 p-3 rounded-md bg-warning-bg text-warning-text text-xs">
                ⚠ Частично успешный пакет — часть объектов не перенесена.
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-4">
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className="text-xl font-semibold text-text-primary tabular-nums">{value}</div>
    </div>
  )
}
