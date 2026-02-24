/**
 * Health Dashboard API layer.
 * Uses mock data for prototyping; replace with real API when backend is ready.
 */

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
import { apiGet, apiPost } from '@/lib/api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'
const STORAGE_KEY = 'lifeops_health_mock'

// --- Mock data ---

const MOCK_HABITS: Habit[] = [
  { id: 'h1', name: 'Morning meditation', isCompleted: true, streak: 7, target: 'daily', lastUpdated: new Date().toISOString() },
  { id: 'h2', name: '10k steps', isCompleted: false, streak: 3, target: 'daily', lastUpdated: new Date().toISOString() },
  { id: 'h3', name: 'No screens after 10pm', isCompleted: true, streak: 5, target: 'daily', lastUpdated: new Date().toISOString() },
  { id: 'h4', name: 'Drink 8 glasses water', isCompleted: false, streak: 2, target: 'daily', lastUpdated: new Date().toISOString() },
]

const MOCK_PLANS: Plan[] = [
  { id: 'p1', type: 'training', title: 'Strength 3x/week', progress: 67, agentSuggestion: undefined },
  { id: 'p2', type: 'meal', title: 'Mediterranean diet', progress: 85, agentSuggestion: undefined },
]

const MOCK_RECOVERY: RecoveryMetrics[] = [
  { id: 'r1', hrV: 52, restingHR: 58, recoveryScore: 82, sleepQuality: 78, sleepDurationHours: 7.2, timestamp: new Date().toISOString() },
  { id: 'r2', hrV: 48, restingHR: 62, recoveryScore: 75, sleepQuality: 72, sleepDurationHours: 6.5, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'r3', hrV: 55, restingHR: 56, recoveryScore: 88, sleepQuality: 85, sleepDurationHours: 7.8, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
]

const MOCK_SLEEP: SleepData[] = [
  { date: '2025-02-24', duration: 7.2, quality: 78, stages: { light: 180, deep: 90, REM: 120 } },
  { date: '2025-02-23', duration: 6.5, quality: 72, stages: { light: 200, deep: 70, REM: 100 } },
  { date: '2025-02-22', duration: 7.8, quality: 85, stages: { light: 160, deep: 110, REM: 130 } },
]

const MOCK_WEARABLES: Wearable[] = [
  { id: 'w1', name: 'Apple Watch', connected: true, lastSync: new Date(Date.now() - 3600000).toISOString(), dataGaps: false },
  { id: 'w2', name: 'Oura Ring', connected: true, lastSync: new Date(Date.now() - 7200000).toISOString(), dataGaps: false },
]

const MOCK_SUGGESTIONS: AgentSuggestion[] = [
  { id: 's1', title: 'Adjust training intensity', summary: 'Based on recovery score, suggest lighter session today', impact: 0.8, status: 'pending', runId: 'run1', createdAt: new Date().toISOString() },
  { id: 's2', title: 'Add afternoon snack', summary: 'Meal plan compliance low; suggest protein-rich snack', impact: 0.6, status: 'pending', runId: 'run2', createdAt: new Date(Date.now() - 86400000).toISOString() },
]

const MOCK_RUN_ARTIFACTS: RunArtifact[] = [
  { id: 'ra1', prompt: 'Analyze recovery', variables: {}, scope: 'health', logs: ['Started', 'Fetched HRV', 'Computed score'], diffs: [], artifacts: ['recovery_report.json'], outcome: 'success', timestamp: new Date().toISOString() },
]

const MOCK_TODAY: TodayOverview = {
  steps: 6842,
  activeMinutes: 42,
  sleepHours: 7.2,
  hrV: 52,
  restingHR: 58,
}

const MOCK_WORKLOAD: WorkloadSuggestion[] = [
  { id: 'wl1', title: 'Reduce meeting load', summary: 'Move 2 meetings to async', suggestedAdjustments: ['Reschedule standup', 'Convert sync to async'], impact: 0.7 },
]

const MOCK_NOTIFICATIONS: HealthNotification[] = [
  { id: 'n1', type: 'approval', title: 'Training adjustment pending', message: 'Agent suggests lighter session today', timestamp: new Date().toISOString(), read: false },
  { id: 'n2', type: 'health', title: 'Sleep consistency', message: '3-day average improved', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
]

const MOCK_TIMELINE: TimelineEvent[] = [
  { id: 't1', type: 'run', title: 'Recovery analysis', description: 'HRV-based recovery score computed', timestamp: new Date().toISOString(), runId: 'run1' },
  { id: 't2', type: 'handoff', title: 'Habit agent → Plan agent', description: 'Streak data passed for plan optimization', timestamp: new Date(Date.now() - 3600000).toISOString(), runId: 'run1' },
]

function getStored<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) {
      const parsed = JSON.parse(s) as Record<string, T>
      return parsed[key] ?? fallback
    }
  } catch {
    // ignore
  }
  return fallback
}

function setStored(key: string, value: unknown) {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    const parsed = s ? (JSON.parse(s) as Record<string, unknown>) : {}
    parsed[key] = value
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  } catch {
    // ignore
  }
}

// --- API functions ---

