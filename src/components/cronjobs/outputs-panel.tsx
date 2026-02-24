/**
 * OutputsPanel - Run history with expandable per-run details, links to Run Detail.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CronjobRun } from '@/types/cronjobs'
import { RunTraceViewer } from './run-trace-viewer'

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

export interface OutputsPanelProps {
  runs: CronjobRun[]
  cronjobId: string
  total?: number
  isLoading?: boolean
  onLoadMore?: () => void
}

export function OutputsPanel({
  runs,
  cronjobId,
  total = 0,
  isLoading,
  onLoadMore,
}: OutputsPanelProps) {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailRunId, setDetailRunId] = useState<string | null>(null)

  const items = Array.isArray(runs) ? runs : []
  const hasMore = total > items.length
  const selectedRun = items.find((r) => r.id === detailRunId)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const openRunDetail = (runId: string) => {
    setDetailRunId(runId)
  }

  const closeRunDetail = () => {
    setDetailRunId(null)
  }

  const goToRunDetailPage = (runId: string) => {
    navigate(`/dashboard/runs/${runId}`)
    closeRunDetail()
  }

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
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Run History</CardTitle>
            <CardDescription>Recent executions with expandable details</CardDescription>
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
            <div className="space-y-2">
              {(items ?? []).map((run) => (
                <div
                  key={run.id}
                  className="rounded-lg border border-border overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(run.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 text-left',
                      'hover:border-primary/30 hover:bg-muted/20 transition-colors'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {expandedId === run.id ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
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
                  </button>

                  {expandedId === run.id && (
                    <div className="border-t border-border p-4 space-y-4 bg-muted/10">
                      {(run.outcome?.artifacts?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Artifacts
                          </p>
                          <p className="text-sm">
                            {(run.outcome?.artifacts ?? []).length} artifact(s)
                          </p>
                        </div>
                      )}
                      {(run.logs?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Logs
                          </p>
                          <pre className="text-xs font-mono bg-muted/30 p-2 rounded max-h-24 overflow-auto">
                            {(run.logs ?? []).slice(0, 5).join('\n')}
                          </pre>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRunDetail(run.id)}
                        >
                          View full detail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToRunDetailPage(run.id)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in Run Detail
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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

      <Sheet open={!!detailRunId} onOpenChange={(open) => !open && closeRunDetail()}>
        <SheetContent className="w-full max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Run Detail</SheetTitle>
            <SheetDescription>
              Full per-run inputs, outputs, logs, diffs, artifacts, and revert actions.
            </SheetDescription>
          </SheetHeader>
          {selectedRun && (
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                <Badge variant={getStatusVariant(selectedRun.status)}>
                  {selectedRun.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Started: {formatTime(selectedRun.startedAt)}
                  {selectedRun.finishedAt && ` • Finished: ${formatTime(selectedRun.finishedAt)}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Outcome</p>
                <pre className="p-4 rounded-lg bg-muted/30 text-sm overflow-x-auto">
                  {JSON.stringify(selectedRun.outcome ?? {}, null, 2)}
                </pre>
              </div>
              {(selectedRun.logs?.length ?? 0) > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Logs</p>
                  <pre className="p-4 rounded-lg bg-muted/30 text-xs overflow-auto max-h-48">
                    {(selectedRun.logs ?? []).join('\n')}
                  </pre>
                </div>
              )}
              {selectedRun.traceId && (
                <RunTraceViewer
                  trace={[
                    {
                      id: '1',
                      agentId: 'orchestrator',
                      agentName: 'Orchestrator',
                      timestamp: selectedRun.startedAt,
                      status: selectedRun.status as 'success' | 'failed' | 'pending',
                    },
                  ]}
                  runId={selectedRun.id}
                />
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => goToRunDetailPage(selectedRun.id)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open full page
                </Button>
                <Button variant="outline" disabled>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Revert (if allowed)
                </Button>
                <Button variant="outline" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Export Trace
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
