/**
 * LeftSidebar - Collapsible navigation with sections.
 * Projects, Content, Finance, Health, Cronjobs, Approvals, Workflows, Admin.
 * Active state indicator bar; responsive collapse for small screens.
 */

import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  FileText,
  Wallet,
  Heart,
  Clock,
  CheckSquare,
  Workflow,
  Bot,
  Settings,
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  History,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SIDEBAR_SECTIONS = [
  {
    key: 'main',
    label: null,
    items: [{ to: '/dashboard/overview', icon: LayoutDashboard, label: 'Overview' }],
  },
  {
    key: 'modules',
    label: 'Modules',
    items: [
      { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
      { to: '/dashboard/content', icon: FileText, label: 'Content' },
      { to: '/dashboard/finance', icon: Wallet, label: 'Finance' },
      { to: '/dashboard/health', icon: Heart, label: 'Health' },
    ],
  },
  {
    key: 'automation',
    label: 'Automation',
    items: [
      { to: '/dashboard/cronjobs', icon: Clock, label: 'Cronjobs' },
      { to: '/dashboard/approvals', icon: CheckSquare, label: 'Approvals' },
      { to: '/dashboard/runs', icon: History, label: 'Run History' },
      { to: '/dashboard/agents', icon: Bot, label: 'Agents' },
      { to: '/dashboard/workflows', icon: Workflow, label: 'Workflows' },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    items: [
      { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
      { to: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
      { to: '/help', icon: HelpCircle, label: 'Help' },
    ],
  },
]

const STORAGE_KEY_SECTIONS = 'lifeops_sidebar_sections'

function getStoredSections(): Record<string, boolean> {
  try {
    const s = localStorage.getItem(STORAGE_KEY_SECTIONS)
    if (s) return JSON.parse(s) as Record<string, boolean>
  } catch {
    // ignore
  }
  return {}
}

function setStoredSections(v: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(v))
  } catch {
    // ignore
  }
}

interface LeftSidebarProps {
  collapsed: boolean
  onCollapsedChange: (v: boolean) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function LeftSidebar({
  collapsed,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
}: LeftSidebarProps) {
  const navigate = useNavigate()
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>(getStoredSections)

  useEffect(() => {
    setStoredSections(sectionOpen)
  }, [sectionOpen])

  const toggleSection = (key: string) => {
    setSectionOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const NavItem = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string
    icon: React.ComponentType<{ className?: string }>
    label: string
  }) => (
    <NavLink
      to={to}
      onClick={onMobileClose}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isActive
            ? 'bg-primary/15 text-primary border-l-2 border-l-primary -ml-[2px] pl-[14px]'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )

  const content = (
    <nav className="flex-1 overflow-y-auto p-3 space-y-4">
      {SIDEBAR_SECTIONS.map((section) => {
        if (section.label === null) {
          return (
            <div key={section.key} className="space-y-1">
              {(section.items ?? []).map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          )
        }

        const isOpen = sectionOpen[section.key] ?? true

        return (
          <div key={section.key} className="space-y-1">
            {collapsed ? (
              (section.items ?? []).map((item) => <NavItem key={item.to} {...item} />)
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {section.label}
                </button>
                {isOpen && (
                  <div className="space-y-1">
                    {(section.items ?? []).map((item) => (
                      <NavItem key={item.to} {...item} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-lg font-bold text-foreground hover:text-primary transition-colors"
            >
              LifeOps
            </button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn('h-5 w-5 transition-transform duration-200', collapsed && 'rotate-180')}
            />
          </Button>
        </div>
        {content}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="text-lg font-bold">LifeOps</span>
          <Button variant="ghost" size="icon" onClick={onMobileClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {content}
      </aside>
    </>
  )
}
