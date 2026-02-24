/**
 * StatusBadge - Reusable badge with color mappings for run statuses.
 * Green: success, Red: failed, Amber: running/pending, Gray: canceled.
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RunStatus } from '@/types/runs'

const STATUS_CLASSES: Record<RunStatus, string> = {
  success: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',
  running: 'bg-warning/20 text-warning',
  pending: 'bg-warning/20 text-warning',
  canceled: 'bg-muted text-muted-foreground',
}

export interface StatusBadgeProps {
  status: RunStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      className={cn('text-xs font-medium', STATUS_CLASSES[status] ?? 'bg-muted text-muted-foreground', className)}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </Badge>
  )
}
