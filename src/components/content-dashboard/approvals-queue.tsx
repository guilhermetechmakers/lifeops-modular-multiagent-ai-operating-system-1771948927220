/**
 * ApprovalsQueue - Items requiring human review; inline actions and audit trail.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckSquare, Check, X } from 'lucide-react'
import type { Approval } from '@/types/content-dashboard'

interface ApprovalsQueueProps {
  approvals?: Approval[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  isLoading?: boolean
}

export function ApprovalsQueue({
  approvals = [],
  onApprove,
  onReject,
  isLoading,
}: ApprovalsQueueProps) {
  const list = approvals ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
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
          <CheckSquare className="h-5 w-5 text-primary" />
          Approvals
        </CardTitle>
        <CardDescription>
          Items requiring human review. Approve, reject, or edit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No pending approvals.</p>
        ) : (
          list.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Content: {a.contentItemId}</p>
                <p className="text-xs text-muted-foreground">By {a.requestedBy}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onApprove?.(a.id)}
                  aria-label="Approve"
                  className="text-success hover:bg-success/10"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onReject?.(a.id)}
                  aria-label="Reject"
                  className="text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
