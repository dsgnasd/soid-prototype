import { CheckCircle2, XCircle, Loader2, FileCheck, Archive, Edit3 } from 'lucide-react'
import { Chip, type ChipVariant } from './chip'
import type { ProcessStatus } from '@/shared/types'

const META: Record<ProcessStatus, { label: string; variant: ChipVariant; icon: typeof CheckCircle2 }> = {
  in_progress: { label: 'В работе', variant: 'info', icon: Loader2 },
  approved: { label: 'Согласован', variant: 'success', icon: CheckCircle2 },
  rejected: { label: 'Отклонён', variant: 'error', icon: XCircle },
  completed: { label: 'Завершён', variant: 'info', icon: FileCheck },
  withdrawn: { label: 'Отозван', variant: 'neutral', icon: Archive },
  draft: { label: 'Черновик', variant: 'neutral', icon: Edit3 },
}

export function ProcessStatusChip({ status }: { status: ProcessStatus }) {
  const m = META[status]
  const Icon = m.icon
  return (
    <Chip variant={m.variant} icon={<Icon size={12} />}>
      {m.label}
    </Chip>
  )
}
