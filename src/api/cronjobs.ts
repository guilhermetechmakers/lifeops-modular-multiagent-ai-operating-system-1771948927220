/**
 * Cronjobs API layer.
 * Full CRUD, trigger, runs, approvals, templates, health.
 */

import { apiGet, apiPost, apiPut, apiPatch } from '@/lib/api'
import type {
  Cronjob,
  CronjobRun,
  CronjobApproval,
  CronjobTemplate,
  CronjobCreateInput,
  CronjobsListResponse,
  CronjobRunsResponse,
} from '@/types/cronjobs'

const API_BASE = '/cronjobs'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_CRONJOBS: Cronjob[] = [
  {
    id: 'c1',
    name: 'Weekly Content Ideas',
    enabled: true,
    paused: false,
    schedule: '0 9 * * 1',
    timezone: 'UTC',
    triggerType: 'time',
    targetType: 'agent',
    targetId: 'a1',
    target: { type: 'agent', id: 'a1', name: 'Content Ideas' },
    inputTemplate: { promptTemplate: 'Generate weekly content ideas', variables: {}, scope: 'content' },
    permissions: 'approval_required',
    constraints: { maxActions: 10, spendLimit: 5 },
    safetyRails: { confirmationsRequired: true },
    retryPolicy: { maxRetries: 3, backoffMs: 1000 },
    ownerId: 'u1',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    nextRun: new Date(Date.now() + 7200000).toISOString(),
    lastRun: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'c2',
    name: 'Monthly Finance Close',
    enabled: true,
    paused: false,
    schedule: '0 0 1 * *',
    timezone: 'UTC',
    triggerType: 'time',
    targetType: 'agent',
    targetId: 'a2',
    target: { type: 'agent', id: 'a2', name: 'Finance Close' },
    inputTemplate: {},
    permissions: 'approval_required',
    retryPolicy: { maxRetries: 3, backoffMs: 2000 },
    ownerId: 'u1',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
    nextRun: new Date(Date.now() + 86400000 * 5).toISOString(),
    lastRun: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'c3',
    name: 'Daily Sync',
    enabled: false,
    paused: true,
    schedule: '0 8 * * *',
    timezone: 'America/New_York',
    triggerType: 'time',
    targetType: 'template',
    targetId: 'w1',
    target: { type: 'template', id: 'w1', name: 'Daily Sync Workflow' },
    inputTemplate: {},
    permissions: 'bounded_autopilot',
    retryPolicy: { maxRetries: 5, backoffMs: 5000, deadLetter: 'dlq-sync' },
    ownerId: 'u1',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date().toISOString(),
    lastRun: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]

const MOCK_RUNS: CronjobRun[] = [
  {
    id: 'r1',
    cronjobId: 'c1',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    finishedAt: new Date(Date.now() - 86400000 + 60000).toISOString(),
    status: 'success',
    outcome: { summary: 'Generated 5 content ideas' },
    traceId: 'tr-001',
  },
  {
    id: 'r2',
    cronjobId: 'c1',
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    finishedAt: new Date(Date.now() - 86400000 * 2 + 45000).toISOString(),
    status: 'failed',
    outcome: { summary: 'API rate limit exceeded' },
    traceId: 'tr-002',
  },
  {
    id: 'r3',
    cronjobId: 'c1',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'running',
    traceId: 'tr-003',
  },
]

const MOCK_APPROVALS: CronjobApproval[] = [
  {
    id: 'ap1',
    cronjobId: 'c1',
    runId: 'r3',
    approvers: ['u1'],
    status: 'open',
    SLAStart: new Date(Date.now() - 3600000).toISOString(),
    SLAEnd: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_TEMPLATES: CronjobTemplate[] = [
  {
    id: 't1',
    name: 'Content Pipeline',
    version: 1,
    content: {},
    type: 'workflow',
    description: 'End-to-end content automation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't2',
    name: 'Finance Close',
    version: 1,
    content: {},
    type: 'cronjob',
    description: 'Monthly finance close workflow',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// --- API functions ---

export async function fetchCronjobs(params?: {
  search?: string
  status?: 'enabled' | 'paused' | 'disabled'
  targetType?: 'agent' | 'template'
  owner?: string
  page?: number
  limit?: number
}): Promise<CronjobsListResponse> {
  if (USE_MOCK) {
    let items = [...MOCK_CRONJOBS]
    if (params?.search) {
      const q = params.search.toLowerCase()
      items = items.filter((c) => c.name.toLowerCase().includes(q))
    }
    if (params?.status === 'enabled') {
      items = items.filter((c) => c.enabled && !c.paused)
    } else if (params?.status === 'paused') {
      items = items.filter((c) => c.paused)
    } else if (params?.status === 'disabled') {
      items = items.filter((c) => !c.enabled)
    }
    if (params?.targetType) {
      items = items.filter((c) => c.targetType === params.targetType)
    }
    const total = items.length
    const page = params?.page ?? 1
    const limit = params?.limit ?? 20
    const start = (page - 1) * limit
    const data = items.slice(start, start + limit)
    return { data, total }
  }
  const q = new URLSearchParams()
  if (params?.search) q.set('search', params.search)
  if (params?.status) q.set('status', params.status)
  if (params?.targetType) q.set('targetType', params.targetType)
  if (params?.owner) q.set('owner', params.owner)
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  const res = await apiGet<{ data?: Cronjob[]; items?: Cronjob[]; total?: number }>(
    `${API_BASE}?${q.toString()}`
  )
  const data = Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : []
  return { data, total: res?.total ?? data.length }
}

export async function fetchCronjob(id: string): Promise<Cronjob | null> {
  if (USE_MOCK) {
    const found = MOCK_CRONJOBS.find((c) => c.id === id)
    return found ?? null
  }
  try {
    const res = await apiGet<Cronjob>(`${API_BASE}/${id}`)
    return res ?? null
  } catch {
    return null
  }
}

export async function createCronjob(input: CronjobCreateInput): Promise<Cronjob> {
  if (USE_MOCK) {
    const newJob: Cronjob = {
      ...input,
      id: `c${Date.now()}`,
      enabled: true,
      paused: false,
      schedule: typeof input.schedule === 'string' ? input.schedule : input.schedule.cron ?? '0 0 * * *',
      inputTemplate:
        typeof input.inputTemplate === 'string'
          ? { promptTemplate: input.inputTemplate, variables: {}, scope: '' }
          : input.inputTemplate,
      permissions: input.permissions ?? 'approval_required',
      ownerId: 'u1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    MOCK_CRONJOBS.push(newJob)
    return newJob
  }
  const res = await apiPost<Cronjob>(API_BASE, input)
  return res
}

export async function updateCronjob(
  id: string,
  updates: Partial<CronjobCreateInput>
): Promise<Cronjob> {
  if (USE_MOCK) {
    const idx = MOCK_CRONJOBS.findIndex((c) => c.id === id)
    if (idx < 0) throw new Error('Cronjob not found')
    const updated = { ...MOCK_CRONJOBS[idx], ...updates, updatedAt: new Date().toISOString() }
    MOCK_CRONJOBS[idx] = updated
    return updated
  }
  const res = await apiPut<Cronjob>(`${API_BASE}/${id}`, updates)
  return res
}

export async function triggerCronjob(id: string): Promise<CronjobRun> {
  if (USE_MOCK) {
    const run: CronjobRun = {
      id: `r${Date.now()}`,
      cronjobId: id,
      startedAt: new Date().toISOString(),
      status: 'running',
      traceId: `tr-${Date.now()}`,
    }
    MOCK_RUNS.unshift(run)
    return run
  }
  const res = await apiPost<CronjobRun>(`${API_BASE}/${id}/trigger`, {})
  return res
}

export async function pauseCronjob(id: string): Promise<void> {
  if (USE_MOCK) {
    const c = MOCK_CRONJOBS.find((j) => j.id === id)
    if (c) c.paused = true
    return
  }
  await apiPost(`${API_BASE}/${id}/pause`, {})
}

export async function enableCronjob(id: string): Promise<void> {
  if (USE_MOCK) {
    const c = MOCK_CRONJOBS.find((j) => j.id === id)
    if (c) {
      c.enabled = true
      c.paused = false
    }
    return
  }
  await apiPost(`${API_BASE}/${id}/enable`, {})
}

export async function resumeCronjob(id: string): Promise<void> {
  if (USE_MOCK) {
    const c = MOCK_CRONJOBS.find((j) => j.id === id)
    if (c) c.paused = false
    return
  }
  await apiPatch(`${API_BASE}/${id}`, { paused: false })
}

export async function disableCronjob(id: string): Promise<void> {
  if (USE_MOCK) {
    const c = MOCK_CRONJOBS.find((j) => j.id === id)
    if (c) c.enabled = false
    return
  }
  await apiPost(`${API_BASE}/${id}/disable`, {})
}

export async function fetchCronjobRuns(
  cronjobId: string,
  params?: { page?: number; limit?: number; status?: string }
): Promise<CronjobRunsResponse> {
  if (USE_MOCK) {
    let items = MOCK_RUNS.filter((r) => r.cronjobId === cronjobId)
    if (params?.status) {
      items = items.filter((r) => r.status === params.status)
    }
    const total = items.length
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const start = (page - 1) * limit
    const data = items.slice(start, start + limit)
    return { data, total }
  }
  const q = new URLSearchParams()
  if (params?.page != null) q.set('page', String(params.page))
  if (params?.limit != null) q.set('limit', String(params.limit))
  if (params?.status) q.set('status', params.status)
  q.set('cronjobId', cronjobId)
  const res = await apiGet<{ data?: CronjobRun[]; items?: CronjobRun[]; total?: number }>(
    `${API_BASE}/${cronjobId}/runs?${q}`
  )
  const data = Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : []
  return { data, total: res?.total ?? data.length }
}

export async function fetchCronjobRunOutputs(
  cronjobId: string,
  runId: string
): Promise<{ logs?: string[]; traces?: string[]; artifacts?: unknown[] }> {
  if (USE_MOCK) {
    const run = MOCK_RUNS.find((r) => r.id === runId && r.cronjobId === cronjobId)
    return {
      logs: run ? ['[INFO] Run started', '[INFO] Processing...', '[INFO] Run completed'] : [],
      traces: run?.traceId ? [`Trace: ${run.traceId}`] : [],
      artifacts: [],
    }
  }
  const res = await apiGet<{ logs?: string[]; traces?: string[]; artifacts?: unknown[] }>(
    `${API_BASE}/${cronjobId}/outputs/${runId}`
  )
  return {
    logs: res?.logs ?? [],
    traces: res?.traces ?? [],
    artifacts: res?.artifacts ?? [],
  }
}

export async function fetchApprovals(): Promise<CronjobApproval[]> {
  if (USE_MOCK) {
    return MOCK_APPROVALS.filter((a) => a.status === 'open')
  }
  const res = await apiGet<CronjobApproval[] | { data?: CronjobApproval[] }>(`/approvals`)
  return Array.isArray(res) ? res : res?.data ?? []
}

export async function approveApproval(id: string, comments?: string): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (a) a.status = 'approved'
    return
  }
  await apiPost(`/approvals/${id}/approve`, { comments })
}

export async function rejectApproval(id: string, comments?: string): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (a) a.status = 'rejected'
    return
  }
  await apiPost(`/approvals/${id}/reject`, { comments })
}

export async function fetchTemplates(): Promise<CronjobTemplate[]> {
  if (USE_MOCK) {
    return MOCK_TEMPLATES
  }
  const res = await apiGet<CronjobTemplate[] | { data?: CronjobTemplate[] }>(`/templates`)
  return Array.isArray(res) ? res : res?.data ?? []
}

export async function simulateTemplate(id: string): Promise<{ success: boolean; output?: unknown }> {
  if (USE_MOCK) {
    return { success: true, output: {} }
  }
  const res = await apiPost<{ success: boolean; output?: unknown }>(`/templates/${id}/simulate`, {})
  return res
}

export async function fetchHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  cronjobsActive: number
  cronjobsPaused: number
}> {
  if (USE_MOCK) {
    const active = MOCK_CRONJOBS.filter((c) => c.enabled && !c.paused).length
    const paused = MOCK_CRONJOBS.filter((c) => c.paused).length
    return {
      status: 'healthy',
      cronjobsActive: active,
      cronjobsPaused: paused,
    }
  }
  const res = await apiGet<{ status: string; cronjobsActive?: number; cronjobsPaused?: number }>(
    '/health'
  )
  return {
    status: (res?.status as 'healthy' | 'degraded' | 'unhealthy') ?? 'healthy',
    cronjobsActive: res?.cronjobsActive ?? 0,
    cronjobsPaused: res?.cronjobsPaused ?? 0,
  }
}
