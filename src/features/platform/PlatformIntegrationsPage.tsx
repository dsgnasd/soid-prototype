import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Play, Plug, RefreshCw, Settings, Plus, Trash2, Power } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton } from '@/shared/ui/empty-state'
import { Modal } from '@/shared/ui/modal'
import { Select } from '@/shared/ui/select'
import { FormField, TextInput } from '@/shared/ui/form-field'
import { apiFetch, ApiError } from '@/shared/api/client'
import { formatDateTime } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import type { ExternalSystemKey, Integration } from '@/shared/types'

const QK = ['integrations'] as const

type DialogState = null | { mode: 'create' } | { mode: 'edit'; integration: Integration } | { mode: 'delete'; integration: Integration }

export function PlatformIntegrationsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: QK,
    queryFn: () => apiFetch<Integration[]>('/integrations'),
  })
  const [dialog, setDialog] = useState<DialogState>(null)

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Платформа' },
          { label: 'Интеграции' },
        ]}
        title="Подключения к внешним системам"
        subtitle="Управление подключениями к PLM-системам и проверка их доступности"
        actions={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setDialog({ mode: 'create' })}>
            Добавить подключение
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)
          : data.map((i) => (
              <IntegrationCard
                key={i.id}
                integration={i}
                onEdit={() => setDialog({ mode: 'edit', integration: i })}
                onDelete={() => setDialog({ mode: 'delete', integration: i })}
              />
            ))}
      </div>

      {dialog?.mode === 'create' && (
        <IntegrationFormModal onClose={() => setDialog(null)} />
      )}
      {dialog?.mode === 'edit' && (
        <IntegrationFormModal integration={dialog.integration} onClose={() => setDialog(null)} />
      )}
      {dialog?.mode === 'delete' && (
        <DeleteIntegrationModal integration={dialog.integration} onClose={() => setDialog(null)} />
      )}
    </div>
  )
}

function IntegrationCard({
  integration,
  onEdit,
  onDelete,
}: {
  integration: Integration
  onEdit: () => void
  onDelete: () => void
}) {
  const qc = useQueryClient()
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const testMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; responseTimeMs: number; version: string }>(
        `/integrations/${integration.id}/test`,
        { method: 'POST' },
      ),
    onSuccess: (data) =>
      setResult({ ok: true, message: `Подключено за ${data.responseTimeMs} мс · версия ${data.version}` }),
    onError: (error) =>
      setResult({ ok: false, message: error instanceof Error ? error.message : 'Ошибка подключения' }),
    onSettled: () => qc.invalidateQueries({ queryKey: QK }),
  })

  const toggleMutation = useMutation({
    mutationFn: () =>
      apiFetch<Integration>(`/integrations/${integration.id}`, {
        method: 'PATCH',
        body: { enabled: !integration.enabled },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })

  const online = integration.status === 'online'
  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Plug size={16} className="text-text-muted" />
          {integration.name}
          {!integration.enabled ? (
            <Chip variant="neutral">отключена</Chip>
          ) : online ? (
            <Chip variant="success">онлайн</Chip>
          ) : (
            <Chip variant="error">офлайн</Chip>
          )}
        </span>
      }
      action={
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Settings size={14} />} onClick={onEdit}>
            Настроить
          </Button>
        </div>
      }
    >
      <dl className="text-sm space-y-2 mb-4">
        <Row
          label="Endpoint"
          value={<span className="font-mono text-xs break-all">{integration.endpoint}</span>}
        />
        <Row label="Тайм-аут" value={`${integration.timeoutMs / 1000} с`} />
        <Row label="Активных миграций" value={String(integration.activeMigrations)} />
        <Row
          label="Ошибок за 24ч"
          value={
            <span className={integration.errorsLast24h > 0 ? 'text-error-text' : ''}>
              {integration.errorsLast24h}
            </span>
          }
        />
        <Row label="Последняя проверка" value={formatDateTime(integration.lastCheckAt)} />
      </dl>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="primary"
          icon={
            testMutation.isPending ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )
          }
          onClick={() => testMutation.mutate()}
          disabled={testMutation.isPending || !integration.enabled}
        >
          Тест подключения
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={<Power size={14} />}
          onClick={() => toggleMutation.mutate()}
          disabled={toggleMutation.isPending}
        >
          {integration.enabled ? 'Отключить' : 'Включить'}
        </Button>
        <div className="flex-1" />
        <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={onDelete}>
          Удалить
        </Button>
      </div>

      {result && (
        <div
          className={`mt-3 px-3 py-2 text-xs rounded-md ${
            result.ok ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'
          }`}
        >
          {result.message}
        </div>
      )}
    </Panel>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary text-right min-w-0">{value}</dd>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Create / Edit modal
