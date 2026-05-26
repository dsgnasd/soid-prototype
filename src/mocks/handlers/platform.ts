import { http, HttpResponse, delay } from 'msw'
import integrations from '../fixtures/integrations.json'
import migrationConfig from '../fixtures/migration-config.json'
import escalations from '../fixtures/escalations.json'
import type { Escalation, Integration, MigrationPair } from '@/shared/types'

let integrationsData = integrations as Integration[]
const migrationConfigData = migrationConfig as MigrationPair[]
let escalationsData = escalations as Escalation[]

export const platformHandlers = [
  http.get('/api/integrations', async () => {
    await delay(200)
    return HttpResponse.json(integrationsData)
  }),

  http.get('/api/integrations/:id', async ({ params }) => {
    await delay(150)
    const i = integrationsData.find((x) => x.id === params.id)
    if (!i) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    return HttpResponse.json(i)
  }),

  http.post('/api/integrations/:id/test', async ({ params }) => {
    await delay(600)
    const i = integrationsData.find((x) => x.id === params.id)
    if (!i) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    if (i.status === 'offline') {
      return HttpResponse.json(
        { ok: false, code: 'CONNECTION_TIMEOUT', message: 'Подключение не установлено за 30 с' },
        { status: 503 },
      )
    }
    return HttpResponse.json({ ok: true, responseTimeMs: i.responseTimeMs, version: '14.2' })
  }),

  http.patch('/api/integrations/:id', async ({ params, request }) => {
    await delay(180)
    const body = (await request.json()) as Partial<Integration>
    const id = params.id as string
    let updated: Integration | null = null
    integrationsData = integrationsData.map((i) => {
      if (i.id === id) {
        updated = { ...i, ...body }
        return updated
      }
      return i
    })
    if (!updated) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  http.get('/api/migration-config', async () => {
    await delay(180)
    return HttpResponse.json(migrationConfigData)
  }),

  http.get('/api/platform/health', async () => {
    await delay(200)
    // 24 точки — почасовые показатели за последние сутки
    const now = new Date()
    const series = Array.from({ length: 24 }, (_, i) => {
      const t = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
      return {
        time: `${t.getHours().toString().padStart(2, '0')}:00`,
        success: Math.floor(Math.random() * 30) + 40,
        errors: Math.floor(Math.random() * 8),
      }
    })
    return HttpResponse.json({
      integrations: integrationsData.map((i) => ({
        key: i.key,
        name: i.name,
        status: i.status,
        responseTimeMs: i.responseTimeMs,
        errorsLast24h: i.errorsLast24h,
      })),
      timeSeries: series,
      queue: { total: 12, success: 10, inProgress: 1, error: 1 },
      backgroundJobs: { active: 3, failed: 0 },
    })
  }),

  http.get('/api/escalations', async () => {
    await delay(220)
    return HttpResponse.json(escalationsData)
  }),

  http.post('/api/escalations/:id/resolve', async ({ params, request }) => {
    await delay(240)
    const body = (await request.json()) as { decision: 'approve' | 'reject'; reason?: string }
    if (body.decision === 'reject' && (!body.reason || body.reason.length < 20)) {
      return HttpResponse.json(
        { code: 'REASON_REQUIRED', message: 'Причина отклонения обязательна (минимум 20 символов)' },
        { status: 400 },
      )
    }
    const id = params.id as string
    escalationsData = escalationsData.map((e) =>
      e.id === id
        ? {
            ...e,
            status: body.decision === 'approve' ? 'approved' : 'rejected',
            resolvedAt: new Date().toISOString(),
            resolverId: 'u-superadmin',
            rejectionReason: body.decision === 'reject' ? body.reason : undefined,
          }
        : e,
    )
    return HttpResponse.json(escalationsData.find((e) => e.id === id))
  }),
]
