import { http, HttpResponse, delay } from 'msw'
import notifications from '../fixtures/notifications.json'
import type { Notification } from '@/shared/types'

let data = [...(notifications as Notification[])]

export const notificationsHandlers = [
  http.get('/api/notifications', async () => {
    await delay(180)
    return HttpResponse.json(data)
  }),

  http.post('/api/notifications/:id/read', async ({ params }) => {
    await delay(80)
    const id = params.id as string
    data = data.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/notifications/read-all', async () => {
    await delay(150)
    const now = new Date().toISOString()
    data = data.map((n) => ({ ...n, readAt: n.readAt ?? now }))
    return new HttpResponse(null, { status: 204 })
  }),
]
