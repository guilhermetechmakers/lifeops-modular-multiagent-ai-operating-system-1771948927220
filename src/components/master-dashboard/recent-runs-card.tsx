/**
 * RecentRunsCard - Latest agent runs with status, duration, cost, links to artifacts.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import type { Run } from '@/types/master-dashboard'
import { cn } from '@/lib/utils'

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  failure: XCircle,
  running: Loader2,
  queued: Loader2,
}

interface RecentRunsCardProps {
  runs: Run[]
  isLoading?: boolean
}

export function RecentRunsCard({ runs, isLoading }: RecentRunsCardProps) {
  const list = Array.isArray(runs) ? runs : []
  const displayList = list.slice(0, 5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
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
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>Latest agent runs</CardDescription>
        </div>
        <Link to="/dashboard/runs">
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {displayList.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No recent runs</p>
        ) : (
          <div className="space-y-3">
            {displayList.map((r) => {
              const Icon = STATUS_ICONS[r.status] ?? History
              const isRunning = r.status === 'running' || r.status === 'queued'

              return (
                <Link
                  key={r.id}
                  to={`/dashboard/runs/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors block"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'rounded-lg p-2 shrink-0',
                        r.status === 'success' && 'bg-success/20',
                        r.status === 'failure' && 'bg-destructive/20',
                        isRunning && 'bg-primary/20'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          r.status === 'success' && 'text-success',
                          r.status === 'failure' && 'text-destructive',
                          isRunning && 'text-primary animate-spin'
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {r.traceId ?? r.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.startTime
                          ? new Date(r.startTime).toLocaleString()
                          : '—'}
                        {r.durationMs != null && ` • ${(r.durationMs / 1000).toFixed(1)}s`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.costEstimate != null && (
                      <span className="text-xs text-muted-foreground">
                        ${r.costEstimate.toFixed(2)}
                      </span>
                    )}
                    <Badge
                      variant={
                        r.status === 'success'
                          ? 'success'
                          : r.status === 'failure'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className="text-xs"
                    >
                      {r.status}
                    </Badge>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
