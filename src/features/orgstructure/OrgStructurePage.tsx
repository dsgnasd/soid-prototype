import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Plus, MoreVertical } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Panel } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/empty-state'
import { apiFetch } from '@/shared/api/client'
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

export function OrgStructurePage() {
  const { data: units = [], isLoading } = useQuery({
    queryKey: ['orgstructure'],
    queryFn: () => apiFetch<OrgUnit[]>('/orgstructure'),
  })
  const tree = useMemo(() => buildTree(units), [units])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

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
          <Button size="sm" icon={<Plus size={14} />}>
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
              />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

function TreeRow({
  node,
  depth,
  expanded,
  onToggle,
}: {
  node: TreeNode
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
}) {
  const hasChildren = node.children.length > 0
  const isOpen = expanded.has(node.id)
  return (
    <li>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-2 rounded-md hover:bg-bg-subtle transition-colors',
        )}
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
        <button
          type="button"
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover"
          aria-label="Действия"
        >
          <MoreVertical size={14} />
        </button>
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
            />
          ))}
        </ul>
      )}
    </li>
  )
}
