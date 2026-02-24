/**
 * Master Dashboard - Central hub for LifeOps.
 * Overview cards, timeline, metrics, approvals, cronjobs, modules.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { MasterDashboardEntry } from '@/components/onboarding'
import {
  OverviewCardsPanel,
  TimelinePanel,
  MetricsDashboard,
  ApprovalsQueueView,
  CronjobsOverviewPanel,
  NotificationsPanel,
  RecentRunsCard,
  AgentConsoleLinkCard,
  HealthModuleOverview,
  ProjectsOverviewPanel,
  ContentOverviewPanel,
  WorkflowEditorAccess,
} from '@/components/master-dashboard'
import { useMasterDashboard } from '@/hooks/use-master-dashboard'

const ONBOARDING_FLAG = 'lifeops_just_completed_onboarding'

function getIsNewUser(): boolean {
  if (typeof window === 'undefined') return false
  const flag = sessionStorage.getItem(ONBOARDING_FLAG)
  if (flag === 'true') {
    sessionStorage.removeItem(ONBOARDING_FLAG)
    return true
  }
  return false
}

export function MasterDashboard() {
  const [isNewUser] = useState(getIsNewUser)

  const {
    summary,
    agents,
    cronjobs,
    runs,
    approvals,
    notifications,
    metrics,
    timeline,
    isLoading,
    error,
    approveApproval,
    rejectApproval,
    pauseCronjob,
    enableCronjob,
    runCronjobNow,
  } = useMasterDashboard()

  return (
    <div className="space-y-8 animate-in-up">
      {isNewUser && (
        <MasterDashboardEntry
          isNewUser
          stats={{
            cronjobsCount: cronjobs.length,
            nextRun: cronjobs[0]?.nextRun,
            pendingApprovals: approvals.length,
          }}
        />
      )}

      <div>
        <h1 className="text-3xl font-bold">Master Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Command center for your automation ecosystem
        </p>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="py-4">
            <p className="text-destructive">{error.message}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Overview cards */}
      <OverviewCardsPanel summary={summary} agents={agents} isLoading={isLoading} />

      {/* Timeline + Recent Runs */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimelinePanel events={timeline} isLoading={isLoading} />
        </div>
        <RecentRunsCard runs={runs} isLoading={isLoading} />
      </div>

      {/* Metrics */}
      <MetricsDashboard metrics={metrics} isLoading={isLoading} />

      {/* Approvals + Cronjobs + Notifications - Bento grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <ApprovalsQueueView
          approvals={approvals}
          onApprove={approveApproval}
          onReject={rejectApproval}
          isLoading={isLoading}
        />
        <CronjobsOverviewPanel
          cronjobs={cronjobs}
          onPause={pauseCronjob}
          onEnable={enableCronjob}
          onRunNow={runCronjobNow}
          isLoading={isLoading}
        />
        <NotificationsPanel notifications={notifications} isLoading={isLoading} />
      </div>

      {/* Module overview cards - Bento grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AgentConsoleLinkCard />
        <HealthModuleOverview />
        <ProjectsOverviewPanel />
        <ContentOverviewPanel />
      </div>

      {/* Workflow + Quick actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <WorkflowEditorAccess />
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Create or manage your automation</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard/cronjobs">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Cronjob
                </Button>
              </Link>
              <Link to="/dashboard/workflows">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Workflow
                </Button>
              </Link>
              <Link to="/dashboard/approvals">
                <Button variant="outline">Review Approvals</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
