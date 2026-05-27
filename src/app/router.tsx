import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { MigrationNewPage } from '@/features/migration/MigrationNewPage'
import { MigrationStatusPage } from '@/features/migration/MigrationStatusPage'
import { MigrationDetailsPage } from '@/features/migration/MigrationDetailsPage'
import { MigrationLogsPage } from '@/features/migration/MigrationLogsPage'
import { ApprovalNewPage } from '@/features/approvals/ApprovalNewPage'
import { MyProcessesPage } from '@/features/approvals/MyProcessesPage'
import { MyTasksPage } from '@/features/approvals/MyTasksPage'
import { TaskDetailsPage } from '@/features/approvals/TaskDetailsPage'
import { ProcessDetailsPage } from '@/features/approvals/ProcessDetailsPage'
import { UsersPage } from '@/features/users/UsersPage'
import { OrgStructurePage } from '@/features/orgstructure/OrgStructurePage'
import { RolesPage } from '@/features/roles/RolesPage'
import { AccessPage } from '@/features/access/AccessPage'
import { ApprovalTemplatesPage } from '@/features/templates/ApprovalTemplatesPage'
import { OperationsPage } from '@/features/operations/OperationsPage'
import { PlatformIntegrationsPage } from '@/features/platform/PlatformIntegrationsPage'
import { PlatformHealthPage } from '@/features/platform/PlatformHealthPage'
import { PlatformSettingsPage } from '@/features/platform/PlatformSettingsPage'
import { PlatformMigrationConfigPage } from '@/features/platform/PlatformMigrationConfigPage'
import { EscalationsPage } from '@/features/escalations/EscalationsPage'
import { NewEscalationPage } from '@/features/escalations/NewEscalationPage'
import { AboutPage } from '@/features/profile/AboutPage'
import { routes } from '@/shared/config/routes'

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: routes.login, element: <LoginPage /> },
      { path: routes.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: routes.dashboard, element: <DashboardPage /> },

      { path: routes.tasks, element: <MyTasksPage /> },
      { path: '/tasks/:id', element: <TaskDetailsPage /> },
      { path: routes.myProcesses, element: <MyProcessesPage /> },
      { path: '/processes/:id', element: <ProcessDetailsPage /> },

      { path: routes.migrationNew, element: <MigrationNewPage /> },
      { path: routes.approvalNew, element: <ApprovalNewPage /> },

      { path: routes.migrationStatus, element: <MigrationStatusPage /> },
      { path: '/migration/status/:id', element: <MigrationDetailsPage /> },
      { path: '/migration/status/:id/logs', element: <MigrationLogsPage /> },
      { path: routes.operations, element: <OperationsPage /> },

      { path: routes.adminUsers, element: <UsersPage /> },
      { path: routes.adminRoles, element: <RolesPage /> },
      { path: routes.adminAccess, element: <AccessPage /> },
      { path: routes.adminOrgstructure, element: <OrgStructurePage /> },
      { path: routes.orgstructure, element: <OrgStructurePage /> },
      { path: routes.adminApprovalTemplates, element: <ApprovalTemplatesPage /> },
      { path: routes.adminEscalations, element: <EscalationsPage /> },
      { path: '/admin/escalations/new', element: <NewEscalationPage /> },

      { path: routes.platformIntegrations, element: <PlatformIntegrationsPage /> },
      { path: routes.platformMigrationConfig, element: <PlatformMigrationConfigPage /> },
      { path: routes.platformSettings, element: <PlatformSettingsPage /> },
      { path: routes.platformHealth, element: <PlatformHealthPage /> },

      { path: routes.about, element: <AboutPage /> },
    ],
  },
  { path: '*', element: <Navigate to={routes.dashboard} replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
