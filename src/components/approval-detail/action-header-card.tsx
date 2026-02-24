/**
 * ActionHeaderCard - Displays action type, target, summary, and SLA ticker.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ApprovalSLA, TargetEntity } from '@/types/approvals'

export interface ActionHeaderCardProps {
  proposedAction: string
  targetEntities?: TargetEntity[]
  status?: string
  sla?: ApprovalSLA
  className?: string
}

export function ActionHeaderCard({
  proposedAction,
  targetEntities = [],
  status = 'pending',
  sla,
  className,
}: ActionHeaderCardProps) {
  const items = Array.isArray(targetEntities) ? targetEntities : []

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold">{proposedAction}</h2>
          <Badge
            variant={
              status === 'approved'
                ? 'success'
                : status === 'denied'
                  ? 'destructive'
                  : status === 'changes_requested'
                    ? 'warning'
                    : 'secondary'
            }
          >
            {status}
          </Badge>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {items.map((t) => (
              <Badge key={t.id} variant="outline" className="font-normal">
                {t.type}: {t.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      {sla && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">SLA</span>
            <span
              className={
                sla.status === 'ok'
                  ? 'text-success'
                  : sla.status === 'escalated'
                    ? 'text-warning'
                    : 'text-destructive'
              }
            >
              {sla.status === 'ok' ? 'On time' : sla.status === 'escalated' ? 'Escalated' : 'Overdue'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
            <div
              className={`h-full rounded-full ${
                sla.status === 'ok'
                  ? 'bg-success'
                  : sla.status === 'escalated'
                    ? 'bg-warning'
                    : 'bg-destructive'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, 100 - (sla.remainingMs / 86400000) * 100))}%`,
              }}
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}
