import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ChevronDown, LogOut, KeyRound, UserCircle2, RefreshCw, Info } from 'lucide-react'
import { useAuth, useCurrentRole, useCurrentUser } from '@/shared/hooks/useAuth'
import { apiFetch } from '@/shared/api/client'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { FormField, TextInput } from '@/shared/ui/form-field'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { User } from '@/shared/types'

const ROLE_LABELS = {
  superadmin: 'Суперадминистратор',
  admin: 'Администратор',
  operator: 'Оператор',
} as const

const SHORTCUTS = [
  { email: 'operator@soid.demo', label: 'Войти как Оператор' },
  { email: 'admin@soid.demo', label: 'Войти как Администратор' },
  { email: 'superadmin@soid.demo', label: 'Войти как Суперадминистратор' },
]

export function ProfileMenu() {
  const user = useCurrentUser()
  const role = useCurrentRole()
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSwitchModal, setShowSwitchModal] = useState(false)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!user) return null

  const initials = user.fullName
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')

  const handleLogout = () => {
    setUser(null)
    navigate(routes.login)
  }

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            'flex items-center gap-3 h-11 px-2 pr-3 rounded-md transition-colors',
            open ? 'bg-bg-hover' : 'hover:bg-bg-hover',
          )}
        >
          <div className="w-8 h-8 rounded-sm bg-accent text-white grid place-items-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className="hidden md:block leading-tight text-left">
            <div className="text-sm font-medium text-text-primary">{user.fullName}</div>
            <div className="text-[11px] text-text-muted">{ROLE_LABELS[role]}</div>
          </div>
          <ChevronDown size={14} className="text-text-muted hidden md:block" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute top-full right-0 mt-2 w-[320px] bg-bg-surface border border-border-default rounded-xl shadow-lg z-[60] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-accent text-white grid place-items-center text-sm font-semibold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-text-primary truncate">{user.fullName}</div>
                  <div className="text-xs text-text-muted truncate">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-text-muted">Роль</div>
                  <div className="text-text-secondary font-medium mt-0.5">
                    {ROLE_LABELS[role]}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted">Подразделение</div>
                  <div className="text-text-secondary font-medium mt-0.5 truncate">
                    {user.orgUnitId.replace(/^ou-/, '').toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <ul className="py-1">
              <MenuItem
                icon={<UserCircle2 size={16} />}
                label="Настройки профиля"
                onClick={() => {
                  setOpen(false)
                  // Заглушка для будущей страницы /profile
                }}
                disabled
                hint="Скоро"
              />
              <MenuItem
                icon={<KeyRound size={16} />}
                label="Сменить пароль"
                onClick={() => {
                  setOpen(false)
                  setShowPasswordModal(true)
                }}
              />
              <MenuItem
                icon={<RefreshCw size={16} />}
                label="Сменить роль (демо)"
                onClick={() => {
                  setOpen(false)
                  setShowSwitchModal(true)
                }}
              />
              <MenuItem
                icon={<Info size={16} />}
                label="О программе"
                onClick={() => {
                  setOpen(false)
                  navigate(routes.about)
                }}
              />
            </ul>

            <div className="border-t border-border-subtle py-1">
              <MenuItem
                icon={<LogOut size={16} />}
                label="Выйти"
                onClick={handleLogout}
                destructive
              />
            </div>
          </div>
        )}
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {showSwitchModal && <SwitchRoleModal onClose={() => setShowSwitchModal(false)} />}
    </>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
  destructive,
  disabled,
  hint,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
  hint?: string
}) {
  return (
    <li>
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
          disabled
            ? 'text-text-disabled cursor-not-allowed'
            : destructive
              ? 'text-error-text hover:bg-error-bg'
              : 'text-text-primary hover:bg-bg-hover',
        )}
      >
        <span className={cn('shrink-0', !destructive && !disabled && 'text-text-muted')}>
          {icon}
        </span>
        <span className="flex-1">{label}</span>
        {hint && <span className="text-[10px] text-text-muted">{hint}</span>}
      </button>
    </li>
  )
}

// ----------------------------------------------------------------------------
// Change password modal (simulation)
// ----------------------------------------------------------------------------

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!current || !next || !confirm) {
      setError('Заполните все поля')
      return
    }
    if (next.length < 10) {
      setError('Минимум 10 символов в новом пароле')
      return
    }
    if (next !== confirm) {
      setError('Пароли не совпадают')
      return
    }
    setError(null)
    setDone(true)
    setTimeout(onClose, 1500)
  }

  if (done) {
    return (
      <Modal open onClose={onClose} title="Пароль изменён" size="sm" hideClose>
        <div className="text-sm text-success-text bg-success-bg rounded-md p-4">
          ✓ Пароль успешно обновлён. Все другие сессии будут завершены.
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Сменить пароль"
      description="Новый пароль будет применён сразу. Все другие сессии завершатся."
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Сменить пароль
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-error-text bg-error-bg rounded-md p-3">{error}</div>
        )}
        <FormField label="Текущий пароль" required>
          <TextInput
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="••••••••"
            autoFocus
          />
        </FormField>
        <FormField
          label="Новый пароль"
          required
          hint="Минимум 10 символов, с буквами и цифрами"
        >
          <TextInput
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="••••••••••"
          />
        </FormField>
        <FormField label="Подтвердите новый пароль" required>
          <TextInput
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••••"
          />
        </FormField>
      </form>
    </Modal>
  )
}

// ----------------------------------------------------------------------------
// Switch role modal (demo only)
// ----------------------------------------------------------------------------

function SwitchRoleModal({ onClose }: { onClose: () => void }) {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const switchMutation = useMutation({
    mutationFn: (email: string) =>
      apiFetch<{ user: User }>('/auth/login', { method: 'POST', body: { email } }),
    onSuccess: (data) => {
      setUser(data.user)
      onClose()
      navigate(routes.dashboard)
    },
  })

  return (
    <Modal
      open
      onClose={onClose}
      title="Сменить роль (демо)"
      description="Только для прототипа на моках. В реальной системе одна учётная запись = одна роль."
      size="md"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Закрыть
        </Button>
      }
    >
      <ul className="space-y-2">
        {SHORTCUTS.map((s) => (
          <li key={s.email}>
            <button
              type="button"
              onClick={() => switchMutation.mutate(s.email)}
              disabled={switchMutation.isPending}
              className="w-full text-left p-3 rounded-md border border-border-default bg-bg-surface hover:bg-bg-hover hover:border-border-strong transition-colors disabled:opacity-50"
            >
              <div className="text-sm font-medium text-text-primary">{s.label}</div>
              <div className="text-xs text-text-muted mt-0.5">{s.email}</div>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
