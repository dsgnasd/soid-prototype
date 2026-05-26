import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, RefreshCw, Search, X, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { EmptyState, Skeleton } from '@/shared/ui/empty-state'
import { MigrationStatusChip } from '@/shared/ui/migration-status-chip'
import { useMigrations, type MigrationFilter } from './api'
import { formatDate } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { MigrationStatus, ExternalSystemKey } from '@/shared/types'

const STATUS_OPTIONS: { value: MigrationStatus | ''; label: string }[] = [
  { value: '', label: 'Все статусы' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'created', label: 'Создан' },
  { value: 'updated', label: 'Обновлён' },
  { value: 'partial', label: 'Частично' },
  { value: 'error', label: 'Ошибка' },
  { value: 'stopped', label: 'Остановлена' },
]

const SYSTEM_OPTIONS: { value: ExternalSystemKey | ''; label: string }[] = [
  { value: '', label: 'Все системы' },
  { value: 'ips', label: 'IPS' },
  { value: 'teamcenter', label: 'Teamcenter' },
  { value: '1c', label: '1С' },
]

const PAGE_SIZE = 10

export function MigrationStatusPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<MigrationStatus | ''>('')
  const [source, setSource] = useState<ExternalSystemKey | ''>('')
  const [target, setTarget] = useState<ExternalSystemKey | ''>('')
  const [page, setPage] = useState(1)

  const filter: MigrationFilter = { search, status, source, target, page, pageSize: PAGE_SIZE }
  const { data, isLoading, isError, refetch, isFetching } = useMigrations(filter)

  const hasFilters = Boolean(search || status || source || target)
  const resetFilters = () => {
    setSearch('')
    setStatus('')
    setSource('')
    setTarget('')
    setPage(1)
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Мониторинг' },
          { label: 'Статус миграции' },
        ]}
        title="Статус миграции"
        subtitle="Контроль и анализ загруженных пакетов миграции"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
              onClick={() => refetch()}
            >
              Обновить
            </Button>
            <Button variant="secondary" size="sm" icon={<Download size={14} />}>
              Экспорт
            </Button>
          </>
        }
      />

      <Panel title="Параметры поиска" bodyClassName="px-5 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div className="lg:col-span-2">
            <label className="block text-xs text-text-muted mb-1">Обозначение / наименование</label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="ТТ-1024, корпус…"
                className="w-full h-10 pl-9 pr-3 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Статус</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as MigrationStatus | '')
                setPage(1)
              }}
              className="w-full h-10 px-3 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-text-muted mb-1">Источник</label>
              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value as ExternalSystemKey | '')
                  setPage(1)
                }}
                className="w-full h-10 px-2 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
              >
                {SYSTEM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Цель</label>
              <select
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value as ExternalSystemKey | '')
                  setPage(1)
                }}
                className="w-full h-10 px-2 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
              >
                {SYSTEM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {hasFilters && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Активные фильтры:</span>
            {search && <FilterChip onRemove={() => setSearch('')}>Поиск: {search}</FilterChip>}
            {status && (
              <FilterChip onRemove={() => setStatus('')}>
                {STATUS_OPTIONS.find((o) => o.value === status)?.label}
              </FilterChip>
            )}
            {source && (
              <FilterChip onRemove={() => setSource('')}>
                Источник: {SYSTEM_OPTIONS.find((o) => o.value === source)?.label}
              </FilterChip>
            )}
            {target && (
              <FilterChip onRemove={() => setTarget('')}>
                Цель: {SYSTEM_OPTIONS.find((o) => o.value === target)?.label}
              </FilterChip>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="ml-1 text-accent hover:text-accent-hover font-medium"
            >
              Сбросить всё
            </button>
          </div>
        )}
      </Panel>

      <div className="mt-5">
        {isLoading ? (
          <Panel>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          </Panel>
        ) : isError ? (
          <Panel>
            <EmptyState
              variant="error"
              icon={<AlertCircle size={48} className="text-error" />}
              title="Не удалось загрузить миграции"
              action={<Button onClick={() => refetch()}>Повторить</Button>}
            />
          </Panel>
        ) : items.length === 0 ? (
          <Panel>
            <EmptyState
              title="Ничего не найдено"
              description={hasFilters ? 'По заданным условиям ничего не найдено.' : 'Запустите первую миграцию из раздела «Сервисы».'}
              action={
                hasFilters ? (
                  <Button variant="secondary" onClick={resetFilters}>
                    Сбросить фильтры
                  </Button>
                ) : (
                  <Link to={routes.migrationNew}>
                    <Button>Запустить миграцию</Button>
                  </Link>
                )
              }
            />
          </Panel>
        ) : (
          <Panel bodyClassName="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-subtle text-text-muted text-[11px] uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">Обозн.</th>
                    <th className="px-3 py-3 text-left font-medium hidden md:table-cell">Рев.</th>
                    <th className="px-3 py-3 text-left font-medium">Наименование</th>
                    <th className="px-3 py-3 text-left font-medium hidden lg:table-cell">Пакет</th>
                    <th className="px-3 py-3 text-left font-medium">Статус</th>
                    <th className="px-3 py-3 text-left font-medium hidden md:table-cell tabular-nums">Дата</th>
                    <th className="px-5 py-3 text-right font-medium">Объектов</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m) => (
                    <tr
                      key={m.id}
                      className="border-t border-border-subtle hover:bg-bg-subtle transition-colors"
                    >
                      <td className="px-5 py-3 align-middle">
                        <Link
                          to={routes.migrationDetails(m.id)}
                          className="font-medium text-text-primary hover:text-accent"
                        >
                          {m.designation}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-text-muted hidden md:table-cell">{m.revision}</td>
                      <td className="px-3 py-3 text-text-secondary">{m.name}</td>
                      <td className="px-3 py-3 text-text-muted hidden lg:table-cell">{m.packageName}</td>
                      <td className="px-3 py-3">
                        <MigrationStatusChip status={m.status} />
                      </td>
                      <td className="px-3 py-3 text-text-muted hidden md:table-cell tabular-nums">
                        {formatDate(m.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {m.successCount}/{m.totalObjects}
                        {m.errorCount > 0 && (
                          <span className="ml-1 text-error-text">(−{m.errorCount})</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="flex items-center justify-between px-5 py-3 border-t border-border-subtle text-sm text-text-muted">
              <div>
                Показано {items.length} из {total}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ←
                </Button>
                <span className="px-2 tabular-nums">
                  Стр. {page} из {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  →
                </Button>
              </div>
            </footer>
          </Panel>
        )}
      </div>
    </div>
  )
}

function FilterChip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
        'bg-accent-subtle text-accent-text border border-accent-border',
      )}
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 -mr-0.5 hover:opacity-70"
        aria-label="Убрать фильтр"
      >
        <X size={12} />
      </button>
    </span>
  )
}
