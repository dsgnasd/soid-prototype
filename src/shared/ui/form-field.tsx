import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface FormFieldProps {
  label: string
  required?: boolean
  hint?: ReactNode
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({ label, required, hint, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-text-secondary">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-error-text">{error}</p>}
      {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function TextInput({ error, className, ...rest }: TextInputProps) {
  return (
    <input
      className={cn(
        'w-full h-10 px-3 rounded-md border bg-bg-subtle focus:bg-bg-surface text-text-primary placeholder-text-muted transition-colors',
        error
          ? 'border-error focus:border-error'
          : 'border-border-default focus:border-accent hover:border-border-strong',
        className,
      )}
      {...rest}
    />
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function TextArea({ error, className, rows = 3, ...rest }: TextAreaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'w-full px-3 py-2 rounded-md border bg-bg-subtle focus:bg-bg-surface text-text-primary placeholder-text-muted transition-colors resize-y',
        error
          ? 'border-error focus:border-error'
          : 'border-border-default focus:border-accent hover:border-border-strong',
        className,
      )}
      {...rest}
    />
  )
}
