/**
 * RunDetailPage - Full details of a single run.
 * Inputs, outputs, inter-agent trace, logs, artifacts, diffs, errors, revert actions.
 */

import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, GitBranch, RotateCcw, Download } from 'lucide-react'
import { toast } from 'sonner'
import { useRunDetail } from '@/hooks/use-runs'
import { StatusBadge } from '@/components/run-history'
import {
  TraceViewer,
  ArtifactsPanel,
  LogsPanel,
  DiffsPanel,
  RevertActionsPanel,
} from '@/components/run-detail'

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

export function RunDetailPage() {
  const { id } = useParams()
  const { run, detail, isLoading, error, refetch, rerun } = useRunDetail(id)

  const handleRerun = async () => {
    try {
      const updated = await rerun()
      if (updated) {
        toast.success('Run queued for re-execution')
        refetch()
      } else {
        toast.error('Re-run failed')
      }
    } catch {
      toast.error('Re-run failed')
    }
  }

  const handleRevert = async () => {
    toast.info('Revert feature: would revert run to previous state')
  }

  if (error) {
    return (
      <div className="space-y-8 animate-in-up">
        <Link to="/dashboard/runs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Card className="border-destructive/50">
          <CardContent className="py-8">
            <p className="text-destructive">{error.message}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sourceName = run?.cronjobName ?? run?.workflowName ?? 'Run'
  const inputs = detail?.inputs ?? run?.inputSnapshot ?? {}
  const outputs = detail?.outputs ?? run?.outputSnapshot ?? {}
  const errors = detail?.errors ?? run?.errors
  const trace = detail?.trace
  const logs = detail?.logs
  const artifacts = detail?.artifacts
  const diffs = detail?.diffs
  const reversible = detail?.reversible ?? run?.reversible ?? false

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/runs">
          <Button variant="ghost" size="icon" aria-label="Back to runs">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold truncate">Run {id?.slice(0, 12)}…</h1>
          <p className="text-muted-foreground mt-1">
            {sourceName}
            {run?.status && (
              <>
                {' • '}
                <StatusBadge status={run.status} />
              </>
            )}
            {run?.startTime && ` • ${formatRelativeTime(run.startTime)}`}
            {run?.durationMs != null && ` • ${formatDuration(run.durationMs)}`}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inputs & Outputs</CardTitle>
            <CardDescription>Run payload and results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Input</p>
              <pre className="p-4 rounded-lg bg-muted/30 text-sm overflow-x-auto max-h-[200px] overflow-y-auto">
                {JSON.stringify(inputs, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Output</p>
              <pre className="p-4 rounded-lg bg-muted/30 text-sm overflow-x-auto max-h-[200px] overflow-y-auto">
                {JSON.stringify(outputs, null, 2)}
              </pre>
            </div>
            {errors != null && (
              <div>
                <p className="text-sm font-medium text-destructive mb-2">Errors</p>
                <pre className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm overflow-x-auto">
                  {typeof errors === 'object'
                    ? JSON.stringify(errors, null, 2)
                    : String(errors)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to={`/dashboard/runs/${id}/trace`}>
              <Button variant="outline" className="w-full gap-2">
                <GitBranch className="h-4 w-4" />
                View Agent Trace
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleRerun}
              disabled={isLoading || run?.status === 'running'}
            >
              <RotateCcw className="h-4 w-4" />
              Re-run
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => toast.info('Export trace – coming soon')}
            >
              <Download className="h-4 w-4" />
              Export Trace
            </Button>
          </CardContent>
        </Card>
      </div>

      <TraceViewer trace={trace} isLoading={isLoading} />

      <div className="grid md:grid-cols-2 gap-6">
        <ArtifactsPanel artifacts={artifacts} isLoading={isLoading} />
        <LogsPanel logs={logs} isLoading={isLoading} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <DiffsPanel diffs={diffs} isLoading={isLoading} />
        <RevertActionsPanel
          reversible={reversible}
          onRevert={handleRevert}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
