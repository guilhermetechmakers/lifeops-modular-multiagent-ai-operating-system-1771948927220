/**
 * AgentJobsPanel - List/timeline of agent-initiated actions, approvals queue.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Bot, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'
import type { AgentJobDetail } from '@/types/project-detail'

export interface AgentJobsPanelProps {
  projectId: string
  jobs: AgentJobDetail[]
  onRefresh: () => void
  onApprove?: (jobId: string) => Promise<void>
}

export function AgentJobsPanel({ projectId: _projectId, jobs, onRefresh, onApprove }: AgentJobsPanelProps) {
  const [selectedJob, setSelectedJob] = useState<AgentJobDetail | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  const pendingApprovals = (jobs ?? []).filter((j) => j.needsApproval)
  const allJobs = jobs ?? []

  const getStatusIcon = (status: AgentJobDetail['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-pulse" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusVariant = (status: AgentJobDetail['status']) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'failed':
        return 'destructive'
      case 'running':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const handleApprove = async (jobId: string) => {
    if (!onApprove) return
    setIsApproving(true)
    try {
      await onApprove(jobId)
      setSelectedJob(null)
      onRefresh()
    } finally {
      setIsApproving(false)
    }
  }

  const formatTime = (s?: string) => (s ? new Date(s).toLocaleString() : '-')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Agent Jobs
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Agent-initiated actions, pending approvals, handoffs
        </p>
      </div>

      {pendingApprovals.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Approvals Queue ({pendingApprovals.length})
            </CardTitle>
            <CardDescription>Actions requiring your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingApprovals.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{j.agentName} — {j.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(j.initiatedAt ?? j.startedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleApprove(j.id)}
                      disabled={isApproving}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedJob(j)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {allJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center max-w-sm">
                No agent jobs yet. Agent workflows will appear here when triggered.
              </p>
            </CardContent>
          </Card>
        ) : (
          (allJobs ?? []).map((j) => (
            <Card
              key={j.id}
              className="transition-all duration-300 hover:shadow-card-hover cursor-pointer"
              onClick={() => setSelectedJob(j)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(j.status)}
                  <div>
                    <p className="font-medium text-sm">{j.agentName} — {j.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(j.startedAt ?? j.initiatedAt)}
                      {j.traceId && ` • ${j.traceId}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(j.status)}>{j.status}</Badge>
                  {j.needsApproval && (
                    <Badge variant="warning">Needs approval</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Sheet open={!!selectedJob} onOpenChange={(o) => !o && setSelectedJob(null)}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
          {selectedJob && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedJob.agentName} — {selectedJob.action}</SheetTitle>
                <SheetDescription>
                  Trace ID: {selectedJob.traceId ?? 'N/A'}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Status</p>
                  <Badge variant={getStatusVariant(selectedJob.status)} className="mt-1">
                    {selectedJob.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Started</p>
                  <p className="text-sm mt-1">{formatTime(selectedJob.startedAt ?? selectedJob.initiatedAt)}</p>
                </div>
                {selectedJob.endedAt && (
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Ended</p>
                    <p className="text-sm mt-1">{formatTime(selectedJob.endedAt)}</p>
                  </div>
                )}
                {(selectedJob.handoffs ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Handoffs</p>
                    <ul className="mt-2 space-y-1">
                      {(selectedJob.handoffs ?? []).map((h, i) => (
                        <li key={i} className="text-sm">
                          {h.from} → {h.to} at {formatTime(h.at)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(selectedJob.messages ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Messages</p>
                    <ul className="mt-2 space-y-2">
                      {(selectedJob.messages ?? []).map((m, i) => (
                        <li key={i} className="text-sm rounded-lg border border-border p-2">
                          <span className="font-medium">{m.role}:</span> {m.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedJob.needsApproval && onApprove && (
                  <Button
                    className="w-full"
                    variant="success"
                    onClick={() => handleApprove(selectedJob.id)}
                    disabled={isApproving}
                  >
                    Approve
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
