/**
 * HealthDashboard - Personal health and workload balancing view.
 * Aggregates habits, training/meal plans, recovery, sleep, wearables, agent suggestions.
 */

import { useHealthDashboard } from '@/hooks/use-health-dashboard'
import {
  TodayOverviewCard,
  HabitTrackerCard,
  TrainingMealPlanCard,
  RecoverySleepCard,
  WorkloadBalanceCard,
  WearablesStatusCard,
  AgentSuggestionsCard,
  MasterDashboardLinkCard,
  NotificationsPanel,
  TimelinePanel,
} from '@/components/health'
import { toast } from 'sonner'

export function HealthDashboard() {
  const {
    today,
    habits,
    plans,
    recovery,
    sleep,
    wearables,
    suggestions,
    workload,
    notifications,
    timeline,
    isLoading,
    error,
    toggleHabitItem,
    approveSuggestionItem,
    rejectSuggestionItem,
    triggerWearablesSync,
    applyWorkloadSuggestionItem,
    isSyncing,
  } = useHealthDashboard()

  const handleToggleHabit = async (id: string) => {
    try {
      await toggleHabitItem(id)
      toast.success('Habit updated')
    } catch {
      toast.error('Failed to update habit')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveSuggestionItem(id)
      toast.success('Suggestion approved')
    } catch {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectSuggestionItem(id)
      toast.success('Suggestion rejected')
    } catch {
      toast.error('Failed to reject')
    }
  }

  const handleWearablesSync = async () => {
    try {
      await triggerWearablesSync()
      toast.success('Wearables synced')
    } catch {
      toast.error('Failed to sync wearables')
    }
  }

  const handleApplyWorkload = async (id: string) => {
    try {
      await applyWorkloadSuggestionItem(id)
      toast.success('Schedule applied')
    } catch {
      toast.error('Failed to apply')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold">Health Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Personal health and workload balancing with habits, plans, recovery, and agent-driven automation
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* 12-column grid with 24-32px gutters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Main content - 8 columns */}
        <div className="lg:col-span-8 space-y-6">
          <TodayOverviewCard data={today} isLoading={isLoading} />

          <div className="grid md:grid-cols-2 gap-6">
            <HabitTrackerCard
              habits={habits ?? []}
              isLoading={isLoading}
              onToggle={handleToggleHabit}
            />
            <TrainingMealPlanCard plans={plans ?? []} isLoading={isLoading} />
          </div>

          <RecoverySleepCard
            recovery={recovery ?? []}
            sleep={sleep ?? []}
            isLoading={isLoading}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <WorkloadBalanceCard
              suggestions={workload ?? []}
              isLoading={isLoading}
              onApply={handleApplyWorkload}
            />
            <WearablesStatusCard
              wearables={wearables ?? []}
              isLoading={isLoading}
              isSyncing={isSyncing}
              onSync={handleWearablesSync}
            />
          </div>

          <AgentSuggestionsCard
            suggestions={suggestions ?? []}
            isLoading={isLoading}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>

        {/* Right rail - 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-4 space-y-6">
            <MasterDashboardLinkCard />
            <NotificationsPanel notifications={notifications ?? []} isLoading={isLoading} />
            <TimelinePanel events={timeline ?? []} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}
