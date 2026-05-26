import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BellOff, CheckCheck, AlertTriangle, ShieldAlert, Inbox, ServerCrash, ArrowUpRightFromSquare } from 'lucide-react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useNotifications, useMarkAllRead, useMarkRead } from './api'
import { formatRelative } from '@/shared/lib/format'
import { IconButton } from '@/shared/ui/icon-button'
import { EmptyState } from '@/shared/ui/empty-state'
import { cn } from '@/shared/lib/utils'
import type { Notification, NotificationType } from '@/shared/types'

const TYPE_ICON: Record<NotificationType, typeof Inbox> = {
  task_assigned: Inbox,
  task_overdue: AlertTriangle,
  process_status_changed: CheckCheck,
  migration_completed: CheckCheck,
  migration_failed: ServerCrash,
  integration_down: ServerCrash,
  security_anomaly: ShieldAlert,
  escalation_received: ArrowUpRightFromSquare,
  escalation_resolved: ArrowUpRightFromSquare,
}

const SEVERITY_ICON_CLASS: Record<Notification['severity'], string> = {
  info: 'bg-info-bg text-info-text',
  warning: 'bg-warning-bg text-warning-text',
  critical: 'bg-error-bg text-error-text',
}

function groupNotifications(items: Notification[]) {
  const newer: Notification[] = []
  const today: Notification[] = []
  const earlier: Notification[] = []
  const now = new Date()
  items.forEach((n) => {
    const d = parseISO(n.createdAt)
    const days = differenceInCalendarDays(now, d)
    if (!n.readAt) newer.push(n)
    else if (days === 0) today.push(n)
    else earlier.push(n)
  })
  return { newer, today, earlier }
}

export function NotificationsPanel() {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = useMemo(
    () => (data ?? []).filter((n) => !n.readAt).length,
    [data],
  )

  // Закрытие по клику вне панели
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const groups = groupNotifications(data ?? [])

  return (
    <div className="relative" ref={ref}>
      <IconButton
        icon={<Bell size={20} />}
        label="Уведомления"
        badge={unreadCount}
        onClick={() => setOpen((v) => !v)}
      />

      {open && (
        <div className="absolute top-full right-0 mt-2 w-[380px] bg-bg-surface border border-border-default rounded-xl shadow-lg z-[60] overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary">Уведомления</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50"
              >
                Прочитать все
              </button>
            )}
          </header>

          <div className="max-h-[480px] overflow-y-auto scrollbar-thin">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-md bg-bg-hover animate-pulse" />
                ))}
              </div>
            ) : (data ?? []).length === 0 ? (
              <EmptyState
                icon={<BellOff size={40} className="text-text-muted" />}
                title="Нет уведомлений"
                description="Здесь появятся события по вашим задачам и процессам."
              />
            ) : (
              <>
                <Group title="Новые" items={groups.newer} onClick={(n) => onItemClick(n, () => setOpen(false), markRead.mutate)} />
                <Group title="Сегодня" items={groups.today} onClick={(n) => onItemClick(n, () => setOpen(false), markRead.mutate)} />
                <Group title="Раньше" items={groups.earlier} onClick={(n) => onItemClick(n, () => setOpen(false), markRead.mutate)} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function onItemClick(n: Notification, close: () => void, markRead: (id: string) => void) {
  if (!n.readAt) markRead(n.id)
  close()
}

function Group({
  title,
  items,
  onClick,
}: {
  title: string
  items: Notification[]
  onClick: (n: Notification) => void
}) {
  if (items.length === 0) return null
  return (
    <section>
      <div className="px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-text-muted bg-bg-subtle">
        {title}
      </div>
      <ul>
        {items.map((n) => {
          const Icon = TYPE_ICON[n.type] ?? Inbox
          const content = (
            <div
              className={cn(
                'flex items-start gap-3 px-4 py-3 hover:bg-bg-subtle transition-colors',
                !n.readAt && 'bg-accent-subtle/30',
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-md grid place-items-center shrink-0',
                  SEVERITY_ICON_CLASS[n.severity],
                )}
              >
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text-primary">{n.title}</div>
                <div className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</div>
                <div className="text-[11px] text-text-muted mt-1">{formatRelative(n.createdAt)}</div>
              </div>
              {!n.readAt && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />}
            </div>
          )
          return (
            <li key={n.id}>
              {n.link ? (
                <Link to={n.link} className="block" onClick={() => onClick(n)}>
                  {content}
                </Link>
              ) : (
                <button type="button" className="w-full text-left" onClick={() => onClick(n)}>
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
