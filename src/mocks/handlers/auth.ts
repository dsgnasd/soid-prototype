import { http, HttpResponse, delay } from 'msw'
import users from '../fixtures/users.json'
import type { User } from '@/shared/types'

const usersData = users as User[]

interface LoginRequest {
  email: string
  password?: string
}

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as LoginRequest
    const user = usersData.find((u) => u.email.toLowerCase() === body.email.toLowerCase())
    if (!user) {
      return HttpResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'Неверный логин или пароль' },
        { status: 401 },
      )
    }
    if (user.status === 'blocked') {
      return HttpResponse.json(
        { code: 'ACCOUNT_BLOCKED', message: 'Учётная запись заблокирована — обратитесь к администратору' },
        { status: 403 },
      )
    }
    return HttpResponse.json({ user, token: `mock-token-${user.id}` })
  }),

  http.get('/api/auth/me', async ({ request }) => {
    await delay(150)
    const auth = request.headers.get('Authorization') ?? ''
    const match = auth.match(/^Bearer mock-token-(.+)$/)
    if (!match) {
      return HttpResponse.json(
        { code: 'UNAUTHORIZED', message: 'Сессия истекла' },
        { status: 401 },
      )
    }
    const user = usersData.find((u) => u.id === match[1])
    if (!user) {
      return HttpResponse.json(
        { code: 'UNAUTHORIZED', message: 'Пользователь не найден' },
        { status: 401 },
      )
    }
    return HttpResponse.json({ user })
  }),

  http.post('/api/auth/logout', async () => {
    await delay(100)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/auth/forgot-password', async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as { email: string }
    // В MVP всегда отвечаем успехом — не выдаём, существует ли email (security best practice)
    return HttpResponse.json({ email: body.email, sent: true })
  }),
]
