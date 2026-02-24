/**
 * ContentMasterDashboardPage - Command center for content module.
 * Cronjobs overview, approvals queue, notifications, health indicators.
 * Quick-action toolbar for creating content, starting agent tasks, triggering runs.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  CheckSquare,
  Plus,
  FileText,
  Database,
  Play,
  Pause,
  Check,
  X,
} from 'lucide-react'
import {
  useContentItems,
  useContentCronjobs,
  useContentApprovals,
} from '@/hooks/use-content-dashboard'
import { toast } from 'sonner'

export function ContentMasterDashboardPage() {
  const { items, isLoading: itemsLoading } = useContentItems()
  const { cronjobs, isLoading: cronLoading, pause, enable } = useContentCronjobs()
  const { approvals, isLoading: approvalsLoading, approve, reject } = useContentApprovals()

  const contentItems = Array.isArray(items) ? items : []
  const pendingApprovals = (approvals ?? []).filter((a) => a.status === 'pending')
  const activeCronjobs = (cronjobs ?? []).filter((c) => c.enabled)

  const handlePauseCronjob = async (id: string) => {
    try {
      await pause(id)
      toast.success('Cronjob paused')
    } catch {
      toast.error('Failed to pause cronjob')
    }
  }

  const handleEnableCronjob = async (id: string) => {
    try {
      await enable(id)
      toast.success('Cronjob enabled')
    } catch {
      toast.error('Failed to enable cronjob')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approve(id)
      toast.success('Approved')
    } catch {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await reject(id)
      toast.success('Rejected')
    } catch {
      toast.error('Failed to reject')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold">Content Master Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Command center for content pipeline, cronjobs, and approvals
        </p>
      </div>

      {/* Status cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{itemsLoading ? '—' : contentItems.length}</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Cronjobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{cronLoading ? '—' : activeCronjobs.length}</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{approvalsLoading ? '—' : pendingApprovals.length}</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Pipeline Health
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Cronjobs</CardTitle>
              <CardDescription>Next run, last run, pause/resume</CardDescription>
            </div>
            <Link to="/dashboard/cronjobs">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {(cronjobs ?? []).length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No cronjobs</p>
            ) : (
              <div className="space-y-3">
                {(cronjobs ?? []).slice(0, 4).map((c) => (
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
                    <div className="flex items-center gap-2">
                      <Badge variant={c.enabled ? 'success' : 'secondary'}>
                        {c.enabled ? 'Active' : 'Paused'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={c.enabled ? 'Pause' : 'Enable'}
                        onClick={() => (c.enabled ? handlePauseCronjob(c.id) : handleEnableCronjob(c.id))}
                      >
                        {c.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Approvals Queue</CardTitle>
              <CardDescription>Items requiring human review</CardDescription>
            </div>
            <Link to="/dashboard/approvals">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <div className="py-8 text-center">
                <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{a.contentItemId}</p>
                      <p className="text-xs text-muted-foreground">{a.requestedBy}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleApprove(a.id)}
                      >
                        <Check className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleReject(a.id)}
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Create content, start agent tasks, trigger runs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link to="/dashboard/content">
              <Button className="gap-2 transition-all duration-200 hover:scale-[1.02]">
                <Plus className="h-4 w-4" />
                New Content
              </Button>
            </Link>
            <Link to="/dashboard/content/library">
              <Button variant="outline" className="gap-2 transition-all duration-200 hover:scale-[1.02]">
                <FileText className="h-4 w-4" />
                Content Library
              </Button>
            </Link>
            <Link to="/dashboard/cronjobs">
              <Button variant="outline" className="gap-2 transition-all duration-200 hover:scale-[1.02]">
                <Clock className="h-4 w-4" />
                Manage Cronjobs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
