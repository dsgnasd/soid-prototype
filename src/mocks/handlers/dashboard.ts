import { http, HttpResponse, delay } from 'msw'
import migrations from '../fixtures/migrations.json'
import integrations from '../fixtures/integrations.json'
import type { DashboardSummary, MigrationPackage, RoleId } from '@/shared/types'

const migrationsData = migrations as MigrationPackage[]

function operatorSummary(): DashboardSummary {
  return {
    actionRequired: [
      {
        id: 'a1',
        kind: 'task',
        title: 'Согласовать ТТ-1024 «Согласование втулки V01»',
        subtitle: 'Срок истёк вчера · этап 2 «Технолог» · от Петрова П.П.',
        link: '/tasks/t-1024',
        severity: 'critical',
        createdAt: '2026-05-25T08:15:00Z',
      },
      {
        id: 'a2',
        kind: 'task',
        title: 'Согласовать ТТ-1031 «Согласование чертежа корпуса»',
        subtitle: 'До 28.05 · этап 1 «Конструктор» · от Сидорова С.С.',
        link: '/tasks/t-1031',
        severity: 'warning',
        createdAt: '2026-05-25T07:42:00Z',
      },
      {
        id: 'a3',
        kind: 'migration_error',
        title: 'Миграция IPS→TC #4521 — ошибка',
        subtitle: '12 объектов из 47 не перенесены',
        link: '/migration/status/m-4521',
        severity: 'critical',
        createdAt: '2026-05-24T19:10:00Z',
      },
    ],
    myStatus: { inProgress: 5, completed7d: 12, overdue: 1 },
    recentMigrations: migrationsData.slice(0, 4),
  }
}

function adminSummary(): DashboardSummary {
  return {
    actionRequired: [
      {
        id: 'a1',
        kind: 'access_request',
        title: 'Заявка от Иванова И.И. — роль «Менеджер»',
        subtitle: 'Подана 20 минут назад',
        link: '/admin/escalations',
        severity: 'warning',
        createdAt: '2026-05-25T09:55:00Z',
      },
      {
        id: 'a2',
        kind: 'blocked_user',
        title: 'Сидоров С.С. заблокирован',
        subtitle: 'Превышено число попыток входа',
        link: '/admin/users/u-sidorov',
        severity: 'warning',
        createdAt: '2026-05-25T08:30:00Z',
      },
      {
        id: 'a3',
        kind: 'password_expiring',
        title: '3 пароля истекают на следующей неделе',
        subtitle: 'Иванов И.И., Кузнецов А.А., Соколова М.С.',
        link: '/admin/users?passwordExpiresIn=7d',
        severity: 'info',
        createdAt: '2026-05-25T07:00:00Z',
      },
    ],
    myStatus: { inProgress: 23, completed7d: 41, overdue: 3 },
    platformStats: {
      usersTotal: 47,
      orgUnitsTotal: 8,
      templatesTotal: 5,
      release: 'v1.0.42',
      releaseDate: '2026-05-24',
    },
  }
}

function superadminSummary(): DashboardSummary {
  return {
    actionRequired: [
      {
        id: 'a1',
        kind: 'integration_down',
        title: 'Teamcenter недоступен',
        subtitle: 'С 09:42 — 47 миграций ждут',
        link: '/platform/integrations/int-tc',
        severity: 'critical',
        createdAt: '2026-05-25T09:43:00Z',
      },
      {
        id: 'a2',
        kind: 'security_anomaly',
        title: 'Подозрительная активность',
        subtitle: '28 неудачных входов за 1 час',
        link: '/operations?anomaly=failed_login',
        severity: 'warning',
        createdAt: '2026-05-25T10:12:00Z',
      },
      {
        id: 'a3',
        kind: 'escalation',
        title: 'Заявка от Петрова П.П.',
        subtitle: 'Расширение прав для Сидорова С.С.',
        link: '/admin/escalations',
        severity: 'info',
        createdAt: '2026-05-25T07:00:00Z',
      },
    ],
    myStatus: { inProgress: 0, completed7d: 0, overdue: 0 },
    systemHealth: {
      integrations: integrations.map((i) => ({
        key: i.key as 'ips' | 'teamcenter' | '1c',
        status: i.status as 'online' | 'offline',
        name: i.name,
      })),
      queue: { total: 12, success: 10, inProgress: 1, error: 1 },
      backgroundJobs: { active: 3, failed: 0 },
    },
    platformStats: {
      usersTotal: 312,
      orgUnitsTotal: 24,
      templatesTotal: 18,
      release: 'v1.0.42',
      releaseDate: '2026-05-24',
    },
    securityStats: {
      eventsLast24h: 1248,
      anomalies: 1,
    },
  }
}

export const dashboardHandlers = [
  http.get('/api/dashboard', async ({ request }) => {
    await delay(220)
    const url = new URL(request.url)
    const role = (url.searchParams.get('role') ?? 'operator') as RoleId
    if (role === 'admin') return HttpResponse.json(adminSummary())
    if (role === 'superadmin') return HttpResponse.json(superadminSummary())
    return HttpResponse.json(operatorSummary())
  }),
]
