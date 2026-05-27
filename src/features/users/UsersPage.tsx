import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Lock, UserCog, Mail, Unlock, X } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton } from '@/shared/ui/empty-state'
import { Select } from '@/shared/ui/select'
import { Modal } from '@/shared/ui/modal'
import { FormField, TextInput } from '@/shared/ui/form-field'
import { apiFetch } from '@/shared/api/client'
import { formatDate } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { OrgUnit, Role, User } from '@/shared/types'

const STATUS_OPTIONS: { value: '' | 'active' | 'blocked'; label: string }[] = [
  { value: '', label: 'Все статусы' },
  { value: 'active', label: 'Активные' },
  { value: 'blocked', label: 'Заблокированные' },
]

const QK_USERS = ['users'] as const

interface UserFormValues {
  fullName: string
  email: string
  phone: string
  orgUnitId: string
  roles: string[]
}

const EMPTY_FORM: UserFormValues = {
  fullName: '',
  email: '',
  phone: '',
  orgUnitId: '',
  roles: ['operator'],
}

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | 'active' | 'blocked'>('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<User | null>(null)
  const [creating, setCreating] = useState(false)

  const { data: users = [], isLoading } = useQuery({
    queryKey: [...QK_USERS, { search, status }],
    queryFn: () =>
      apiFetch<User[]>('/users', { params: { search, status: status || undefined } }),
  })
  const { data: orgUnits = [] } = useQuery({
    queryKey: ['orgstructure'],
    queryFn: () => apiFetch<OrgUnit[]>('/orgstructure'),
  })

  const orgMap = useMemo(
    () => Object.fromEntries(orgUnits.map((o) => [o.id, o.name])),
    [orgUnits],
  )

  const allSelected = users.length > 0 && users.every((u) => selected.has(u.id))
  const someSelected = selected.size > 0

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(users.map((u) => u.id)))
  }
  const clearSelection = () => setSelected(new Set())

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Администрирование' },
          { label: 'Пользователи' },
        ]}
        title="Пользователи"
        subtitle="Управление учётными записями в рамках вашего scope"
        actions={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
            Добавить пользователя
          </Button>
        }
      />

      {someSelected && (
        <BulkActionBar
          count={selected.size}
          ids={Array.from(selected)}
          onClear={clearSelection}
        />
      )}

      <Panel bodyClassName="p-0">
        <div className="flex flex-col md:flex-row gap-3 p-5 pb-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по ФИО или email…"
              className="w-full h-10 pl-9 pr-3 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
            />
          </div>
          <div className="md:w-44">
            <Select
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
              ariaLabel="Статус пользователя"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 pb-5 space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-sm text-text-muted py-8 text-center px-5 pb-5">
            Пользователей по фильтру не найдено.
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-border-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-subtle text-text-muted text-[11px] uppercase tracking-wider">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Выбрать всех"
                      className="accent-accent"
                    />
                  </th>
                  <th className="px-3 py-3 text-left font-medium">ФИО</th>
                  <th className="px-3 py-3 text-left font-medium hidden md:table-cell">Email</th>
                  <th className="px-3 py-3 text-left font-medium hidden lg:table-cell">Подразделение</th>
                  <th className="px-3 py-3 text-left font-medium">Роли</th>
                  <th className="px-3 py-3 text-left font-medium">Статус</th>
                  <th className="px-3 py-3 text-left font-medium hidden lg:table-cell tabular-nums">Пароль до</th>
                  <th className="px-5 py-3 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelected = selected.has(u.id)
                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        'border-t border-border-subtle transition-colors',
                        isSelected ? 'bg-accent-subtle/40' : 'hover:bg-bg-subtle',
                      )}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(u.id)}
                          aria-label={`Выбрать ${u.fullName}`}
                          className="accent-accent"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setEditing(u)}
                          className="font-medium text-text-primary hover:text-accent text-left"
                        >
                          {u.fullName}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-text-muted hidden md:table-cell">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={12} className="opacity-60" />
                          {u.email}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-text-secondary hidden lg:table-cell">
                        {orgMap[u.orgUnitId] ?? '—'}
                      </td>
                      <td className="px-3 py-3 text-text-secondary text-xs">{u.roles.join(', ')}</td>
                      <td className="px-3 py-3">
                        {u.status === 'active' ? (
                          <Chip variant="success">Активен</Chip>
                        ) : u.status === 'blocked' ? (
                          <Chip variant="error" icon={<Lock size={12} />}>
                            Заблокирован
                          </Chip>
                        ) : (
                          <Chip variant="neutral">Архив</Chip>
                        )}
                      </td>
                      <td className="px-3 py-3 text-text-muted hidden lg:table-cell tabular-nums">
                        {formatDate(u.passwordExpiresAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setEditing(u)}
                          className="text-text-muted hover:text-text-primary p-1.5 rounded-md hover:bg-bg-hover"
                          aria-label="Редактировать"
                        >
                          <UserCog size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {creating && (
        <UserFormModal
          mode="create"
          orgUnits={orgUnits}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <UserFormModal
          mode="edit"
          user={editing}
          orgUnits={orgUnits}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Bulk action bar
// ----------------------------------------------------------------------------

function BulkActionBar({
  count,
  ids,
  onClear,
}: {
  count: number
  ids: string[]
  onClear: () => void
}) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: (action: 'block' | 'unblock' | 'archive') =>
      apiFetch<{ updated: number }>('/users/bulk-action', {
        method: 'POST',
        body: { ids, action },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_USERS })
      onClear()
    },
  })

  return (
    <div className="flex items-center gap-3 mb-3 p-3 rounded-md bg-accent-subtle border border-accent-border">
      <span className="text-sm font-medium text-accent-text">Выбрано: {count}</span>
      <div className="flex-1" />
      <Button
        variant="secondary"
        size="sm"
        icon={<Lock size={14} />}
        onClick={() => mutation.mutate('block')}
        disabled={mutation.isPending}
      >
        Заблокировать
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<Unlock size={14} />}
        onClick={() => mutation.mutate('unblock')}
        disabled={mutation.isPending}
      >
        Разблокировать
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={<X size={14} />}
        onClick={onClear}
        aria-label="Снять выделение"
      />
    </div>
  )
}

