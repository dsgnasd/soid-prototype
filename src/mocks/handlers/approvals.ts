import { http, HttpResponse, delay } from 'msw'
import templates from '../fixtures/approval-templates.json'
import processes from '../fixtures/processes.json'
import tasks from '../fixtures/tasks.json'
import type { ApprovalProcess, ApprovalTask, ApprovalTemplate, ProcessStatus } from '@/shared/types'

const templatesData = templates as ApprovalTemplate[]
let processesData = processes as ApprovalProcess[]
let tasksData = tasks as ApprovalTask[]

interface StartProcessRequest {
  templateId: string
  name: string
  description?: string
  deadline?: string
}

interface DecideTaskRequest {
  decision: 'approve' | 'reject' | 'return'
  comment?: string
}

function applyDecision(task: ApprovalTask, decision: DecideTaskRequest['decision']): ApprovalTask {
  const map = { approve: 'approved', reject: 'rejected', return: 'returned' } as const
  return { ...task, status: map[decision], decidedAt: new Date().toISOString() }
}

function updateProcessAfterDecision(processId: string, decision: DecideTaskRequest['decision'], comment?: string) {
  processesData = processesData.map((p) => {
    if (p.id !== processId) return p
    const next: ApprovalProcess = { ...p }
    next.history = [
      ...p.history,
      {
        id: `h-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: 'u-operator',
        action: decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'returned',
        stageOrder: p.currentStageOrder,
        comment,
      },
    ]
    if (decision === 'reject') {
      next.status = 'rejected'
      next.finishedAt = new Date().toISOString()
    } else if (decision === 'approve') {
      // Если был последний этап — процесс завершается
      // (для прототипа упрощённо)
      const totalStages = templatesData.find((t) => t.id === p.templateId)?.stages.length ?? 1
      if (p.currentStageOrder >= totalStages) {
        next.status = 'approved'
        next.finishedAt = new Date().toISOString()
      } else {
        next.currentStageOrder = p.currentStageOrder + 1
      }
    } else if (decision === 'return') {
      next.currentStageOrder = Math.max(1, p.currentStageOrder - 1)
    }
    return next
  })
}

export const approvalsHandlers = [
  http.get('/api/approval-templates', async ({ request }) => {
    await delay(180)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const data = status ? templatesData.filter((t) => t.status === status) : templatesData
    return HttpResponse.json(data)
  }),

  http.get('/api/processes', async ({ request }) => {
    await delay(220)
    const url = new URL(request.url)
    const initiatorId = url.searchParams.get('initiatorId')
    const status = url.searchParams.get('status')
    let data = [...processesData]
    if (initiatorId) data = data.filter((p) => p.initiatorId === initiatorId)
    if (status) data = data.filter((p) => p.status === (status as ProcessStatus))
    return HttpResponse.json(data)
  }),

  http.get('/api/processes/:id', async ({ params }) => {
    await delay(180)
    const p = processesData.find((x) => x.id === params.id)
    if (!p) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Процесс не найден' }, { status: 404 })
    return HttpResponse.json(p)
  }),

  http.post('/api/processes', async ({ request }) => {
    await delay(380)
    const body = (await request.json()) as StartProcessRequest
    const template = templatesData.find((t) => t.id === body.templateId)
    if (!template) {
      return HttpResponse.json({ code: 'INVALID_TEMPLATE', message: 'Шаблон не найден' }, { status: 400 })
    }
    const id = `p-${Math.floor(Math.random() * 9000) + 1000}`
    const newProcess: ApprovalProcess = {
      id,
      name: body.name,
      templateId: body.templateId,
      templateName: template.name,
      initiatorId: 'u-operator',
      status: 'in_progress',
      currentStageOrder: 1,
      startedAt: new Date().toISOString(),
      deadline: body.deadline,
      documents: [],
      history: [
        { id: `h-${Date.now()}`, timestamp: new Date().toISOString(), actorId: 'u-operator', action: 'started' },
      ],
      participants: [{ userId: 'u-operator', stageOrder: 1, status: 'pending' }],
    }
    processesData = [newProcess, ...processesData]
    return HttpResponse.json(newProcess, { status: 201 })
  }),

  http.get('/api/tasks', async ({ request }) => {
    await delay(220)
    const url = new URL(request.url)
    const assigneeId = url.searchParams.get('assigneeId')
    const status = url.searchParams.get('status')
    let data = [...tasksData]
    if (assigneeId) data = data.filter((t) => t.assigneeId === assigneeId)
    if (status) data = data.filter((t) => t.status === status)
    return HttpResponse.json(data)
  }),

  http.get('/api/tasks/:id', async ({ params }) => {
    await delay(180)
    const task = tasksData.find((t) => t.id === params.id)
    if (!task) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Задача не найдена' }, { status: 404 })
    return HttpResponse.json(task)
  }),

  http.post('/api/tasks/:id/decide', async ({ params, request }) => {
    await delay(320)
    const body = (await request.json()) as DecideTaskRequest
    if ((body.decision === 'reject' || body.decision === 'return') && (!body.comment || body.comment.length < 10)) {
      return HttpResponse.json(
        { code: 'COMMENT_REQUIRED', message: 'Комментарий обязателен (минимум 10 символов)' },
        { status: 400 },
      )
    }
    const task = tasksData.find((t) => t.id === params.id)
    if (!task) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Задача не найдена' }, { status: 404 })
    const updated = applyDecision(task, body.decision)
    tasksData = tasksData.map((t) => (t.id === task.id ? updated : t))
    updateProcessAfterDecision(task.processId, body.decision, body.comment)
    return HttpResponse.json(updated)
  }),
]
