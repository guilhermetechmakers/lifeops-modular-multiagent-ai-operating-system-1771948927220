/**
 * RunDetailPanel - Full per-run detail with inputs, outputs, logs, diffs, artifacts, errors, revert.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  RotateCcw,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from 'lucide-react'
import { RunTraceViewer } from './run-trace-viewer'
import type { CronjobRun } from '@/types/cronjobs'
import { cn } from '@/lib/utils'

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

export interface RunDetailPanelProps {
  run: CronjobRun | null
  cronjobId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRevert?: (runId: string) => void
}

export function RunDetailPanel({
  run,
  cronjobId: _cronjobId,
  open,
  onOpenChange,
  onRevert,
}: RunDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!run) return null

  const inputs = run.inputs ?? run.outcome ?? {}
  const outputs = run.outputs ?? (run.outcome?.result as Record<string, unknown>) ?? {}
  const logs = Array.isArray(run.logs) ? run.logs : []
  const diffs = run.diffs ?? run.outcome?.diffs ?? []
  const artifacts = run.artifacts ?? run.outcome?.artifacts ?? []
  const errors = Array.isArray(run.errors) ? run.errors : []

  const canRevert = run.status === 'success' && onRevert

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {getStatusIcon(run.status)}
            Run {run.id.slice(-8)}
          </SheetTitle>
          <SheetDescription>
            {formatTime(run.startedAt)}
            {run.finishedAt && ` – ${formatTime(run.finishedAt)}`}
            {run.outcome?.summary && ` • ${run.outcome.summary}`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                run.status === 'success'
                  ? 'success'
                  : run.status === 'failed'
                    ? 'destructive'
                    : run.status === 'running'
                      ? 'warning'
                      : 'secondary'
              }
            >
              {run.status}
            </Badge>
            <Link to={`/dashboard/runs/${run.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                Full page
              </Button>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="io">I/O</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="trace">Trace</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Input</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre
                    className={cn(
                      'p-4 rounded-lg text-sm overflow-x-auto max-h-48',
                      'bg-muted/30 font-mono'
                    )}
                  >
                    {JSON.stringify(inputs, null, 2)}
                  </pre>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre
                    className={cn(
                      'p-4 rounded-lg text-sm overflow-x-auto max-h-48',
                      'bg-muted/30 font-mono'
                    )}
                  >
                    {JSON.stringify(outputs, null, 2)}
                  </pre>
                </CardContent>
              </Card>
              {canRevert && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onRevert(run.id)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Revert (if allowed)
                </Button>
              )}
            </TabsContent>

            <TabsContent value="io" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Input Payload</CardTitle>
                  <CardDescription>Data sent to the agent/workflow</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre
                    className={cn(
                      'p-4 rounded-lg text-sm overflow-x-auto',
                      'bg-muted/30 font-mono'
                    )}
                  >
                    {JSON.stringify(inputs, null, 2)}
                  </pre>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Output</CardTitle>
                  <CardDescription>Results from the run</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre
                    className={cn(
                      'p-4 rounded-lg text-sm overflow-x-auto',
                      'bg-muted/30 font-mono'
                    )}
                  >
                    {JSON.stringify(outputs, null, 2)}
                  </pre>
                </CardContent>
              </Card>
              {(Array.isArray(diffs) ? diffs : []).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Diffs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre
                      className={cn(
                        'p-4 rounded-lg text-sm overflow-x-auto',
                        'bg-muted/30 font-mono'
                      )}
                    >
                      {JSON.stringify(diffs, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
              {(Array.isArray(artifacts) ? artifacts : []).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Artifacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre
                      className={cn(
                        'p-4 rounded-lg text-sm overflow-x-auto',
                        'bg-muted/30 font-mono'
                      )}
                    >
                      {JSON.stringify(artifacts, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Logs</CardTitle>
                  <CardDescription>Execution log output</CardDescription>
                </CardHeader>
                <CardContent>
                  {logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No logs</p>
                  ) : (
                    <pre
                      className={cn(
                        'p-4 rounded-lg text-sm overflow-x-auto max-h-64',
                        'bg-muted/30 font-mono whitespace-pre-wrap'
                      )}
                    >
                      {logs.join('\n')}
                    </pre>
                  )}
                  {errors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-destructive mb-2">Errors</p>
                      <pre
                        className={cn(
                          'p-4 rounded-lg text-sm overflow-x-auto',
                          'bg-destructive/10 text-destructive font-mono'
                        )}
                      >
                        {errors.join('\n')}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trace" className="mt-4">
              <RunTraceViewer run={run} />
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/dashboard/runs/${run.id}`}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Open in Run Detail
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export Trace
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
