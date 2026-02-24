/**
 * Cronjobs Dashboard - List view with search, filters, cards, approvals, health.
 */

import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  SearchBar,
  FiltersBar,
  CronjobListCard,
  ApprovalsPanel,
  HealthIndicator,
} from '@/components/cronjobs'
import { useCronjobs, useCronjobApprovals, useCronjobHealth } from '@/hooks/use-cronjobs'
import type { StatusFilter, TargetTypeFilter } from '@/components/cronjobs'
import { toast } from 'sonner'
import {
  triggerCronjob,
  pauseCronjob,
  enableCronjob,
  disableCronjob,
} from '@/api/cronjobs'

export function CronjobsDashboard() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [targetType, setTargetType] = useState<TargetTypeFilter>('all')
  const [page, setPage] = useState(1)

  const filters = {
    search,
    status: status === 'all' ? undefined : status,
    targetType: targetType === 'all' ? undefined : targetType,
    page,
    limit: 20,
  }

  const { cronjobs, total, isLoading, error, refetch } = useCronjobs(filters)
  const { approvals, isLoading: approvalsLoading, approveApproval, rejectApproval } = useCronjobApprovals()
  const { health, refetch: refetchHealth } = useCronjobHealth()

  const handleRunNow = useCallback(async (id: string) => {
    try {
      await triggerCronjob(id)
      toast.success('Run triggered')
      refetch()
      refetchHealth()
    } catch {
      toast.error('Failed to trigger run')
    }
  }, [refetch, refetchHealth])

  const handlePause = useCallback(async (id: string) => {
    try {
      await pauseCronjob(id)
      toast.success('Cronjob paused')
      refetch()
      refetchHealth()
    } catch {
      toast.error('Failed to pause')
    }
  }, [refetch, refetchHealth])

  const handleEnable = useCallback(async (id: string) => {
    try {
      await enableCronjob(id)
      toast.success('Cronjob enabled')
      refetch()
      refetchHealth()
    } catch {
      toast.error('Failed to enable')
    }
  }, [refetch, refetchHealth])

  const handleDisable = useCallback(async (id: string) => {
    try {
      await disableCronjob(id)
      toast.success('Cronjob disabled')
      refetch()
      refetchHealth()
    } catch {
      toast.error('Failed to disable')
    }
  }, [refetch, refetchHealth])

  const handleApprove = useCallback(async (id: string, comments?: string) => {
    try {
      await approveApproval(id, comments)
      toast.success('Approved')
    } catch {
      toast.error('Failed to approve')
    }
  }, [approveApproval])

  const handleReject = useCallback(async (id: string, comments?: string) => {
    try {
      await rejectApproval(id, comments)
      toast.success('Rejected')
    } catch {
      toast.error('Failed to reject')
    }
  }, [rejectApproval])

  const handleClearFilters = useCallback(() => {
    setSearch('')
    setStatus('all')
    setTargetType('all')
    setPage(1)
  }, [])

  const list = Array.isArray(cronjobs) ? cronjobs : []

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cronjobs</h1>
          <p className="text-muted-foreground mt-1">
            Manage scheduled jobs and multi-agent workflows
          </p>
        </div>
        <Link to="/dashboard/cronjobs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Cronjob
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="py-4">
            <p className="text-destructive">{error.message}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <SearchBar value={search} onChange={setSearch} />
                <FiltersBar
                  status={status}
                  targetType={targetType}
                  onStatusChange={setStatus}
                  onTargetTypeChange={setTargetType}
                  onClear={handleClearFilters}
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="h-24 bg-muted/30 rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : list.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground text-center">No cronjobs found</p>
                <Link to="/dashboard/cronjobs/new">
                  <Button variant="outline" className="mt-4">
                    Create your first cronjob
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {list.map((job) => (
                <CronjobListCard
                  key={job.id}
                  cronjob={job}
                  onRunNow={handleRunNow}
                  onPause={handlePause}
                  onEnable={handleEnable}
                  onDisable={handleDisable}
                />
              ))}
            </div>
          )}

          {total > 20 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * 20 >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <HealthIndicator
            status={health?.status ?? 'healthy'}
            cronjobsActive={health?.cronjobsActive ?? 0}
            cronjobsPaused={health?.cronjobsPaused ?? 0}
          />
          <ApprovalsPanel
            approvals={approvals}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={approvalsLoading}
          />
        </div>
      </div>
    </div>
  )
}
