/**
 * ActivityLegend - Color legend for event types, status, and priority.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, ArrowRight, Handshake, AlertTriangle, CheckCircle } from 'lucide-react'
import type { EventType } from '@/types/agent-trace'
import { cn } from '@/lib/utils'

const EVENT_LEGEND: { type: EventType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { type: 'message', label: 'Message', icon: MessageSquare, color: 'text-primary' },
  { type: 'handoff', label: 'Handoff', icon: ArrowRight, color: 'text-primary' },
  { type: 'negotiation', label: 'Negotiation', icon: Handshake, color: 'text-warning' },
  { type: 'alert', label: 'Alert', icon: AlertTriangle, color: 'text-destructive' },
  { type: 'consensus', label: 'Consensus', icon: CheckCircle, color: 'text-success' },
]

export interface ActivityLegendProps {
  className?: string
}

export function ActivityLegend({ className }: ActivityLegendProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Event Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {EVENT_LEGEND.map(({ type, label, icon: Icon, color }) => (
          <div key={type} className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4 shrink-0', color)} aria-hidden />
            <span className="text-sm text-muted-foreground">{label}</span>
            <Badge variant="secondary" className="ml-auto text-xs capitalize">
              {type}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
