import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  GripVertical,
  ArrowDown,
  ArrowUp,
} from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton } from '@/shared/ui/empty-state'
import { Modal } from '@/shared/ui/modal'
import { Select } from '@/shared/ui/select'
import { FormField, TextInput, TextArea } from '@/shared/ui/form-field'
import { apiFetch, ApiError } from '@/shared/api/client'
import { toast } from '@/shared/ui/toast'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { ApprovalStage, ApprovalTemplate } from '@/shared/types'

const QK = ['admin-templates'] as const

const STATUS_VARIANT = {
  published: 'success',
  draft: 'warning',
  archived: 'neutral',
} as const

const STATUS_LABEL = {
  published: 'Опубликован',
  draft: 'Черновик',
  archived: 'Архив',
} as const

const ROLE_OPTIONS = [
  { value: '', label: 'Любой пользователь' },
  { value: 'constructor', label: 'Конструктор' },
  { value: 'technologist', label: 'Технолог' },
  { value: 'chief', label: 'Главный инженер' },
  { value: 'production', label: 'Производство' },
  { value: 'qc', label: 'Контроль качества' },
  { value: 'manager', label: 'Менеджер' },
]

type DialogState =
  | null
  | { mode: 'create' }
  | { mode: 'edit'; template: ApprovalTemplate }
  | { mode: 'view'; template: ApprovalTemplate }
  | { mode: 'delete'; template: ApprovalTemplate }

export function ApprovalTemplatesPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: QK,
    queryFn: () => apiFetch<ApprovalTemplate[]>('/admin/approval-templates'),
  })
  const [dialog, setDialog] = useState<DialogState>(null)

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Администрирование' },
          { label: 'Шаблоны процессов согласования' },
        ]}
        title="Шаблоны процессов согласования"
        subtitle="Готовые шаблоны для запуска процессов операторами"
        actions={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setDialog({ mode: 'create' })}>
            Создать шаблон
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((t) => (
            <Panel
              key={t.id}
              title={
                <span className="flex items-center gap-2">
                  {t.name}
                  <Chip variant={STATUS_VARIANT[t.status]}>{STATUS_LABEL[t.status]}</Chip>
                </span>
              }
              action={
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Eye size={14} />}
                    onClick={() => setDialog({ mode: 'view', template: t })}
                  >
                    Открыть
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Pencil size={14} />}
                    onClick={() => setDialog({ mode: 'edit', template: t })}
                  >
                    Изменить
                  </Button>
                </div>
              }
            >
              <p className="text-sm text-text-secondary mb-3">{t.description}</p>
              <div className="text-xs text-text-muted mb-2">
                Этапов: <span className="font-medium text-text-secondary">{t.stages.length}</span> ·
                Версия: <span className="font-medium text-text-secondary">v{t.version}</span>
              </div>
              <ol className="space-y-1 text-sm">
                {t.stages.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-subtle"
                  >
                    <span className="text-xs font-semibold text-text-muted">{s.order}.</span>
                    <span className="text-text-primary">{s.name}</span>
                    {s.autoAssign && (
                      <span className="ml-auto text-[10px] uppercase tracking-wider text-text-muted">
                        авто
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </Panel>
          ))}
        </div>
      )}

      {dialog?.mode === 'create' && <TemplateFormModal onClose={() => setDialog(null)} />}
      {dialog?.mode === 'edit' && (
        <TemplateFormModal template={dialog.template} onClose={() => setDialog(null)} />
      )}
      {dialog?.mode === 'view' && (
        <TemplateViewModal
          template={dialog.template}
          onEdit={() => setDialog({ mode: 'edit', template: dialog.template })}
          onDelete={() => setDialog({ mode: 'delete', template: dialog.template })}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.mode === 'delete' && (
        <DeleteTemplateModal template={dialog.template} onClose={() => setDialog(null)} />
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Read-only view modal
// ----------------------------------------------------------------------------

function TemplateViewModal({
  template,
  onEdit,
  onDelete,
  onClose,
}: {
  template: ApprovalTemplate
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <Modal
      open
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          {template.name}
          <Chip variant={STATUS_VARIANT[template.status]}>{STATUS_LABEL[template.status]}</Chip>
        </span>
      }
      description={`Версия v${template.version}`}
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => {
              onClose()
              onDelete()
            }}
          >
            Удалить
          </Button>
          <div className="flex-1" />
          <Button variant="secondary" size="sm" onClick={onClose}>
            Закрыть
          </Button>
          <Button size="sm" icon={<Pencil size={14} />} onClick={onEdit}>
            Редактировать
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary mb-4">{template.description}</p>
      <h3 className="text-sm font-medium text-text-secondary mb-2">
        Этапы согласования ({template.stages.length})
      </h3>
      <ol className="space-y-2">
        {template.stages.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 p-3 rounded-md border border-border-subtle bg-bg-subtle"
          >
            <div className="w-7 h-7 rounded-md bg-accent text-white grid place-items-center text-xs font-semibold">
              {s.order}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary">{s.name}</div>
              {s.participantRole && (
                <div className="text-xs text-text-muted mt-0.5">
                  Участник:{' '}
                  {ROLE_OPTIONS.find((o) => o.value === s.participantRole)?.label ??
                    s.participantRole}
                </div>
              )}
            </div>
            {s.autoAssign && (
              <span className="text-[10px] uppercase tracking-wider text-text-muted">
                Авто-назначение
              </span>
            )}
          </li>
        ))}
      </ol>
    </Modal>
  )
}

