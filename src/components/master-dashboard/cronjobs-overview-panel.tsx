/**
 * CronjobsOverviewPanel - Summary of cronjobs with enable/disable/pause toggles.
 * Next run, last run details, quick edit access.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, PlayCircle, MoreVertical } from 'lucide-react'
import type { CronJob } from '@/types/master-dashboard'
interface CronjobsOverviewPanelProps {
  cronjobs: CronJob[]
  onPause?: (id: string) => Promise<void>
  onEnable?: (id: string) => Promise<void>
  onRunNow?: (id: string) => Promise<void>
  isLoading?: boolean
}

export function CronjobsOverviewPanel({
  cronjobs,
  onPause,
  onEnable,
  onRunNow,
  isLoading,
}: CronjobsOverviewPanelProps) {
  const list = Array.isArray(cronjobs) ? cronjobs : []
  const displayList = list.slice(0, 5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cronjobs</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
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
          <CardTitle>Cronjobs</CardTitle>
          <CardDescription>Next run times and status</CardDescription>
        </div>
        <Link to="/dashboard/cronjobs">
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {displayList.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No cronjobs configured</p>
            <Link to="/dashboard/cronjobs">
              <Button variant="outline" size="sm" className="mt-2">
                Create Cronjob
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {displayList.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="min-w-0">
                  <Link
                    to={`/dashboard/cronjobs/${job.id}`}
                    className="font-medium hover:text-primary block truncate"
                  >
                    {job.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {job.nextRun
                      ? `Next: ${new Date(job.nextRun).toLocaleString()}`
                      : job.lastRun
                        ? `Last: ${new Date(job.lastRun).toLocaleString()}`
                        : 'No runs'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={job.enabled && !job.paused ? 'success' : 'secondary'}
                    className="text-xs"
                  >
                    {job.paused ? 'Paused' : job.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                  {job.enabled && !job.paused && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRunNow?.(job.id)}
                      title="Run now"
                      aria-label="Run now"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {job.enabled && !job.paused && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onPause?.(job.id)}
                      title="Pause"
                      aria-label="Pause"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {(!job.enabled || job.paused) && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEnable?.(job.id)}
                      title="Enable"
                      aria-label="Enable"
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Link to={`/dashboard/cronjobs/${job.id}`}>
                    <Button variant="ghost" size="icon-sm" title="Edit" aria-label="Edit">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
