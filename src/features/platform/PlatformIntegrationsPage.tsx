import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Play, Plug, RefreshCw, Settings } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton } from '@/shared/ui/empty-state'
import { apiFetch } from '@/shared/api/client'
import { formatDateTime } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import type { Integration } from '@/shared/types'

export function PlatformIntegrationsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => apiFetch<Integration[]>('/integrations'),
  })

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Платформа' },
          { label: 'Интеграции' },
        ]}
        title="Подключения к внешним системам"
        subtitle="Управление подключениями к PLM-системам и проверка их доступности"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)
          : data.map((i) => <IntegrationCard key={i.id} integration={i} />)}
      </div>
    </div>
  )
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const qc = useQueryClient()
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const testMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; responseTimeMs: number; version: string }>(
        `/integrations/${integration.id}/test`,
        { method: 'POST' },
      ),
    onSuccess: (data) =>
      setResult({ ok: true, message: `Подключено за ${data.responseTimeMs} мс · версия ${data.version}` }),
    onError: (error) =>
      setResult({ ok: false, message: error instanceof Error ? error.message : 'Ошибка подключения' }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  })

  const online = integration.status === 'online'
  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Plug size={16} className="text-text-muted" />
          {integration.name}
          {online ? (
            <Chip variant="success">онлайн</Chip>
          ) : (
            <Chip variant="error">офлайн</Chip>
          )}
        </span>
      }
      action={
        <Button variant="ghost" size="sm" icon={<Settings size={14} />}>
          Настроить
        </Button>
      }
    >
      <dl className="text-sm space-y-2 mb-4">
        <Row label="Endpoint" value={<span className="font-mono text-xs">{integration.endpoint}</span>} />
        <Row label="Тайм-аут" value={`${integration.timeoutMs / 1000} с`} />
        <Row label="Активных миграций" value={String(integration.activeMigrations)} />
        <Row
          label="Ошибок за 24ч"
          value={
            <span className={integration.errorsLast24h > 0 ? 'text-error-text' : ''}>
              {integration.errorsLast24h}
            </span>
          }
        />
        <Row label="Последняя проверка" value={formatDateTime(integration.lastCheckAt)} />
      </dl>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="primary"
          icon={
            testMutation.isPending ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )
          }
          onClick={() => testMutation.mutate()}
          disabled={testMutation.isPending}
        >
          Тест подключения
        </Button>
      </div>

      {result && (
        <div
          className={`mt-3 px-3 py-2 text-xs rounded-md ${
            result.ok ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'
          }`}
        >
          {result.message}
        </div>
      )}
    </Panel>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary text-right">{value}</dd>
    </div>
  )
}