// ----------------------------------------------------------------------------
// Form modal (create + edit)
// ----------------------------------------------------------------------------

interface StageDraft {
  id: string
  order: number
  name: string
  participantRole: string
  autoAssign: boolean
}

function TemplateFormModal({
  template,
  onClose,
}: {
  template?: ApprovalTemplate
  onClose: () => void
}) {
  const qc = useQueryClient()
  const isEdit = Boolean(template)

  const [name, setName] = useState(template?.name ?? '')
  const [description, setDescription] = useState(template?.description ?? '')
  const [status, setStatus] = useState<ApprovalTemplate['status']>(template?.status ?? 'draft')
  const [stages, setStages] = useState<StageDraft[]>(() =>
    template
      ? template.stages.map((s) => ({
          id: s.id,
          order: s.order,
          name: s.name,
          participantRole: s.participantRole ?? '',
          autoAssign: s.autoAssign,
        }))
      : [
          { id: `s-${Date.now()}-1`, order: 1, name: 'Согласующий', participantRole: '', autoAssign: false },
        ],
  )
  const [errors, setErrors] = useState<{ name?: string; stages?: string }>({})

  const addStage = () => {
    setStages((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        order: prev.length + 1,
        name: `Этап ${prev.length + 1}`,
        participantRole: '',
        autoAssign: false,
      },
    ])
  }
  const removeStage = (id: string) => {
    setStages((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, order: idx + 1 })),
    )
  }
  const moveStage = (id: string, direction: 'up' | 'down') => {
    setStages((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx < 0) return prev
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next.map((s, i) => ({ ...s, order: i + 1 }))
    })
  }
  const updateStage = <K extends keyof StageDraft>(id: string, key: K, value: StageDraft[K]) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)))
  }

  const validate = (publish: boolean): boolean => {
    const next: typeof errors = {}
    if (name.trim().length < 3) next.name = 'Минимум 3 символа'
    if (stages.length === 0) {
      next.stages = 'Добавьте хотя бы один этап'
    } else if (publish) {
      const emptyStage = stages.find((s) => !s.name.trim())
      if (emptyStage) next.stages = `У этапа ${emptyStage.order} не задано название`
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const saveMutation = useMutation({
    mutationFn: (payload: { publish: boolean }) => {
      const body: Omit<ApprovalTemplate, 'id' | 'version'> = {
        name,
        description,
        status: payload.publish ? 'published' : status,
        stages: stages.map<ApprovalStage>((s) => ({
          id: s.id,
          order: s.order,
          name: s.name.trim() || `Этап ${s.order}`,
          participantRole: s.participantRole || undefined,
          autoAssign: s.autoAssign,
        })),
      }
      return isEdit
        ? apiFetch<ApprovalTemplate>(`/admin/approval-templates/${template!.id}`, {
            method: 'PATCH',
            body,
          })
        : apiFetch<ApprovalTemplate>('/admin/approval-templates', {
            method: 'POST',
            body,
          })
    },
    onSuccess: (_data, payload) => {
      qc.invalidateQueries({ queryKey: QK })
      toast.success(
        payload.publish ? 'Шаблон опубликован' : isEdit ? 'Шаблон сохранён' : 'Черновик сохранён',
      )
      onClose()
    },
    onError: (err: Error) => {
      if (err instanceof ApiError) setErrors({ stages: err.message })
      else toast.error('Не удалось сохранить шаблон', err.message)
    },
  })

  const handleSaveDraft = () => {
    if (!validate(false)) return
    saveMutation.mutate({ publish: false })
  }
  const handlePublish = () => {
    if (!validate(true)) return
    saveMutation.mutate({ publish: true })
  }

  const isPending = saveMutation.isPending
  const willPublish = status !== 'published'

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Редактирование: ${template!.name}` : 'Новый шаблон согласования'}
      description={
        isEdit
          ? `Текущая версия v${template!.version}. Изменения создадут новую версию — активные процессы продолжат идти по предыдущей.`
          : 'По умолчанию шаблон сохраняется как черновик. Опубликуйте его, чтобы операторы могли запускать процессы.'
      }
      size="xl"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isPending}
          >
            {isPending ? 'Сохранение…' : 'Сохранить как черновик'}
          </Button>
          {willPublish && (
            <Button size="sm" onClick={handlePublish} disabled={isPending}>
              {isPending ? 'Публикация…' : 'Опубликовать'}
            </Button>
          )}
          {!willPublish && (
            <Button size="sm" onClick={handleSaveDraft} disabled={isPending}>
              {isPending ? 'Сохранение…' : 'Сохранить'}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Название" required error={errors.name}>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, «Согласование чертежа КД»"
              error={Boolean(errors.name)}
              autoFocus
            />
          </FormField>
          <FormField label="Статус">
            <Select
              value={status}
              onChange={(v) => setStatus(v as ApprovalTemplate['status'])}
              options={[
                { value: 'draft', label: 'Черновик' },
                { value: 'published', label: 'Опубликован' },
                { value: 'archived', label: 'Архив' },
              ]}
              ariaLabel="Статус"
            />
          </FormField>
        </div>

        <FormField label="Описание" hint="Краткое описание для операторов">
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите, какие документы согласует этот шаблон и кто участвует"
            rows={2}
          />
        </FormField>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Этапы согласования{' '}
              <span className="text-text-muted">({stages.length})</span>
            </h3>
            <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addStage}>
              Добавить этап
            </Button>
          </div>

          {errors.stages && (
            <div className="text-xs text-error-text mb-2">{errors.stages}</div>
          )}

          <ol className="space-y-2">
            {stages.map((s, idx) => (
              <li
                key={s.id}
                className="grid grid-cols-[24px_1fr_1fr_auto_auto] items-start gap-3 p-3 rounded-md border border-border-default bg-bg-subtle"
              >
                <div className="pt-2 text-text-muted">
                  <GripVertical size={16} />
                </div>
                <FormField label={`Этап ${s.order}`}>
                  <TextInput
                    value={s.name}
                    onChange={(e) => updateStage(s.id, 'name', e.target.value)}
                    placeholder="Название этапа"
                  />
                </FormField>
                <FormField label="Роль участника">
                  <Select
                    value={s.participantRole}
                    onChange={(v) => updateStage(s.id, 'participantRole', v)}
                    options={ROLE_OPTIONS}
                    ariaLabel={`Роль для этапа ${s.order}`}
                  />
                </FormField>
                <label
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md border text-xs cursor-pointer transition-colors mt-[22px]',
                    s.autoAssign
                      ? 'border-accent-border bg-accent-subtle text-accent-text'
                      : 'border-border-default bg-bg-surface text-text-muted',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={s.autoAssign}
                    onChange={(e) => updateStage(s.id, 'autoAssign', e.target.checked)}
                    className="accent-accent"
                  />
                  Авто-назначение
                </label>
                <div className="flex flex-col gap-1 mt-[22px]">
                  <button
                    type="button"
                    onClick={() => moveStage(s.id, 'up')}
                    disabled={idx === 0}
                    aria-label="Поднять выше"
                    className="w-7 h-7 grid place-items-center rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStage(s.id, 'down')}
                    disabled={idx === stages.length - 1}
                    aria-label="Опустить ниже"
                    className="w-7 h-7 grid place-items-center rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStage(s.id)}
                    disabled={stages.length === 1}
                    aria-label="Удалить этап"
                    className="w-7 h-7 grid place-items-center rounded-sm text-text-muted hover:text-error-text hover:bg-error-bg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ol>

          {stages.length === 0 && (
            <div className="text-center py-6 rounded-md border border-dashed border-border-default text-sm text-text-muted">
              Нет этапов. Добавьте хотя бы один.
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ----------------------------------------------------------------------------
// Delete modal
// ----------------------------------------------------------------------------

function DeleteTemplateModal({
  template,
  onClose,
}: {
  template: ApprovalTemplate
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiFetch<void>(`/admin/approval-templates/${template.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK })
      toast.success('Шаблон удалён')
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
      title={`Удалить шаблон «${template.name}»?`}
      description="Активные процессы, запущенные по этому шаблону, продолжат идти."
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
      <p className="text-sm text-text-secondary">
        Подтвердите удаление шаблона <span className="font-semibold">{template.name}</span>.
        Операторы больше не смогут запускать процессы по этому шаблону.
      </p>
    </Modal>
  )
}
