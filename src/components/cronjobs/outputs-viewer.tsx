/**
 * OutputsViewer - Run history, logs, traces, artifacts.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CronjobRun } from '@/types/cronjobs'

function formatTime(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-success" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />
    case 'running':
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />
    case 'pending':
      return <Clock className="h-4 w-4 text-muted-foreground" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusVariant(status: string): 'success' | 'destructive' | 'warning' | 'secondary' {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'destructive'
    case 'running':
      return 'warning'
    default:
      return 'secondary'
  }
}

export interface OutputsViewerProps {
  runs: CronjobRun[]
  cronjobId: string
  total?: number
  isLoading?: boolean
  onLoadMore?: () => void
  onRunClick?: (runId: string) => void
}

export function OutputsViewer({
  runs,
  cronjobId,
  total = 0,
  isLoading,
  onLoadMore,
  onRunClick,
}: OutputsViewerProps) {
  const items = Array.isArray(runs) ? runs : []
  const hasMore = total > items.length

  if (isLoading && items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Run History</CardTitle>
          <CardDescription>Recent executions and outcomes</CardDescription>
        </div>
        <Link to={`/dashboard/runs?cronjobId=${cronjobId}`}>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-1" />
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No runs yet</p>
            <p className="text-muted-foreground text-xs mt-1">
              Trigger a run to see history here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((run) => {
              const content = (
                <div
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border border-border',
                    'hover:border-primary/50 hover:bg-muted/20 transition-colors',
                    onRunClick && 'cursor-pointer'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getStatusIcon(run.status)}
                    <div>
                      <p className="font-medium text-sm truncate">
                        Run {run.id.slice(-8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(run.startedAt)}
                        {run.outcome?.summary && ` • ${run.outcome.summary}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(run.status)} className="shrink-0">
                    {run.status}
                  </Badge>
                </div>
              )
              return onRunClick ? (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => onRunClick(run.id)}
                  className="block w-full text-left"
                >
                  {content}
                </button>
              ) : (
                <Link key={run.id} to={`/dashboard/runs/${run.id}`} className="block">
                  {content}
                </Link>
              )
            })}
          </div>
        )}

        {hasMore && items.length > 0 && onLoadMore && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            Load more
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
