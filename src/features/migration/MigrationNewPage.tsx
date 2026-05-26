import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Play } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { useCreateMigration, useExternalSystems } from './api'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { ExternalSystemKey } from '@/shared/types'

const STEPS = [
  { id: 1, label: 'Выбор систем' },
  { id: 2, label: 'Подтверждение' },
]

export function MigrationNewPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [source, setSource] = useState<ExternalSystemKey | ''>('')
  const [target, setTarget] = useState<ExternalSystemKey | ''>('')

  const { data: systems = [], isLoading } = useExternalSystems()
  const createMigration = useCreateMigration()

  const canNext = source && target && source !== target
  const sameSystem = source && target && source === target

  const handleNext = () => setStep(2)
  const handleBack = () => setStep(1)
  const handleStart = async () => {
    if (!source || !target) return
    const result = await createMigration.mutateAsync({ source, target })
    navigate(routes.migrationDetails(result.id))
  }

  return (
    <div className="max-w-[1000px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Сервисы' },
          { label: 'Запустить миграцию' },
        ]}
        title="Запустить миграцию"
        subtitle="Выберите исходную и целевую систему для переноса инженерных данных"
      />

      {/* Stepper */}
      <div className="flex items-center gap-3 mb-6">
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

      {/* Step 1: выбор систем */}
      {step === 1 && (
        <Panel title="Системы">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="h-40 rounded-md bg-bg-hover animate-pulse" />
              <div className="h-40 rounded-md bg-bg-hover animate-pulse" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <SystemColumn
                  title="Исходная система"
                  systems={systems}
                  selected={source}
                  onChange={(key) => setSource(key)}
                />
                <SystemColumn
                  title="Целевая система"
                  systems={systems}
                  selected={target}
                  onChange={(key) => setTarget(key)}
                />
              </div>
              {sameSystem && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-warning-bg text-warning-text text-sm">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  Исходная и целевая системы должны различаться.
                </div>
              )}
              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border-subtle">
                <Button variant="secondary" onClick={() => navigate(routes.dashboard)}>
                  Отмена
                </Button>
                <Button onClick={handleNext} disabled={!canNext} iconRight={<ArrowRight size={16} />}>
                  Далее
                </Button>
              </div>
            </>
          )}
        </Panel>
      )}

      {/* Step 2: подтверждение */}
      {step === 2 && source && target && (
        <Panel title="Подтверждение запуска">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-4 rounded-md bg-bg-subtle border border-border-subtle">
              <div>
                <div className="text-xs text-text-muted mb-1">Исходная</div>
                <div className="text-base font-medium text-text-primary">
                  {systems.find((s) => s.key === source)?.name}
                </div>
              </div>
              <div className="text-center text-text-muted">
                <ArrowRight size={24} className="mx-auto" />
              </div>
              <div className="text-right md:text-right">
                <div className="text-xs text-text-muted mb-1">Целевая</div>
                <div className="text-base font-medium text-text-primary">
                  {systems.find((s) => s.key === target)?.name}
                </div>
              </div>
            </div>

            <EmptyState
              title="Готово к запуску"
              description="После запуска вы перейдёте в среду исходной системы для выбора объектов и параметров миграции. Процесс может идти от нескольких минут до нескольких часов; уведомление о завершении придёт в центр уведомлений."
              className="py-6"
            />

            <div className="flex items-center justify-between gap-2 pt-4 border-t border-border-subtle">
              <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={handleBack}>
                Назад
              </Button>
              <Button
                onClick={handleStart}
                disabled={createMigration.isPending}
                icon={<Play size={16} />}
              >
                {createMigration.isPending ? 'Запуск…' : 'Запустить миграцию'}
              </Button>
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}

function SystemColumn({
  title,
  systems,
  selected,
  onChange,
}: {
  title: string
  systems: { id: string; key: ExternalSystemKey; name: string; status: string }[]
  selected: ExternalSystemKey | ''
  onChange: (key: ExternalSystemKey) => void
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-text-secondary mb-3">{title}</legend>
      <div className="space-y-2">
        {systems.map((s) => {
          const isOffline = s.status === 'offline'
          const isSelected = selected === s.key
          return (
            <label
              key={s.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-md border cursor-pointer transition-colors',
                isSelected
                  ? 'border-accent bg-accent-subtle'
                  : 'border-border-default bg-bg-surface hover:bg-bg-hover',
                isOffline && 'opacity-60 cursor-not-allowed',
              )}
            >
              <input
                type="radio"
                name={title}
                checked={isSelected}
                disabled={isOffline}
                onChange={() => onChange(s.key)}
                className="accent-accent shrink-0"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">{s.name}</div>
                <div className="text-xs text-text-muted mt-0.5">
                  {isOffline ? (
                    <span className="text-error-text">⚠ недоступна</span>
                  ) : (
                    <span>онлайн</span>
                  )}
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
