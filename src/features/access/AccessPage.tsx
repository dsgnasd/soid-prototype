import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/empty-state'
import { apiFetch } from '@/shared/api/client'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { Role, User } from '@/shared/types'

export function AccessPage() {
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users', { search }],
    queryFn: () => apiFetch<User[]>('/users', { params: { search } }),
  })
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiFetch<Role[]>('/roles'),
  })

  const selected = users.find((u) => u.id === selectedUserId) ?? users[0]
  const assignedRoles = roles.filter((r) =>
    selected ? selected.roles.some((id) => r.id.endsWith(id)) : false,
  )

  // Итоговая матрица — объединение всех permissions назначенных ролей
  const aggregatedPerms = new Map<string, Set<string>>()
  assignedRoles.forEach((r) => {
    r.permissions.forEach((p) => {
      const set = aggregatedPerms.get(p.module) ?? new Set()
      p.actions.forEach((a) => set.add(a))
      aggregatedPerms.set(p.module, set)
    })
  })

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Администрирование' },
          { label: 'Управление доступами' },
        ]}
        title="Управление доступами"
        subtitle="Назначение ролей пользователям и итоговые разрешения"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* Список пользователей */}
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
              placeholder="Поиск пользователя…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
            />
          </div>
          {usersLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {users.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={cn(
                      'w-full text-left p-2.5 rounded-md transition-colors',
                      selected?.id === u.id
                        ? 'bg-accent-subtle border border-accent-border'
                        : 'border border-transparent hover:bg-bg-hover',
                    )}
                  >
                    <div className="text-sm font-medium text-text-primary truncate">
                      {u.fullName}
                    </div>
                    <div className="text-xs text-text-muted">{u.roles.join(', ')}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {selected && (
          <div className="space-y-5">
            {/* Назначенные роли */}
            <Panel title={`Назначенные роли — ${selected.fullName}`}>
              <ul className="space-y-2">
                {roles.map((r) => {
                  const enabled = selected.roles.some((roleId) => r.id.endsWith(roleId))
                  return (
                    <li key={r.id}>
                      <label className="flex items-center gap-3 p-3 rounded-md border border-border-subtle hover:bg-bg-subtle cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={enabled}
                          readOnly
                          className="accent-accent"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary">{r.name}</div>
                          {r.description && (
                            <div className="text-xs text-text-muted">{r.description}</div>
                          )}
                        </div>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </Panel>

            {/* Итоговые разрешения */}
            <Panel title="Итоговые разрешения">
              <p className="text-xs text-text-muted mb-3">
                Объединение прав всех назначенных ролей. Если одна роль даёт «Просмотр», а другая —
                «Редактирование», итоговое право — «Редактирование».
              </p>
              <ul className="space-y-1.5">
                {Array.from(aggregatedPerms.entries()).map(([module, actions]) => (
                  <li
                    key={module}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-bg-subtle border border-border-subtle"
                  >
                    <span className="text-sm font-medium text-text-primary">{module}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {Array.from(actions).map((a) => (
                        <span
                          key={a}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-accent-subtle text-accent-text"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
                {aggregatedPerms.size === 0 && (
                  <li className="text-sm text-text-muted text-center py-4">
                    Нет назначенных ролей.
                  </li>
                )}
              </ul>
            </Panel>
          </div>
        )}
      </div>
    </div>
  )
}
