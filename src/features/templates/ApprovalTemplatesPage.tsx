import { useQuery } from '@tanstack/react-query'
import { Plus, Eye } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton } from '@/shared/ui/empty-state'
import { apiFetch } from '@/shared/api/client'
import { routes } from '@/shared/config/routes'
import type { ApprovalTemplate } from '@/shared/types'

const STATUS_VARIANT = {
  published: 'success',
  draft: 'warning',
  archived: 'neutral',
} as const

export function ApprovalTemplatesPage() {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: () => apiFetch<ApprovalTemplate[]>('/admin/approval-templates'),
  })

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Администрирование' },
          { label: 'Шаблоны процессов согласования' },
        ]}
        title="Шаблоны процессов согласования"
        subtitle="Готовые шаблоны для запуска процессов операторами"
        actions={
          <Button size="sm" icon={<Plus size={14} />}>
            Создать шаблон
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <Panel
              key={t.id}
              title={
                <span className="flex items-center gap-2">
                  {t.name}
                  <Chip variant={STATUS_VARIANT[t.status]}>
                    {t.status === 'published' ? 'Опубликован' : t.status === 'draft' ? 'Черновик' : 'Архив'}
                  </Chip>
                </span>
              }
              action={
                <Button size="sm" variant="secondary" icon={<Eye size={14} />}>
                  Открыть
                </Button>
              }
            >
              <p className="text-sm text-text-secondary mb-3">{t.description}</p>
              <div className="text-xs text-text-muted">
                Этапов: <span className="font-medium text-text-secondary">{t.stages.length}</span> ·
                Версия: <span className="font-medium text-text-secondary">v{t.version}</span>
              </div>
              <ol className="mt-3 space-y-1 text-sm">
                {t.stages.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-subtle"
                  >
                    <span className="text-xs font-semibold text-text-muted">{s.order}.</span>
                    <span className="text-text-primary">{s.name}</span>
                    {s.autoAssign && (
                      <span className="ml-auto text-[10px] uppercase tracking-wider text-text-muted">
                        авто
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}
