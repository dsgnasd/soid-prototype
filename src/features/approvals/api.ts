import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/client'
import type { ApprovalProcess, ApprovalTask, ApprovalTemplate, ProcessStatus, TaskStatus } from '@/shared/types'

export function useApprovalTemplates() {
  return useQuery({
    queryKey: ['approval-templates'],
    queryFn: () =>
      apiFetch<ApprovalTemplate[]>('/approval-templates', { params: { status: 'published' } }),
  })
}

export function useMyProcesses(filter: { status?: ProcessStatus | '' } = {}) {
  return useQuery({
    queryKey: ['processes', 'my', filter],
    queryFn: () =>
      apiFetch<ApprovalProcess[]>('/processes', {
        params: { initiatorId: 'u-operator', status: filter.status || undefined },
      }),
  })
}

export function useProcessDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['process', id],
    queryFn: () => apiFetch<ApprovalProcess>(`/processes/${id}`),
    enabled: Boolean(id),
  })
}

export function useStartProcess() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { templateId: string; name: string; description?: string; deadline?: string }) =>
      apiFetch<ApprovalProcess>('/processes', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['processes'] }),
  })
}

export function useMyTasks(filter: { status?: TaskStatus | '' } = {}) {
  return useQuery({
    queryKey: ['tasks', 'my', filter],
    queryFn: () =>
      apiFetch<ApprovalTask[]>('/tasks', {
        params: { assigneeId: 'u-operator', status: filter.status || undefined },
      }),
  })
}

export function useTaskDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => apiFetch<ApprovalTask>(`/tasks/${id}`),
    enabled: Boolean(id),
  })
}

export function useDecideTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      decision,
      comment,
    }: {
      id: string
      decision: 'approve' | 'reject' | 'return'
      comment?: string
    }) =>
      apiFetch<ApprovalTask>(`/tasks/${id}/decide`, {
        method: 'POST',
        body: { decision, comment },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['processes'] })
    },
  })
}
