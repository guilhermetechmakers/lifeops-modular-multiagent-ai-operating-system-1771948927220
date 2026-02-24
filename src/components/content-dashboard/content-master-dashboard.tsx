/**
 * ContentMasterDashboard - Content-specific command center.
 * Summary cards, cronjobs overview, approvals queue, notifications, health.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Zap,
  CheckSquare,
  Bell,
  Activity,
  Plus,
  Clock,
  Play,
  Pause,
} from 'lucide-react'
import type { CronJob, Approval } from '@/types/content-dashboard'
import { ApprovalsQueue } from './approvals-queue'

interface ContentMasterDashboardProps {
  contentCount?: number
  pipelineCount?: number
  cronjobs?: CronJob[]
  approvals?: Approval[]
  notifications?: { id: string; message: string; timestamp: string }[]
  isLoading?: boolean
}

export function ContentMasterDashboard({
  contentCount = 0,
  pipelineCount = 0,
  cronjobs = [],
  approvals = [],
  notifications = [],
  isLoading,
}: ContentMasterDashboardProps) {
  const cronjobsList = cronjobs ?? []
  const approvalsList = approvals ?? []
  const notificationsList = notifications ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Content Master</h1>
        <p className="text-muted-foreground mt-1">
          Command center for content pipeline, cronjobs, and approvals.
        </p>
      </div>

      {/* Status cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{contentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Pipeline Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pipelineCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{approvalsList.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success" className="text-sm">Healthy</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Cronjobs + Approvals */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Cronjobs
            </CardTitle>
            <CardDescription>Next run, last run, pause/resume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {cronjobsList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No cronjobs.</p>
            ) : (
              cronjobsList.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
                >
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Next: {c.nextRun ? new Date(c.nextRun).toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={c.enabled ? 'success' : 'secondary'}>
                      {c.enabled ? 'Active' : 'Paused'}
                    </Badge>
                    <Button variant="ghost" size="icon-sm" aria-label={c.enabled ? 'Pause' : 'Enable'}>
                      {c.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <ApprovalsQueue
          approvals={approvalsList}
          onApprove={() => {}}
          onReject={() => {}}
          isLoading={isLoading}
        />
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notificationsList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No recent notifications.</p>
          ) : (
            <div className="space-y-2">
              {notificationsList.slice(0, 5).map((n) => (
                <div key={n.id} className="p-2 rounded-lg border border-border text-sm">
                  {n.message}
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Create content or trigger agent tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link to="/dashboard/content">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Content
              </Button>
            </Link>
            <Link to="/dashboard/content/library">
              <Button variant="outline" className="gap-2">
                Browse Library
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
