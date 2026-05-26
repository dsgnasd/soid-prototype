import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download, ChevronLeft, Search } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Skeleton, EmptyState } from '@/shared/ui/empty-state'
import { useMigrationLogs, useMigrationDetails } from './api'
import { formatDateTime } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import { Select } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import type { MigrationLogEntry } from '@/shared/types'

const LEVEL_OPTIONS: { value: '' | MigrationLogEntry['level']; label: string }[] = [
  { value: '', label: 'Все уровни' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warn' },
  { value: 'error', label: 'Error' },
]

const LEVEL_CLASS: Record<MigrationLogEntry['level'], string> = {
  info: 'text-info-text bg-info-bg',
  warn: 'text-warning-text bg-warning-bg',
  error: 'text-error-text bg-error-bg',
}

export function MigrationLogsPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useMigrationLogs(id)
  const { data: pkg } = useMigrationDetails(id)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState<'' | MigrationLogEntry['level']>('')

  const filtered = (data ?? []).filter((entry) => {
    if (level && entry.level !== level) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        entry.message.toLowerCase().includes(q) ||
        (entry.objectDesignation ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Мониторинг' },
          { label: 'Статус миграции', to: routes.migrationStatus },
          { label: pkg?.packageName ?? '…', to: id ? routes.migrationDetails(id) : '#' },
          { label: 'Логи' },
        ]}
        title="Логи миграции"
        subtitle={pkg ? `${pkg.designation} · ${pkg.name}` : 'Загрузка…'}
        actions={
          <>
            {id && (
              <Link to={routes.migrationDetails(id)}>
                <Button variant="secondary" size="sm" icon={<ChevronLeft size={14} />}>
                  Назад
                </Button>
              </Link>
            )}
            <Button variant="secondary" size="sm" icon={<Download size={14} />}>
              Скачать .txt
            </Button>
          </>
        }
      />

      <Panel bodyClassName="px-5 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3 mb-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по сообщению или объекту…"
              className="w-full h-10 pl-9 pr-3 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
            />
          </div>
          <Select
            value={level}
            onChange={(v) => setLevel(v as '' | MigrationLogEntry['level'])}
            options={LEVEL_OPTIONS}
            ariaLabel="Уровень лога"
          />
        </div>

        {isLoading ? (
          <div className="space-y-1.5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Записей не найдено" description="Попробуйте изменить параметры поиска." />
        ) : (
          <div className="font-mono text-[12px] leading-relaxed border border-border-subtle rounded-md overflow-hidden">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'grid grid-cols-[160px_auto_1fr] gap-3 px-3 py-1.5 border-b border-border-subtle last:border-b-0',
                  entry.level === 'error' && 'bg-error-bg/30',
                  entry.level === 'warn' && 'bg-warning-bg/30',
                )}
              >
                <div className="text-text-muted tabular-nums whitespace-nowrap">
                  {formatDateTime(entry.timestamp)}
                </div>
                <div>
                  <span
                    className={cn(
                      'inline-block px-1.5 rounded-sm text-[10px] font-semibold uppercase',
                      LEVEL_CLASS[entry.level],
                    )}
                  >
                    {entry.level}
                  </span>
                </div>
                <div className="text-text-primary break-words">
                  {entry.objectDesignation && (
                    <span className="text-text-muted mr-2">[{entry.objectDesignation}]</span>
                  )}
                  {entry.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
