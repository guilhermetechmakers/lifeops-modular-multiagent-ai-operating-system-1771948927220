/**
 * RunTraceViewer - Inter-agent trace visualization with clickable nodes.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitBranch, ChevronRight } from 'lucide-react'

export interface TraceNode {
  id: string
  agentId: string
  agentName?: string
  timestamp?: string
  duration?: number
  status?: 'success' | 'failed' | 'pending'
}

import type { CronjobRun } from '@/types/cronjobs'

export interface RunTraceViewerProps {
  trace?: TraceNode[] | Record<string, unknown> | null
  runId?: string
  run?: CronjobRun
}

function formatTime(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString()
}

function parseTraceFromRun(run: CronjobRun): TraceNode[] {
  const t = run.trace
  if (!t) return []
  if (Array.isArray(t)) {
    return (t as { id?: string; agentId: string; agentName?: string; timestamp?: string; durationMs?: number }[]).map(
      (n, i) => ({
        id: n.id ?? String(i),
        agentId: n.agentId,
        agentName: n.agentName,
        timestamp: n.timestamp,
        duration: n.durationMs,
      })
    )
  }
  const arr = (t as { nodes?: TraceNode[] }).nodes
  return Array.isArray(arr) ? arr : []
}

export function RunTraceViewer({ trace, run }: RunTraceViewerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const nodes: TraceNode[] = (() => {
    if (run) return parseTraceFromRun(run)
    if (!trace) return []
    if (Array.isArray(trace)) return trace
    const arr = (trace as { nodes?: TraceNode[] }).nodes
    return Array.isArray(arr) ? arr : []
  })()

  if (nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Inter-Agent Trace
          </CardTitle>
          <CardDescription>
            Agent-to-agent handoffs with timing data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No trace data</p>
            <p className="text-muted-foreground text-xs mt-1">
              Trace will appear when run completes
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Inter-Agent Trace
        </CardTitle>
        <CardDescription>
          Agent-to-agent handoffs with timing data. Click a node for details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {nodes.map((node, idx) => (
            <div key={node.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedId(selectedId === node.id ? null : node.id)}
                className={`
                  flex-1 flex items-center gap-3 p-3 rounded-lg text-left
                  transition-colors border
                  ${selectedId === node.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/30 hover:bg-muted/20'}
                `}
                aria-pressed={selectedId === node.id}
              >
                <div
                  className={`
                    w-2 h-2 rounded-full shrink-0
                    ${node.status === 'success' ? 'bg-success' : ''}
                    ${node.status === 'failed' ? 'bg-destructive' : ''}
                    ${node.status === 'pending' || !node.status ? 'bg-muted-foreground' : ''}
                  `}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {node.agentName ?? node.agentId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {node.timestamp && formatTime(node.timestamp)}
                    {node.duration != null && ` • ${node.duration}ms`}
                  </p>
                </div>
                {node.status && (
                  <Badge
                    variant={
                      node.status === 'success'
                        ? 'success'
                        : node.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="shrink-0"
                  >
                    {node.status}
                  </Badge>
                )}
                <ChevronRight
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    selectedId === node.id ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {idx < nodes.length - 1 && (
                <div className="w-px h-4 bg-border self-center ml-2" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
