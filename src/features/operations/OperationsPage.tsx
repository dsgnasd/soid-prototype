import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Search } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton } from '@/shared/ui/empty-state'
import { apiFetch } from '@/shared/api/client'
import { formatDateTime } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import { Select } from '@/shared/ui/select'
import type { Operation, OperationType } from '@/shared/types'

const TYPE_OPTIONS: { value: '' | OperationType; label: string }[] = [
  { value: '', label: 'Все типы' },
  { value: 'create', label: 'Создание' },
  { value: 'update', label: 'Изменение' },
  { value: 'delete', label: 'Удаление' },
  { value: 'authorize', label: 'Авторизация' },
  { value: 'export', label: 'Экспорт' },
]

const TYPE_LABEL: Record<OperationType, string> = {
  create: 'Создание',
  update: 'Изменение',
  delete: 'Удаление',
  authorize: 'Авторизация',
  export: 'Экспорт',
}

const TYPE_VARIANT: Record<OperationType, 'success' | 'info' | 'error' | 'warning' | 'neutral'> = {
  create: 'success',
  update: 'info',
  delete: 'error',
  authorize: 'warning',
  export: 'neutral',
}

export function OperationsPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'' | OperationType>('')

  const { data = [], isLoading } = useQuery({
    queryKey: ['operations', { search, type }],
    queryFn: () =>
      apiFetch<Operation[]>('/operations', {
        params: { search, type: type || undefined },
      }),
  })

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Мониторинг' },
          { label: 'История операций' },
        ]}
        title="История операций"
        subtitle="Журнал значимых действий пользователей в системе"
        actions={
          <Button size="sm" variant="secondary" icon={<Download size={14} />}>
            Экспорт
          </Button>
        }
      />

      <Panel bodyClassName="px-5 pb-5">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по описанию или объекту…"
              className="w-full h-10 pl-9 pr-3 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
            />
          </div>
          <div className="md:w-44">
            <Select
              value={type}
              onChange={setType}
              options={TYPE_OPTIONS}
              ariaLabel="Тип операции"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-subtle text-text-muted text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium tabular-nums">Дата/время</th>
                  <th className="px-3 py-3 text-left font-medium">Пользователь</th>
                  <th className="px-3 py-3 text-left font-medium hidden md:table-cell">Объект</th>
                  <th className="px-3 py-3 text-left font-medium">Тип</th>
                  <th className="px-3 py-3 text-left font-medium hidden lg:table-cell">Описание</th>
                  <th className="px-5 py-3 text-left font-medium hidden xl:table-cell">IP</th>
                </tr>
              </thead>
              <tbody>
                {data.map((op) => (
                  <tr
                    key={op.id}
                    className="border-t border-border-subtle hover:bg-bg-subtle transition-colors"
                  >
                    <td className="px-5 py-3 text-text-muted tabular-nums whitespace-nowrap">
                      {formatDateTime(op.timestamp)}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">{op.userId}</td>
                    <td className="px-3 py-3 text-text-secondary hidden md:table-cell">
                      <span className="text-text-muted text-xs mr-1">{op.entityType}:</span>
                      {op.entityLabel}
                    </td>
                    <td className="px-3 py-3">
                      <Chip variant={TYPE_VARIANT[op.type]}>{TYPE_LABEL[op.type]}</Chip>
                    </td>
                    <td className="px-3 py-3 text-text-secondary hidden lg:table-cell">
                      {op.description}
                    </td>
                    <td className="px-5 py-3 text-text-muted hidden xl:table-cell font-mono text-xs">
                      {op.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
