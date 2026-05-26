import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/client'
import type { ExternalSystemKey, Integration, MigrationLogEntry, MigrationPackage, MigrationStatus } from '@/shared/types'

export interface MigrationFilter {
  status?: MigrationStatus | ''
  source?: ExternalSystemKey | ''
  target?: ExternalSystemKey | ''
  userId?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

interface MigrationsListResponse {
  items: MigrationPackage[]
  total: number
  page: number
  pageSize: number
}

export function useMigrations(filter: MigrationFilter) {
  return useQuery({
    queryKey: ['migrations', filter],
    queryFn: () =>
      apiFetch<MigrationsListResponse>('/migrations', {
        params: filter as Record<string, string | number | undefined>,
      }),
    placeholderData: (prev) => prev,
  })
}

export function useMigrationDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['migration', id],
    queryFn: () => apiFetch<MigrationPackage>(`/migrations/${id}`),
    enabled: Boolean(id),
  })
}

export function useMigrationLogs(id: string | undefined) {
  return useQuery({
    queryKey: ['migration-logs', id],
    queryFn: () => apiFetch<MigrationLogEntry[]>(`/migrations/${id}/logs`),
    enabled: Boolean(id),
  })
}

export function useExternalSystems() {
  return useQuery({
    queryKey: ['external-systems'],
    queryFn: () => apiFetch<Integration[]>('/external-systems'),
  })
}

export function useCreateMigration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { source: ExternalSystemKey; target: ExternalSystemKey; designation?: string; name?: string }) =>
      apiFetch<MigrationPackage>('/migrations', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['migrations'] }),
  })
}
