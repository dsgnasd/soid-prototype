import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white border-transparent hover:bg-accent-hover active:bg-accent-pressed disabled:bg-bg-disabled disabled:text-text-disabled',
  secondary:
    'bg-bg-surface text-text-primary border-border-default hover:bg-bg-hover hover:border-border-strong disabled:bg-bg-disabled disabled:text-text-disabled',
  ghost:
    'bg-transparent text-text-primary border-transparent hover:bg-bg-hover disabled:text-text-disabled',
  danger:
    'bg-error text-white border-transparent hover:opacity-90 disabled:bg-bg-disabled disabled:text-text-disabled',
  link:
    'bg-transparent text-accent border-transparent px-0 hover:text-accent-hover hover:underline disabled:text-text-disabled',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[13px] gap-1.5 rounded-sm',
  md: 'h-11 px-5 text-sm gap-2 rounded-md',
  lg: 'h-12 px-6 text-base gap-2 rounded-md',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconRight, loading, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium border transition-colors whitespace-nowrap disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        loading && 'opacity-80',
        className,
      )}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children && <span className="truncate">{children}</span>}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  ),
)
Button.displayName = 'Button'
