import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Copy, Search, Shield } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton } from '@/shared/ui/empty-state'
import { apiFetch } from '@/shared/api/client'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { Role, PermissionAction } from '@/shared/types'

const MODULES: { id: string; label: string }[] = [
  { id: 'migration', label: 'Миграция' },
  { id: 'approvals', label: 'Согласование' },
  { id: 'orgstructure', label: 'Оргструктура' },
  { id: 'users', label: 'Пользователи' },
  { id: 'roles', label: 'Роли' },
  { id: 'templates', label: 'Шаблоны' },
  { id: 'operations', label: 'Журнал' },
  { id: 'platform', label: 'Платформа' },
]

const ACTIONS: { id: PermissionAction; label: string }[] = [
  { id: 'view', label: 'Просмотр' },
  { id: 'create', label: 'Создание' },
  { id: 'edit', label: 'Редактирование' },
  { id: 'delete', label: 'Удаление' },
]

export function RolesPage() {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiFetch<Role[]>('/roles'),
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const selected = roles.find((r) => r.id === selectedId) ?? roles[0]
  const filteredRoles = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Администрирование' },
          { label: 'Роли' },
        ]}
        title="Роли"
        subtitle="Шаблоны прав и разрешений в системе"
        actions={
          <Button size="sm" icon={<Plus size={14} />}>
            Добавить роль
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* Список ролей */}
        <Panel bodyClassName="px-3 pb-3">
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск роли…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
            />
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredRoles.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-md transition-colors',
                      selected?.id === r.id
                        ? 'bg-accent-subtle border border-accent-border'
                        : 'border border-transparent hover:bg-bg-hover',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-sm font-medium text-text-primary">{r.name}</span>
                      {r.system && (
                        <Chip variant="neutral" icon={<Shield size={10} />}>
                          сист.
                        </Chip>
                      )}
                    </div>
                    {r.description && (
                      <div className="text-xs text-text-muted line-clamp-2">{r.description}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Матрица прав */}
        {selected && (
          <Panel
            title={selected.name}
            action={
              <Button size="sm" variant="secondary" icon={<Copy size={14} />}>
                Дублировать
              </Button>
            }
          >
            <p className="text-sm text-text-muted mb-4">{selected.description}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-subtle text-text-muted text-[11px] uppercase tracking-wider">
                    <th className="px-3 py-2.5 text-left font-medium">Раздел</th>
                    {ACTIONS.map((a) => (
                      <th key={a.id} className="px-3 py-2.5 text-center font-medium">
                        {a.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((m) => {
                    const perm = selected.permissions.find((p) => p.module === m.id)
                    return (
                      <tr key={m.id} className="border-t border-border-subtle">
                        <td className="px-3 py-2.5 text-text-secondary">{m.label}</td>
                        {ACTIONS.map((a) => {
                          const enabled = perm?.actions.includes(a.id)
                          return (
                            <td key={a.id} className="px-3 py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={Boolean(enabled)}
                                readOnly
                                className="accent-accent"
                              />
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </div>
  )
}
