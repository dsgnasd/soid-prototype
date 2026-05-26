import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { routes } from '@/shared/config/routes'

export function AboutPage() {
  return (
    <div className="max-w-[800px]">
      <PageHeader
        breadcrumbs={[{ label: 'Дашборд', to: routes.dashboard }, { label: 'О программе' }]}
        title="О программе"
        subtitle="СОИД — Система обработки инженерных данных"
      />
      <Panel>
        <dl className="text-sm space-y-3">
          <Row label="Название" value="СОИД — Система обработки инженерных данных" />
          <Row label="Версия" value="v0.1.0 (демо-прототип)" />
          <Row label="Дата сборки" value="25.05.2026" />
          <Row label="Стек" value="React 19 · TypeScript · Tailwind · shadcn/ui · MSW" />
          <Row label="Поддерживаемые браузеры" value="Chrome / Firefox / Safari / Edge (последние версии)" />
          <Row label="Минимальное разрешение" value="1024 × 768 px" />
          <Row label="Локализация" value="ru-RU" />
        </dl>
        <div className="mt-6 pt-4 border-t border-border-subtle text-xs text-text-muted">
          Прототип использует моки (Mock Service Worker) для имитации бэкенда. Все данные —
          демонстрационные.
        </div>
      </Panel>
    </div>
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
