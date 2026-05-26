import { Link } from 'react-router-dom'
import { Play, FileCheck, Settings, Wrench } from 'lucide-react'
import { Panel } from '@/shared/ui/panel'
import { routes } from '@/shared/config/routes'
import type { RoleId } from '@/shared/types'

interface QuickActionsWidgetProps {
  role: RoleId
}

const OPERATOR_ACTIONS = [
  { to: routes.migrationNew, label: 'Запустить миграцию', icon: Play },
  { to: routes.approvalNew, label: 'Создать процесс согласования', icon: FileCheck },
]

const ADMIN_ACTIONS = [
  { to: routes.adminUsers, label: 'Добавить пользователя', icon: Play },
  { to: routes.adminRoles, label: 'Создать роль', icon: FileCheck },
  { to: routes.adminOrgstructure, label: 'Добавить подразделение', icon: Wrench },
  { to: routes.adminApprovalTemplates, label: 'Шаблоны согласования', icon: Settings },
]

const SUPERADMIN_ACTIONS = [
  { to: routes.platformHealth, label: 'Тест всех интеграций', icon: Play },
  { to: routes.operations, label: 'Открыть журнал', icon: FileCheck },
  { to: routes.platformSettings, label: 'Системные настройки', icon: Settings },
]

export function QuickActionsWidget({ role }: QuickActionsWidgetProps) {
  const actions =
    role === 'superadmin' ? SUPERADMIN_ACTIONS : role === 'admin' ? ADMIN_ACTIONS : OPERATOR_ACTIONS

  return (
    <Panel title="Быстрые действия">
      <ul className="space-y-2">
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <li key={a.to}>
              <Link
                to={a.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border-subtle bg-bg-subtle hover:bg-accent-subtle hover:border-accent-border transition-colors text-sm font-medium text-text-primary"
              >
                <span className="w-8 h-8 rounded-md bg-accent text-white grid place-items-center shrink-0">
                  <Icon size={16} />
                </span>
                <span className="flex-1">{a.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
