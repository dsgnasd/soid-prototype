import { http, HttpResponse, delay } from 'msw'
import migrations from '../fixtures/migrations.json'
import logs from '../fixtures/migration-logs.json'
import integrations from '../fixtures/integrations.json'
import type { ExternalSystemKey, MigrationLogEntry, MigrationPackage } from '@/shared/types'

let migrationsData = migrations as MigrationPackage[]
const logsData = logs as MigrationLogEntry[]

interface CreateMigrationRequest {
  source: ExternalSystemKey
  target: ExternalSystemKey
  designation?: string
  name?: string
}

export const migrationHandlers = [
  // Список систем (для wizard)
  http.get('/api/external-systems', async () => {
    await delay(120)
    return HttpResponse.json(integrations)
  }),

  // Список миграций с фильтрами
  http.get('/api/migrations', async ({ request }) => {
    await delay(280)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const source = url.searchParams.get('source')
    const target = url.searchParams.get('target')
    const userId = url.searchParams.get('userId')
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50')

    let filtered = [...migrationsData].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    if (status) filtered = filtered.filter((m) => m.status === status)
    if (source) filtered = filtered.filter((m) => m.source === source)
    if (target) filtered = filtered.filter((m) => m.target === target)
    if (userId) filtered = filtered.filter((m) => m.userId === userId)
    if (dateFrom) filtered = filtered.filter((m) => m.createdAt >= dateFrom)
    if (dateTo) filtered = filtered.filter((m) => m.createdAt <= `${dateTo}T23:59:59Z`)
    if (search) {
      filtered = filtered.filter((m) =>
        [m.designation, m.name, m.packageName].some((v) => v.toLowerCase().includes(search)),
      )
    }

    const total = filtered.length
    const items = filtered.slice((page - 1) * pageSize, page * pageSize)
    return HttpResponse.json({ items, total, page, pageSize })
  }),

  // Детали пакета
  http.get('/api/migrations/:id', async ({ params }) => {
    await delay(180)
    const id = params.id as string
    const m = migrationsData.find((x) => x.id === id)
    if (!m) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Пакет не найден' },
        { status: 404 },
      )
    }
    return HttpResponse.json(m)
  }),

  // Логи пакета (упрощённо: один и тот же лог для всех — для демо)
  http.get('/api/migrations/:id/logs', async () => {
    await delay(200)
    return HttpResponse.json(logsData)
  }),

  // Создание миграции
  http.post('/api/migrations', async ({ request }) => {
    await delay(350)
    const body = (await request.json()) as CreateMigrationRequest
    if (body.source === body.target) {
      return HttpResponse.json(
        { code: 'INVALID_PAIR', message: 'Исходная и целевая системы должны различаться' },
        { status: 400 },
      )
    }
    const id = `m-${Math.floor(Math.random() * 9000) + 1000}`
    const newPackage: MigrationPackage = {
      id,
      designation: body.designation ?? `ТТ-${Math.floor(Math.random() * 9000) + 1000}`,
      revision: '01',
      name: body.name ?? 'Новый пакет миграции',
      packageName: `${body.source.toUpperCase()}→${body.target.toUpperCase()} #${id.replace('m-', '')}`,
      source: body.source,
      target: body.target,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      userId: 'u-operator',
      totalObjects: 0,
      successCount: 0,
      errorCount: 0,
    }
    migrationsData = [newPackage, ...migrationsData]
    return HttpResponse.json(newPackage, { status: 201 })
  }),
]
