import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? parseISO(value) : value
  if (!isValid(date)) return '—'
  return format(date, 'dd.MM.yyyy', { locale: ru })
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? parseISO(value) : value
  if (!isValid(date)) return '—'
  return format(date, 'dd.MM.yyyy HH:mm', { locale: ru })
}

export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? parseISO(value) : value
  if (!isValid(date)) return '—'
  return formatDistanceToNow(date, { locale: ru, addSuffix: true })
}
