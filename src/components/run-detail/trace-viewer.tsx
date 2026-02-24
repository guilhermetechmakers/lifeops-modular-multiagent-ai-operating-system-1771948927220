/**
 * TraceViewer - Visualizes inter-agent messages with trace timeline.
 * Collapsible steps, agent names, timestamps.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Bot, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentTraceStep } from '@/types/runs'

export interface TraceViewerProps {
  trace?: AgentTraceStep[] | null
  runId?: string
  isLoading?: boolean
}

function formatTimestamp(iso?: string): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return iso
  }
}

export function TraceViewer({ trace, runId, isLoading }: TraceViewerProps) {
  const steps = Array.isArray(trace) ? trace : []
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inter-Agent Trace</CardTitle>
          <CardDescription>Message flow between agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-muted mt-2" />
                <div className="flex-1 h-16 rounded-lg bg-muted/30" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (steps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inter-Agent Trace</CardTitle>
          <CardDescription>Message flow between agents</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No trace data available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inter-Agent Trace</CardTitle>
            <CardDescription>Message flow between agents</CardDescription>
          </div>
          {runId && (
            <Link to={`/dashboard/runs/${runId}/trace`}>
              <Button variant="default" size="sm" className="gap-2">
                <GitBranch className="h-4 w-4" />
                View Full Trace
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(steps ?? []).map((step, i) => {
            const isExpanded = expanded[step.id] ?? true
            const content = step.content ?? (step as { message?: string }).message ?? ''
            const agentName = step.agentName ?? step.agentId ?? 'Agent'

            return (
              <div
                key={step.id ?? i}
                className={cn(
                  'rounded-lg border border-border overflow-hidden transition-colors',
                  'hover:bg-muted/20'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(step.id)}
                  className="flex items-center gap-3 w-full p-4 text-left"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-sm">{agentName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(step.timestamp)}
                      </span>
                    </div>
                    {isExpanded && content && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">{content}</p>
                    )}
                  </div>
                </button>
                {isExpanded && content && (
                  <div className="px-4 pb-4 pt-0 pl-12">
                    <pre className="p-3 rounded-lg bg-muted/30 text-sm overflow-x-auto whitespace-pre-wrap">
                      {content}
                    </pre>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
