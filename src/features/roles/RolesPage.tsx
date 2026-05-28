import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Copy, Search, Shield, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton } from '@/shared/ui/empty-state'
import { Modal } from '@/shared/ui/modal'
import { FormField, TextInput } from '@/shared/ui/form-field'
import { apiFetch, ApiError } from '@/shared/api/client'
import { toast } from '@/shared/ui/toast'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { Permission, PermissionAction, Role, User } from '@/shared/types'

const MODULES: { id: string; label: string }[] = [
  { id: 'migration', label: 'Миграция' },
  { id: 'approvals', label: 'Согласование' },
  { id: 'orgstructure', label: 'Оргструктура' },
  { id: 'users', label: 'Пользователи' },
  { id: 'roles', label: 'Роли' },
  { id: 'templates', label: 'Шаблоны' },
  { id: 'operations', label: 'Журнал' },
  { id: 'platform', label: 'Платформа' },
]

const ACTIONS: { id: PermissionAction; label: string }[] = [
  { id: 'view', label: 'Просмотр' },
  { id: 'create', label: 'Создание' },
  { id: 'edit', label: 'Редактирование' },
  { id: 'delete', label: 'Удаление' },
]

const QK_ROLES = ['roles'] as const

type DialogState = null | { mode: 'create' } | { mode: 'duplicate'; base: Role } | { mode: 'edit'; role: Role } | { mode: 'delete'; role: Role }

