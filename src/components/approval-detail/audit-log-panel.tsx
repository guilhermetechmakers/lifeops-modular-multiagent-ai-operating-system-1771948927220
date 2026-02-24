/**
 * AuditLogPanel - Per-approval audit trail with actions, users, timestamps.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { History } from 'lucide-react'
import type { ApprovalHistoryEntry } from '@/types/approvals'

export interface AuditLogPanelProps {
  history: ApprovalHistoryEntry[]
  className?: string
}

export function AuditLogPanel({ history, className }: AuditLogPanelProps) {
  const items = Array.isArray(history) ? history : []

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit Trail
          </CardTitle>
          <CardDescription>Immutable log of actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4">No audit entries yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Audit Trail
        </CardTitle>
        <CardDescription>Immutable log of actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((log) => (
            <div key={log.id} className="rounded-lg border border-border bg-card p-3 text-sm">
              <p className="font-medium">{log.action}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {log.actor ?? log.actorId} • {new Date(log.timestamp).toLocaleString()}
              </p>
              {log.comment && (
                <p className="text-muted-foreground text-xs mt-1">{log.comment}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
