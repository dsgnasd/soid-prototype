import { useCurrentRole, useCurrentUser } from '@/shared/hooks/useAuth'
import { useDashboard } from './api'
import { ActionRequiredWidget } from './widgets/ActionRequiredWidget'
import { MyStatusWidget } from './widgets/MyStatusWidget'
import { QuickActionsWidget } from './widgets/QuickActionsWidget'
import { HelpWidget } from './widgets/HelpWidget'
import { LastMigrationsWidget } from './widgets/LastMigrationsWidget'
import { SystemHealthWidget } from './widgets/SystemHealthWidget'
import { PlatformStatsWidget } from './widgets/PlatformStatsWidget'
import { SecurityWidget } from './widgets/SecurityWidget'
import { EmptyState } from '@/shared/ui/empty-state'
import { AlertCircle } from 'lucide-react'

const ROLE_TITLES: Record<string, string> = {
  operator: 'Дашборд',
  admin: 'Дашборд — администрирование',
  superadmin: 'Дашборд — платформа',
}

const ROLE_SUBTITLES: Record<string, string> = {
  operator: 'Задачи, миграции и согласования, требующие вашего внимания',
  admin: 'Состояние пользователей, ролей и процессов в вашем подразделении',
  superadmin: 'Системное здоровье, безопасность и эскалации',
}

export function DashboardPage() {
  const user = useCurrentUser()
  const role = useCurrentRole()
  const { data, isLoading, isError, refetch } = useDashboard(role)

  if (isError) {
    return (
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text-primary mb-6">
          {ROLE_TITLES[role]}
        </h1>
        <EmptyState
          icon={<AlertCircle size={48} className="text-error" />}
          title="Не удалось загрузить дашборд"
          description="Проверьте подключение к сети."
          action={
            <button
              type="button"
              onClick={() => refetch()}
              className="h-10 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover"
            >
              Повторить
            </button>
          }
          variant="error"
        />
      </div>
    )
  }

  const showSystemHealth = role === 'superadmin' && data?.systemHealth
  const showPlatformStats = (role === 'admin' || role === 'superadmin') && data?.platformStats
  const showSecurity = role === 'superadmin' && data?.securityStats
  const showLastMigrations = role === 'operator' && data?.recentMigrations
  const showMyStatus = role !== 'superadmin'

  return (
    <div className="max-w-[1400px]">
      {/* Заголовок */}
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-tight text-text-primary">
          {ROLE_TITLES[role]}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {user?.fullName} · {ROLE_SUBTITLES[role]}
        </p>
      </header>

      {/* System health (только суперадмин) */}
      {showSystemHealth && (
        <div className="mb-5">
          <SystemHealthWidget
            integrations={data!.systemHealth!.integrations}
            queue={data!.systemHealth!.queue}
            backgroundJobs={data!.systemHealth!.backgroundJobs}
          />
        </div>
      )}

      {/* Action Required */}
      <div className="mb-5">
        <ActionRequiredWidget items={data?.actionRequired ?? []} loading={isLoading} />
      </div>

      {/* Сетка: статус + быстрые действия + справка */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {showMyStatus && data?.myStatus && (
          <MyStatusWidget
            inProgress={data.myStatus.inProgress}
            completed7d={data.myStatus.completed7d}
            overdue={data.myStatus.overdue}
          />
        )}
        {showPlatformStats && (
          <PlatformStatsWidget
            usersTotal={data!.platformStats!.usersTotal}
            orgUnitsTotal={data!.platformStats!.orgUnitsTotal}
            templatesTotal={data!.platformStats!.templatesTotal}
            release={data!.platformStats!.release}
            releaseDate={data!.platformStats!.releaseDate}
            title={role === 'superadmin' ? 'Платформа' : 'Мой scope'}
          />
        )}
        <QuickActionsWidget role={role} />
        {role === 'operator' && <HelpWidget />}
        {showSecurity && (
          <SecurityWidget
            eventsLast24h={data!.securityStats!.eventsLast24h}
            anomalies={data!.securityStats!.anomalies}
          />
        )}
      </div>

      {/* Последние миграции (только оператор) */}
      {showLastMigrations && data!.recentMigrations!.length > 0 && (
        <LastMigrationsWidget items={data!.recentMigrations!} />
      )}
    </div>
  )
}
