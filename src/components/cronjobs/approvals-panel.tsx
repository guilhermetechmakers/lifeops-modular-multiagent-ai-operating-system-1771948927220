/**
 * ApprovalsPanel - Pending approvals with SLA status and inline actions.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Check, X, MessageSquare, Clock } from 'lucide-react'
import type { CronjobApproval } from '@/types/cronjobs'
import { Skeleton } from '@/components/ui/skeleton'

interface ApprovalsPanelProps {
  approvals: CronjobApproval[]
  onApprove?: (id: string, comments?: string) => Promise<void>
  onReject?: (id: string, comments?: string) => Promise<void>
  isLoading?: boolean
}

function formatSLA(slaEnd?: string): string {
  if (!slaEnd) return '—'
  const end = new Date(slaEnd)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (diff < 0) return 'Overdue'
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}

export function ApprovalsPanel({
  approvals,
  onApprove,
  onReject,
  isLoading,
}: ApprovalsPanelProps) {
  const list = Array.isArray(approvals) ? approvals : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approvals Queue</CardTitle>
          <CardDescription>Items requiring human review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
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
          <CardDescription>Items requiring human review</CardDescription>
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
        {list.length === 0 ? (
          <div className="py-12 text-center">
            <div className="rounded-lg p-4 bg-muted/30 inline-flex mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <p className="text-muted-foreground">No pending approvals</p>
            <p className="text-sm text-muted-foreground mt-1">
              When agents request approval, they&apos;ll appear here.
            </p>
            <Link to="/dashboard/approvals">
              <Button variant="outline" size="sm" className="mt-4">
                Go to Approvals
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {list.slice(0, 5).map((a) => (
              <ApprovalCard
                key={a.id}
                approval={a}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ApprovalCardProps {
  approval: CronjobApproval
  onApprove?: (id: string, comments?: string) => Promise<void>
  onReject?: (id: string, comments?: string) => Promise<void>
}

function ApprovalCard({ approval, onApprove, onReject }: ApprovalCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      await onApprove?.(approval.id, comments || undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      await onReject?.(approval.id, comments || undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  const slaText = formatSLA(approval.SLAEnd)
  const isOverdue = slaText === 'Overdue'

  return (
    <div className="rounded-lg border border-border p-4 space-y-3 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-3 min-w-0">
          <div className="rounded-lg p-2 bg-warning/20 shrink-0">
            <MessageSquare className="h-5 w-5 text-warning" />
          </div>
          <div className="min-w-0">
            <Link
              to={`/dashboard/approvals/${approval.id}`}
              className="font-medium hover:text-primary block truncate"
            >
              Cronjob approval
            </Link>
            <p className="text-sm text-muted-foreground">
              Run: {approval.runId ?? '—'} • {new Date(approval.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <Badge
          variant={isOverdue ? 'destructive' : 'warning'}
          className="shrink-0 text-xs"
        >
          <Clock className="h-3 w-3" />
          {slaText}
        </Badge>
      </div>
      {showComments && (
        <Textarea
          placeholder="Add a comment (optional)"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="min-h-[60px]"
        />
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="success"
          size="sm"
          onClick={handleApprove}
          disabled={isSubmitting}
          aria-label="Approve"
        >
          <Check className="h-4 w-4" />
          Approve
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleReject}
          disabled={isSubmitting}
          aria-label="Reject"
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? 'Hide comment' : 'Add comment'}
        </Button>
      </div>
    </div>
  )
}
