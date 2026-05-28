import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Check, X, RotateCcw, Paperclip, AlertCircle, FileText } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Skeleton, EmptyState } from '@/shared/ui/empty-state'
import { useDecideTask, useProcessDetails, useTaskDetails } from './api'
import { formatDateTime } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import { ApiError } from '@/shared/api/client'
import { toast } from '@/shared/ui/toast'

const DECISION_TOAST: Record<'approve' | 'reject' | 'return', string> = {
  approve: 'Задача согласована',
  reject: 'Задача отклонена',
  return: 'Задача отправлена на доработку',
}

type Decision = 'approve' | 'reject' | 'return' | null

export function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: task, isLoading } = useTaskDetails(id)
  const { data: process } = useProcessDetails(task?.processId)
  const decideTask = useDecideTask()

  const [decision, setDecision] = useState<Decision>(null)
  const [comment, setComment] = useState('')

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-72 mb-4" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!task) {
    return (
      <EmptyState
        variant="error"
        icon={<AlertCircle size={48} className="text-error" />}
        title="Задача не найдена"
      />
    )
  }

  const isDecided = task.status !== 'pending'
  const commentRequired = decision === 'reject' || decision === 'return'
  const canSubmit = decision && (!commentRequired || comment.length >= 10)

  const submitDecision = async () => {
    if (!decision || !id) return
    try {
      await decideTask.mutateAsync({ id, decision, comment: comment || undefined })
      toast.success(DECISION_TOAST[decision])
      navigate(routes.tasks)
    } catch {
      // Ошибка отобразится из mutation.error
    }
  }

  const error = decideTask.error instanceof ApiError ? decideTask.error.message : null

  return (
    <div className="max-w-[1200px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Работа' },
          { label: 'Мои задачи', to: routes.tasks },
          { label: task.processName },
        ]}
        title={task.processName}
        subtitle={`${task.templateName} · этап ${task.stageOrder} «${task.stageName}»`}
        actions={
          <Link to={routes.tasks}>
            <Button variant="secondary" size="sm" icon={<ChevronLeft size={14} />}>
              Назад
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        {/* Левая колонка */}
        <div className="space-y-5">
          {isDecided && (
            <div className="p-3 rounded-md bg-info-bg text-info-text text-sm">
              Решение по задаче уже принято · {formatDateTime(task.decidedAt)}.
              Действия больше недоступны.
            </div>
          )}

          {/* Документы */}
          <Panel title="Документы">
            {process?.documents.length ? (
              <ul className="space-y-2">
                {process.documents.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 p-3 rounded-md border border-border-subtle bg-bg-subtle"
                  >
                    <div className="w-9 h-9 rounded-md bg-info-bg text-info-text grid place-items-center">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {d.fileName}
                      </div>
                      <div className="text-xs text-text-muted">
                        {Math.round(d.sizeKb / 102.4) / 10} МБ · загружен{' '}
                        {formatDateTime(d.uploadedAt)}
                      </div>
                    </div>
                    <button type="button" className="text-accent text-sm hover:text-accent-hover">
                      Просмотр
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Документов нет" description="К процессу не прикреплено ни одного файла." />
            )}
          </Panel>

          {/* История */}
          <Panel title="История согласования">
            {process?.history.length ? (
              <ol className="relative border-l border-border-default ml-2 space-y-3">
                {process.history.map((h) => (
                  <li key={h.id} className="ml-4">
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-accent" />
                    <div className="text-xs text-text-muted tabular-nums">
                      {formatDateTime(h.timestamp)}
                    </div>
                    <div className="text-sm text-text-primary">
                      {h.actorId} · <HistoryAction action={h.action} stageOrder={h.stageOrder} />
                    </div>
                    {h.comment && (
                      <div className="mt-1 text-xs text-text-secondary bg-bg-subtle rounded-md p-2">
                        {h.comment}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-sm text-text-muted">История пуста.</div>
            )}
          </Panel>
        </div>

        {/* Правая колонка — действия */}
        <div className="space-y-5">
          <Panel title="Принять решение">
            {isDecided ? (
              <div className="text-sm text-text-muted">
                Эта задача уже завершена. Повторное действие невозможно.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <DecisionButton
                    icon={<Check size={16} />}
                    label="Согласовать"
                    active={decision === 'approve'}
                    tone="success"
                    onClick={() => setDecision('approve')}
                  />
                  <DecisionButton
                    icon={<RotateCcw size={16} />}
                    label="На доработку"
                    active={decision === 'return'}
                    tone="warning"
                    onClick={() => setDecision('return')}
                  />
                  <DecisionButton
                    icon={<X size={16} />}
                    label="Отклонить"
                    active={decision === 'reject'}
                    tone="error"
                    onClick={() => setDecision('reject')}
                  />
                </div>

                {decision && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      Комментарий {commentRequired && <span className="text-error">*</span>}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder={
                        commentRequired ? 'Минимум 10 символов' : 'Опционально'
                      }
                      className="w-full px-3 py-2 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm resize-y"
                    />
                    {commentRequired && comment.length < 10 && (
                      <p className="text-xs text-text-muted">
                        Комментарий обязателен при отклонении и доработке (минимум 10 символов)
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
                >
                  <Paperclip size={14} />
                  Прикрепить файл
                </button>

                {error && (
                  <div className="text-sm text-error-text bg-error-bg rounded-md p-2.5">
                    {error}
                  </div>
                )}

                <Button
                  onClick={submitDecision}
                  disabled={!canSubmit || decideTask.isPending}
                  className="w-full"
                  variant={decision === 'reject' ? 'danger' : 'primary'}
                >
                  {decideTask.isPending ? 'Отправка…' : 'Подтвердить решение'}
                </Button>
              </div>
            )}
          </Panel>

          <Panel title="О процессе">
            <dl className="text-sm space-y-2">
              <Row label="Шаблон" value={task.templateName} />
              <Row label="Этап" value={`${task.stageOrder} «${task.stageName}»`} />
              <Row label="Инициатор" value={task.initiatorId} />
              <Row label="Назначено" value={formatDateTime(task.createdAt)} />
              {task.deadline && <Row label="Срок" value={formatDateTime(task.deadline)} />}
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function DecisionButton({
  icon,
  label,
  active,
  tone,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  tone: 'success' | 'warning' | 'error'
  onClick: () => void
}) {
  const toneClasses = {
    success: active
      ? 'bg-success-bg text-success-text border-success/30'
      : 'border-border-default hover:bg-success-bg/40',
    warning: active
      ? 'bg-warning-bg text-warning-text border-warning/30'
      : 'border-border-default hover:bg-warning-bg/40',
    error: active
      ? 'bg-error-bg text-error-text border-error/30'
      : 'border-border-default hover:bg-error-bg/40',
  }[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full h-11 px-4 rounded-md border text-sm font-medium text-text-primary transition-colors ${toneClasses}`}
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}

function HistoryAction({ action, stageOrder }: { action: string; stageOrder?: number }) {
  const map: Record<string, string> = {
    started: 'запустил процесс',
    approved: `согласовал на этапе ${stageOrder ?? '?'}`,
    rejected: `отклонил на этапе ${stageOrder ?? '?'}`,
    returned: `вернул на доработку с этапа ${stageOrder ?? '?'}`,
    withdrawn: 'отозвал процесс',
    attached_file: 'прикрепил файл',
    commented: 'оставил комментарий',
  }
  return <>{map[action] ?? action}</>
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary text-right">{value}</dd>
    </div>
  )
}
