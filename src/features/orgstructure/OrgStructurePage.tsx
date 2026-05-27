import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Plus, MoreVertical, Edit3, Trash2, FolderPlus } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/empty-state'
import { Modal } from '@/shared/ui/modal'
import { FormField, TextInput, TextArea } from '@/shared/ui/form-field'
import { apiFetch, ApiError } from '@/shared/api/client'
import { routes } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import type { OrgUnit } from '@/shared/types'

interface TreeNode extends OrgUnit {
  children: TreeNode[]
}

function buildTree(units: OrgUnit[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  units.forEach((u) => map.set(u.id, { ...u, children: [] }))
  const roots: TreeNode[] = []
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

const QK = ['orgstructure'] as const

type DialogState =
  | null
  | { mode: 'create-root' }
  | { mode: 'create-child'; parent: OrgUnit }
  | { mode: 'edit'; node: OrgUnit }
  | { mode: 'delete'; node: OrgUnit }

export function OrgStructurePage() {
  const { data: units = [], isLoading } = useQuery({
    queryKey: QK,
    queryFn: () => apiFetch<OrgUnit[]>('/orgstructure'),
  })
  const tree = useMemo(() => buildTree(units), [units])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [dialog, setDialog] = useState<DialogState>(null)

  // Раскрыть все корневые при первом получении дерева
  useEffect(() => {
    if (tree.length > 0 && expanded.size === 0) {
      setExpanded(new Set(tree.map((n) => n.id)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree.length])

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Дашборд', to: routes.dashboard },
          { label: 'Администрирование' },
          { label: 'Оргструктура' },
        ]}
        title="Оргструктура"
        subtitle="Подразделения предприятия и их иерархия"
        actions={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setDialog({ mode: 'create-root' })}>
            Добавить подразделение
          </Button>
        }
      />

      <Panel>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : (
          <ul>
            {tree.map((node) => (
              <TreeRow
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                onToggle={toggle}
                onAction={(action) =>
                  setDialog(
                    action === 'add-child'
                      ? { mode: 'create-child', parent: node }
                      : action === 'edit'
                        ? { mode: 'edit', node }
                        : { mode: 'delete', node },
                  )
                }
              />
            ))}
          </ul>
        )}
      </Panel>

      {dialog?.mode === 'create-root' && (
        <OrgUnitFormModal parent={null} onClose={() => setDialog(null)} />
      )}
      {dialog?.mode === 'create-child' && (
        <OrgUnitFormModal parent={dialog.parent} onClose={() => setDialog(null)} />
      )}
      {dialog?.mode === 'edit' && (
        <OrgUnitFormModal node={dialog.node} onClose={() => setDialog(null)} />
      )}
      {dialog?.mode === 'delete' && (
        <DeleteConfirmModal node={dialog.node} onClose={() => setDialog(null)} />
      )}
    </div>
  )
}

type ActionType = 'add-child' | 'edit' | 'delete'

