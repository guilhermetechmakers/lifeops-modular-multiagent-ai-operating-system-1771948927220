/**
 * Master Dashboard API layer.
 * Uses mock data for prototyping; replace with real API calls when backend is ready.
 */

import type {
  DashboardSummary,
  DashboardHealth,
  CronJob,
  Run,
  Approval,
  Notification,
  SystemMetric,
  TimelineEvent,
  GlobalSearchResponse,
} from '@/types/master-dashboard'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_SUMMARY: DashboardSummary = {
  activeAgentsCount: 12,
  upcomingCronjobsCount: 8,
  pendingApprovalsCount: 3,
  recentRunsCount: 47,
  spendTotal: 24,
  spendForecast: 28,
  spendRisk: 'low',
}

const MOCK_AGENTS = [
  { id: 'a1', name: 'Content Ideas', status: 'active' as const, lastActive: new Date().toISOString() },
  { id: 'a2', name: 'Finance Close', status: 'active' as const, lastActive: new Date().toISOString() },
  { id: 'a3', name: 'Weekly Sync', status: 'idle' as const, lastActive: new Date(Date.now() - 3600000).toISOString() },
]

const MOCK_CRONJOBS: CronJob[] = [
  {
    id: 'c1',
    name: 'Weekly Content Ideas',
    enabled: true,
    schedule: '0 9 * * 1',
    timezone: 'UTC',
    triggerType: 'time',
    target: { type: 'agent', id: 'a1' },
    inputPayload: '{}',
    permissions: 'read,write',
    nextRun: new Date(Date.now() + 7200000).toISOString(),
    lastRun: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'c2',
    name: 'Monthly Finance Close',
    enabled: true,
    schedule: '0 0 1 * *',
    timezone: 'UTC',
    triggerType: 'time',
    target: { type: 'agent', id: 'a2' },
    inputPayload: '{}',
    permissions: 'read,write',
    nextRun: new Date(Date.now() + 86400000 * 5).toISOString(),
    lastRun: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'c3',
    name: 'Daily Sync',
    enabled: false,
    paused: true,
    schedule: '0 8 * * *',
    timezone: 'UTC',
    triggerType: 'time',
    target: { type: 'workflow', id: 'w1' },
    inputPayload: '{}',
    permissions: 'read',
    nextRun: undefined,
    lastRun: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]

const MOCK_RUNS: Run[] = [
  {
    id: 'r1',
    cronJobId: 'c1',
    status: 'success',
    startTime: new Date(Date.now() - 120000).toISOString(),
    endTime: new Date(Date.now() - 60000).toISOString(),
    durationMs: 60000,
    costEstimate: 0.12,
    traceId: 'tr-001',
  },
  {
    id: 'r2',
    cronJobId: 'c2',
    status: 'failure',
    startTime: new Date(Date.now() - 900000).toISOString(),
    durationMs: 30000,
    costEstimate: 0.05,
    traceId: 'tr-002',
  },
  {
    id: 'r3',
    cronJobId: 'c1',
    status: 'running',
    startTime: new Date(Date.now() - 30000).toISOString(),
    traceId: 'tr-003',
  },
]

const MOCK_APPROVALS: Approval[] = [
  {
    id: 'ap1',
    type: 'financial',
    status: 'pending',
    requester: 'Finance Close Agent',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    priority: 'high',
    details: { title: 'Finance Close - January' },
  },
  {
    id: 'ap2',
    type: 'agent-change',
    status: 'pending',
    requester: 'Content Ideas Agent',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    priority: 'medium',
    details: { title: 'Content Publish - Blog Post' },
  },
  {
    id: 'ap3',
    type: 'release',
    status: 'pending',
    requester: 'Projects Agent',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    priority: 'high',
    details: { title: 'Release v1.2.0' },
  },
]

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', channel: 'email', templateId: 't1', lastSent: new Date().toISOString(), status: 'sent' },
  { id: 'n2', channel: 'in-app', lastSent: new Date().toISOString(), status: 'sent' },
  { id: 'n3', channel: 'webhook', status: 'failed' },
]

