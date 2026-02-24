/**
 * AuditTrailPanel - Action logs, agent communications, audit trail.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollText, User } from 'lucide-react'
import type { AuditLog } from '@/types/content-dashboard'

interface AuditTrailPanelProps {
  logs: AuditLog[]
  loading?: boolean
}

export function AuditTrailPanel({
  logs,
  loading,
}: AuditTrailPanelProps) {
  const displayLogs = [...(Array.isArray(logs) ? logs : [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-primary" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : displayLogs.length === 0 ? (
          <div className="py-8 text-center">
            <ScrollText className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No audit entries yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Actions will be logged here for traceability
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {displayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 p-2 rounded-lg border border-border bg-muted/20"
              >
                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {log.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {log.actorId}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <span className="ml-1">
                        — {JSON.stringify(log.details)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
