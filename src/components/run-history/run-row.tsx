/**
 * RunRow - Displays run summary with status badge, duration, start time, owner, quick actions.
 */

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Clock, GitBranch, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from './status-badge'
import { cn } from '@/lib/utils'
import type { Run, RunStatus } from '@/types/runs'

function formatDuration(ms?: number): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

function formatStartTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffM = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffM < 1) return 'Just now'
  if (diffM < 60) return `${diffM}m ago`
  if (diffH < 24) return `${diffH}h ago`
  if (diffD < 7) return `${diffD}d ago`
  return d.toLocaleDateString()
}

export interface RunRowProps {
  run: Run
  selected?: boolean
  onSelect?: () => void
  onRerun?: (id: string) => void
  onExportLogs?: (id: string) => void
  selectable?: boolean
}

export function RunRow({
  run,
  selected,
  onSelect,
  onRerun,
  onExportLogs,
  selectable = true,
}: RunRowProps) {
  const name = run.cronjobName ?? run.workflowName ?? 'Unknown'
  const status = (run.status ?? 'pending') as RunStatus

  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-muted/30 group'
      )}
      role="row"
    >
      {selectable && (
        <td className="p-4 w-12">
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            aria-label={`Select run ${run.id}`}
          />
        </td>
      )}
      <td className="p-4">
        <Link
          to={`/dashboard/runs/${run.id}`}
          className="font-mono text-sm text-primary hover:underline"
        >
          {run.id.slice(0, 12)}…
        </Link>
      </td>
      <td className="p-4">
        <Link
          to={`/dashboard/runs/${run.id}`}
          className="font-medium hover:text-primary block max-w-[200px] truncate"
        >
          {name}
        </Link>
      </td>
      <td className="p-4">
        <StatusBadge status={status} />
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        {formatDuration(run.durationMs)}
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        {formatStartTime(run.startTime)}
      </td>
      <td className="p-4 text-sm">{run.owner ?? run.ownerId ?? '—'}</td>
      <td className="p-4 text-sm text-muted-foreground">{run.environment}</td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link to={`/dashboard/runs/${run.id}/trace`}>
            <Button variant="outline" size="sm" className="gap-1">
              <GitBranch className="h-4 w-4" />
              Trace
            </Button>
          </Link>
          <Link to={`/dashboard/runs/${run.id}`}>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRerun && (
                <DropdownMenuItem onClick={() => onRerun(run.id)}>
                  <Clock className="h-4 w-4" />
                  Re-run
                </DropdownMenuItem>
              )}
              {onExportLogs && (
                <DropdownMenuItem onClick={() => onExportLogs(run.id)}>
                  Export logs
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  )
}
