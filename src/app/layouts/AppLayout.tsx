import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Moon,
  Sun,
  LayoutDashboard,
  Inbox,
  FileCheck,
  Play,
  FilePlus,
  Activity,
  ScrollText,
  Users,
  Shield,
  KeyRound,
  Network,
  FileText,
  ArrowUpRightFromSquare,
  Plug,
  Database,
  Settings,
  Info,
  type LucideIcon,
} from 'lucide-react'
import { useAuth, useCurrentRole } from '@/shared/hooks/useAuth'
import { useTheme } from '@/shared/hooks/useTheme'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import { IconButton } from '@/shared/ui/icon-button'
import { NotificationsPanel } from '@/features/notifications/NotificationsPanel'
import { ProfileMenu } from '@/features/profile/ProfileMenu'
import type { RoleId } from '@/shared/types'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  group?: string
  roles?: RoleId[]
}

const NAV: NavItem[] = [
  { to: routes.dashboard, label: 'Дашборд', icon: LayoutDashboard },

  { to: routes.tasks, label: 'Мои задачи', icon: Inbox, group: 'РАБОТА', roles: ['operator', 'admin'] },
  { to: routes.myProcesses, label: 'Мои процессы', icon: FileCheck, group: 'РАБОТА', roles: ['operator', 'admin'] },

  { to: routes.migrationNew, label: 'Запустить миграцию', icon: Play, group: 'СЕРВИСЫ', roles: ['operator', 'admin'] },
  { to: routes.approvalNew, label: 'Запустить согласование', icon: FilePlus, group: 'СЕРВИСЫ', roles: ['operator', 'admin'] },

  { to: routes.migrationStatus, label: 'Статус миграции', icon: Activity, group: 'МОНИТОРИНГ' },
  { to: routes.operations, label: 'История операций', icon: ScrollText, group: 'МОНИТОРИНГ' },

  { to: routes.adminUsers, label: 'Пользователи', icon: Users, group: 'АДМИНИСТРИРОВАНИЕ', roles: ['admin', 'superadmin'] },
  { to: routes.adminRoles, label: 'Роли', icon: Shield, group: 'АДМИНИСТРИРОВАНИЕ', roles: ['admin', 'superadmin'] },
  { to: routes.adminAccess, label: 'Управление доступами', icon: KeyRound, group: 'АДМИНИСТРИРОВАНИЕ', roles: ['admin', 'superadmin'] },
  { to: routes.adminOrgstructure, label: 'Оргструктура', icon: Network, group: 'АДМИНИСТРИРОВАНИЕ', roles: ['admin', 'superadmin'] },
  { to: routes.adminApprovalTemplates, label: 'Шаблоны согласования', icon: FileText, group: 'АДМИНИСТРИРОВАНИЕ', roles: ['admin', 'superadmin'] },
  { to: routes.adminEscalations, label: 'Заявки эскалации', icon: ArrowUpRightFromSquare, group: 'АДМИНИСТРИРОВАНИЕ', roles: ['admin', 'superadmin'] },

  { to: routes.platformIntegrations, label: 'Интеграции', icon: Plug, group: 'ПЛАТФОРМА', roles: ['superadmin'] },
  { to: routes.platformMigrationConfig, label: 'Конфигурация миграций', icon: Database, group: 'ПЛАТФОРМА', roles: ['superadmin'] },
  { to: routes.platformSettings, label: 'Системные настройки', icon: Settings, group: 'ПЛАТФОРМА', roles: ['superadmin'] },
  { to: routes.platformHealth, label: 'System health', icon: Activity, group: 'ПЛАТФОРМА', roles: ['superadmin'] },

  { to: routes.orgstructure, label: 'Оргструктура (просмотр)', icon: Network, group: 'СПРАВОЧНИКИ' },
  { to: routes.about, label: 'О программе', icon: Info, group: 'СПРАВОЧНИКИ' },
]

export function AppLayout() {
  const auth = useAuth()
  const role = useCurrentRole()
  const location = useLocation()
  const { theme, toggle } = useTheme()

  if (!auth.user) {
    return <Navigate to={routes.login} state={{ from: location.pathname }} replace />
  }

  const visibleNav = NAV.filter((item) => !item.roles || item.roles.includes(role))
  const grouped = visibleNav.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.group ?? ''
    acc[key] = acc[key] ?? []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen flex bg-bg-app text-text-primary">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[252px] shrink-0 bg-bg-surface border-r border-border-subtle">
        <div className="h-[72px] flex items-center gap-2 px-5 border-b border-border-subtle">
          <div className="w-8 h-8 rounded-md bg-accent text-white grid place-items-center font-semibold">
            С
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">СОИД</div>
            <div className="text-[11px] text-text-muted">Прототип v0.1</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group || 'top'} className="mb-4">
              {group && (
                <div className="px-3 py-2 text-[11px] font-medium tracking-wider uppercase text-text-muted">
                  {group}
                </div>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === routes.dashboard}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-3 h-[42px] px-3 rounded-md text-sm transition-colors',
                            isActive
                              ? 'bg-accent-subtle text-accent-text font-medium'
                              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              size={18}
                              className={cn(
                                'shrink-0 transition-colors',
                                isActive
                                  ? 'text-accent'
                                  : 'text-text-muted group-hover:text-text-secondary',
                              )}
                              strokeWidth={1.75}
                            />
                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-border-subtle text-[11px] text-text-muted">
          СОИД v0.1 · сборка 25.05.2026
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[72px] shrink-0 bg-bg-surface border-b border-border-subtle px-4 lg:px-8 flex items-center gap-3 sticky top-0 z-50">
          <div className="flex-1" />
          <NotificationsPanel />
          <IconButton
            icon={theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            onClick={toggle}
          />
          <ProfileMenu />
        </header>

        {/* Content */}
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-7 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
