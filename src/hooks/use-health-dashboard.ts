/**
 * useHealthDashboard - Data fetching and state for Health Dashboard.
 */

import { useState, useCallback, useEffect } from 'react'
import type {
  Habit,
  Plan,
  RecoveryMetrics,
  SleepData,
  Wearable,
  AgentSuggestion,
  RunArtifact,
  TodayOverview,
  WorkloadSuggestion,
  HealthNotification,
  TimelineEvent,
} from '@/types/health'
import {
  fetchHealthDashboard,
  toggleHabit,
  approveSuggestion,
  rejectSuggestion,
  syncWearables,
  applyWorkloadSuggestion,
} from '@/api/health'

export function useHealthDashboard() {
  const [today, setToday] = useState<TodayOverview | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [recovery, setRecovery] = useState<RecoveryMetrics[]>([])
  const [sleep, setSleep] = useState<SleepData[]>([])
  const [wearables, setWearables] = useState<Wearable[]>([])
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([])
  const [runArtifacts, setRunArtifacts] = useState<RunArtifact[]>([])
  const [workload, setWorkload] = useState<WorkloadSuggestion[]>([])
  const [notifications, setNotifications] = useState<HealthNotification[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchHealthDashboard()
      setToday(data?.today ?? null)
      setHabits(data?.habits ?? [])
      setPlans(data?.plans ?? [])
      setRecovery(data?.recovery ?? [])
      setSleep(data?.sleep ?? [])
      setWearables(data?.wearables ?? [])
      setSuggestions(data?.suggestions ?? [])
      setRunArtifacts(data?.runArtifacts ?? [])
      setWorkload(data?.workload ?? [])
      setNotifications(data?.notifications ?? [])
      setTimeline(data?.timeline ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleHabitItem = useCallback(async (id: string) => {
    const updated = await toggleHabit(id)
    setHabits((prev) => (prev ?? []).map((h) => (h.id === id ? updated : h)))
    return updated
  }, [])

  const approveSuggestionItem = useCallback(async (id: string) => {
    await approveSuggestion(id)
    setSuggestions((prev) => (prev ?? []).map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s)))
  }, [])

  const rejectSuggestionItem = useCallback(async (id: string) => {
    await rejectSuggestion(id)
    setSuggestions((prev) => (prev ?? []).map((s) => (s.id === id ? { ...s, status: 'rejected' as const } : s)))
  }, [])

  const triggerWearablesSync = useCallback(async () => {
    setIsSyncing(true)
    try {
      await syncWearables()
      await load()
    } finally {
      setIsSyncing(false)
    }
  }, [load])

  const applyWorkloadSuggestionItem = useCallback(async (id: string) => {
    await applyWorkloadSuggestion(id)
    setWorkload((prev) => (prev ?? []).map((s) => (s.id === id ? { ...s, status: 'applied' as const } : s)))
  }, [])

  return {
    today,
    habits,
    plans,
    recovery,
    sleep,
    wearables,
    suggestions,
    runArtifacts,
    workload,
    notifications,
    timeline,
    isLoading,
    error,
    refetch: load,
    toggleHabitItem,
    approveSuggestionItem,
    rejectSuggestionItem,
    triggerWearablesSync,
    applyWorkloadSuggestionItem,
    isSyncing,
  }
}
