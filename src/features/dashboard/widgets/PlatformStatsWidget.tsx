import { Panel } from '@/shared/ui/panel'

interface PlatformStatsWidgetProps {
  usersTotal: number
  orgUnitsTotal: number
  templatesTotal: number
  release: string
  releaseDate: string
  title?: string
}

export function PlatformStatsWidget({
  usersTotal,
  orgUnitsTotal,
  templatesTotal,
  release,
  releaseDate,
  title = 'Платформа',
}: PlatformStatsWidgetProps) {
  return (
    <Panel title={title}>
      <dl className="space-y-2.5 text-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-text-secondary">Пользователей</dt>
          <dd className="font-semibold text-text-primary tabular-nums">{usersTotal}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-text-secondary">Подразделений</dt>
          <dd className="font-semibold text-text-primary tabular-nums">{orgUnitsTotal}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-text-secondary">Шаблонов согласования</dt>
          <dd className="font-semibold text-text-primary tabular-nums">{templatesTotal}</dd>
        </div>
        <div className="pt-3 border-t border-border-subtle text-xs text-text-muted">
          Релиз: <span className="font-medium text-text-secondary">{release}</span> от {releaseDate}
        </div>
      </dl>
    </Panel>
  )
}