// ----------------------------------------------------------------------------

const TYPE_OPTIONS: { value: ExternalSystemKey; label: string }[] = [
  { value: 'ips', label: 'IPS (ИНТЕРМЕХ)' },
  { value: 'teamcenter', label: 'Siemens Teamcenter' },
  { value: '1c', label: '1С:Предприятие' },
]

interface FormValues {
  name: string
  key: ExternalSystemKey
  endpoint: string
  timeoutMs: number
  login: string
  password: string
  enabled: boolean
}

function IntegrationFormModal({
  integration,
  onClose,
}: {
  integration?: Integration
  onClose: () => void
}) {
  const qc = useQueryClient()
  const isEdit = Boolean(integration)
  const [values, setValues] = useState<FormValues>({
    name: integration?.name ?? '',
    key: integration?.key ?? 'ips',
    endpoint: integration?.endpoint ?? '',
    timeoutMs: integration?.timeoutMs ?? 30000,
    login: '',
    password: '',
    enabled: integration?.enabled ?? true,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  const [replaceCreds, setReplaceCreds] = useState(false)

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<Integration>('/integrations', {
        method: 'POST',
        body: {
          name: values.name,
          key: values.key,
          type: values.key,
          endpoint: values.endpoint,
          timeoutMs: values.timeoutMs,
          enabled: values.enabled,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK })
      onClose()
    },
  })

  const editMutation = useMutation({
    mutationFn: () =>
      apiFetch<Integration>(`/integrations/${integration!.id}`, {
        method: 'PATCH',
        body: {
          name: values.name,
          endpoint: values.endpoint,
          timeoutMs: values.timeoutMs,
          enabled: values.enabled,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK })
      onClose()
    },
  })

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (values.name.trim().length < 3) next.name = 'Минимум 3 символа'
    if (!/^https?:\/\//.test(values.endpoint)) next.endpoint = 'URL должен начинаться с http:// или https://'
    if (values.timeoutMs < 1000) next.timeoutMs = 'Минимум 1000 мс'
    if (!isEdit) {
      if (!values.login) next.login = 'Укажите логин'
      if (!values.password || values.password.length < 4)
        next.password = 'Пароль минимум 4 символа'
    } else if (replaceCreds) {
      if (!values.password || values.password.length < 4)
        next.password = 'Пароль минимум 4 символа'
    }
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
  const hasActiveMigrations = (integration?.activeMigrations ?? 0) > 0

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Настройка: ${integration!.name}` : 'Новое подключение'}
      description={
        isEdit
          ? 'Изменения параметров применятся к новым миграциям. Активные миграции могут быть прерваны.'
          : 'После создания подключения нужно настроить пары миграции для использования в сервисе.'
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать подключение'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEdit && hasActiveMigrations && (
          <div className="rounded-md bg-warning-bg text-warning-text text-xs p-3">
            ⚠ По подключению идут {integration!.activeMigrations} активных миграций. Изменение URL
            или креденшалов может их прервать.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Название" required error={errors.name}>
            <TextInput
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              placeholder="IPS (ИНТЕРМЕХ)"
              error={Boolean(errors.name)}
              autoFocus
            />
          </FormField>
          <FormField label="Тип системы" required>
            <Select
              value={values.key}
              onChange={(v) => setValues({ ...values, key: v as ExternalSystemKey })}
              options={TYPE_OPTIONS}
              disabled={isEdit}
              ariaLabel="Тип системы"
            />
          </FormField>
        </div>

        <FormField label="Endpoint URL" required error={errors.endpoint}>
          <TextInput
            type="url"
            value={values.endpoint}
            onChange={(e) => setValues({ ...values, endpoint: e.target.value })}
            placeholder="https://ips.internal/api"
            error={Boolean(errors.endpoint)}
          />
        </FormField>

        <FormField
          label="Тайм-аут (мс)"
          required
          error={errors.timeoutMs}
          hint="Максимальное время ожидания одного запроса"
        >
          <TextInput
            type="number"
            value={String(values.timeoutMs)}
            onChange={(e) => setValues({ ...values, timeoutMs: Number(e.target.value) || 0 })}
            min={1000}
            step={1000}
            error={Boolean(errors.timeoutMs)}
          />
        </FormField>

        {/* Credentials */}
        <div className="rounded-md border border-border-default bg-bg-subtle p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text-secondary">Учётные данные</h3>
            {isEdit && (
              <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceCreds}
                  onChange={(e) => setReplaceCreds(e.target.checked)}
                  className="accent-accent"
                />
                Заменить
              </label>
            )}
          </div>
          {isEdit && !replaceCreds ? (
            <div className="text-xs text-text-muted">
              Текущие креды скрыты. Чтобы заменить — отметьте чекбокс «Заменить».
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Логин" required={!isEdit} error={errors.login}>
                <TextInput
                  value={values.login}
                  onChange={(e) => setValues({ ...values, login: e.target.value })}
                  placeholder="api_user"
                  error={Boolean(errors.login)}
                  autoComplete="off"
                />
              </FormField>
              <FormField label="Пароль / токен" required error={errors.password}>
                <TextInput
                  type="password"
                  value={values.password}
                  onChange={(e) => setValues({ ...values, password: e.target.value })}
                  placeholder="••••••••"
                  error={Boolean(errors.password)}
                  autoComplete="new-password"
                />
              </FormField>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2.5 p-3 rounded-md border border-border-default bg-bg-subtle cursor-pointer">
          <input
            type="checkbox"
            checked={values.enabled}
            onChange={(e) => setValues({ ...values, enabled: e.target.checked })}
            className="accent-accent"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-text-primary">Подключение включено</div>
            <div className="text-xs text-text-muted">
              Если выключено — новые миграции не смогут использовать эту систему
            </div>
          </div>
        </label>
      </form>
    </Modal>
  )
}

// ----------------------------------------------------------------------------
// Delete modal
// ----------------------------------------------------------------------------

function DeleteIntegrationModal({
  integration,
  onClose,
}: {
  integration: Integration
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch<void>(`/integrations/${integration.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK })
      onClose()
    },
    onError: (err: Error) => {
      setError(err instanceof ApiError ? err.message : 'Ошибка удаления')
    },
  })

  const cannotDelete = integration.activeMigrations > 0

  return (
    <Modal
      open
      onClose={onClose}
      title={`Удалить подключение «${integration.name}»?`}
      description={
        cannotDelete
          ? 'Удаление невозможно — есть активные миграции.'
          : 'Операция необратима. Все пары миграции, использующие это подключение, будут отключены.'
      }
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {cannotDelete ? 'Закрыть' : 'Отмена'}
          </Button>
          {!cannotDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Удаление…' : 'Удалить'}
            </Button>
          )}
        </>
      }
    >
      {error && (
        <div className="text-sm text-error-text bg-error-bg rounded-md p-3 mb-3">{error}</div>
      )}
      {cannotDelete ? (
        <div className="text-sm text-warning-text bg-warning-bg rounded-md p-3">
          Сейчас идёт{' '}
          <span className="font-semibold">{integration.activeMigrations}</span> активных миграций.
          Дождитесь их завершения или прервите их вручную.
        </div>
      ) : (
        <p className="text-sm text-text-secondary">
          Подтвердите удаление подключения{' '}
          <span className="font-semibold">{integration.name}</span>.
        </p>
      )}
    </Modal>
  )
}
