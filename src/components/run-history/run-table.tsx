/**
 * RunTable - Renders RunRow items with selection and bulk actions.
 * Sticky headers, row hover, sortable columns, loading skeletons.
 */

import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { GitBranch, History, RotateCcw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/run-history/status-badge'
import { cn } from '@/lib/utils'
import type { Run, RunStatus } from '@/types/runs'

export interface RunTableProps {
  runs: Run[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onRerun?: (id: string) => void
  isLoading?: boolean
}

function formatDuration(ms?: number): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function getSourceName(run: Run): string {
  return run.cronjobName ?? run.workflowName ?? '—'
}

function getSourceIcon(run: Run) {
  return run.workflowId ? (
    <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
  ) : (
    <History className="h-4 w-4 text-muted-foreground shrink-0" />
  )
}

export function RunTable({
  runs = [],
  selectedIds = [],
  onSelectionChange,
  onRerun,
  isLoading,
}: RunTableProps) {
  const items = Array.isArray(runs) ? runs : []

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === items.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map((r) => r.id))
    }
  }, [items, selectedIds.length, onSelectionChange])

  const handleSelectOne = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((x) => x !== id))
      } else {
        onSelectionChange([...selectedIds, id])
      }
    },
    [selectedIds, onSelectionChange]
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" role="grid" aria-label="Runs table loading">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="h-12 px-4 text-left w-12">
                    <Skeleton className="h-4 w-4" />
                  </th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-24" /></th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-32" /></th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-20" /></th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-20" /></th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-24" /></th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-20" /></th>
                  <th className="h-12 px-4 text-right w-32" />
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-4"><Skeleton className="h-4 w-4" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24 font-mono" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <History className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-sm">
            No runs match your filters. Workflow and cronjob runs will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  const allSelected = items.length > 0 && selectedIds.length === items.length

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full border-collapse" role="grid" aria-label="Runs table">
            <thead className="sticky top-0 z-10 bg-card border-b border-border">
              <tr>
                <th className="h-12 px-4 text-left w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="h-12 px-4 text-left text-sm font-semibold text-muted-foreground">
                  Run ID
                </th>
                <th className="h-12 px-4 text-left text-sm font-semibold text-muted-foreground">
                  Cronjob / Workflow
                </th>
                <th className="h-12 px-4 text-left text-sm font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left text-sm font-semibold text-muted-foreground">
                  Duration
                </th>
                <th className="h-12 px-4 text-left text-sm font-semibold text-muted-foreground">
                  Start Time
                </th>
                <th className="h-12 px-4 text-left text-sm font-semibold text-muted-foreground">
                  Owner
                </th>
                <th className="h-12 px-4 text-left text-sm font-semibold text-muted-foreground">
                  Environment
                </th>
                <th className="h-12 px-4 text-right text-sm font-semibold text-muted-foreground w-36">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(items ?? []).map((run) => (
                <RunRow
                  key={run.id}
                  run={run}
                  selected={selectedIds.includes(run.id)}
                  onSelect={() => handleSelectOne(run.id)}
                  onRerun={onRerun}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

interface RunRowProps {
  run: Run
  selected: boolean
  onSelect: () => void
  onRerun?: (id: string) => void
}

function RunRow({ run, selected, onSelect, onRerun }: RunRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-muted/30',
        'group'
      )}
    >
      <td className="py-3 px-4">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          aria-label={`Select run ${run.id}`}
        />
      </td>
      <td className="py-3 px-4">
        <Link
          to={`/dashboard/runs/${run.id}`}
          className="font-mono text-sm text-primary hover:underline"
        >
          {run.id.slice(0, 12)}…
        </Link>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {getSourceIcon(run)}
          <Link
            to={`/dashboard/runs/${run.id}`}
            className="font-medium hover:text-primary hover:underline block max-w-[180px] truncate"
          >
            {getSourceName(run)}
          </Link>
        </div>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={run.status as RunStatus} />
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {formatDuration(run.durationMs)}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {formatRelativeTime(run.startTime)}
      </td>
      <td className="py-3 px-4 text-sm">
        {run.owner ?? run.ownerId ?? '—'}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {run.environment ?? '—'}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {onRerun && run.status !== 'running' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                onRerun(run.id)
              }}
              aria-label="Re-run"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Link to={`/dashboard/runs/${run.id}/trace`}>
            <Button variant="outline" size="sm" className="gap-1" aria-label="View trace">
              <GitBranch className="h-4 w-4" />
              Trace
            </Button>
          </Link>
          <Link to={`/dashboard/runs/${run.id}`}>
            <Button variant="ghost" size="sm" aria-label="View details">
              View
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  )
}
