// ============================================================================
// Domain types для СОИД-прототипа.
// Используются и в фикстурах, и в MSW handlers, и в компонентах.
// ============================================================================

export type RoleId = 'operator' | 'admin' | 'superadmin'

export interface Role {
  id: RoleId | string
  name: string
  description?: string
  permissions: Permission[]
  system?: boolean
}

export interface Permission {
  module: string // 'migration' | 'approvals' | 'users' | ...
  actions: PermissionAction[]
}

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete'

export interface OrgUnit {
  id: string
  name: string
  parentId: string | null
  description?: string
}

export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  orgUnitId: string
  roles: RoleId[]
  status: 'active' | 'blocked' | 'archived'
  scopeOrgUnitId?: string // для админа — узел дерева, в рамках которого он работает
  passwordExpiresAt?: string
  lastLoginAt?: string
}

// ----------------------------------------------------------------------------
// Миграции
// ----------------------------------------------------------------------------

export type ExternalSystemKey = 'ips' | 'teamcenter' | '1c'

export interface ExternalSystem {
  id: string
  key: ExternalSystemKey
  name: string
  status: 'online' | 'offline'
  lastCheckAt: string
  responseTimeMs: number
}

export type MigrationStatus = 'in_progress' | 'created' | 'updated' | 'error' | 'partial' | 'stopped'

export interface MigrationPackage {
  id: string
  designation: string // ТТ-1024
  revision: string
  name: string
  packageName: string
  source: ExternalSystemKey
  target: ExternalSystemKey
  status: MigrationStatus
  createdAt: string
  finishedAt?: string
  userId: string
  totalObjects: number
  successCount: number
  errorCount: number
  errors?: MigrationError[]
}

export interface MigrationError {
  code: string
  objectDesignation: string
  message: string
  timestamp: string
}

export interface MigrationLogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
  objectDesignation?: string
}

// ----------------------------------------------------------------------------
// Согласование
// ----------------------------------------------------------------------------

export interface ApprovalTemplate {
  id: string
  name: string
  description: string
  status: 'published' | 'draft' | 'archived'
  stages: ApprovalStage[]
  version: number
}

export interface ApprovalStage {
  id: string
  order: number
  name: string
  participantRole?: string
  participantUserId?: string
  autoAssign: boolean
  requiredFields?: string[]
}

export type ProcessStatus = 'in_progress' | 'approved' | 'rejected' | 'completed' | 'withdrawn' | 'draft'

export interface ApprovalProcess {
  id: string
  name: string
  templateId: string
  templateName: string
  initiatorId: string
  status: ProcessStatus
  currentStageOrder: number
  startedAt: string
  finishedAt?: string
  deadline?: string
  documents: ProcessDocument[]
  history: ProcessHistoryEntry[]
  participants: ProcessParticipant[]
}

export interface ProcessParticipant {
  userId: string
  stageOrder: number
  status: 'pending' | 'approved' | 'rejected' | 'returned'
  decidedAt?: string
}

export interface ProcessDocument {
  id: string
  fileName: string
  sizeKb: number
  mimeType: string
  uploadedAt: string
  uploadedById: string
}

export interface ProcessHistoryEntry {
  id: string
  timestamp: string
  actorId: string
  action: 'started' | 'approved' | 'rejected' | 'returned' | 'withdrawn' | 'attached_file' | 'commented'
  stageOrder?: number
  comment?: string
}

export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'returned' | 'withdrawn'

export interface ApprovalTask {
  id: string
  processId: string
  processName: string
  templateName: string
  stageOrder: number
  stageName: string
  initiatorId: string
  assigneeId: string
  status: TaskStatus
  createdAt: string
  deadline?: string
  decidedAt?: string
  documentCount: number
  commentCount: number
}

// ----------------------------------------------------------------------------
// Журнал операций
// ----------------------------------------------------------------------------

export type OperationType = 'create' | 'update' | 'delete' | 'authorize' | 'export'

export interface Operation {
  id: string
  timestamp: string
  userId: string
  entityType: string // 'user' | 'role' | 'orgunit' | 'process' | 'migration' | ...
  entityId: string
  entityLabel: string // удобочитаемое имя сущности на момент действия
  type: OperationType
  description: string
  ip: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

// ----------------------------------------------------------------------------
// Уведомления
// ----------------------------------------------------------------------------

export type NotificationType =
  | 'task_assigned'
  | 'process_status_changed'
  | 'migration_completed'
  | 'migration_failed'
  | 'task_overdue'
  | 'integration_down'
  | 'security_anomaly'
  | 'escalation_received'
  | 'escalation_resolved'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  createdAt: string
  readAt?: string
  severity: 'info' | 'warning' | 'critical'
}

// ----------------------------------------------------------------------------
// Платформа (суперадмин)
// ----------------------------------------------------------------------------

export interface Integration extends ExternalSystem {
  type: ExternalSystemKey
  endpoint: string
  timeoutMs: number
  enabled: boolean
  activeMigrations: number
  errorsLast24h: number
}

export interface MigrationPair {
  id: string
  source: ExternalSystemKey
  target: ExternalSystemKey
  objectTypes: string[]
  status: 'active' | 'draft' | 'disabled'
  updatedAt: string
  successCount30d: number
  errorCount30d: number
}

export interface Escalation {
  id: string
  authorId: string
  type: 'cross_scope_action' | 'temporary_permission' | 'license_increase' | 'other'
  description: string
  objectRef?: string
  urgency: 'low' | 'medium' | 'high'
  status: 'new' | 'in_review' | 'approved' | 'rejected'
  createdAt: string
  resolvedAt?: string
  resolverId?: string
  rejectionReason?: string
}

// ----------------------------------------------------------------------------
// Дашборд
// ----------------------------------------------------------------------------

export interface DashboardSummary {
  actionRequired: DashboardActionItem[]
  myStatus: {
    inProgress: number
    completed7d: number
    overdue: number
  }
  recentMigrations?: MigrationPackage[]
  systemHealth?: {
    integrations: { key: ExternalSystemKey; status: 'online' | 'offline'; name: string }[]
    queue: { total: number; success: number; inProgress: number; error: number }
    backgroundJobs: { active: number; failed: number }
  }
  platformStats?: {
    usersTotal: number
    orgUnitsTotal: number
    templatesTotal: number
    release: string
    releaseDate: string
  }
  securityStats?: {
    eventsLast24h: number
    anomalies: number
  }
}

export interface DashboardActionItem {
  id: string
  kind: 'task' | 'migration_error' | 'access_request' | 'blocked_user' | 'password_expiring' | 'integration_down' | 'security_anomaly' | 'escalation'
  title: string
  subtitle: string
  link: string
  severity: 'info' | 'warning' | 'critical'
  createdAt: string
}
