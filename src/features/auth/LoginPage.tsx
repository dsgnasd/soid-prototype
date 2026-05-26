import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { apiFetch, ApiError } from '@/shared/api/client'
import { useAuth } from '@/shared/hooks/useAuth'
import { routes } from '@/shared/config/routes'
import type { User } from '@/shared/types'

interface LoginResponse {
  user: User
  token: string
}

const SHORTCUTS = [
  { email: 'operator@soid.demo', label: 'Войти как Оператор', hint: 'Иванов И.И.' },
  { email: 'admin@soid.demo', label: 'Войти как Администратор', hint: 'Петров П.П., scope: Отдел внедрения' },
  { email: 'superadmin@soid.demo', label: 'Войти как Суперадминистратор', hint: 'Кузнецова О.А., без scope' },
]

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (creds: { email: string; password?: string }) =>
      apiFetch<LoginResponse>('/auth/login', { method: 'POST', body: creds }),
    onSuccess: (data) => {
      setUser(data.user)
      navigate(routes.dashboard, { replace: true })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  const handleShortcut = (shortcutEmail: string) => {
    loginMutation.mutate({ email: shortcutEmail })
  }

  const errorMessage =
    loginMutation.error instanceof ApiError ? loginMutation.error.message : null

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-text-primary mb-1">Вход в систему</h1>
      <p className="text-sm text-text-muted mb-6">Введите свои логин и пароль</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
            Email <span className="text-error">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-4 rounded-md border border-border-default bg-bg-subtle text-text-primary placeholder-text-muted focus:bg-bg-surface focus:border-accent transition-colors"
            placeholder="user@soid.demo"
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
              Пароль <span className="text-error">*</span>
            </label>
            <Link to={routes.forgotPassword} className="text-xs text-accent hover:underline">
              Забыли пароль?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 rounded-md border border-border-default bg-bg-subtle text-text-primary placeholder-text-muted focus:bg-bg-surface focus:border-accent transition-colors"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {errorMessage && (
          <div className="text-sm text-error-text bg-error-bg rounded-md px-3 py-2 border border-error/20">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending || !email}
          className="w-full h-11 rounded-md bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:bg-bg-disabled disabled:text-text-disabled disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? 'Вход…' : 'Войти'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-text-muted">
        <div className="flex-1 h-px bg-border-subtle" />
        <span>Демо-доступ</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      <div className="space-y-2">
        {SHORTCUTS.map((s) => (
          <button
            key={s.email}
            type="button"
            onClick={() => handleShortcut(s.email)}
            disabled={loginMutation.isPending}
            className="w-full text-left px-4 py-2.5 rounded-md border border-border-default bg-bg-surface hover:bg-bg-hover hover:border-border-strong transition-colors disabled:opacity-50"
          >
            <div className="text-sm font-medium text-text-primary">{s.label}</div>
            <div className="text-xs text-text-muted mt-0.5">{s.hint}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
