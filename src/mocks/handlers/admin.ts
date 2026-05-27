import { http, HttpResponse, delay } from 'msw'
import usersFull from '../fixtures/users-full.json'
import orgstructure from '../fixtures/orgstructure.json'
import roles from '../fixtures/roles.json'
import operations from '../fixtures/operations.json'
import templates from '../fixtures/approval-templates.json'
import type { OrgUnit, Operation, Role, User } from '@/shared/types'

let usersData = usersFull as User[]
let orgData = orgstructure as OrgUnit[]
let rolesData = roles as Role[]
const operationsData = operations as Operation[]

export const adminHandlers = [
  // Users
  http.get('/api/users', async ({ request }) => {
    await delay(220)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const status = url.searchParams.get('status')
    const orgUnitId = url.searchParams.get('orgUnitId')
    let data = [...usersData]
    if (search) {
      data = data.filter((u) =>
        [u.fullName, u.email].some((v) => v.toLowerCase().includes(search)),
      )
    }
    if (status) data = data.filter((u) => u.status === status)
    if (orgUnitId) data = data.filter((u) => u.orgUnitId === orgUnitId)
    return HttpResponse.json(data)
  }),

  http.post('/api/users', async ({ request }) => {
    await delay(280)
    const body = (await request.json()) as Partial<User> & { fullName: string; email: string; orgUnitId: string }
    if (usersData.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
      return HttpResponse.json(
        { code: 'EMAIL_TAKEN', message: 'Email уже зарегистрирован' },
        { status: 400 },
      )
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      orgUnitId: body.orgUnitId,
      roles: body.roles ?? ['operator'],
      status: 'active',
      passwordExpiresAt: '2026-08-25T00:00:00Z',
    }
    usersData = [newUser, ...usersData]
    return HttpResponse.json(newUser, { status: 201 })
  }),

  http.patch('/api/users/:id', async ({ params, request }) => {
    await delay(220)
    const body = (await request.json()) as Partial<User>
    const id = params.id as string
    let updated: User | null = null
    usersData = usersData.map((u) => {
      if (u.id === id) {
        updated = { ...u, ...body }
        return updated
      }
      return u
    })
    if (!updated) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  http.post('/api/users/bulk-action', async ({ request }) => {
    await delay(380)
    const body = (await request.json()) as {
      ids: string[]
      action: 'block' | 'unblock' | 'archive'
    }
    const targetStatus: User['status'] =
      body.action === 'block' ? 'blocked' : body.action === 'unblock' ? 'active' : 'archived'
    usersData = usersData.map((u) =>
      body.ids.includes(u.id) ? { ...u, status: targetStatus } : u,
    )
    return HttpResponse.json({ updated: body.ids.length, status: targetStatus })
  }),

  // OrgStructure
  http.get('/api/orgstructure', async () => {
    await delay(180)
    return HttpResponse.json(orgData)
  }),

  http.post('/api/orgstructure', async ({ request }) => {
    await delay(220)
    const body = (await request.json()) as { name: string; parentId: string | null; description?: string }
    const newOu: OrgUnit = {
      id: `ou-${Date.now()}`,
      name: body.name,
      parentId: body.parentId,
      description: body.description,
    }
    orgData = [...orgData, newOu]
    return HttpResponse.json(newOu, { status: 201 })
  }),

  http.delete('/api/orgstructure/:id', async ({ params }) => {
    await delay(180)
    const id = params.id as string
    const hasChildren = orgData.some((o) => o.parentId === id)
    const hasUsers = usersData.some((u) => u.orgUnitId === id)
    if (hasChildren || hasUsers) {
      return HttpResponse.json(
        { code: 'NOT_EMPTY', message: `Невозможно удалить: ${hasUsers ? 'есть пользователи' : 'есть дочерние подразделения'}` },
        { status: 409 },
      )
    }
    orgData = orgData.filter((o) => o.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // Roles
  http.get('/api/roles', async () => {
    await delay(180)
    return HttpResponse.json(rolesData)
  }),

  http.get('/api/roles/:id', async ({ params }) => {
    await delay(150)
    const r = rolesData.find((x) => x.id === params.id)
    if (!r) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    return HttpResponse.json(r)
  }),

  http.patch('/api/roles/:id', async ({ params, request }) => {
    await delay(200)
    const body = (await request.json()) as Partial<Role>
    const id = params.id as string
    let updated: Role | null = null
    rolesData = rolesData.map((r) => {
      if (r.id === id) {
        updated = { ...r, ...body }
        return updated
      }
      return r
    })
    if (!updated) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  http.post('/api/roles', async ({ request }) => {
    await delay(260)
    const body = (await request.json()) as Omit<Role, 'id'>
    if (rolesData.some((r) => r.name.toLowerCase() === body.name.toLowerCase())) {
      return HttpResponse.json(
        { code: 'NAME_TAKEN', message: 'Роль с таким названием уже существует' },
        { status: 400 },
      )
    }
    const id = `role-${body.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    const newRole: Role = { ...body, id, system: false }
    rolesData = [newRole, ...rolesData]
    return HttpResponse.json(newRole, { status: 201 })
  }),

  http.delete('/api/roles/:id', async ({ params }) => {
    await delay(200)
    const id = params.id as string
    const role = rolesData.find((r) => r.id === id)
    if (!role) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    if (role.system) {
      return HttpResponse.json(
        { code: 'SYSTEM_ROLE', message: 'Системную роль нельзя удалить' },
        { status: 403 },
      )
    }
    rolesData = rolesData.filter((r) => r.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // Operations log
  http.get('/api/operations', async ({ request }) => {
    await delay(280)
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const type = url.searchParams.get('type')
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    let data = [...operationsData].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    if (userId) data = data.filter((o) => o.userId === userId)
    if (type) data = data.filter((o) => o.type === type)
    if (search) {
      data = data.filter((o) =>
        [o.description, o.entityLabel].some((v) => v.toLowerCase().includes(search)),
      )
    }
    return HttpResponse.json(data)
  }),

  // Templates list (for admin)
  http.get('/api/admin/approval-templates', async () => {
    await delay(180)
    return HttpResponse.json(templates)
  }),
]
