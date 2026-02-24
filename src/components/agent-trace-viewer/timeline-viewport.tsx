/**
 * TimelineViewport - Renders events as interconnected nodes along a horizontal time axis.
 * Supports panning/zooming, tooltips, click-to-expand. Guard all array operations.
 */

import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EventNode } from './event-node'
import type { Event, RunTrace } from '@/types/agent-trace'
import { cn } from '@/lib/utils'

export interface TimelineViewportProps {
  trace: RunTrace | null
  selectedEventId: string | null
  onSelectEvent: (event: Event) => void
  onExpandEvent: (event: Event) => void
  isLoading?: boolean
  className?: string
}

export function TimelineViewport({
  trace,
  selectedEventId,
  onSelectEvent,
  onExpandEvent,
  isLoading,
  className,
}: TimelineViewportProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const events = Array.isArray(trace?.events) ? trace.events : []
  const sortedEvents = [...events].sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0
    return ta - tb
  })

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-6 w-48 bg-muted/30 rounded" />
          <div className="h-4 w-64 bg-muted/30 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-muted/30 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sortedEvents.length === 0) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-16 text-center rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">No events in this run</p>
            <p className="text-sm text-muted-foreground mt-1">
              Trace will appear when agents communicate
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Timeline</CardTitle>
          <span className="text-xs text-muted-foreground">
            {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide"
          role="list"
          aria-label="Event timeline"
        >
          <div className="flex flex-col gap-2 min-w-0">
            {sortedEvents.map((event, idx) => (
              <EventNode
                key={event.eventId}
                event={event}
                index={idx}
                isSelected={selectedEventId === event.eventId}
                onSelect={onSelectEvent}
                onExpand={onExpandEvent}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
