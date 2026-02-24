/**
 * Runs API layer.
 * GET /runs, GET /runs/:id, GET /runs/:id/detail, POST /runs/:id/rerun, POST /runs/bulk.
 * All responses validated with null-safe patterns.
 */

import { apiGet, apiPost } from '@/lib/api'
import type {
  Run,
  RunDetailPayload,
  RunsListParams,
  RunsListResponse,
} from '@/types/runs'

const API_BASE = '/runs'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_RUNS: Run[] = [
  {
    id: 'run-001',
    cronjobId: 'cj-001',
    cronjobName: 'Weekly Content Ideas',
    workflowId: undefined,
    ownerId: 'u1',
    owner: 'Content Agent',
    status: 'success',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000).toISOString(),
    durationMs: 45000,
    environment: 'production',
    tags: ['content', 'ideas'],
    reversible: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'run-002',
    cronjobId: 'cj-002',
    cronjobName: 'Monthly Finance Close',
    ownerId: 'u2',
    owner: 'Finance Agent',
    status: 'pending',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    environment: 'production',
    tags: ['finance'],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'run-003',
    cronjobId: 'cj-003',
    cronjobName: 'Daily Sync',
    ownerId: 'u1',
    owner: 'Sync Agent',
    status: 'failed',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 12000).toISOString(),
    durationMs: 12000,
    environment: 'production',
    errors: { message: 'Connection timeout' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'run-004',
    workflowId: 'wf-001',
    workflowName: 'Content Pipeline',
    ownerId: 'u3',
    owner: 'Orchestrator',
    status: 'running',
    startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    environment: 'staging',
    tags: ['content', 'pipeline'],
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'run-005',
    cronjobId: 'cj-004',
    cronjobName: 'Health Check',
    ownerId: 'system',
    owner: 'System',
    status: 'canceled',
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    environment: 'production',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function filterRuns(items: Run[], params?: RunsListParams): Run[] {
  let filtered = [...(items ?? [])]
  if (!params) return filtered

  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status]
    filtered = filtered.filter((r) => statuses.includes(r.status))
  }
  if (params.ownerId) {
    filtered = filtered.filter((r) => r.ownerId === params.ownerId)
  }
  if (params.cronjobId) {
    filtered = filtered.filter((r) => r.cronjobId === params.cronjobId)
  }
  if (params.workflowId) {
    filtered = filtered.filter((r) => r.workflowId === params.workflowId)
  }
  if (params.environment) {
    filtered = filtered.filter((r) => r.environment === params.environment)
  }
  if (params.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        (r.cronjobName ?? '').toLowerCase().includes(q) ||
        (r.workflowName ?? '').toLowerCase().includes(q) ||
        (r.owner ?? '').toLowerCase().includes(q)
    )
  }
  if (params.startDate) {
    filtered = filtered.filter((r) => r.startTime >= params.startDate!)
  }
  if (params.endDate) {
    filtered = filtered.filter((r) => r.startTime <= params.endDate!)
  }
  if (params.minDuration != null) {
    filtered = filtered.filter((r) => (r.durationMs ?? 0) >= params.minDuration!)
  }
  if (params.maxDuration != null) {
    filtered = filtered.filter((r) => (r.durationMs ?? 0) <= params.maxDuration!)
  }

  return filtered
}

// --- API functions ---

export async function fetchRuns(params?: RunsListParams): Promise<RunsListResponse> {
  if (USE_MOCK) {
    const filtered = filterRuns(MOCK_RUNS, params)
    const total = filtered.length
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 20
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize)
    return { data, total, page, pageSize }
  }

  const q = new URLSearchParams()
  if (params?.search) q.set('search', params.search)
  if (params?.status) {
    const s = Array.isArray(params.status) ? params.status.join(',') : params.status
    q.set('status', s)
  }
  if (params?.ownerId) q.set('ownerId', params.ownerId)
  if (params?.cronjobId) q.set('cronjobId', params.cronjobId)
  if (params?.workflowId) q.set('workflowId', params.workflowId)
  if (params?.projectId) q.set('projectId', params.projectId)
  if (params?.environment) q.set('environment', params.environment)
  if (params?.startDate) q.set('startDate', params.startDate)
  if (params?.endDate) q.set('endDate', params.endDate)
  if (params?.minDuration != null) q.set('minDuration', String(params.minDuration))
  if (params?.maxDuration != null) q.set('maxDuration', String(params.maxDuration))
  if (params?.page != null) q.set('page', String(params.page))
  if (params?.pageSize != null) q.set('pageSize', String(params.pageSize))
  if (params?.sort) q.set('sort', params.sort)

  const res = await apiGet<{ data?: Run[]; total?: number; page?: number; pageSize?: number }>(
    `${API_BASE}?${q.toString()}`
  )
  const data = Array.isArray(res?.data) ? res.data : []
  return {
    data,
    total: res?.total ?? data.length,
    page: res?.page ?? params?.page ?? 1,
    pageSize: res?.pageSize ?? params?.pageSize ?? 20,
  }
}

