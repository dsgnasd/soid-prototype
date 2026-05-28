import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Paperclip, Play, Check } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { useApprovalTemplates, useStartProcess } from './api'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import { DatePicker } from '@/shared/ui/date-picker'

const STEPS = [
  { id: 1, label: 'Шаблон' },
  { id: 2, label: 'Параметры' },
  { id: 3, label: 'Подтверждение' },
]

export function ApprovalNewPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')

  const { data: templates = [], isLoading } = useApprovalTemplates()
  const startProcess = useStartProcess()
  const template = templates.find((t) => t.id === templateId)

  const nameValid = name.length >= 5 && name.length <= 200
  const canFinish = templateId && nameValid

  const handleStart = async () => {
    if (!templateId) return
    const result = await startProcess.mutateAsync({
      templateId,
      name,
      description: description || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
    })
    navigate(routes.process(result.id))
  }

  return (
    <div className="max-w-[1000px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Сервисы' },
          { label: 'Запустить согласование' },
        ]}
        title="Запустить процесс согласования"
        subtitle="Выберите шаблон, заполните параметры и запустите процесс"
      />

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {STEPS.map((s, idx) => {
          const isActive = step === s.id
          const isDone = step > s.id
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div
                className={cn(
                  'w-8 h-8 rounded-full grid place-items-center text-sm font-semibold',
                  isDone
                    ? 'bg-accent text-white'
                    : isActive
                      ? 'bg-accent-subtle text-accent-text ring-2 ring-accent'
                      : 'bg-bg-hover text-text-muted',
                )}
              >
                {isDone ? <Check size={16} /> : s.id}
              </div>
              <span
                className={cn(
                  'text-sm',
                  isActive ? 'text-text-primary font-medium' : 'text-text-muted',
                )}
              >
                {s.label}
              </span>
              {idx < STEPS.length - 1 && <span className="w-8 h-px bg-border-default mx-1" />}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <Panel title="Выберите шаблон">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-md bg-bg-hover animate-pulse" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {templates.map((t) => {
                const selected = templateId === t.id
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      className={cn(
                        'w-full text-left p-4 rounded-md border transition-colors',
                        selected
                          ? 'border-accent bg-accent-subtle'
                          : 'border-border-default bg-bg-surface hover:bg-bg-hover',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="template"
                          checked={selected}
                          onChange={() => setTemplateId(t.id)}
                          className="accent-accent"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary">
                            {t.name}
                          </div>
                          <div className="text-xs text-text-muted mt-0.5">
                            {t.description}
                          </div>
                          <div className="text-[11px] text-text-muted mt-1.5">
                            Этапов: {t.stages.length} · v{t.version}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border-subtle">
            <Button variant="secondary" onClick={() => navigate(routes.dashboard)}>
              Отмена
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={!templateId}
              iconRight={<ArrowRight size={16} />}
            >
              Далее
            </Button>
          </div>
        </Panel>
      )}

      {step === 2 && template && (
        <Panel title="Параметры процесса">
          <div className="space-y-4">
            <FormField
              label="Наименование процесса"
              required
              error={name && !nameValid ? 'От 5 до 200 символов' : undefined}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, «Согласование ТП-1024»"
                className="w-full h-11 px-4 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
              />
            </FormField>

            <FormField label="Описание / комментарий">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Опционально"
                className="w-full px-4 py-3 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm resize-y"
              />
            </FormField>

            <FormField label="Документы">
              <button
                type="button"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-dashed border-border-strong bg-bg-subtle text-sm text-text-secondary hover:bg-bg-hover"
              >
                <Paperclip size={14} />
                Прикрепить файлы
              </button>
              <p className="text-xs text-text-muted mt-1.5">
                До 50 МБ · .pdf, .dwg, .doc, .docx, .xlsx, .png, .jpg
              </p>
            </FormField>

            <FormField label="Срок завершения">
              <DatePicker
                value={deadline}
                onChange={setDeadline}
                minDate={new Date()}
                ariaLabel="Срок завершения"
              />
              <p className="text-xs text-text-muted mt-1.5">
                Дата, к которой процесс должен быть согласован
              </p>
            </FormField>

            <div className="rounded-md bg-bg-subtle border border-border-subtle p-3 text-xs text-text-muted">
              При выходе с формы черновик будет сохранён автоматически.
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-border-subtle">
            <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => setStep(1)}>
              Назад
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!nameValid}
              iconRight={<ArrowRight size={16} />}
            >
              Далее
            </Button>
          </div>
        </Panel>
      )}

      {step === 3 && template && (
        <Panel title="Подтверждение">
          <dl className="text-sm space-y-3">
            <Row label="Шаблон" value={template.name} />
            <Row label="Наименование" value={name} />
            {description && <Row label="Описание" value={description} />}
            <Row label="Этапов" value={String(template.stages.length)} />
            {deadline && <Row label="Срок" value={deadline} />}
          </dl>

          <div className="mt-4 rounded-md bg-info-bg text-info-text text-xs p-3">
            После запуска процесс получит статус «В работе», задачи будут разосланы участникам.
          </div>

          <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-border-subtle">
            <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => setStep(2)}>
              Назад
            </Button>
            <Button
              onClick={handleStart}
              disabled={!canFinish || startProcess.isPending}
              icon={<Play size={16} />}
            >
              {startProcess.isPending ? 'Запуск…' : 'Запустить процесс'}
            </Button>
          </div>
        </Panel>
      )}
    </div>
  )
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-error-text mt-1">{error}</p>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-text-muted w-32 shrink-0">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  )
}
