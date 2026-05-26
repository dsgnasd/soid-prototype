import { useState } from 'react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'

const TABS = [
  { id: 'security', label: 'Безопасность' },
  { id: 'smtp', label: 'Уведомления (SMTP)' },
  { id: 'retention', label: 'Хранение' },
  { id: 'license', label: 'Лицензия' },
]

export function PlatformSettingsPage() {
  const [tab, setTab] = useState('security')

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Платформа' },
          { label: 'Системные настройки' },
        ]}
        title="Системные настройки"
        subtitle="Глобальные параметры платформы СОИД"
      />

      <div className="inline-flex items-center gap-0.5 p-1 mb-5 rounded-md bg-bg-hover border border-border-default">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'h-8 px-3.5 rounded-sm text-xs font-medium transition-colors',
              tab === t.id
                ? 'bg-bg-surface text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'security' && (
        <Panel title="Политика безопасности">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Минимальная длина пароля" defaultValue="10" />
            <Field label="Срок жизни пароля (дней)" defaultValue="90" />
            <Field label="Тайм-аут бездействия (мин)" defaultValue="30" />
            <Field label="Попыток до блокировки" defaultValue="5" />
            <Checkbox label="Требовать спецсимволы в пароле" defaultChecked />
            <Checkbox label="Требовать сочетание букв и цифр" defaultChecked />
            <Checkbox label="Двойной контроль (4-eyes) для критичных операций" />
            <Checkbox label="Авто-логаут с предупреждением за 1 минуту" defaultChecked />
          </div>
          <div className="mt-5 pt-4 border-t border-border-subtle flex justify-end gap-2">
            <Button variant="secondary">Отмена</Button>
            <Button>Сохранить</Button>
          </div>
        </Panel>
      )}

      {tab === 'smtp' && (
        <Panel title="SMTP-сервер">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Сервер" defaultValue="smtp.soid.demo" />
            <Field label="Порт" defaultValue="587" />
            <Field label="Логин" defaultValue="noreply@soid.demo" />
            <Field label="Пароль" defaultValue="••••••••" type="password" />
            <Field label="Отправитель (From)" defaultValue="СОИД <noreply@soid.demo>" />
            <Checkbox label="STARTTLS" defaultChecked />
          </div>
          <div className="mt-5 pt-4 border-t border-border-subtle flex justify-between">
            <Button variant="secondary">Отправить тестовое письмо</Button>
            <div className="flex gap-2">
              <Button variant="secondary">Отмена</Button>
              <Button>Сохранить</Button>
            </div>
          </div>
        </Panel>
      )}

      {tab === 'retention' && (
        <Panel title="Политика хранения">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Хранить журнал операций, мес" defaultValue="36" />
            <Field label="Хранить логи миграций, мес" defaultValue="12" />
            <Field label="Срок ссылок на экспорт (часов)" defaultValue="24" />
          </div>
          <div className="mt-4 p-3 rounded-md bg-warning-bg text-warning-text text-xs">
            ⚠ При уменьшении срока ретенции записи старше нового срока будут архивированы. Это
            необратимо.
          </div>
          <div className="mt-5 pt-4 border-t border-border-subtle flex justify-end gap-2">
            <Button variant="secondary">Отмена</Button>
            <Button>Сохранить</Button>
          </div>
        </Panel>
      )}

      {tab === 'license' && (
        <Panel title="Лицензия">
          <dl className="text-sm space-y-2.5">
            <Row label="Тип лицензии" value="Корпоративная" />
            <Row label="Срок действия" value="до 31.12.2026" />
            <Row label="Лимит активных пользователей" value="100" />
            <Row label="Используется" value="47 из 100 (47%)" />
            <Row label="Версия СОИД" value="v1.0.42" />
            <Row label="Дата сборки" value="24.05.2026" />
          </dl>
          <div className="mt-5 flex gap-2">
            <Button variant="secondary">Проверить обновления</Button>
            <Button variant="secondary">Скачать лицензионный файл</Button>
          </div>
        </Panel>
      )}
    </div>
  )
}

function Field({
  label,
  defaultValue,
  type = 'text',
}: {
  label: string
  defaultValue: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm text-text-secondary mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full h-11 px-4 rounded-md border border-border-default bg-bg-subtle focus:bg-bg-surface focus:border-accent text-sm"
      />
    </div>
  )
}

function Checkbox({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 h-11 px-3 rounded-md border border-border-default bg-bg-subtle hover:bg-bg-hover cursor-pointer text-sm">
      <input type="checkbox" defaultChecked={defaultChecked} className="accent-accent" />
      {label}
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  )
}
