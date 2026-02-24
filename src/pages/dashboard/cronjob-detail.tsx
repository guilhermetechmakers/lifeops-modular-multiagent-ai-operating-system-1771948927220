/**
 * Cronjob Detail Page - Full editor with schedule, trigger, outputs, quick actions.
 */

import { useParams, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Pause, PlayCircle, History } from 'lucide-react'
import { useCronjobDetail, useCronjobRuns } from '@/hooks/use-cronjobs'
import { CronjobDetailPanel, OutputsViewer } from '@/components/cronjobs'
import { toast } from 'sonner'

export function CronjobDetailPage() {
  const { id } = useParams()

  const {
    cronjob,
    isLoading,
    error,
    refetch,
    update,
    trigger,
    pause,
    enable,
    disable,
  } = useCronjobDetail(id)

  const { runs, total: runsTotal, isLoading: runsLoading, refetch: refetchRuns } =
    useCronjobRuns(id, { limit: 10 })

  const handleScheduleChange = async (
    schedule: string | { cron?: string; humanReadable?: string },
    timezone: string
  ) => {
    try {
      const scheduleValue =
        typeof schedule === 'string'
          ? schedule
          : { cron: schedule?.cron ?? '', timezone, humanReadable: schedule?.humanReadable }
      await update({ schedule: scheduleValue, timezone })
      toast.success('Schedule updated')
    } catch {
      toast.error('Failed to update schedule')
    }
  }

  const handleRunNow = async () => {
    try {
      await trigger()
      toast.success('Cronjob triggered')
      refetchRuns()
    } catch {
      toast.error('Failed to trigger cronjob')
    }
  }

  if (isLoading && !cronjob) {
    return (
      <div className="space-y-8 animate-in-up">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted/30 animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-muted/30 rounded-xl animate-pulse" />
              <div className="h-48 bg-muted/30 rounded-xl animate-pulse" />
          </div>
          <div className="h-48 bg-muted/30 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !cronjob) {
    return (
      <div className="space-y-8 animate-in-up">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/cronjobs">
            <Button variant="ghost" size="icon" aria-label="Back to cronjobs">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="py-8">
            <p className="text-destructive">
              {error?.message ?? 'Cronjob not found'}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Link to="/dashboard/cronjobs">
                <Button>Back to Cronjobs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusLabel = cronjob.paused
    ? 'Paused'
    : cronjob.enabled
      ? 'Active'
      : 'Disabled'

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/cronjobs">
            <Button variant="ghost" size="icon" aria-label="Back to cronjobs">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{cronjob.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              Cronjob #{cronjob.id}
              <Badge variant={cronjob.enabled && !cronjob.paused ? 'success' : 'secondary'}>
                {statusLabel}
              </Badge>
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CronjobDetailPanel
            cronjob={cronjob}
            onScheduleChange={handleScheduleChange}
            isEditing={false}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {cronjob.enabled && !cronjob.paused && (
                  <>
                    <Button
                      className="w-full gap-2"
                      onClick={handleRunNow}
                    >
                      <Play className="h-4 w-4" />
                      Run Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => pause()}
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  </>
                )}
                {(!cronjob.enabled || cronjob.paused) && (
                  <Button
                    variant="success"
                    className="w-full gap-2"
                    onClick={() => enable()}
                  >
                    <PlayCircle className="h-4 w-4" />
                    Enable
                  </Button>
                )}
                {cronjob.enabled && !cronjob.paused && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => disable()}
                  >
                    Disable
                  </Button>
                )}
                <Link to={`/dashboard/runs?cronjobId=${cronjob.id}`} className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <History className="h-4 w-4" />
                    Run History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <OutputsViewer
            runs={runs}
            cronjobId={cronjob.id}
            total={runsTotal}
            isLoading={runsLoading}
            onLoadMore={refetchRuns}
          />
        </div>
      </div>
    </div>
  )
}
