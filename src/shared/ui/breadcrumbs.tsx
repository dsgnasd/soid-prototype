import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Хлебные крошки" className="text-xs text-text-muted">
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <Fragment key={`${item.label}-${idx}`}>
              <li className={isLast ? 'text-text-secondary font-medium' : ''}>
                {item.to && !isLast ? (
                  <Link to={item.to} className="hover:text-text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
              {!isLast && <ChevronRight size={12} className="opacity-60" />}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
