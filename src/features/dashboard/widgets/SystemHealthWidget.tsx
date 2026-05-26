import { Link } from 'react-router-dom'
import { Panel } from '@/shared/ui/panel'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'

interface SystemHealthWidgetProps {
  integrations: { key: string; name: string; status: 'online' | 'offline' }[]
  queue: { total: number; success: number; inProgress: number; error: number }
  backgroundJobs: { active: number; failed: number }
}

export function SystemHealthWidget({ integrations, queue, backgroundJobs }: SystemHealthWidgetProps) {
  return (
    <Panel
      title="System Health"
      action={
        <Link to={routes.platformHealth} className="text-sm font-medium text-accent hover:text-accent-hover">
          Подробности →
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Интеграции */}
        <div className="flex flex-wrap gap-3">
          {integrations.map((i) => (
            <div
              key={i.key}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg-subtle border border-border-subtle"
            >
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  i.status === 'online' ? 'bg-success' : 'bg-error',
                )}
                aria-hidden
              />
              <span className="text-sm font-medium text-text-primary">{i.name}</span>
              <span
                className={cn(
                  'text-xs font-medium',
                  i.status === 'online' ? 'text-success-text' : 'text-error-text',
                )}
              >
                {i.status === 'online' ? 'онлайн' : 'офлайн'}
              </span>
            </div>
          ))}
        </div>

        {/* Очередь миграций */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-text-muted text-xs mb-1">Очередь миграций</div>
            <div className="font-medium">
              {queue.total} <span className="text-text-muted">всего</span>
            </div>
            <div className="mt-1 text-xs text-text-muted">
              ✓ {queue.success} · ⟳ {queue.inProgress} · ❌ {queue.error}
            </div>
          </div>
          <div>
            <div className="text-text-muted text-xs mb-1">Фоновые задачи</div>
            <div className="font-medium">
              {backgroundJobs.active} <span className="text-text-muted">активны</span>
            </div>
            <div className="mt-1 text-xs text-text-muted">
              Ошибок: {backgroundJobs.failed}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
