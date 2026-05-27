import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, X, AlertTriangle, Clock, Inbox, Plus } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Skeleton, EmptyState } from '@/shared/ui/empty-state'
import { apiFetch } from '@/shared/api/client'
import { formatDateTime } from '@/shared/lib/format'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import { ApiError } from '@/shared/api/client'
import { useCurrentRole } from '@/shared/hooks/useAuth'
import type { Escalation } from '@/shared/types'

const URGENCY_VARIANT = {
  high: 'error',
  medium: 'warning',
  low: 'info',
} as const

const URGENCY_LABEL = {
  high: 'Высокая',
  medium: 'Средняя',
  low: 'Низкая',
}

const STATUS_LABEL = {
  new: 'Новая',
  in_review: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
}

const STATUS_VARIANT = {
  new: 'info',
  in_review: 'warning',
  approved: 'success',
  rejected: 'error',
} as const

const TYPE_LABEL = {
  cross_scope_action: 'Действие вне scope',
  temporary_permission: 'Временные права',
  license_increase: 'Расширение лицензии',
  other: 'Прочее',
}

export function EscalationsPage() {
  const role = useCurrentRole()
  const isAdmin = role === 'admin'

  const { data = [], isLoading } = useQuery({
    queryKey: ['escalations', { authorId: isAdmin ? 'u-admin' : undefined }],
    queryFn: () =>
      apiFetch<Escalation[]>('/escalations', {
        params: { authorId: isAdmin ? 'u-admin' : undefined },
      }),
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = data.find((e) => e.id === selectedId) ?? data[0]

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Администрирование' },
          { label: 'Заявки эскалации' },
        ]}
        title="Заявки эскалации"
        subtitle={
          isAdmin
            ? 'Ваши запросы на действия вне scope — рассматриваются суперадминистратором'
            : 'Запросы от администраторов на действия за пределами их scope'
        }
        actions={
          isAdmin ? (
            <Link to="/admin/escalations/new">
              <Button size="sm" icon={<Plus size={14} />}>
                Новая заявка
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5">
        <Panel bodyClassName="px-3 pb-3">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={<Inbox size={48} className="text-text-muted" />}
              title="Нет заявок"
              description="Когда администраторы отправят запросы, они появятся здесь."
            />
          ) : (
            <ul className="space-y-1">
              {data.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(e.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-md transition-colors',
                      selected?.id === e.id
                        ? 'bg-accent-subtle border border-accent-border'
                        : 'border border-transparent hover:bg-bg-hover',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-text-primary">
                        {TYPE_LABEL[e.type]}
                      </span>
                      <Chip variant={STATUS_VARIANT[e.status]}>{STATUS_LABEL[e.status]}</Chip>
                    </div>
                    <div className="text-xs text-text-muted line-clamp-2">{e.description}</div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        {formatDateTime(e.createdAt)}
                      </span>
                      <Chip variant={URGENCY_VARIANT[e.urgency]} icon={<AlertTriangle size={11} />}>
                        {URGENCY_LABEL[e.urgency]}
                      </Chip>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {selected && <EscalationDetails escalation={selected} canResolve={!isAdmin} />}
      </div>
    </div>
  )
}

function EscalationDetails({
  escalation,
  canResolve,
}: {
  escalation: Escalation
  canResolve: boolean
}) {
  const qc = useQueryClient()
  const [reason, setReason] = useState('')
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)

  const resolveMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/escalations/${escalation.id}/resolve`, {
        method: 'POST',
        body: { decision, reason: reason || undefined },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['escalations'] })
      setDecision(null)
      setReason('')
    },
  })

  const isResolved = escalation.status === 'approved' || escalation.status === 'rejected'
  const error = resolveMutation.error instanceof ApiError ? resolveMutation.error.message : null

  return (
    <Panel
      title={TYPE_LABEL[escalation.type]}
      action={<Chip variant={STATUS_VARIANT[escalation.status]}>{STATUS_LABEL[escalation.status]}</Chip>}
    >
      <dl className="text-sm space-y-2 mb-4">
        <Row label="Автор" value={escalation.authorId} />
        <Row label="Срочность" value={URGENCY_LABEL[escalation.urgency]} />
        <Row label="Создана" value={formatDateTime(escalation.createdAt)} />
        {escalation.objectRef && <Row label="Объект" value={escalation.objectRef} />}
      </dl>

      <div className="rounded-md bg-bg-subtle border border-border-subtle p-3 text-sm text-text-primary mb-4 whitespace-pre-wrap">
        {escalation.description}
      </div>

      {isResolved ? (
        <div className="p-3 rounded-md bg-info-bg text-info-text text-sm">
          Решение принято {formatDateTime(escalation.resolvedAt)} пользователем{' '}
          <span className="font-medium">{escalation.resolverId}</span>.
          {escalation.rejectionReason && (
            <div className="mt-1 text-xs">Причина: {escalation.rejectionReason}</div>
          )}
        </div>
      ) : !canResolve ? (
        <div className="p-3 rounded-md bg-bg-subtle border border-border-subtle text-sm text-text-muted">
          Заявка ожидает рассмотрения суперадминистратором. Вы получите уведомление при изменении
          статуса.
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Button
              variant={decision === 'approve' ? 'primary' : 'secondary'}
              icon={<Check size={14} />}
              onClick={() => setDecision('approve')}
            >
              Одобрить
            </Button>
            <Button
              variant={decision === 'reject' ? 'danger' : 'secondary'}
              icon={<X size={14} />}
              onClick={() => setDecision('reject')}
            >
              Отклонить
            </Button>
          </div>

          {decision === 'reject' && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Причина <span className="text-error">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Минимум 20 символов"
                className="w-full px-3 py-2 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm resize-y"
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-error-text bg-error-bg rounded-md p-2.5 mb-3">{error}</div>
          )}

          {decision && (
            <Button
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending || (decision === 'reject' && reason.length < 20)}
              variant={decision === 'reject' ? 'danger' : 'primary'}
              className="w-full"
            >
              {resolveMutation.isPending ? 'Отправка…' : 'Подтвердить решение'}
            </Button>
          )}
        </>
      )}
    </Panel>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary text-right">{value}</dd>
    </div>
  )
}
