/**
 * CronjobsApprovalsPanel - Pending approvals with SLA status and inline actions.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Clock, MessageSquare } from 'lucide-react'
import type { CronjobApproval } from '@/types/cronjobs'

function formatSLA(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  if (diff < 0) return 'Overdue'
  if (diff < 3600000) return `${Math.round(diff / 60000)}m left`
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h left`
  return d.toLocaleDateString()
}

export interface CronjobsApprovalsPanelProps {
  approvals: CronjobApproval[]
  onApprove?: (id: string, comment?: string) => void
  onReject?: (id: string, comment?: string) => void
  isLoading?: boolean
  maxItems?: number
}

export function CronjobsApprovalsPanel({
  approvals,
  onApprove,
  onReject,
  isLoading,
  maxItems = 5,
}: CronjobsApprovalsPanelProps) {
  const list = Array.isArray(approvals) ? approvals : []
  const displayList = list.slice(0, maxItems)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approvals Queue</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Approvals Queue</CardTitle>
          <CardDescription>
            {list.length > 0
              ? `${list.length} pending approval${list.length === 1 ? '' : 's'}`
              : 'No pending approvals'}
          </CardDescription>
        </div>
        {list.length > 0 && (
          <Link to="/dashboard/approvals">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {displayList.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              No pending approvals. When cronjobs require human review, they&apos;ll appear here.
            </p>
            <Link to="/dashboard/approvals">
              <Button variant="outline" size="sm" className="mt-4">
                Open Approvals
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {displayList.map((approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/dashboard/approvals/${approval.id}`}
                    className="font-medium hover:text-primary block truncate"
                  >
                    Cronjob {approval.cronjobId}
                  </Link>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                    SLA: {formatSLA(approval.SLAEnd)}
                  </p>
                  {(approval.comments?.length ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {approval.comments?.length} comment(s)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Button
                    variant="success"
                    size="icon-sm"
                    onClick={() => onApprove?.(approval.id)}
                    title="Approve"
                    aria-label="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => onReject?.(approval.id)}
                    title="Reject"
                    aria-label="Reject"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
