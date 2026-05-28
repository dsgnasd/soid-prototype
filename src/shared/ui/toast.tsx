import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration: number
}

interface ToastStore {
  toasts: ToastItem[]
  push: (t: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

function show(variant: ToastVariant, title: string, description?: string, duration = 4000) {
  useToastStore.getState().push({ variant, title, description, duration })
}

/** Императивный API: toast.success('Сохранено') */
export const toast = {
  success: (title: string, description?: string) => show('success', title, description),
  error: (title: string, description?: string) => show('error', title, description, 6000),
  info: (title: string, description?: string) => show('info', title, description),
  warning: (title: string, description?: string) => show('warning', title, description),
}

const VARIANT: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconClass: string }
> = {
  success: { icon: CheckCircle2, iconClass: 'text-success' },
  error: { icon: XCircle, iconClass: 'text-error' },
  info: { icon: Info, iconClass: 'text-info' },
  warning: { icon: AlertTriangle, iconClass: 'text-warning' },
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>,
    document.body,
  )
}

function ToastCard({ toast: t, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const { icon: Icon, iconClass } = VARIANT[t.variant]

  useEffect(() => {
    const timer = setTimeout(onDismiss, t.duration)
    return () => clearTimeout(timer)
  }, [t.duration, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border border-border-default bg-bg-surface shadow-lg"
    >
      <Icon size={18} className={cn('shrink-0 mt-0.5', iconClass)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary">{t.title}</div>
        {t.description && (
          <div className="text-xs text-text-muted mt-0.5">{t.description}</div>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Закрыть"
        className="shrink-0 w-6 h-6 grid place-items-center rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover"
      >
        <X size={14} />
      </button>
    </div>
  )
}
