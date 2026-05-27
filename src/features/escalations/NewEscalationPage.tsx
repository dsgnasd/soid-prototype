import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { FormField, TextInput, TextArea } from '@/shared/ui/form-field'
import { apiFetch, ApiError } from '@/shared/api/client'
import { routes } from '@/shared/config/routes'
import type { Escalation } from '@/shared/types'

const TYPE_OPTIONS: { value: Escalation['type']; label: string; description?: string }[] = [
  {
    value: 'cross_scope_action',
    label: 'Действие вне scope',
    description: 'Изменение пользователей или подразделений вне моего scope',
  },
  {
    value: 'temporary_permission',
    label: 'Временные права',
    description: 'Расширить права пользователю на ограниченный срок',
  },
  {
    value: 'license_increase',
    label: 'Расширение лицензии',
    description: 'Увеличить лимит активных пользователей',
  },
  { value: 'other', label: 'Прочее' },
]

const URGENCY_OPTIONS: { value: Escalation['urgency']; label: string }[] = [
  { value: 'low', label: 'Низкая' },
  { value: 'medium', label: 'Средняя' },
  { value: 'high', label: 'Высокая' },
]

export function NewEscalationPage() {
  const navigate = useNavigate()
  const [type, setType] = useState<Escalation['type']>('cross_scope_action')
  const [urgency, setUrgency] = useState<Escalation['urgency']>('medium')
  const [description, setDescription] = useState('')
  const [objectRef, setObjectRef] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<Escalation>('/escalations', {
        method: 'POST',
        body: { type, urgency, description, objectRef: objectRef || undefined },
      }),
    onSuccess: () => navigate(routes.adminEscalations),
    onError: (err: Error) => {
      setError(err instanceof ApiError ? err.message : 'Ошибка отправки заявки')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim().length < 30) {
      setError('Описание минимум 30 символов — опишите задачу подробно')
      return
    }
    setError(null)
    createMutation.mutate()
  }

  const charCount = description.length

  return (
    <div className="max-w-[800px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Администрирование' },
          { label: 'Заявки эскалации', to: routes.adminEscalations },
          { label: 'Новая заявка' },
        ]}
        title="Новая заявка эскалации"
        subtitle="Запрос на действие за пределами вашего scope или на расширение прав"
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronLeft size={14} />}
            onClick={() => navigate(routes.adminEscalations)}
          >
            Назад
          </Button>
        }
      />

      <Panel>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-error-text bg-error-bg rounded-md p-3">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Тип запроса" required>
              <Select
                value={type}
                onChange={setType}
                options={TYPE_OPTIONS}
                ariaLabel="Тип запроса"
              />
            </FormField>
            <FormField label="Срочность" required>
              <Select
                value={urgency}
                onChange={setUrgency}
                options={URGENCY_OPTIONS}
                ariaLabel="Срочность"
              />
            </FormField>
          </div>

          <FormField
            label="Описание"
            required
            error={
              charCount > 0 && charCount < 30
                ? `Минимум 30 символов (сейчас ${charCount})`
                : undefined
            }
            hint={
              charCount >= 30
                ? `${charCount} символов`
                : 'Опишите задачу подробно: что нужно сделать, для кого, на какой срок'
            }
          >
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Например: «Прошу временно расширить права пользователю Сидорову С.С. для доступа к подразделению «Производство» в рамках проекта ABC. Срок: до 31.05.2026.»"
              error={charCount > 0 && charCount < 30}
            />
          </FormField>

          <FormField
            label="Ссылка на объект"
            hint="ID пользователя / подразделения / процесса (опционально)"
          >
            <TextInput
              value={objectRef}
              onChange={(e) => setObjectRef(e.target.value)}
              placeholder="u-sidorov"
            />
          </FormField>

          <div className="rounded-md bg-info-bg text-info-text text-xs p-3">
            Заявка попадёт в очередь суперадминистратора. Вы получите уведомление, когда по ней
            будет принято решение.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(routes.adminEscalations)}
            >
              Отмена
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={createMutation.isPending || description.length < 30}
            >
              {createMutation.isPending ? 'Отправка…' : 'Отправить заявку'}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  )
}
