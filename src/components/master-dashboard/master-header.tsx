/**
 * MasterHeader - Top navigation with global search, user avatar, quick-create actions.
 * Triggers global search modal and new item modals; accessible keyboard shortcuts.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  Clock,
  Workflow,
  Bot,
  Menu,
  User,
  Settings,
  LogOut,
  Bell,
  FolderKanban,
} from 'lucide-react'
import { GlobalSearchPanel } from './global-search-panel'
import { cn } from '@/lib/utils'

interface MasterHeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
  className?: string
}

export function MasterHeader({
  onMenuClick,
  showMenuButton = false,
  className,
}: MasterHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-8',
          className
        )}
      >
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex-1 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(
              'relative flex-1 max-w-md flex items-center gap-3 rounded-lg border border-input bg-secondary/50 px-4 py-2.5',
              'text-left text-sm text-muted-foreground hover:bg-secondary/80 hover:border-border transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
            aria-label="Open global search"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>Search...</span>
            <kbd className="hidden sm:inline-flex ml-auto h-5 items-center gap-1 rounded border border-border bg-muted/50 px-1.5 font-mono text-xs">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Notifications"
              onClick={() => navigate('/dashboard/overview')}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Quick Create</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/dashboard/projects')}>
                  <FolderKanban className="h-4 w-4" />
                  New Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/cronjobs')}>
                  <Clock className="h-4 w-4" />
                  New Cronjob
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/workflows')}>
                  <Workflow className="h-4 w-4" />
                  New Workflow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/agents')}>
                  <Bot className="h-4 w-4" />
                  New Agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/login')}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <GlobalSearchPanel open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
