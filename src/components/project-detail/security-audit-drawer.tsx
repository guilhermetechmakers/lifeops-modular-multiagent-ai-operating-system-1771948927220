/**
 * SecurityAuditDrawer - Access logs, action history, audit trail.
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Shield, History, RotateCcw } from 'lucide-react'
import type { AuditLogEntry } from '@/types/project-detail'

export interface SecurityAuditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auditLogs: AuditLogEntry[]
  projectId: string
}

export function SecurityAuditDrawer({
  open,
  onOpenChange,
  auditLogs,
  projectId: _projectId,
}: SecurityAuditDrawerProps) {
  const logs = auditLogs ?? []

  const formatTime = (s: string) => new Date(s).toLocaleString()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security & Audit
          </SheetTitle>
          <SheetDescription>
            Access logs, action history, role-based permissions
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center text-sm">
                No audit logs yet. Actions will be recorded here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {logs.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-border bg-card/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{entry.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.userName ?? entry.userId ?? 'System'} • {formatTime(entry.timestamp)}
                      </p>
                      {entry.traceId && (
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {entry.traceId}
                        </p>
                      )}
                      {entry.rationale && (
                        <p className="text-xs text-muted-foreground mt-1">{entry.rationale}</p>
                      )}
                    </div>
                    {entry.reversible && (
                      <Badge variant="outline" className="shrink-0 gap-1">
                        <RotateCcw className="h-3 w-3" />
                        Reversible
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
