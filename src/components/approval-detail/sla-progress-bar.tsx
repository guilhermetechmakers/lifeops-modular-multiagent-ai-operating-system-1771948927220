/**
 * SLAProgressBar - Visual gauge for SLA status and remaining time.
 */

import type { ApprovalSLA } from '@/types/approvals'

export interface SLAProgressBarProps {
  sla: ApprovalSLA
  className?: string
}

export function SLAProgressBar({ sla, className }: SLAProgressBarProps) {
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m`
    return '< 1m'
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">SLA</span>
        <span
          className={
            sla.status === 'ok'
              ? 'text-success font-medium'
              : sla.status === 'escalated'
                ? 'text-warning font-medium'
                : 'text-destructive font-medium'
          }
        >
          {sla.status === 'ok' ? 'On time' : sla.status === 'escalated' ? 'Escalated' : 'Overdue'}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
        <div
          className={`h-full rounded-full ${
            sla.status === 'ok' ? 'bg-success' : sla.status === 'escalated' ? 'bg-warning' : 'bg-destructive'
          }`}
          style={{
            width: `${Math.min(100, Math.max(0, 100 - (sla.remainingMs / 86400000) * 100))}%`,
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {sla.remainingMs > 0 ? `${formatTime(sla.remainingMs)} remaining` : 'Overdue'}
        {sla.dueAt && ` • Due ${new Date(sla.dueAt).toLocaleString()}`}
      </p>
    </div>
  )
}
