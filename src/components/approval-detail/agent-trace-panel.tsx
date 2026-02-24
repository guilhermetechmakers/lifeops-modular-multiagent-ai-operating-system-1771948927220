/**
 * AgentTracePanel - Thread of agent messages with collapsible sections.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronRight, Bot } from 'lucide-react'
import type { AgentMessage } from '@/types/approvals'

export interface AgentTracePanelProps {
  trace: AgentMessage[]
  className?: string
}

export function AgentTracePanel({ trace, className }: AgentTracePanelProps) {
  const items = Array.isArray(trace) ? trace : []
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(items.map((m) => m.id)))

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agent Trace
          </CardTitle>
          <CardDescription>Inter-agent messages and handoffs</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4">No agent messages</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Agent Trace
        </CardTitle>
        <CardDescription>Inter-agent messages, handoffs, and negotiation logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((msg) => {
            const isExpanded = expandedIds.has(msg.id)
            return (
              <div key={msg.id} className="rounded-lg border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(msg.id)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground font-mono">{msg.agentId}</span>
                  <span className="text-xs text-muted-foreground">{msg.type}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
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