export async function fetchRun(id: string): Promise<Run | null> {
  if (USE_MOCK) {
    const found = (MOCK_RUNS ?? []).find((r) => r.id === id)
    return found ?? null
  }
  try {
    const res = await apiGet<Run>(`${API_BASE}/${id}`)
    return res ?? null
  } catch {
    return null
  }
}

export async function fetchRunDetail(id: string): Promise<RunDetailPayload | null> {
  if (USE_MOCK) {
    const run = (MOCK_RUNS ?? []).find((r) => r.id === id)
    if (!run) return null
    const trace = Array.isArray(run.trace)
      ? run.trace
      : [
          { id: 't1', agentName: 'Orchestrator', content: 'Initiated run', timestamp: run.startTime },
          { id: 't2', agentName: run.cronjobName ?? run.workflowName ?? 'Agent', content: 'Processing', timestamp: run.startTime },
          { id: 't3', agentName: 'Suggester', content: 'Completed', timestamp: run.endTime ?? run.startTime },
        ]
    return {
      inputs: run.inputSnapshot ?? { schedule: 'weekly', module: 'content' },
      outputs: run.outputSnapshot ?? { ideas: 5, status: 'suggested' },
      trace,
      logs: Array.isArray(run.logs)
        ? run.logs
        : [
            { id: 'l1', runId: id, timestamp: run.startTime, level: 'info', message: 'Run started' },
            { id: 'l2', runId: id, timestamp: run.endTime ?? run.startTime, level: 'info', message: 'Run completed' },
          ],
      artifacts: Array.isArray(run.artifacts)
        ? run.artifacts
        : [
            { id: 'a1', runId: id, name: 'output.json', type: 'json', url: '#artifact-1' },
          ],
      diffs: Array.isArray(run.diffs) ? run.diffs : [],
      errors: run.errors,
      reversible: run.reversible ?? false,
    }
  }
  try {
    const res = await apiGet<RunDetailPayload>(`${API_BASE}/${id}/detail`)
    return res ?? null
  } catch {
    return null
  }
}

export async function rerunRun(id: string): Promise<Run | null> {
  if (USE_MOCK) {
    const run = (MOCK_RUNS ?? []).find((r) => r.id === id)
    if (!run) return null
    const newRun: Run = {
      ...run,
      id: `run-${Date.now()}`,
      status: 'pending',
      startTime: new Date().toISOString(),
      endTime: undefined,
      durationMs: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    MOCK_RUNS.unshift(newRun)
    return newRun
  }
  try {
    const res = await apiPost<Run>(`${API_BASE}/${id}/rerun`, {})
    return res ?? null
  } catch {
    return null
  }
}

export async function fetchRunLogs(id: string): Promise<unknown[]> {
  if (USE_MOCK) {
    const detail = await fetchRunDetail(id)
    const logs = (detail?.logs ?? []) as { id: string; message: string; level: string; timestamp: string }[]
    return Array.isArray(logs) ? logs : []
  }
  const res = await apiGet<unknown[] | { data?: unknown[] }>(`${API_BASE}/${id}/logs`)
  return Array.isArray(res) ? res : (res?.data ?? [])
}

export async function bulkRunsAction(
  action: 'rerun' | 'export',
  runIds: string[]
): Promise<{ success: number; failed: number; exportedUrl?: string }> {
  if (USE_MOCK) {
    let success = 0
    for (const id of runIds ?? []) {
      const run = (MOCK_RUNS ?? []).find((r) => r.id === id)
      if (run && action === 'rerun') {
        const newRun: Run = {
          ...run,
          id: `run-${Date.now()}-${success}`,
          status: 'pending',
          startTime: new Date().toISOString(),
          endTime: undefined,
          durationMs: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        MOCK_RUNS.unshift(newRun)
        success++
      } else if (action === 'export') {
        success++
      }
    }
    return { success, failed: (runIds ?? []).length - success }
  }
  const res = await apiPost<{ success?: number; failed?: number; exportedUrl?: string }>(
    `${API_BASE}/bulk`,
    { action, runIds }
  )
  return {
    success: res?.success ?? 0,
    failed: res?.failed ?? 0,
    exportedUrl: res?.exportedUrl,
  }
}
