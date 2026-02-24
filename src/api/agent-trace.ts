/**
 * Agent Trace API - Fetch run trace data, policy decisions, memory entries.
 * All responses validated with null-safe patterns.
 */

import { apiGet } from '@/lib/api'
import type {
  RunTrace,
  Event,
  EventDetail,
  Artifact,
  PolicyResult,
  MemoryEntry,
  Agent,
  TraceFilters,
} from '@/types/agent-trace'

export interface TraceResponse {
  events: Event[]
  summary: string
  runId: string
  artifacts?: Artifact[]
}

function buildQuery(params: Record<string, string | string[] | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return
    if (Array.isArray(v)) {
      v.forEach((val) => search.append(k, val))
    } else {
      search.set(k, v)
    }
  })
  const q = search.toString()
  return q ? `?${q}` : ''
}

/**
 * GET /runs/{runId}/trace
 */
export async function fetchRunTrace(
  runId: string,
  filters?: TraceFilters
): Promise<RunTrace> {
  const params: Record<string, string | string[] | undefined> = {}
  if (filters?.agentIds?.length) params.agentIds = filters.agentIds
  if (filters?.eventTypes?.length) params.eventTypes = filters.eventTypes
  if (filters?.topics?.length) params.topics = filters.topics
  if (filters?.timeRange) {
    params.start = filters.timeRange.start
    params.end = filters.timeRange.end
  }
  if (filters?.consensusOnly) params.consensusOnly = 'true'

  const res = await apiGet<TraceResponse>(`/runs/${encodeURIComponent(runId)}/trace${buildQuery(params)}`)
  const events = Array.isArray(res?.events) ? res.events : []
  const artifacts = Array.isArray(res?.artifacts) ? res.artifacts : []
  return {
    runId: res?.runId ?? runId,
    events,
    artifacts,
    summary: res?.summary ?? '',
  }
}

/**
 * GET /runs/{runId}/trace/{eventId}
 */
export async function fetchEventDetail(runId: string, eventId: string): Promise<EventDetail | null> {
  const res = await apiGet<EventDetail>(`/runs/${encodeURIComponent(runId)}/trace/${encodeURIComponent(eventId)}`)
  if (!res?.eventId) return null
  return res
}

/**
 * GET /runs/{runId}/artifacts
 */
export async function fetchRunArtifacts(runId: string): Promise<Artifact[]> {
  const res = await apiGet<Artifact[] | { data: Artifact[] }>(`/runs/${encodeURIComponent(runId)}/artifacts`)
  const list = Array.isArray(res) ? res : (res as { data?: Artifact[] })?.data
  return Array.isArray(list) ? list : []
}

/**
 * GET /agents/{agentId}/config
 */
export async function fetchAgentConfig(agentId: string): Promise<Agent | null> {
  const res = await apiGet<Agent>(`/agents/${encodeURIComponent(agentId)}/config`)
  return res?.agentId ? res : null
}

/**
 * GET /policies/{policyResultId}
 */
export async function fetchPolicyJustification(policyResultId: string): Promise<PolicyResult | null> {
  const res = await apiGet<PolicyResult>(`/policies/${encodeURIComponent(policyResultId)}`)
  return res?.policyResultId ? res : null
}

/**
 * GET /memory/{memoryId}
 */
export async function fetchMemoryEntry(memoryId: string): Promise<MemoryEntry | null> {
  const res = await apiGet<MemoryEntry>(`/memory/${encodeURIComponent(memoryId)}`)
  return res?.memoryId ? res : null
}

/**
 * GET /memory?runId=&scope=&agentId=
 */
export async function fetchMemoryByRun(
  runId: string,
  scope?: string,
  agentId?: string
): Promise<MemoryEntry[]> {
  const params: Record<string, string> = { runId }
  if (scope) params.scope = scope
  if (agentId) params.agentId = agentId
  const res = await apiGet<MemoryEntry[] | { data: MemoryEntry[] }>(
    `/memory${buildQuery(params)}`
  )
  const list = Array.isArray(res) ? res : (res as { data?: MemoryEntry[] })?.data
  return Array.isArray(list) ? list : []
}
