/**
 * EventNode - Single event with expandable details.
 * Represents message, handoff, negotiation, alert, or consensus.
 */

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  ArrowRight,
  Handshake,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { Event, EventType } from '@/types/agent-trace'
import { cn } from '@/lib/utils'

function eventIcon(type: EventType) {
  switch (type) {
    case 'message':
      return MessageSquare
    case 'handoff':
      return ArrowRight
    case 'negotiation':
      return Handshake
    case 'alert':
      return AlertTriangle
    case 'consensus':
      return CheckCircle
    default:
      return MessageSquare
  }
}

function eventColor(type: EventType): string {
  switch (type) {
    case 'message':
    case 'handoff':
      return 'text-primary'
    case 'negotiation':
      return 'text-warning'
    case 'alert':
      return 'text-destructive'
    case 'consensus':
      return 'text-success'
    default:
      return 'text-muted-foreground'
  }
}

function eventDotColor(type: EventType): string {
  switch (type) {
    case 'message':
    case 'handoff':
      return 'bg-primary'
    case 'negotiation':
      return 'bg-warning'
    case 'alert':
      return 'bg-destructive'
    case 'consensus':
      return 'bg-success'
    default:
      return 'bg-muted-foreground'
  }
}

export interface EventNodeProps {
  event: Event
  index: number
  isExpanded?: boolean
  onToggle?: () => void
  onSelect?: (event: Event) => void
  isSelected?: boolean
  onExpand?: (event: Event) => void
  className?: string
}

export function EventNode({
  event,
  index,
  isExpanded: controlledExpanded,
  onToggle,
  onSelect,
  isSelected,
  onExpand,
  className,
}: EventNodeProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const isControlled = controlledExpanded !== undefined && onToggle !== undefined
  const expanded = isControlled ? controlledExpanded : internalExpanded

  const toggleExpand = () => {
    if (isControlled) {
      onToggle?.()
    } else {
      setInternalExpanded((e) => !e)
      onExpand?.(event)
    }
  }

  const handleClick = () => {
    onSelect?.(event)
    toggleExpand()
  }

  const Icon = eventIcon(event.type)
  const time = event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : '—'
  const fromTo = [event.fromAgentId, event.toAgentId].filter(Boolean).join(' → ') || '—'

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        (isSelected ?? expanded) ? 'border-primary/60 bg-primary/5 shadow-glow' : 'border-border hover:border-primary/30 hover:shadow-card-hover',
        className
      )}
      role="listitem"
      aria-label={`Event ${index + 1}: ${event.type}`}
    >
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
        aria-expanded={expanded}
      >
        <span className="text-xs text-muted-foreground w-6 shrink-0">{index + 1}</span>
        <div className={cn('w-2 h-2 rounded-full shrink-0', eventDotColor(event.type))} aria-hidden />
        <Icon className={cn('h-4 w-4 shrink-0', eventColor(event.type))} aria-hidden />
        <Badge variant="secondary" className="capitalize shrink-0">
          {event.type}
        </Badge>
        <span className="text-xs font-mono text-muted-foreground truncate min-w-0 flex-1">
          {fromTo}
        </span>
        {event.topic && (
          <span className="text-xs text-muted-foreground truncate max-w-24 hidden sm:inline">
            {event.topic}
          </span>
        )}
        <span className="text-xs text-muted-foreground shrink-0">{time}</span>
          {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border animate-fade-in">
          <div className="mt-3 space-y-2">
            {event.details && Object.keys(event.details).length > 0 && (
              <pre className="p-3 rounded-lg bg-muted/30 text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(event.details, null, 2)}
              </pre>
            )}
            {event.policyResultId && (
              <p className="text-xs text-muted-foreground">
                Policy: <code className="font-mono">{event.policyResultId}</code>
              </p>
            )}
            {((event.memoryAccessIds ?? []).length > 0) && (
              <p className="text-xs text-muted-foreground">
                Memory: {(event.memoryAccessIds ?? []).length} access(es)
              </p>
            )}
            {((event.linkedRunArtifactIds ?? []).length > 0) && (
              <p className="text-xs text-muted-foreground">
                Artifacts: {(event.linkedRunArtifactIds ?? []).length} linked
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
