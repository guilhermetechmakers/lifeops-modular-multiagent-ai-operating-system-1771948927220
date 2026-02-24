/**
 * CronjobListCard - Displays next run, last run outcome, status, quick actions.
 * Enable/Disable, Pause/Resume, Run Now, View History, Edit.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Play,
  Pause,
  PlayCircle,
  MoreVertical,
  History,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Cronjob, CronjobRun } from '@/types/cronjobs'

function formatNextRun(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  if (diff < 0) return 'Overdue'
  if (diff < 3600000) return `In ${Math.round(diff / 60000)}m`
  if (diff < 86400000) return `In ${Math.round(diff / 3600000)}h`
  if (diff < 86400000 * 7) return `In ${Math.round(diff / 86400000)}d`
  return d.toLocaleDateString()
}

function formatLastRun(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
  if (diff < 86400000 * 7) return `${Math.round(diff / 86400000)}d ago`
  return d.toLocaleDateString()
}

function getScheduleDisplay(schedule: string | { cron?: string; humanReadable?: string }): string {
  if (typeof schedule === 'string') return schedule
  return schedule?.humanReadable ?? schedule?.cron ?? '—'
}

function getStatusBadgeVariant(
  enabled: boolean,
  paused: boolean
): 'success' | 'warning' | 'secondary' {
  if (!enabled) return 'secondary'
  if (paused) return 'warning'
  return 'success'
}

function getLastRunIcon(status?: string) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-success" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />
    case 'running':
      return <Loader2 className="h-4 w-4 text-primary animate-pulse" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

export interface CronjobListCardProps {
  cronjob: Cronjob
  lastRun?: CronjobRun | null
  onRunNow?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onEnable?: (id: string) => void
  onDisable?: (id: string) => void
  isRunning?: boolean
}

export function CronjobListCard({
  cronjob,
  lastRun,
  onRunNow,
  onPause,
  onResume,
  onEnable,
  onDisable,
  isRunning,
}: CronjobListCardProps) {
  const statusLabel = cronjob.paused
    ? 'Paused'
    : cronjob.enabled
      ? 'Active'
      : 'Disabled'

  const scheduleStr = getScheduleDisplay(cronjob.schedule)
  const nextRunStr = formatNextRun(cronjob.nextRun)
  const lastRunStr = formatLastRun(lastRun?.startedAt ?? cronjob.lastRun)
  const lastRunStatus = lastRun?.status

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-card-hover hover:border-primary/30',
        'border border-border rounded-xl'
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              to={`/dashboard/cronjobs/${cronjob.id}`}
              className="font-semibold text-foreground hover:text-primary block truncate transition-colors"
            >
              {cronjob.name}
            </Link>
            <p className="text-sm text-muted-foreground mt-0.5">
              {cronjob.target?.name ?? cronjob.targetType} • {scheduleStr}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Next: {nextRunStr}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {getLastRunIcon(lastRunStatus)}
                Last: {lastRunStr}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={getStatusBadgeVariant(cronjob.enabled, cronjob.paused ?? false)}
              className="text-xs"
            >
              {statusLabel}
            </Badge>

            {cronjob.enabled && !cronjob.paused && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRunNow?.(cronjob.id)}
                disabled={isRunning}
                title="Run now"
                aria-label="Run now"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}

            {cronjob.enabled && !cronjob.paused && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onPause?.(cronjob.id)}
                title="Pause"
                aria-label="Pause"
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}

            {(!cronjob.enabled || cronjob.paused) && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => (cronjob.paused ? onResume?.(cronjob.id) : onEnable?.(cronjob.id))}
                title="Enable"
                aria-label="Enable"
              >
                <PlayCircle className="h-4 w-4" />
              </Button>
            )}

            {cronjob.enabled && !cronjob.paused && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDisable?.(cronjob.id)}
                title="Disable"
                aria-label="Disable"
              >
                <span className="text-xs font-medium">Off</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" title="More actions" aria-label="More actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/cronjobs/${cronjob.id}`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/runs?cronjobId=${cronjob.id}`}>
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
