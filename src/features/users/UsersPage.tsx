import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, Lock, UserCog, Mail } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton } from '@/shared/ui/empty-state'
import { apiFetch } from '@/shared/api/client'
import { formatDate } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import type { OrgUnit, User } from '@/shared/types'

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | 'active' | 'blocked'>('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', { search, status }],
    queryFn: () =>
      apiFetch<User[]>('/users', { params: { search, status: status || undefined } }),
  })
  const { data: orgUnits = [] } = useQuery({
    queryKey: ['orgstructure'],
    queryFn: () => apiFetch<OrgUnit[]>('/orgstructure'),
  })

  const orgMap = Object.fromEntries(orgUnits.map((o) => [o.id, o.name]))

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Администрирование' },
          { label: 'Пользователи' },
        ]}
        title="Пользователи"
        subtitle="Управление учётными записями в рамках вашего scope"
        actions={
          <Button size="sm" icon={<Plus size={14} />}>
            Добавить пользователя
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
              placeholder="Поиск по ФИО или email…"
              className="w-full h-10 pl-9 pr-3 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as '' | 'active' | 'blocked')}
            className="h-10 px-3 rounded-md border border-border-default bg-bg-subtle text-sm md:w-44"
          >
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="blocked">Заблокированные</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-sm text-text-muted py-8 text-center">
            Пользователей по фильтру не найдено.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-subtle text-text-muted text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">ФИО</th>
                  <th className="px-3 py-3 text-left font-medium hidden md:table-cell">Email</th>
                  <th className="px-3 py-3 text-left font-medium hidden lg:table-cell">Подразделение</th>
                  <th className="px-3 py-3 text-left font-medium">Роли</th>
                  <th className="px-3 py-3 text-left font-medium">Статус</th>
                  <th className="px-3 py-3 text-left font-medium hidden lg:table-cell tabular-nums">Пароль до</th>
                  <th className="px-5 py-3 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-border-subtle hover:bg-bg-subtle transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-text-primary">{u.fullName}</div>
                    </td>
                    <td className="px-3 py-3 text-text-muted hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={12} className="opacity-60" />
                        {u.email}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-text-secondary hidden lg:table-cell">
                      {orgMap[u.orgUnitId] ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-text-secondary text-xs">
                      {u.roles.join(', ')}
                    </td>
                    <td className="px-3 py-3">
                      {u.status === 'active' ? (
                        <Chip variant="success">Активен</Chip>
                      ) : (
                        <Chip variant="error" icon={<Lock size={12} />}>
                          Заблокирован
                        </Chip>
                      )}
                    </td>
                    <td className="px-3 py-3 text-text-muted hidden lg:table-cell tabular-nums">
                      {formatDate(u.passwordExpiresAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        className="text-text-muted hover:text-text-primary p-1.5 rounded-md hover:bg-bg-hover"
                        aria-label="Редактировать"
                      >
                        <UserCog size={14} />
                      </button>
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
