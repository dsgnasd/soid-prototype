import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/client'
import { routes } from '@/shared/config/routes'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  const mutation = useMutation({
    mutationFn: (e: string) =>
      apiFetch<{ sent: boolean }>('/auth/forgot-password', { method: 'POST', body: { email: e } }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(email)
  }

  if (mutation.isSuccess) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary mb-2">
          Если такой email зарегистрирован
        </h1>
        <p className="text-sm text-text-muted mb-6">
          Мы отправили ссылку для сброса пароля. Она действительна 1 час.
        </p>
        <Link to={routes.login} className="inline-block text-accent text-sm hover:underline">
          ← Вернуться ко входу
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-text-primary mb-1">Восстановление пароля</h1>
      <p className="text-sm text-text-muted mb-6">Введите email учётной записи</p>

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
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || !email}
          className="w-full h-11 rounded-md bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:bg-bg-disabled disabled:text-text-disabled disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Отправка…' : 'Отправить ссылку'}
        </button>

        <Link to={routes.login} className="block text-center text-sm text-accent hover:underline">
          ← Вернуться ко входу
        </Link>
      </form>
    </div>
  )
}