function TreeRow({
  node,
  depth,
  expanded,
  onToggle,
  onAction,
}: {
  node: TreeNode
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
  onAction: (action: ActionType, node: OrgUnit) => void
}) {
  const hasChildren = node.children.length > 0
  const isOpen = expanded.has(node.id)
  return (
    <li>
      <div
        className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-bg-subtle transition-colors"
        style={{ paddingLeft: depth * 24 + 8 }}
      >
        <button
          type="button"
          onClick={() => hasChildren && onToggle(node.id)}
          aria-label={isOpen ? 'Свернуть' : 'Развернуть'}
          className={cn(
            'w-5 h-5 grid place-items-center rounded text-text-muted',
            hasChildren ? 'hover:text-text-primary hover:bg-bg-hover' : 'invisible',
          )}
        >
          {hasChildren && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-primary">{node.name}</div>
          {node.description && (
            <div className="text-xs text-text-muted truncate">{node.description}</div>
          )}
        </div>
        <NodeMenu node={node} onAction={onAction} />
      </div>
      {isOpen && hasChildren && (
        <ul>
          {node.children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onAction={onAction}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function NodeMenu({
  node,
  onAction,
}: {
  node: OrgUnit
  onAction: (action: ActionType, node: OrgUnit) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const items: { label: string; icon: typeof Edit3; action: ActionType; destructive?: boolean }[] = [
    { label: 'Добавить дочернее', icon: FolderPlus, action: 'add-child' },
    { label: 'Редактировать', icon: Edit3, action: 'edit' },
    { label: 'Удалить', icon: Trash2, action: 'delete', destructive: true },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Действия"
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute z-30 right-0 top-full mt-1 w-52 bg-bg-surface border border-border-default rounded-md shadow-md py-1"
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.action}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onAction(item.action, node)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                    item.destructive
                      ? 'text-error-text hover:bg-error-bg'
                      : 'text-text-primary hover:bg-bg-hover',
                  )}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Form modal (create root/child + edit)
// ----------------------------------------------------------------------------

interface FormModalProps {
  parent?: OrgUnit | null
  node?: OrgUnit
  onClose: () => void
}

function OrgUnitFormModal({ parent, node, onClose }: FormModalProps) {
  const qc = useQueryClient()
  const isEdit = Boolean(node)
  const [name, setName] = useState(node?.name ?? '')
  const [description, setDescription] = useState(node?.description ?? '')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<OrgUnit>('/orgstructure', {
        method: 'POST',
        body: { name, description: description || undefined, parentId: parent?.id ?? null },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK })
      onClose()
    },
  })

  // Edit endpoint не реализован в MSW — для прототипа симулируем оптимистично.
  // Здесь оставлен как заглушка для будущей реализации.
  const editMutation = useMutation({
    mutationFn: async () => {
      // Симуляция: эмулируем сервер локально
      await new Promise((r) => setTimeout(r, 250))
      return { ...node!, name, description }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError('Минимум 2 символа')
      return
    }
    setError(null)
    if (isEdit) editMutation.mutate()
    else createMutation.mutate()
  }

  const title = isEdit
    ? `Редактирование: ${node?.name}`
    : parent
      ? `Добавить дочернее в «${parent.name}»`
      : 'Добавить подразделение'

  const isPending = createMutation.isPending || editMutation.isPending

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Название" required error={error ?? undefined}>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="МКЦ (маркетинг центр)"
            autoFocus
            error={Boolean(error)}
          />
        </FormField>
        <FormField label="Краткое описание">
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опционально"
            rows={2}
          />
        </FormField>
        {parent && (
          <div className="rounded-md bg-bg-subtle border border-border-subtle p-3 text-xs">
            <div className="text-text-muted mb-0.5">Родительское подразделение</div>
            <div className="text-text-primary font-medium">{parent.name}</div>
          </div>
        )}
      </form>
    </Modal>
  )
}

// ----------------------------------------------------------------------------
// Delete confirm modal
// ----------------------------------------------------------------------------

function DeleteConfirmModal({ node, onClose }: { node: OrgUnit; onClose: () => void }) {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch<void>(`/orgstructure/${node.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK })
      onClose()
    },
    onError: (err: Error) => {
      setError(err instanceof ApiError ? err.message : 'Ошибка удаления')
    },
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={`Удалить «${node.name}»?`}
      description="Операция необратима. Если в подразделении есть пользователи или дочерние узлы — удаление будет заблокировано."
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Удаление…' : 'Удалить'}
          </Button>
        </>
      }
    >
      {error && (
        <div className="text-sm text-error-text bg-error-bg rounded-md p-3 mb-3">{error}</div>
      )}
      <p className="text-sm text-text-secondary">
        Подтвердите удаление подразделения <span className="font-semibold">{node.name}</span>.
      </p>
    </Modal>
  )
}