const MOCK_METRICS: SystemMetric[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  cpu: 40 + Math.random() * 30,
  memory: 60 + Math.random() * 20,
  latencyMs: 100 + Math.random() * 200,
  throughput: 50 + Math.random() * 100,
  errorRate: Math.random() * 2,
}))

const MOCK_TIMELINE: TimelineEvent[] = [
  { id: 'e1', type: 'handoff', title: 'Content Ideas → Editor', timestamp: new Date().toISOString(), traceId: 'tr-003', module: 'Content' },
  { id: 'e2', type: 'alert', title: 'Finance Close failed', timestamp: new Date(Date.now() - 900000).toISOString(), traceId: 'tr-002', module: 'Finance' },
  { id: 'e3', type: 'milestone', title: 'Weekly Sync completed', timestamp: new Date(Date.now() - 3600000).toISOString(), traceId: 'tr-001' },
]

// --- API functions ---

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  if (USE_MOCK) return MOCK_SUMMARY
  const res = await fetch(`${API_BASE}/master-dashboard/summary`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch summary')
  const data = await res.json()
  return {
    activeAgentsCount: data.activeAgentsCount ?? 0,
    upcomingCronjobsCount: data.upcomingCronjobsCount ?? 0,
    pendingApprovalsCount: data.pendingApprovalsCount ?? 0,
    recentRunsCount: data.recentRunsCount ?? 0,
    spendTotal: data.spendTotal ?? 0,
    spendForecast: data.spendForecast,
    spendRisk: data.spendRisk,
  }
}

