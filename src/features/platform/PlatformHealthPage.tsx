import { useQuery } from '@tanstack/react-query'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/empty-state'
import { apiFetch } from '@/shared/api/client'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'

interface HealthData {
  integrations: { key: string; name: string; status: 'online' | 'offline'; responseTimeMs: number; errorsLast24h: number }[]
  timeSeries: { time: string; success: number; errors: number }[]
  queue: { total: number; success: number; inProgress: number; error: number }
  backgroundJobs: { active: number; failed: number }
}

export function PlatformHealthPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<HealthData>('/platform/health'),
    refetchInterval: 30_000,
  })

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Платформа' },
          { label: 'System Health' },
        ]}
        title="System Health"
        subtitle="Состояние интеграций, очередей и фоновых задач (обновляется каждые 30 секунд)"
      />

      {isLoading || !data ? (
        <div className="space-y-5">
          <Skeleton className="h-32" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="space-y-5">
          <Panel title="Интеграции">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.integrations.map((i) => (
                <div
                  key={i.key}
                  className="p-4 rounded-md border border-border-subtle bg-bg-subtle"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-text-primary">{i.name}</span>
                    <span
                      className={cn(
                        'w-2.5 h-2.5 rounded-full',
                        i.status === 'online' ? 'bg-success' : 'bg-error',
                      )}
                    />
                  </div>
                  <div className="text-xs text-text-muted">
                    Время отклика:{' '}
                    <span className="text-text-secondary font-medium tabular-nums">
                      {i.responseTimeMs} мс
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    Ошибок за 24ч:{' '}
                    <span
                      className={cn(
                        'font-medium tabular-nums',
                        i.errorsLast24h > 0 ? 'text-error-text' : 'text-text-secondary',
                      )}
                    >
                      {i.errorsLast24h}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Миграции за последние 24 часа">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke="var(--success)"
                    name="Успешные"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="var(--error)"
                    name="Ошибки"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Panel title="Очередь миграций">
              <dl className="text-sm space-y-2">
                <dt className="text-text-muted">Всего</dt>
                <dd className="text-3xl font-semibold text-text-primary tabular-nums">{data.queue.total}</dd>
                <div className="flex gap-4 text-xs text-text-muted pt-3 border-t border-border-subtle">
                  <span>✓ {data.queue.success}</span>
                  <span>⟳ {data.queue.inProgress}</span>
                  <span className="text-error-text">❌ {data.queue.error}</span>
                </div>
              </dl>
            </Panel>
            <Panel title="Фоновые задачи">
              <dl className="text-sm space-y-2">
                <dt className="text-text-muted">Активны</dt>
                <dd className="text-3xl font-semibold text-text-primary tabular-nums">
                  {data.backgroundJobs.active}
                </dd>
                <div
                  className={cn(
                    'text-xs pt-3 border-t border-border-subtle',
                    data.backgroundJobs.failed > 0 ? 'text-error-text' : 'text-text-muted',
                  )}
                >
                  Ошибок: {data.backgroundJobs.failed}
                </div>
              </dl>
            </Panel>
          </div>
        </div>
      )}
    </div>
  )
}
