/**
 * ApprovalsQueueView - List of items requiring human review.
 * Priority, source module, context snippet; actions: Approve, Request Change, Reject, Escalate.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, MessageSquare } from 'lucide-react'
import type { Approval } from '@/types/master-dashboard'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ApprovalsQueueViewProps {
  approvals: Approval[]
  onApprove?: (id: string) => Promise<void>
  onReject?: (id: string) => Promise<void>
  isLoading?: boolean
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-warning/20 text-warning',
  low: 'bg-muted text-muted-foreground',
}

const TYPE_LABELS: Record<string, string> = {
  cronjob: 'Cronjob',
  'agent-change': 'Agent Change',
  release: 'Release',
  financial: 'Financial',
}

export function ApprovalsQueueView({
  approvals,
  onApprove,
  onReject,
  isLoading,
}: ApprovalsQueueViewProps) {
  const list = Array.isArray(approvals) ? approvals.filter((a) => a.status === 'pending') : []
  const displayList = list.slice(0, 5)

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

  const handleApprove = async (id: string) => {
    try {
      await onApprove?.(id)
      toast.success('Approved')
    } catch {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await onReject?.(id)
      toast.success('Rejected')
    } catch {
      toast.error('Failed to reject')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Approvals Queue</CardTitle>
          <CardDescription>Items requiring human review</CardDescription>
        </div>
        <Link to="/dashboard/approvals">
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {displayList.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No pending approvals</p>
            <Link to="/dashboard/approvals">
              <Button variant="outline" size="sm" className="mt-2">
                Go to Approvals
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayList.map((a) => {
              const details = a.details as { title?: string } | undefined
              const title = details?.title ?? `${a.type} from ${a.requester}`

              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="rounded-lg p-2 bg-warning/20 shrink-0">
                      <MessageSquare className="h-5 w-5 text-warning" />
                    </div>
                    <div className="min-w-0">
                      <Link to={`/dashboard/approvals/${a.id}`} className="font-medium hover:text-primary block truncate">
                        {title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {a.requester} • {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={cn('text-xs', PRIORITY_COLORS[a.priority ?? 'low'])}>
                      {a.priority ?? 'low'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[a.type] ?? a.type}
                    </Badge>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(a.id)}
                      aria-label="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(a.id)}
                      aria-label="Reject"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
