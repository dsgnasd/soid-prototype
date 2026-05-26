import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/client'
import type { DashboardSummary, RoleId } from '@/shared/types'

export function useDashboard(role: RoleId) {
  return useQuery({
    queryKey: ['dashboard', role],
    queryFn: () => apiFetch<DashboardSummary>('/dashboard', { params: { role } }),
  })
}
