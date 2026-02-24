/**
 * DetailPanel - Side panel showing event-specific details.
 * Rule engine justification, memory context, handoff transcripts, artifact links.
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MemorySliceInspector } from './memory-slice-inspector'
import { PolicyEngineInsights } from './policy-engine-insights'
import { LinkedNavigationWidgets } from './linked-navigation-widgets'
import type { EventDetail } from '@/types/agent-trace'
import { cn } from '@/lib/utils'

export interface DetailPanelProps {
  event: EventDetail | null
  runId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function DetailPanel({
  event,
  runId,
  open,
  onOpenChange,
  className,
}: DetailPanelProps) {
  if (!event) return null

  const time = event.timestamp ? new Date(event.timestamp).toLocaleString() : '—'
  const fromTo = [event.fromAgentId, event.toAgentId].filter(Boolean).join(' → ') || '—'
  const memoryAccess = event.memoryAccess ?? []
  const policyResult = event.policyResult
  const artifactIds = event.linkedRunArtifactIds ?? []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn('w-full max-w-lg overflow-y-auto', className)}
        aria-describedby="detail-panel-description"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {event.type}
            </Badge>
            Event {event.eventId}
          </SheetTitle>
          <SheetDescription id="detail-panel-description">
            {fromTo} • {time}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {event.topic && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Topic</p>
              <p className="text-sm mt-1">{event.topic}</p>
            </div>
          )}

          {event.details && Object.keys(event.details).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-3 rounded-lg bg-muted/30 text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {policyResult && (
            <PolicyEngineInsights policyResult={policyResult} />
          )}

          {memoryAccess.length > 0 && (
            <MemorySliceInspector memoryAccess={memoryAccess} />
          )}

          <LinkedNavigationWidgets
            runId={runId}
            fromAgentId={event.fromAgentId}
            toAgentId={event.toAgentId}
            artifactIds={artifactIds}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