// ----------------------------------------------------------------------------
// User form modal (create + edit)
// ----------------------------------------------------------------------------

interface UserFormModalProps {
  mode: 'create' | 'edit'
  user?: User
  orgUnits: OrgUnit[]
  onClose: () => void
}

function UserFormModal({ mode, user, orgUnits, onClose }: UserFormModalProps) {
  const qc = useQueryClient()
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiFetch<Role[]>('/roles'),
  })

  const [values, setValues] = useState<UserFormValues>(() =>
    user
      ? {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone ?? '',
          orgUnitId: user.orgUnitId,
          roles: user.roles,
        }
      : { ...EMPTY_FORM, orgUnitId: orgUnits[0]?.id ?? '' },
  )
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({})

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<User>('/users', {
        method: 'POST',
        body: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone || undefined,
          orgUnitId: values.orgUnitId,
          roles: values.roles,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_USERS })
      onClose()
    },
    onError: (err: Error) => {
      if (err.message.includes('Email')) setErrors({ email: err.message })
    },
  })

  const patchMutation = useMutation({
    mutationFn: (patch: Partial<User>) =>
      apiFetch<User>(`/users/${user!.id}`, { method: 'PATCH', body: patch }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_USERS })
    },
  })

  const validate = (): boolean => {
    const next: Partial<Record<keyof UserFormValues, string>> = {}
    if (values.fullName.trim().length < 5) next.fullName = 'Минимум 5 символов'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Некорректный email'
    if (!values.orgUnitId) next.orgUnitId = 'Выберите подразделение'
    if (values.roles.length === 0) next.roles = 'Выберите хотя бы одну роль'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (mode === 'create') {
      createMutation.mutate()
    } else {
      patchMutation.mutate(
        {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          orgUnitId: values.orgUnitId,
          roles: values.roles as User['roles'],
        },
        { onSuccess: () => onClose() },
      )
    }
  }

  const toggleBlock = () => {
    if (!user) return
    patchMutation.mutate({ status: user.status === 'blocked' ? 'active' : 'blocked' })
  }

  const orgOptions = orgUnits.map((o) => ({ value: o.id, label: o.name }))

  return (
    <Modal
      open
      onClose={onClose}
      title={mode === 'create' ? 'Добавить пользователя' : `Редактирование: ${user?.fullName}`}
      description={mode === 'edit' ? user?.email : 'Заполните данные нового сотрудника'}
      size="lg"
      footer={
        <>
          {mode === 'edit' && user && (
            <>
              <Button
                variant={user.status === 'blocked' ? 'secondary' : 'danger'}
                size="sm"
                icon={user.status === 'blocked' ? <Unlock size={14} /> : <Lock size={14} />}
                onClick={toggleBlock}
                disabled={patchMutation.isPending}
              >
                {user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
              </Button>
              <div className="flex-1" />
            </>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={createMutation.isPending || patchMutation.isPending}
          >
            {mode === 'create'
              ? createMutation.isPending
                ? 'Создание…'
                : 'Создать'
              : patchMutation.isPending
                ? 'Сохранение…'
                : 'Сохранить'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="ФИО" required error={errors.fullName}>
            <TextInput
              value={values.fullName}
              onChange={(e) => setValues({ ...values, fullName: e.target.value })}
              placeholder="Иванов Иван Иванович"
              error={Boolean(errors.fullName)}
            />
          </FormField>
          <FormField label="Email (логин)" required error={errors.email}>
            <TextInput
              type="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              placeholder="user@soid.demo"
              error={Boolean(errors.email)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Телефон">
            <TextInput
              value={values.phone}
              onChange={(e) => setValues({ ...values, phone: e.target.value })}
              placeholder="+7 (495) 000-00-00"
            />
          </FormField>
          <FormField label="Подразделение" required error={errors.orgUnitId}>
            <Select
              value={values.orgUnitId}
              onChange={(v) => setValues({ ...values, orgUnitId: v })}
              options={orgOptions}
              ariaLabel="Подразделение"
            />
          </FormField>
        </div>

        <FormField
          label="Роли"
          required
          error={errors.roles}
          hint="Выберите одну или несколько ролей. Итоговые права — объединение."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {roles.map((r) => {
              const roleKey = r.id.replace(/^role-/, '')
              const checked = values.roles.includes(roleKey)
              return (
                <label
                  key={r.id}
                  className={cn(
                    'flex items-start gap-2.5 p-3 rounded-md border cursor-pointer transition-colors',
                    checked
                      ? 'bg-accent-subtle border-accent-border'
                      : 'bg-bg-subtle border-border-default hover:bg-bg-hover',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setValues({
                        ...values,
                        roles: checked
                          ? values.roles.filter((id) => id !== roleKey)
                          : [...values.roles, roleKey],
                      })
                    }
                    className="accent-accent mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary">{r.name}</div>
                    {r.description && (
                      <div className="text-xs text-text-muted mt-0.5">{r.description}</div>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        </FormField>

        {mode === 'create' && (
          <div className="rounded-md bg-info-bg text-info-text text-xs p-3">
            После создания на email будет отправлена одноразовая ссылка для установки пароля
            (срок действия 24 часа). Пароль в UI администратору не показывается.
          </div>
        )}
      </form>
    </Modal>
  )
}
