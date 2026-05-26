import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Panel } from '@/shared/ui/panel'
import { routes } from '@/shared/config/routes'

interface SecurityWidgetProps {
  eventsLast24h: number
  anomalies: number
}

export function SecurityWidget({ eventsLast24h, anomalies }: SecurityWidgetProps) {
  return (
    <Panel
      title="Безопасность"
      action={
        <Link to={routes.operations} className="text-sm font-medium text-accent hover:text-accent-hover">
          Журнал →
        </Link>
      }
    >
      <div className="space-y-2.5 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-text-secondary">Событий за 24 часа</span>
          <span className="font-semibold text-text-primary tabular-nums">
            {eventsLast24h.toLocaleString('ru-RU')}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-text-secondary">Аномалий</span>
          <span
            className={`font-semibold tabular-nums ${anomalies > 0 ? 'text-warning-text' : 'text-text-primary'}`}
          >
            {anomalies}
          </span>
        </div>
        {anomalies > 0 && (
          <div className="flex items-start gap-2 mt-3 p-2.5 rounded-md bg-warning-bg text-warning-text text-xs">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <span>Обнаружена подозрительная активность вне рабочего времени.</span>
          </div>
        )}
      </div>
    </Panel>
  )
}
