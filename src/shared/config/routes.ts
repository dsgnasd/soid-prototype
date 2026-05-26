export const routes = {
  // Auth
  login: '/login',
  forgotPassword: '/forgot-password',

  // Dashboard
  dashboard: '/',

  // Работа (оператор + админ)
  tasks: '/tasks',
  task: (id: string | number) => `/tasks/${id}`,
  myProcesses: '/processes/my',
  process: (id: string | number) => `/processes/${id}`,

  // Сервисы (оператор + админ)
  migrationNew: '/migration/new',
  approvalNew: '/approvals/new',

  // Мониторинг (оператор + админ)
  migrationStatus: '/migration/status',
  migrationDetails: (id: string | number) => `/migration/status/${id}`,
  migrationLogs: (id: string | number) => `/migration/status/${id}/logs`,
  operations: '/operations',

  // Справочники
  orgstructure: '/orgstructure',

  // Администрирование (админ)
  adminUsers: '/admin/users',
  adminUser: (id: string | number) => `/admin/users/${id}`,
  adminRoles: '/admin/roles',
  adminRole: (id: string | number) => `/admin/roles/${id}`,
  adminAccess: '/admin/access',
  adminOrgstructure: '/admin/orgstructure',
  adminApprovalTemplates: '/admin/approval-templates',
  adminApprovalTemplate: (id: string | number) => `/admin/approval-templates/${id}`,
  adminEscalations: '/admin/escalations',

  // Платформа (суперадмин)
  platformIntegrations: '/platform/integrations',
  platformIntegration: (id: string | number) => `/platform/integrations/${id}`,
  platformMigrationConfig: '/platform/migration-config',
  platformSettings: '/platform/settings',
  platformHealth: '/platform/health',

  // Прочее
  notifications: '/notifications',
  profile: '/profile',
  about: '/about',
} as const
