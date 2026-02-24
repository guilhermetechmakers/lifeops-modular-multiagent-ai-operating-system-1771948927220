/**
 * AuditTrailViewer - Display of change history and revert actions.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { History, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AuditTrailEntry {
  id: string
  timestamp: string
  userId?: string
  userName?: string
  action: string
  field?: string
  before?: unknown
  after?: unknown
  revertable?: boolean
}

export interface AuditTrailViewerProps {
  entries: AuditTrailEntry[]
  isLoading?: boolean
  onRevert?: (entryId: string) => void
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString()
}

export function AuditTrailViewer({
  entries,
  isLoading,
  onRevert,
}: AuditTrailViewerProps) {
  const items = Array.isArray(entries) ? entries : []

  if (isLoading && items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Audit Trail
        </CardTitle>
        <CardDescription>
          Change history and who made changes. Revert when allowed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No audit entries yet</p>
            <p className="text-muted-foreground text-xs mt-1">
              Changes will appear here when the cronjob is updated
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-start justify-between gap-4 p-3 rounded-lg',
                  'border border-border hover:border-primary/30 transition-colors'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{entry.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.userName ?? entry.userId ?? 'System'} •{' '}
                    {formatTime(entry.timestamp)}
                    {entry.field && ` • ${entry.field}`}
                  </p>
                  {entry.before != null && entry.after != null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {String(entry.before)} → {String(entry.after)}
                    </p>
                  )}
                </div>
                {entry.revertable && onRevert && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRevert(entry.id)}
                    aria-label={`Revert ${entry.action}`}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
