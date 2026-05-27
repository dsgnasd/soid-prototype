import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, ArrowRight, Pencil, Trash2, Power, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton, EmptyState } from '@/shared/ui/empty-state'
import { Modal } from '@/shared/ui/modal'
import { Select } from '@/shared/ui/select'
import { FormField } from '@/shared/ui/form-field'
import { apiFetch, ApiError } from '@/shared/api/client'
import { formatDate } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { ExternalSystemKey, Integration, MigrationPair } from '@/shared/types'

const QK = ['migration-config'] as const

const STATUS_LABEL: Record<MigrationPair['status'], { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Активна', variant: 'success' },
  draft: { label: 'Черновик', variant: 'warning' },
  disabled: { label: 'Отключена', variant: 'neutral' },
}

const OBJECT_TYPES = [
  'Деталь',
  'Сборочная единица',
  'Документ',
  'Чертёж',
  'Спецификация',
  'Технологический процесс',
]

type DialogState =
  | null
  | { mode: 'create' }
  | { mode: 'edit'; pair: MigrationPair }
  | { mode: 'delete'; pair: MigrationPair }

export function PlatformMigrationConfigPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: QK,
    queryFn: () => apiFetch<MigrationPair[]>('/migration-config'),
  })
  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => apiFetch<Integration[]>('/integrations'),
  })
  const [dialog, setDialog] = useState<DialogState>(null)
  const qc = useQueryClient()

  const integrationName = (key: ExternalSystemKey) =>
    integrations.find((i) => i.key === key)?.name ?? key.toUpperCase()

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MigrationPair['status'] }) =>
      apiFetch<MigrationPair>(`/migration-config/${id}`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Платформа' },
          { label: 'Конфигурация миграций' },
        ]}
        title="Конфигурация миграций"
        subtitle="Допустимые пары систем (источник → цель) и поддерживаемые типы объектов"
        actions={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setDialog({ mode: 'create' })}>
            Добавить пару
          </Button>
        }
      />

      <Panel bodyClassName="p-0">
        {isLoading ? (
          <div className="p-5 space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title="Пар миграции пока нет"
            description="Создайте первую пару источник → цель, чтобы операторы могли запускать миграции."
            action={
              <Button icon={<Plus size={14} />} onClick={() => setDialog({ mode: 'create' })}>
                Добавить пару
              </Button>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-subtle text-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Пара</th>
                <th className="px-3 py-3 text-left font-medium hidden md:table-cell">Типы объектов</th>
                <th className="px-3 py-3 text-left font-medium">Статус</th>
                <th className="px-3 py-3 text-right font-medium tabular-nums hidden lg:table-cell">
                  Успех / Ошибки 30 дн.
                </th>
                <th className="px-3 py-3 text-right font-medium tabular-nums hidden md:table-cell">
                  Обновлено
                </th>
                <th className="px-5 py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody>
              {data.map((m) => {
                const status = STATUS_LABEL[m.status]
                return (
                  <tr
                    key={m.id}
                    className="border-t border-border-subtle hover:bg-bg-subtle transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 font-medium text-text-primary">
                        {integrationName(m.source)}
                        <ArrowRight size={14} className="text-text-muted" />
                        {integrationName(m.target)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-text-secondary hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {m.objectTypes.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[11px] px-1.5 py-0.5 rounded-sm bg-bg-hover text-text-secondary"
                          >
                            {t}
                          </span>
                        ))}
                        {m.objectTypes.length > 3 && (
                          <span className="text-[11px] text-text-muted">
                            +{m.objectTypes.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Chip variant={status.variant}>{status.label}</Chip>
                    </td>
                    <td className="px-3 py-3 text-right text-text-secondary tabular-nums hidden lg:table-cell">
                      <span className="text-success-text">{m.successCount30d}</span>
                      {' / '}
                      <span className={m.errorCount30d > 0 ? 'text-error-text' : ''}>
                        {m.errorCount30d}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-text-muted tabular-nums hidden md:table-cell">
                      {formatDate(m.updatedAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            toggleMutation.mutate({
                              id: m.id,
                              status: m.status === 'disabled' ? 'active' : 'disabled',
                            })
                          }
                          disabled={toggleMutation.isPending}
                          aria-label={m.status === 'disabled' ? 'Включить' : 'Отключить'}
                          title={m.status === 'disabled' ? 'Включить' : 'Отключить'}
                          className={cn(
                            'p-1.5 rounded-md transition-colors disabled:opacity-50',
                            m.status === 'disabled'
                              ? 'text-text-muted hover:text-success-text hover:bg-success-bg'
                              : 'text-text-muted hover:text-text-primary hover:bg-bg-hover',
                          )}
                        >
                          <Power size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDialog({ mode: 'edit', pair: m })}
                          aria-label="Редактировать"
                          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDialog({ mode: 'delete', pair: m })}
                          aria-label="Удалить"
                          className="p-1.5 rounded-md text-text-muted hover:text-error-text hover:bg-error-bg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Panel>

      {dialog?.mode === 'create' && (
        <PairFormModal integrations={integrations} onClose={() => setDialog(null)} />
      )}
      {dialog?.mode === 'edit' && (
        <PairFormModal
          pair={dialog.pair}
          integrations={integrations}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.mode === 'delete' && (
        <DeletePairModal
          pair={dialog.pair}
          integrationName={integrationName}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Form modal (create + edit)
// ----------------------------------------------------------------------------

interface FormValues {
  source: ExternalSystemKey | ''
  target: ExternalSystemKey | ''
  objectTypes: string[]
  status: MigrationPair['status']
}

function PairFormModal({
  pair,
  integrations,
  onClose,
}: {
  pair?: MigrationPair
  integrations: Integration[]
  onClose: () => void
}) {
  const qc = useQueryClient()
  const isEdit = Boolean(pair)
  const [values, setValues] = useState<FormValues>({
    source: pair?.source ?? '',
    target: pair?.target ?? '',
    objectTypes: pair?.objectTypes ?? [],
    status: pair?.status ?? 'draft',
  })
  const [error, setError] = useState<string | null>(null)

  const sysOptions = [
    { value: '' as ExternalSystemKey | '', label: 'Не выбрано' },
    ...integrations.map((i) => ({ value: i.key as ExternalSystemKey | '', label: i.name })),
  ]

  const sameSystem = values.source && values.target && values.source === values.target

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<MigrationPair>('/migration-config', {
        method: 'POST',
        body: {
          source: values.source,
          target: values.target,
          objectTypes: values.objectTypes,
          status: values.status,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK })
      onClose()
    },
    onError: (err: Error) => {
      setError(err instanceof ApiError ? err.message : 'Ошибка создания')
    },
  })

  const editMutation = useMutation({
    mutationFn: () =>
      apiFetch<MigrationPair>(`/migration-config/${pair!.id}`, {
        method: 'PATCH',
        body: {
          objectTypes: values.objectTypes,
          status: values.status,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK })
      onClose()
    },
  })

  const validate = (): boolean => {
    if (!values.source || !values.target) {
      setError('Укажите исходную и целевую систему')
      return false
    }
    if (sameSystem) {
      setError('Исходная и целевая системы должны различаться')
      return false
    }
    if (values.objectTypes.length === 0) {
      setError('Выберите хотя бы один тип объекта')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = () => {
    if (!validate()) return
    if (isEdit) editMutation.mutate()
    else createMutation.mutate()
  }

  const isPending = createMutation.isPending || editMutation.isPending

  const toggleType = (t: string) =>
    setValues((v) => ({
      ...v,
      objectTypes: v.objectTypes.includes(t)
        ? v.objectTypes.filter((x) => x !== t)
        : [...v.objectTypes, t],
    }))

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Редактирование пары миграции' : 'Новая пара миграции'}
      description={
        isEdit
          ? 'Изменение типа объектов применится только к новым миграциям. Системы источника и цели нельзя поменять — создайте новую пару.'
          : 'Определите пару систем (источник → цель) и поддерживаемые типы объектов.'
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать пару'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="text-sm text-error-text bg-error-bg rounded-md p-3">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-end gap-3">
          <FormField label="Исходная система" required>
            <Select
              value={values.source ?? ''}
              onChange={(v) => setValues({ ...values, source: v as ExternalSystemKey | '' })}
              options={sysOptions as { value: string; label: string }[]}
              disabled={isEdit}
              ariaLabel="Исходная система"
            />
          </FormField>
          <div className="hidden md:flex pb-2 text-text-muted">
            <ArrowRight size={20} />
          </div>
          <FormField label="Целевая система" required>
            <Select
              value={values.target ?? ''}
              onChange={(v) => setValues({ ...values, target: v as ExternalSystemKey | '' })}
              options={sysOptions as { value: string; label: string }[]}
              disabled={isEdit}
              ariaLabel="Целевая система"
            />
          </FormField>
        </div>

        <FormField label="Типы объектов" required hint="Какие сущности можно мигрировать в этой паре">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {OBJECT_TYPES.map((t) => {
              const checked = values.objectTypes.includes(t)
              return (
                <label
                  key={t}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors text-sm',
                    checked
                      ? 'bg-accent-subtle border-accent-border text-accent-text'
                      : 'bg-bg-subtle border-border-default hover:bg-bg-hover',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleType(t)}
                    className="accent-accent"
                  />
                  <span className="truncate">{t}</span>
                </label>
              )
            })}
          </div>
        </FormField>

        <FormField label="Статус">
          <Select
            value={values.status}
            onChange={(v) => setValues({ ...values, status: v as MigrationPair['status'] })}
            options={[
              { value: 'active', label: 'Активна', description: 'Доступна операторам для миграций' },
              { value: 'draft', label: 'Черновик', description: 'Не отображается операторам' },
              { value: 'disabled', label: 'Отключена', description: 'Скрыта, идущие миграции остановлены' },
            ]}
            ariaLabel="Статус пары"
          />
        </FormField>

        {sameSystem && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-warning-bg text-warning-text text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            Исходная и целевая системы должны различаться.
          </div>
        )}
      </div>
    </Modal>
  )
}

// ----------------------------------------------------------------------------
// Delete modal
// ----------------------------------------------------------------------------

function DeletePairModal({
  pair,
  integrationName,
  onClose,
}: {
  pair: MigrationPair
  integrationName: (key: ExternalSystemKey) => string
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch<void>(`/migration-config/${pair.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK })
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
      title="Удалить пару миграции?"
      description="После удаления операторы не смогут запускать миграции для этой пары."
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
      <div className="rounded-md bg-bg-subtle border border-border-subtle p-3 mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
          {integrationName(pair.source)}
          <ArrowRight size={14} className="text-text-muted" />
          {integrationName(pair.target)}
        </div>
        <div className="text-xs text-text-muted mt-1">
          За последние 30 дней: ✓ {pair.successCount30d} миграций, ❌ {pair.errorCount30d} ошибок
        </div>
      </div>
      <p className="text-sm text-text-secondary">
        Это действие необратимо. История запущенных миграций сохранится в журнале.
      </p>
    </Modal>
  )
}