export async function fetchHealthDashboard(): Promise<{
  today: TodayOverview
  habits: Habit[]
  plans: Plan[]
  recovery: RecoveryMetrics[]
  sleep: SleepData[]
  wearables: Wearable[]
  suggestions: AgentSuggestion[]
  runArtifacts: RunArtifact[]
  workload: WorkloadSuggestion[]
  notifications: HealthNotification[]
  timeline: TimelineEvent[]
}> {
  if (USE_MOCK) {
    const habits = getStored<Habit[]>('habits', MOCK_HABITS)
    const suggestions = getStored<AgentSuggestion[]>('suggestions', MOCK_SUGGESTIONS)
    return {
      today: MOCK_TODAY,
      habits,
      plans: MOCK_PLANS,
      recovery: MOCK_RECOVERY,
      sleep: MOCK_SLEEP,
      wearables: MOCK_WEARABLES,
      suggestions,
      runArtifacts: MOCK_RUN_ARTIFACTS,
      workload: MOCK_WORKLOAD,
      notifications: MOCK_NOTIFICATIONS,
      timeline: MOCK_TIMELINE,
    }
  }
  const res = await apiGet<{
    today: TodayOverview
    habits: Habit[]
    plans: Plan[]
    recovery: RecoveryMetrics[]
    sleep: SleepData[]
    wearables: Wearable[]
    suggestions: AgentSuggestion[]
    runArtifacts: RunArtifact[]
    workload: WorkloadSuggestion[]
    notifications: HealthNotification[]
    timeline: TimelineEvent[]
  }>('/health/dashboard')
  return {
    today: res?.today ?? MOCK_TODAY,
    habits: Array.isArray(res?.habits) ? res.habits : [],
    plans: Array.isArray(res?.plans) ? res.plans : [],
    recovery: Array.isArray(res?.recovery) ? res.recovery : [],
    sleep: Array.isArray(res?.sleep) ? res.sleep : [],
    wearables: Array.isArray(res?.wearables) ? res.wearables : [],
    suggestions: Array.isArray(res?.suggestions) ? res.suggestions : [],
    runArtifacts: Array.isArray(res?.runArtifacts) ? res.runArtifacts : [],
    workload: Array.isArray(res?.workload) ? res.workload : [],
    notifications: Array.isArray(res?.notifications) ? res.notifications : [],
    timeline: Array.isArray(res?.timeline) ? res.timeline : [],
  }
}

export async function fetchHabits(): Promise<Habit[]> {
  if (USE_MOCK) {
    return getStored<Habit[]>('habits', MOCK_HABITS)
  }
  const res = await apiGet<Habit[] | { data: Habit[] }>('/health/habits')
  return Array.isArray(res) ? res : Array.isArray((res as { data?: Habit[] })?.data) ? (res as { data: Habit[] }).data : []
}

export async function toggleHabit(id: string): Promise<Habit> {
  if (USE_MOCK) {
    const habits = getStored<Habit[]>('habits', MOCK_HABITS)
    const updated = habits.map((h) =>
      h.id === id ? { ...h, isCompleted: !h.isCompleted, lastUpdated: new Date().toISOString(), streak: h.isCompleted ? Math.max(0, h.streak - 1) : h.streak + 1 } : h
    )
    setStored('habits', updated)
    const found = updated.find((h) => h.id === id)
    if (!found) throw new Error('Habit not found')
    return found
  }
  const res = await apiPost<Habit>(`/health/habits/${id}/toggle`, {})
  return res ?? ({} as Habit)
}

export async function fetchSuggestions(): Promise<AgentSuggestion[]> {
  if (USE_MOCK) {
    return getStored<AgentSuggestion[]>('suggestions', MOCK_SUGGESTIONS)
  }
  const res = await apiGet<AgentSuggestion[] | { data: AgentSuggestion[] }>('/health/suggestions')
  return Array.isArray(res) ? res : Array.isArray((res as { data?: AgentSuggestion[] })?.data) ? (res as { data: AgentSuggestion[] }).data : []
}

export async function approveSuggestion(id: string): Promise<void> {
  if (USE_MOCK) {
    const suggestions = getStored<AgentSuggestion[]>('suggestions', MOCK_SUGGESTIONS)
    setStored(
      'suggestions',
      suggestions.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s))
    )
    return
  }
  await apiPost('/health/automation/approve', { suggestionId: id })
}

export async function rejectSuggestion(id: string): Promise<void> {
  if (USE_MOCK) {
    const suggestions = getStored<AgentSuggestion[]>('suggestions', MOCK_SUGGESTIONS)
    setStored(
      'suggestions',
      suggestions.map((s) => (s.id === id ? { ...s, status: 'rejected' as const } : s))
    )
    return
  }
  await apiPost('/health/automation/reject', { suggestionId: id })
}

export async function syncWearables(): Promise<void> {
  if (USE_MOCK) {
    return
  }
  await apiPost('/wearables/sync', {})
}

export async function fetchRunArtifacts(): Promise<RunArtifact[]> {
  if (USE_MOCK) {
    return MOCK_RUN_ARTIFACTS
  }
  const res = await apiGet<RunArtifact[] | { data: RunArtifact[] }>('/health/run-artifacts')
  return Array.isArray(res) ? res : Array.isArray((res as { data?: RunArtifact[] })?.data) ? (res as { data: RunArtifact[] }).data : []
}

export async function applyWorkloadSuggestion(id: string): Promise<void> {
  if (USE_MOCK) {
    return
  }
  await apiPost('/health/workload/apply', { id })
}
