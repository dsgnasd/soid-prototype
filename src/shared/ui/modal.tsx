import { useEffect, useId, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlay?: boolean
  hideClose?: boolean
}

const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

/**
 * Универсальный Modal с overlay.
 * Закрытие по Esc и клику на overlay. Блокирует скролл body.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  hideClose,
}: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative w-full bg-bg-surface border border-border-default rounded-2xl shadow-lg flex flex-col max-h-[90vh]',
          SIZE_CLASS[size],
        )}
      >
        <header className="flex items-start gap-3 px-5 pt-5 pb-3 border-b border-border-subtle">
          <div className="flex-1 min-w-0">
            <h2
              id={titleId}
              className="text-base font-semibold tracking-tight text-text-primary"
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs text-text-muted mt-1">{description}</p>
            )}
          </div>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="w-8 h-8 grid place-items-center rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-subtle">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