export async function fetchDashboardHealth(): Promise<DashboardHealth> {
  if (USE_MOCK) {
    return {
      agents: MOCK_AGENTS,
      systemMetrics: MOCK_METRICS,
    }
  }
  const res = await fetch(`${API_BASE}/master-dashboard/health`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch health')
  const data = await res.json()
  return {
    agents: Array.isArray(data.agents) ? data.agents : [],
    systemMetrics: Array.isArray(data.systemMetrics) ? data.systemMetrics : [],
  }
}

export async function fetchCronjobs(params?: {
  limit?: number
  offset?: number
  enabled?: boolean
  search?: string
}): Promise<{ items: CronJob[]; total: number }> {
  if (USE_MOCK) {
    const items = MOCK_CRONJOBS.filter((c) => {
      if (params?.enabled !== undefined && c.enabled !== params.enabled) return false
      if (params?.search && !c.name.toLowerCase().includes(params.search.toLowerCase())) return false
      return true
    })
    return { items, total: items.length }
  }
  const q = new URLSearchParams(params as Record<string, string>)
  const res = await fetch(`${API_BASE}/master-dashboard/cronjobs?${q}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch cronjobs')
  const data = await res.json()
  return {
    items: Array.isArray(data.items) ? data.items : data.data ?? [],
    total: data.total ?? 0,
  }
}

export async function fetchRuns(params?: { cronJobId?: string; limit?: number; offset?: number }): Promise<{ items: Run[]; total: number }> {
  if (USE_MOCK) {
    let items = [...MOCK_RUNS]
    if (params?.cronJobId) items = items.filter((r) => r.cronJobId === params.cronJobId)
    return { items, total: items.length }
  }
  const q = new URLSearchParams(params as Record<string, string>)
  const res = await fetch(`${API_BASE}/master-dashboard/runs?${q}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch runs')
  const data = await res.json()
  return {
    items: Array.isArray(data.items) ? data.items : data.data ?? [],
    total: data.total ?? 0,
  }
}

export async function fetchApprovals(status?: string): Promise<Approval[]> {
  if (USE_MOCK) {
    return status === 'pending' ? MOCK_APPROVALS.filter((a) => a.status === 'pending') : MOCK_APPROVALS
  }
  const q = status ? `?status=${status}` : ''
  const res = await fetch(`${API_BASE}/master-dashboard/approvals${q}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch approvals')
  const data = await res.json()
  return Array.isArray(data) ? data : data.items ?? data.data ?? []
}

export async function fetchNotifications(): Promise<Notification[]> {
  if (USE_MOCK) return MOCK_NOTIFICATIONS
  const res = await fetch(`${API_BASE}/master-dashboard/notifications`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch notifications')
  const data = await res.json()
  return Array.isArray(data) ? data : data.items ?? data.data ?? []
}

export async function fetchMetrics(since?: string, until?: string): Promise<SystemMetric[]> {
  if (USE_MOCK) return MOCK_METRICS
  const q = new URLSearchParams()
  if (since) q.set('since', since)
  if (until) q.set('until', until)
  const res = await fetch(`${API_BASE}/master-dashboard/metrics?${q}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch metrics')
  const data = await res.json()
  return Array.isArray(data) ? data : data.items ?? data.data ?? []
}

export async function fetchTimelineEvents(): Promise<TimelineEvent[]> {
  if (USE_MOCK) return MOCK_TIMELINE
  const res = await fetch(`${API_BASE}/master-dashboard/timeline`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch timeline')
  const data = await res.json()
  return Array.isArray(data) ? data : data.items ?? data.events ?? []
}

export async function globalSearch(query: string, filters?: Record<string, string>): Promise<GlobalSearchResponse> {
  if (USE_MOCK) {
    const results = [
      { id: '1', type: 'content' as const, title: 'Blog: Getting Started', snippet: '...', module: 'Content', href: '/dashboard/content/1' },
      { id: '2', type: 'run' as const, title: 'Run tr-003', snippet: '...', module: 'Runs', href: '/dashboard/runs/r3' },
      { id: '3', type: 'cronjob' as const, title: 'Weekly Content Ideas', snippet: '...', module: 'Cronjobs', href: '/dashboard/cronjobs/c1' },
    ].filter((r) => !query || r.title.toLowerCase().includes(query.toLowerCase()))
    return { results, facets: { content: 1, run: 1, cronjob: 1 } }
  }
  const q = new URLSearchParams({ q: query, ...filters })
  const res = await fetch(`${API_BASE}/master-dashboard/search?${q}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to search')
  const data = await res.json()
  return {
    results: Array.isArray(data.results) ? data.results : [],
    facets: data.facets ?? {},
  }
}

export async function approveApproval(id: string, explanation?: string): Promise<void> {
  if (USE_MOCK) return
  const res = await fetch(`${API_BASE}/master-dashboard/approvals/${id}/approve`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ explanation }),
  })
  if (!res.ok) throw new Error('Failed to approve')
}

export async function rejectApproval(id: string, explanation?: string): Promise<void> {
  if (USE_MOCK) return
  await fetch(`${API_BASE}/master-dashboard/approvals/${id}/reject`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ explanation }),
  })
}

export async function pauseCronjob(id: string): Promise<void> {
  if (USE_MOCK) return
  const res = await fetch(`${API_BASE}/master-dashboard/cronjobs/${id}/pause`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to pause')
}

export async function enableCronjob(id: string): Promise<void> {
  if (USE_MOCK) return
  const res = await fetch(`${API_BASE}/master-dashboard/cronjobs/${id}/enable`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to enable')
}

export async function retryCronjob(id: string): Promise<void> {
  if (USE_MOCK) return
  const res = await fetch(`${API_BASE}/master-dashboard/cronjobs/${id}/retry`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to retry')
}

export async function runCronjobNow(id: string): Promise<void> {
  if (USE_MOCK) return
  const res = await fetch(`${API_BASE}/master-dashboard/cronjobs/${id}/run-now`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to run')
}
