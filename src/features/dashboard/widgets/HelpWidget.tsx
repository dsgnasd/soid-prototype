import { HelpCircle, Phone, BookOpen } from 'lucide-react'
import { Panel } from '@/shared/ui/panel'

const ITEMS = [
  { icon: HelpCircle, label: 'Как запустить миграцию', href: '#' },
  { icon: BookOpen, label: 'Шаблоны согласования', href: '#' },
  { icon: Phone, label: 'Контакт техподдержки', href: 'mailto:support@soid.demo' },
]

export function HelpWidget() {
  return (
    <Panel title="Справка">
      <ul className="space-y-1.5">
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.label}>
              <a
                href={item.href}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-bg-hover text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <Icon size={16} className="text-text-muted" />
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
