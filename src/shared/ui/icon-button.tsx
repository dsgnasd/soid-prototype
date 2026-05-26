import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string
  badge?: number
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, badge, className, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative w-11 h-11 grid place-items-center rounded-md text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors',
        className,
      )}
      {...rest}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-semibold leading-none grid place-items-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  ),
)
IconButton.displayName = 'IconButton'
