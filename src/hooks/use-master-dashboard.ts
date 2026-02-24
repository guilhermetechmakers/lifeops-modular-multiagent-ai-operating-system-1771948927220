/**
 * Master Dashboard data hooks.
 * Fetches summary, health, cronjobs, runs, approvals, notifications, metrics, timeline.
 */

import { useState, useEffect, useCallback } from 'react'
import type {
  DashboardSummary,
  DashboardHealth,
  CronJob,
  Run,
  Approval,
  Notification,
  SystemMetric,
  TimelineEvent,
} from '@/types/master-dashboard'
import {
  fetchDashboardSummary,
  fetchDashboardHealth,
  fetchCronjobs,
  fetchRuns,
  fetchApprovals,
  fetchNotifications,
  fetchMetrics,
  fetchTimelineEvents,
  approveApproval,
  rejectApproval,
  pauseCronjob,
  enableCronjob,
  runCronjobNow,
} from '@/api/master-dashboard'

export function useMasterDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [health, setHealth] = useState<DashboardHealth | null>(null)
  const [cronjobs, setCronjobs] = useState<CronJob[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [s, h, c, r, a, n, m, t] = await Promise.all([
        fetchDashboardSummary(),
        fetchDashboardHealth(),
        fetchCronjobs({ limit: 20 }),
        fetchRuns({ limit: 10 }),
        fetchApprovals('pending'),
        fetchNotifications(),
        fetchMetrics(),
        fetchTimelineEvents(),
      ])
      setSummary(s)
      setHealth(h)
      setCronjobs(Array.isArray(c.items) ? c.items : [])
      setRuns(Array.isArray(r.items) ? r.items : [])
      setApprovals(Array.isArray(a) ? a : [])
      setNotifications(Array.isArray(n) ? n : [])
      setMetrics(Array.isArray(m) ? m : [])
      setTimeline(Array.isArray(t) ? t : [])
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load dashboard'))
      setSummary(null)
      setHealth(null)
      setCronjobs([])
      setRuns([])
      setApprovals([])
      setNotifications([])
      setMetrics([])
      setTimeline([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = useCallback(async (id: string) => {
    await approveApproval(id)
    setApprovals((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const handleReject = useCallback(async (id: string) => {
    await rejectApproval(id)
    setApprovals((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const handlePauseCronjob = useCallback(async (id: string) => {
    await pauseCronjob(id)
    setCronjobs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, paused: true } : c))
    )
  }, [])

  const handleEnableCronjob = useCallback(async (id: string) => {
    await enableCronjob(id)
    setCronjobs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: true, paused: false } : c))
    )
  }, [])

  const handleRunCronjobNow = useCallback(async (id: string) => {
    await runCronjobNow(id)
    load()
  }, [load])

  return {
    summary,
    agents: health?.agents ?? [],
    cronjobs,
    runs,
    approvals,
    notifications,
    metrics,
    timeline,
    isLoading,
    error,
    refetch: load,
    approveApproval: handleApprove,
    rejectApproval: handleReject,
    pauseCronjob: handlePauseCronjob,
    enableCronjob: handleEnableCronjob,
    runCronjobNow: handleRunCronjobNow,
  }
}
