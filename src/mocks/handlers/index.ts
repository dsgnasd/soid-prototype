import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { notificationsHandlers } from './notifications'
import { migrationHandlers } from './migration'
import { approvalsHandlers } from './approvals'
import { adminHandlers } from './admin'
import { platformHandlers } from './platform'

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...notificationsHandlers,
  ...migrationHandlers,
  ...approvalsHandlers,
  ...adminHandlers,
  ...platformHandlers,
]
