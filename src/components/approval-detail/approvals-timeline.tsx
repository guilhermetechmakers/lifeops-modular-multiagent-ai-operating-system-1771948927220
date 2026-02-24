/**
 * ApprovalsTimeline - Timeline of handoffs and decision points.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { History } from 'lucide-react'
import type { ApprovalHistoryEntry, AgentMessage } from '@/types/approvals'

export interface ApprovalsTimelineProps {
  history: ApprovalHistoryEntry[]
  trace?: AgentMessage[]
  className?: string
}

type TimelineItem = {
  id: string
  timestamp: string
  label: string
  detail?: string
}

export function ApprovalsTimeline({ history, trace, className }: ApprovalsTimelineProps) {
  const historyItems = Array.isArray(history) ? history : []
  const traceItems = Array.isArray(trace) ? trace : []

  const entries: TimelineItem[] = [
    ...historyItems.map((h) => ({
      id: h.id,
      timestamp: h.timestamp,
      label: h.action,
      detail: h.comment ?? h.actor,
    })),
    ...traceItems.map((t) => ({
      id: t.id,
      timestamp: t.timestamp,
      label: t.type,
      detail: t.content?.slice(0, 80) + (t.content && t.content.length > 80 ? '…' : ''),
    })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Timeline
          </CardTitle>
          <CardDescription>Handoffs and decision points</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4">No timeline entries</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Timeline
        </CardTitle>
        <CardDescription>Handoffs, negotiations, and decision points</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" aria-hidden />
          <div className="space-y-4">
            {entries.map((item) => (
              <div key={item.id} className="relative flex gap-4 pl-8">
                <div
                  className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary"
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.detail && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.detail}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
