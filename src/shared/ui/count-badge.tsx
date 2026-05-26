import { cn } from '@/shared/lib/utils'

interface CountBadgeProps {
  value: number | string
  className?: string
}

/**
 * Count Badge — числовой счётчик. DS v4.0 §9.6.
 * Акцентный фон, белый текст.
 */
export function CountBadge({ value, className }: CountBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-sm bg-accent text-white text-[11px] font-semibold leading-none',
        className,
      )}
    >
      {value}
    </span>
  )
}
