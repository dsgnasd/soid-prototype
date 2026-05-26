import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Panel } from '@/shared/ui/panel'
import { routes } from '@/shared/config/routes'

interface MyStatusWidgetProps {
  inProgress: number
  completed7d: number
  overdue: number
}

export function MyStatusWidget({ inProgress, completed7d, overdue }: MyStatusWidgetProps) {
  return (
    <Panel
      title="Мой статус"
      action={
        <Link
          to={routes.myProcesses}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
        >
          К процессам <ArrowUpRight size={14} />
        </Link>
      }
    >
      <dl className="space-y-3">
        <div className="flex items-baseline justify-between">
          <dt className="text-sm text-text-secondary">В работе</dt>
          <dd className="text-2xl font-semibold text-text-primary tabular-nums">{inProgress}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-sm text-text-secondary">Завершено за 7 дней</dt>
          <dd className="text-2xl font-semibold text-text-primary tabular-nums">{completed7d}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-sm text-text-secondary">Просрочено</dt>
          <dd className={`text-2xl font-semibold tabular-nums ${overdue > 0 ? 'text-error-text' : 'text-text-primary'}`}>
            {overdue}
          </dd>
        </div>
      </dl>
    </Panel>
  )
}
