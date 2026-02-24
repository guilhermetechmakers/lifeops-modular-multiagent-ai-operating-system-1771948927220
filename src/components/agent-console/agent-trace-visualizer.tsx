/**
 * Agent Trace Visualizer - Timeline of messages with handoffs, negotiations, alerts, consensus.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, ArrowRight, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Trace, TraceType } from '@/types/agent-console'

export interface AgentTraceVisualizerProps {
  traces: Trace[]
  runId?: string
  isLoading?: boolean
  className?: string
}

function traceTypeIcon(type: TraceType) {
  switch (type) {
    case 'handoff':
      return <ArrowRight className="h-4 w-4 text-primary" />
    case 'negotiation':
      return <MessageSquare className="h-4 w-4 text-warning" />
    case 'alert':
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    case 'consensus':
      return <CheckCircle className="h-4 w-4 text-success" />
    default:
      return <Bot className="h-4 w-4 text-muted-foreground" />
  }
}

function traceTypeVariant(type: TraceType): 'default' | 'secondary' | 'warning' | 'destructive' | 'success' {
  switch (type) {
    case 'handoff':
      return 'default'
    case 'negotiation':
      return 'warning'
    case 'alert':
      return 'destructive'
    case 'consensus':
      return 'success'
    default:
      return 'secondary'
  }
}

export function AgentTraceVisualizer({
  traces,
  runId,
  isLoading,
  className,
}: AgentTraceVisualizerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const items = Array.isArray(traces) ? traces : []

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-6 w-40 bg-muted/30 rounded" />
          <div className="h-4 w-56 bg-muted/30 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('transition-all duration-300', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Trace Timeline</CardTitle>
          </div>
          {runId && (
            <span className="text-xs text-muted-foreground font-mono">{runId}</span>
          )}
        </div>
        <CardDescription>
          Handoffs, negotiations, alerts, and consensus steps
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground rounded-lg border border-dashed border-border">
            <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No trace data</p>
            <p className="text-sm mt-1">Run a simulation to see the trace</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((trace, idx) => {
              const isExpanded = expandedId === trace.id
              return (
                <div
                  key={trace.id}
                  className={cn(
                    'rounded-lg border transition-all duration-200',
                    isExpanded ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : trace.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    aria-expanded={isExpanded}
                  >
                    <span className="text-xs text-muted-foreground w-6">{idx + 1}</span>
                    {traceTypeIcon(trace.type)}
                    <Badge variant={traceTypeVariant(trace.type)} className="capitalize">
                      {trace.type}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {trace.sender_id} → {trace.receiver_id}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(trace.timestamp).toLocaleTimeString()}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-border">
                      <p className="mt-2 text-sm whitespace-pre-wrap">{trace.message}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
