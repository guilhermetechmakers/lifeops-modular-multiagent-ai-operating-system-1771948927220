/**
 * MasterDashboardMini - Summary tiles for modules, cronjobs, approvals, notifications, health.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  CheckSquare,
  Activity,
  Play,
  Check,
  X,
} from 'lucide-react'
import type { CronJob, Approval } from '@/types/finance'
import { Skeleton } from '@/components/ui/skeleton'

interface MasterDashboardMiniProps {
  cronjobs: CronJob[]
  approvals: Approval[]
  isLoading?: boolean
  onApprove?: (id: string) => Promise<void>
  onReject?: (id: string) => Promise<void>
  onTriggerCronjob?: (id: string) => Promise<void>
}

export function MasterDashboardMini({
  cronjobs = [],
  approvals = [],
  isLoading,
  onApprove,
  onReject,
  onTriggerCronjob,
}: MasterDashboardMiniProps) {
  const cronjobsList = cronjobs ?? []
  const approvalsList = (approvals ?? []).filter((a) => a.status === 'pending')
  const activeCronjobs = cronjobsList.filter((c) => c.enabled)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Master Dashboard</CardTitle>
        <CardDescription>
          Cronjobs, approvals, health
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status tiles */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg border border-border bg-card/50">
            <p className="text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 inline mr-1" />
              Active Cronjobs
            </p>
            <p className="text-lg font-bold">{activeCronjobs.length}</p>
          </div>
          <div className="p-2 rounded-lg border border-border bg-card/50">
            <p className="text-xs text-muted-foreground">
              <CheckSquare className="h-3.5 w-3.5 inline mr-1" />
              Pending Approvals
            </p>
            <p className="text-lg font-bold">{approvalsList.length}</p>
          </div>
        </div>

        {/* Cronjobs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Cronjobs</span>
            <Link to="/dashboard/cronjobs">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-2">
            {cronjobsList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No cronjobs</p>
            ) : (
              cronjobsList.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-border text-sm"
                >
                  <span className="truncate">{c.name}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant={c.enabled ? 'success' : 'secondary'} className="text-xs">
                      {c.enabled ? 'Active' : 'Paused'}
                    </Badge>
                    {onTriggerCronjob && c.enabled && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Trigger"
                        onClick={() => onTriggerCronjob(c.id)}
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Approvals */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Approvals</span>
            <Link to="/dashboard/approvals">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          {approvalsList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No pending approvals</p>
          ) : (
            <div className="space-y-2">
              {approvalsList.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-border text-sm"
                >
                  <span className="truncate">{a.requested_by}</span>
                  <div className="flex gap-1">
                    {onApprove && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Approve"
                        onClick={() => onApprove(a.id)}
                      >
                        <Check className="h-3.5 w-3.5 text-success" />
                      </Button>
                    )}
                    {onReject && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Reject"
                        onClick={() => onReject(a.id)}
                      >
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-success/30 bg-success/5">
          <span className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-success" />
            System Health
          </span>
          <Badge variant="success">Healthy</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
