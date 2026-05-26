import { useQuery } from '@tanstack/react-query'
import { Plus, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton } from '@/shared/ui/empty-state'
import { apiFetch } from '@/shared/api/client'
import { formatDate } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import type { MigrationPair } from '@/shared/types'

const SYSTEM_NAMES: Record<string, string> = {
  ips: 'IPS',
  teamcenter: 'Teamcenter',
  '1c': '1С',
}

const STATUS_LABEL: Record<MigrationPair['status'], { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Активна', variant: 'success' },
  draft: { label: 'Черновик', variant: 'warning' },
  disabled: { label: 'Отключена', variant: 'neutral' },
}

export function PlatformMigrationConfigPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['migration-config'],
    queryFn: () => apiFetch<MigrationPair[]>('/migration-config'),
  })

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Платформа' },
          { label: 'Конфигурация миграций' },
        ]}
        title="Конфигурация миграций"
        subtitle="Допустимые пары систем (источник → цель) и поддерживаемые типы объектов"
        actions={
          <Button size="sm" icon={<Plus size={14} />}>
            Добавить пару
          </Button>
        }
      />

      <Panel bodyClassName="px-0 pb-0">
        {isLoading ? (
          <div className="p-5 space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-subtle text-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Пара</th>
                <th className="px-3 py-3 text-left font-medium">Типы объектов</th>
                <th className="px-3 py-3 text-left font-medium">Статус</th>
                <th className="px-3 py-3 text-right font-medium tabular-nums">Успех / Ошибки 30 дн.</th>
                <th className="px-5 py-3 text-right font-medium tabular-nums">Обновлено</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => {
                const status = STATUS_LABEL[m.status]
                return (
                  <tr
                    key={m.id}
                    className="border-t border-border-subtle hover:bg-bg-subtle transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 font-medium text-text-primary">
                        {SYSTEM_NAMES[m.source]}
                        <ArrowRight size={14} className="text-text-muted" />
                        {SYSTEM_NAMES[m.target]}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {m.objectTypes.join(', ')}
                    </td>
                    <td className="px-3 py-3">
                      <Chip variant={status.variant}>{status.label}</Chip>
                    </td>
                    <td className="px-3 py-3 text-right text-text-secondary tabular-nums">
                      <span className="text-success-text">{m.successCount30d}</span>
                      {' / '}
                      <span className={m.errorCount30d > 0 ? 'text-error-text' : ''}>
                        {m.errorCount30d}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-text-muted tabular-nums">
                      {formatDate(m.updatedAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  )
}