export function RolesPage() {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: QK_ROLES,
    queryFn: () => apiFetch<Role[]>('/roles'),
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<DialogState>(null)

  const filteredRoles = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
  const selected = roles.find((r) => r.id === selectedId) ?? filteredRoles[0]

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Администрирование' },
          { label: 'Роли' },
        ]}
        title="Роли"
        subtitle="Шаблоны прав и разрешений в системе"
        actions={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setDialog({ mode: 'create' })}>
            Добавить роль
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <Panel bodyClassName="px-3 pb-3">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск роли…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
            />
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredRoles.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-md transition-colors',
                      selected?.id === r.id
                        ? 'bg-accent-subtle border border-accent-border'
                        : 'border border-transparent hover:bg-bg-hover',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-sm font-medium text-text-primary">{r.name}</span>
                      {r.system && (
                        <Chip variant="neutral" icon={<Shield size={10} />}>
                          сист.
                        </Chip>
                      )}
                    </div>
                    {r.description && (
                      <div className="text-xs text-text-muted line-clamp-2">{r.description}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {selected && (
          <Panel
            title={selected.name}
            action={
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Copy size={14} />}
                  onClick={() => setDialog({ mode: 'duplicate', base: selected })}
                >
                  Дублировать
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Pencil size={14} />}
                  onClick={() => setDialog({ mode: 'edit', role: selected })}
                  disabled={selected.system}
                  title={selected.system ? 'Системная роль — только просмотр' : 'Редактировать'}
                >
                  Редактировать
                </Button>
                {!selected.system && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 size={14} />}
                    onClick={() => setDialog({ mode: 'delete', role: selected })}
                  >
                    Удалить
                  </Button>
                )}
              </div>
            }
          >
            <p className="text-sm text-text-muted mb-4">{selected.description}</p>
            <PermissionMatrix
              permissions={selected.permissions}
              readonly
            />
          </Panel>
        )}
      </div>

      {dialog?.mode === 'create' && <RoleFormModal onClose={() => setDialog(null)} />}
      {dialog?.mode === 'duplicate' && (
        <RoleFormModal base={dialog.base} onClose={() => setDialog(null)} />
      )}
      {dialog?.mode === 'edit' && (
        <RoleFormModal role={dialog.role} onClose={() => setDialog(null)} />
      )}
      {dialog?.mode === 'delete' && (
        <DeleteRoleModal role={dialog.role} onClose={() => setDialog(null)} />
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Permission matrix (shared between create/edit/view)
// ----------------------------------------------------------------------------

interface PermissionMatrixProps {
  permissions: Permission[]
  readonly?: boolean
  onChange?: (perms: Permission[]) => void
}

function PermissionMatrix({ permissions, readonly, onChange }: PermissionMatrixProps) {
  const togglePermission = (moduleId: string, action: PermissionAction) => {
    if (!onChange) return
    const existing = permissions.find((p) => p.module === moduleId)
    if (!existing) {
      onChange([...permissions, { module: moduleId, actions: [action] }])
      return
    }
    const next = existing.actions.includes(action)
      ? existing.actions.filter((a) => a !== action)
      : [...existing.actions, action]
    onChange(
      permissions
        .map((p) => (p.module === moduleId ? { ...p, actions: next } : p))
        .filter((p) => p.actions.length > 0),
    )
  }

  const toggleModuleRow = (moduleId: string, enable: boolean) => {
    if (!onChange) return
    if (enable) {
      onChange([
        ...permissions.filter((p) => p.module !== moduleId),
        { module: moduleId, actions: ACTIONS.map((a) => a.id) },
      ])
    } else {
      onChange(permissions.filter((p) => p.module !== moduleId))
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-subtle text-text-muted text-[11px] uppercase tracking-wider">
            <th className="px-3 py-2.5 text-left font-medium">Раздел</th>
            {ACTIONS.map((a) => (
              <th key={a.id} className="px-3 py-2.5 text-center font-medium">
                {a.label}
              </th>
            ))}
            {!readonly && <th className="px-3 py-2.5 text-center font-medium">Все</th>}
          </tr>
        </thead>
        <tbody>
          {MODULES.map((m) => {
            const perm = permissions.find((p) => p.module === m.id)
            const allEnabled = perm?.actions.length === ACTIONS.length
            return (
              <tr key={m.id} className="border-t border-border-subtle">
                <td className="px-3 py-2.5 text-text-secondary">{m.label}</td>
                {ACTIONS.map((a) => {
                  const enabled = perm?.actions.includes(a.id)
                  return (
                    <td key={a.id} className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(enabled)}
                        onChange={() => togglePermission(m.id, a.id)}
                        disabled={readonly}
                        aria-label={`${m.label} — ${a.label}`}
                        className="accent-accent"
                      />
                    </td>
                  )
                })}
                {!readonly && (
                  <td className="px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(allEnabled)}
                      onChange={() => toggleModuleRow(m.id, !allEnabled)}
                      aria-label={`Все ${m.label}`}
                      className="accent-accent"
                    />
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Role form modal (create + edit + duplicate)
// ----------------------------------------------------------------------------

function RoleFormModal({
  role,
  base,
  onClose,
}: {
  role?: Role
  base?: Role
  onClose: () => void
}) {
  const qc = useQueryClient()
  const isEdit = Boolean(role)
  const initial = role ?? base
  const [name, setName] = useState(
    role?.name ?? (base ? `${base.name} (копия)` : ''),
  )
  const [description, setDescription] = useState(initial?.description ?? '')
  const [permissions, setPermissions] = useState<Permission[]>(initial?.permissions ?? [])
  const [errors, setErrors] = useState<{ name?: string; permissions?: string }>({})

  // Подтянуть пользователей с этой ролью (для предупреждения)
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<User[]>('/users'),
    enabled: isEdit,
  })
  const affected = isEdit
    ? users.filter((u) => u.roles.some((r) => role!.id.endsWith(r)))
    : []

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<Role>('/roles', {
        method: 'POST',
        body: { name, description, permissions, system: false },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ROLES })
      toast.success('Роль создана')
      onClose()
    },
    onError: (err: Error) => {
      if (err instanceof ApiError && err.code === 'NAME_TAKEN') {
        setErrors({ name: err.message })
      } else {
        toast.error('Не удалось создать роль', err.message)
      }
    },
  })

  const editMutation = useMutation({
    mutationFn: () =>
      apiFetch<Role>(`/roles/${role!.id}`, {
        method: 'PATCH',
        body: { name, description, permissions },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ROLES })
      toast.success('Роль обновлена')
      onClose()
    },
    onError: (err: Error) => toast.error('Не удалось сохранить роль', err.message),
  })

  const totalPerms = permissions.reduce((sum, p) => sum + p.actions.length, 0)
  const initialTotal = (initial?.permissions ?? []).reduce((s, p) => s + p.actions.length, 0)
  const delta = totalPerms - initialTotal

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (name.trim().length < 3) next.name = 'Минимум 3 символа'
    if (permissions.length === 0) next.permissions = 'Выберите хотя бы одно разрешение'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (isEdit) editMutation.mutate()
    else createMutation.mutate()
  }

  const isPending = createMutation.isPending || editMutation.isPending

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Редактирование: ${role!.name}` : base ? `Новая роль на основе «${base.name}»` : 'Новая роль'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать роль'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Название" required error={errors.name}>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, «Менеджер подразделения»"
              autoFocus
              error={Boolean(errors.name)}
            />
          </FormField>
          <FormField label="Краткое описание">
            <TextInput
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Кратко о назначении роли"
            />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-text-secondary">
              Разрешения {errors.permissions && <span className="text-error">*</span>}
            </h3>
            {isEdit && delta !== 0 && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  delta > 0 ? 'bg-success-bg text-success-text' : 'bg-warning-bg text-warning-text',
                )}
              >
                {delta > 0 ? `+${delta}` : delta} разрешений
              </span>
            )}
          </div>
          {errors.permissions && (
            <p className="text-xs text-error-text mb-2">{errors.permissions}</p>
          )}
          <PermissionMatrix permissions={permissions} onChange={setPermissions} />
        </div>

        {isEdit && affected.length > 0 && delta !== 0 && (
          <div className="rounded-md bg-warning-bg text-warning-text text-xs p-3">
            <div className="font-medium mb-1">
              Это изменение затронет {affected.length}{' '}
              {affected.length === 1 ? 'пользователя' : 'пользователей'}:
            </div>
            <div className="text-warning-text/80">
              {affected.slice(0, 3).map((u) => u.fullName).join(', ')}
              {affected.length > 3 && ` и ещё ${affected.length - 3}`}
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}

// ----------------------------------------------------------------------------
// Delete confirm
// ----------------------------------------------------------------------------

function DeleteRoleModal({ role, onClose }: { role: Role; onClose: () => void }) {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<User[]>('/users'),
  })
  const affected = users.filter((u) => u.roles.some((r) => role.id.endsWith(r)))

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch<void>(`/roles/${role.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ROLES })
      toast.success('Роль удалена')
      onClose()
    },
    onError: (err: Error) => {
      setError(err instanceof ApiError ? err.message : 'Ошибка удаления')
    },
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={`Удалить роль «${role.name}»?`}
      description="Операция необратима."
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Удаление…' : 'Удалить'}
          </Button>
        </>
      }
    >
      {error && (
        <div className="text-sm text-error-text bg-error-bg rounded-md p-3 mb-3">{error}</div>
      )}
      {affected.length > 0 && (
        <div className="rounded-md bg-warning-bg text-warning-text text-xs p-3 mb-3">
          <div className="font-medium mb-1">
            Роль назначена {affected.length}{' '}
            {affected.length === 1 ? 'пользователю' : 'пользователям'}. Они лишатся прав этой роли.
          </div>
        </div>
      )}
      <p className="text-sm text-text-secondary">
        Подтвердите удаление роли <span className="font-semibold">{role.name}</span>.
      </p>
    </Modal>
  )
}
