/**
 * FinanceNavRail - Left navigation for Finance Dashboard subsections.
 */

import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutGrid, Plug, ChevronLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'lifeops_finance_nav_collapsed'

const NAV_ITEMS: { to: string; icon: React.ComponentType<{ className?: string }>; label: string; end?: boolean }[] = [
  { to: '', icon: LayoutGrid, label: 'Overview', end: true },
  { to: 'transactions-reconciliation', icon: FileText, label: 'Transactions & Reconciliation', end: true },
  { to: 'integrations', icon: Plug, label: 'Integrations', end: true },
]

function getStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function FinanceNavRail() {
  const [collapsed, setCollapsed] = useState(getStoredCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // ignore
    }
  }, [collapsed])

  const basePath = '/dashboard/finance'

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card/50 transition-all duration-300 shrink-0',
        collapsed ? 'w-[56px]' : 'w-52'
      )}
    >
      <div className="flex h-12 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Finance
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand nav' : 'Collapse nav'}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')}
          />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {(NAV_ITEMS ?? []).map((item) => {
          const to = item.to ? `${basePath}/${item.to}` : basePath
          return (
            <NavLink
              key={item.to || 'overview'}
              to={to}
              end={item.end ?? false}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary/15 text-primary border-l-2 border-l-primary -ml-[2px] pl-[14px]'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
