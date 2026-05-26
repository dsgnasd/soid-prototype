import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/client'
import type { Notification } from '@/shared/types'

const QK = ['notifications'] as const

export function useNotifications() {
  return useQuery({
    queryKey: QK,
    queryFn: () => apiFetch<Notification[]>('/notifications'),
    refetchInterval: 60_000,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch<void>('/notifications/read-all', { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}
