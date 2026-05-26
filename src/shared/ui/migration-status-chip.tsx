import { CheckCircle2, XCircle, RefreshCcw, AlertCircle, Loader2, Pause } from 'lucide-react'
import { Chip, type ChipVariant } from './chip'
import type { MigrationStatus } from '@/shared/types'

const META: Record<MigrationStatus, { label: string; variant: ChipVariant; icon: typeof CheckCircle2 }> = {
  created: { label: 'Создан', variant: 'success', icon: CheckCircle2 },
  updated: { label: 'Обновлён', variant: 'info', icon: RefreshCcw },
  in_progress: { label: 'В работе', variant: 'info', icon: Loader2 },
  error: { label: 'Ошибка', variant: 'error', icon: XCircle },
  partial: { label: 'Частично', variant: 'warning', icon: AlertCircle },
  stopped: { label: 'Остановлена', variant: 'neutral', icon: Pause },
}

export function MigrationStatusChip({ status }: { status: MigrationStatus }) {
  const m = META[status]
  const Icon = m.icon
  return (
    <Chip variant={m.variant} icon={<Icon size={12} />}>
      {m.label}
    </Chip>
  )
}
