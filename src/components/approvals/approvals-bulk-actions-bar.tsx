/**
 * ApprovalsBulkActionsBar - Bulk approve/deny/request-info for selected approvals.
 */

import { Button } from '@/components/ui/button'
import { Check, X, MessageSquare } from 'lucide-react'

export interface ApprovalsBulkActionsBarProps {
  selectedCount: number
  onApprove: () => void
  onDeny: () => void
  onRequestInfo: () => void
  onClearSelection: () => void
  isLoading?: boolean
  canApprove?: boolean
  canDeny?: boolean
  canRequestInfo?: boolean
}

export function ApprovalsBulkActionsBar({
  selectedCount,
  onApprove,
  onDeny,
  onRequestInfo,
  onClearSelection,
  isLoading,
  canApprove = true,
  canDeny = true,
  canRequestInfo = true,
}: ApprovalsBulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card animate-in"
      role="toolbar"
      aria-label="Bulk actions"
    >
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="flex gap-2">
        {canApprove && (
          <Button
            variant="success"
            size="sm"
            onClick={onApprove}
            disabled={isLoading}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Approve
          </Button>
        )}
        {canDeny && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeny}
            disabled={isLoading}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Deny
          </Button>
        )}
        {canRequestInfo && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestInfo}
            disabled={isLoading}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Request Info
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        disabled={isLoading}
      >
        Clear selection
      </Button>
    </div>
  )
}
