import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { EmptyState, Skeleton } from '@/shared/ui/empty-state'
import { ProcessStatusChip } from '@/shared/ui/process-status-chip'
import { useMyProcesses } from './api'
import { formatDate } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { ProcessStatus } from '@/shared/types'

const TABS: { value: ProcessStatus | ''; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'approved', label: 'Согласованные' },
  { value: 'rejected', label: 'Отклонённые' },
  { value: 'completed', label: 'Завершённые' },
]

export function MyProcessesPage() {
  const [activeTab, setActiveTab] = useState<ProcessStatus | ''>('')
  const { data = [], isLoading } = useMyProcesses({ status: activeTab })

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Работа' },
          { label: 'Мои процессы' },
        ]}
        title="Мои процессы согласования"
        subtitle="Запущенные вами процессы и их текущий статус"
        actions={
          <Link to={routes.approvalNew}>
            <Button size="sm" icon={<Plus size={14} />}>
              Запустить
            </Button>
          </Link>
        }
      />

      {/* Tabs */}
      <div className="inline-flex items-center gap-0.5 p-1 mb-5 rounded-md bg-bg-hover border border-border-default">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'h-8 px-3.5 rounded-sm text-xs font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-bg-surface text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Panel>
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        </Panel>
      ) : data.length === 0 ? (
        <Panel>
          <EmptyState
            title="Нет процессов"
            description={
              activeTab
                ? 'По выбранному фильтру ничего не найдено. Попробуйте другой статус.'
                : 'Вы ещё не запускали процессы согласования.'
            }
            action={
              <Link to={routes.approvalNew}>
                <Button icon={<Plus size={14} />}>Запустить процесс</Button>
              </Link>
            }
          />
        </Panel>
      ) : (
        <Panel bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-subtle text-text-muted text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Наименование</th>
                  <th className="px-3 py-3 text-left font-medium hidden md:table-cell">Шаблон</th>
                  <th className="px-3 py-3 text-left font-medium">Этап</th>
                  <th className="px-3 py-3 text-left font-medium">Статус</th>
                  <th className="px-3 py-3 text-left font-medium hidden md:table-cell tabular-nums">Запуск</th>
                  <th className="px-5 py-3 text-left font-medium hidden lg:table-cell tabular-nums">Срок</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-border-subtle hover:bg-bg-subtle transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        to={routes.process(p.id)}
                        className="font-medium text-text-primary hover:text-accent"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-text-secondary hidden md:table-cell">
                      {p.templateName}
                    </td>
                    <td className="px-3 py-3 text-text-secondary tabular-nums">
                      {p.currentStageOrder}
                    </td>
                    <td className="px-3 py-3">
                      <ProcessStatusChip status={p.status} />
                    </td>
                    <td className="px-3 py-3 text-text-muted hidden md:table-cell tabular-nums">
                      {formatDate(p.startedAt)}
                    </td>
                    <td className="px-5 py-3 text-text-muted hidden lg:table-cell tabular-nums">
                      {p.deadline ? formatDate(p.deadline) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  )
}
