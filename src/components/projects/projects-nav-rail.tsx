/**
 * ProjectsNavRail - Left navigation for Projects Dashboard subsections.
 * Collapsible rail with Roadmaps, Tickets, PRs/Releases, CI Triggers, Templates, Integrations.
 */

import { useState, useEffect } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import {
  Map,
  LayoutGrid,
  GitPullRequest,
  Zap,
  FileCode,
  Plug,
  ChevronLeft,
  Package,
  FolderKanban,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'lifeops_projects_nav_collapsed'

const NAV_ITEMS_BASE: { to: string; icon: React.ComponentType<{ className?: string }>; label: string; exact?: boolean }[] = [
  { to: '', icon: FolderKanban, label: 'Overview', exact: true },
  { to: 'roadmaps', icon: Map, label: 'Roadmaps' },
  { to: 'tickets', icon: LayoutGrid, label: 'Tickets' },
  { to: 'prs-releases', icon: GitPullRequest, label: 'PRs & Releases' },
  { to: 'ci-triggers', icon: Zap, label: 'CI Triggers' },
  { to: 'templates', icon: FileCode, label: 'Templates' },
  { to: 'integrations', icon: Plug, label: 'Integrations' },
]

const NAV_ITEM_ARTIFACTS = { to: 'artifacts', icon: Package, label: 'Artifacts', exact: false as const }

function getStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

interface ProjectsNavRailProps {
  projectId?: string | null
}

export function ProjectsNavRail({ projectId: propProjectId }: ProjectsNavRailProps) {
  const params = useParams<{ id?: string }>()
  const projectId = propProjectId ?? params.id ?? null
  const [collapsed, setCollapsed] = useState(getStoredCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // ignore
    }
  }, [collapsed])

  const basePath = projectId ? `/dashboard/projects/${projectId}` : '/dashboard/projects'

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
            Projects
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
        {[...(NAV_ITEMS_BASE ?? []), ...(projectId ? [NAV_ITEM_ARTIFACTS] : [])].map((item) => {
          const to = item.to ? `${basePath}/${item.to}` : basePath

          return (
            <NavLink
              key={item.to || 'overview'}
              to={to}
              end={'exact' in item ? (item.exact ?? false) : false}
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
