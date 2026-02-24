/**
 * Agent Trace Viewer API - Fetch run trace, events, policy, memory, and artifacts.
 * All responses validated with null-safe defaults.
 */

import { apiGet } from '@/lib/api'
import type {
  RunTrace,
  Event,
  PolicyResult,
  MemoryEntry,
  Artifact,
} from '@/types/agent-trace-viewer'

export interface TraceResponse {
  events: Event[]
  summary: string
  runId: string
  artifacts?: Artifact[]
}

export interface TraceQueryParams {
  filters?: string
  timeRange?: string
  limit?: number
  offset?: number
}

/**
 * GET /runs/{runId}/trace
 */
export async function fetchRunTrace(
  runId: string,
  params?: TraceQueryParams
): Promise<RunTrace> {
  const search = new URLSearchParams()
  if (params?.filters) search.set('filters', params.filters)
  if (params?.timeRange) search.set('timeRange', params.timeRange)
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.offset != null) search.set('offset', String(params.offset))
  const qs = search.toString()
  const path = `/runs/${encodeURIComponent(runId)}/trace${qs ? `?${qs}` : ''}`

  const raw = await apiGet<unknown>(path)
  const data = raw as TraceResponse | null | undefined
  const events = Array.isArray(data?.events) ? data.events : []
  const artifacts = Array.isArray(data?.artifacts) ? data.artifacts : []

  return {
    runId: data?.runId ?? runId,
    events,
    artifacts,
    summary: data?.summary ?? '',
  }
}

/**
 * GET /runs/{runId}/trace/{eventId}
 */
export async function fetchEventDetail(
  runId: string,
  eventId: string
): Promise<Event | null> {
  const raw = await apiGet<unknown>(
    `/runs/${encodeURIComponent(runId)}/trace/${encodeURIComponent(eventId)}`
  )
  const data = raw as Event | null | undefined
  return data ?? null
}

/**
 * GET /runs/{runId}/artifacts
 */
export async function fetchRunArtifacts(runId: string): Promise<Artifact[]> {
  const raw = await apiGet<unknown>(
    `/runs/${encodeURIComponent(runId)}/artifacts`
  )
  const data = raw as Artifact[] | { data?: Artifact[] } | null | undefined
  if (Array.isArray(data)) return data
  const arr = (data as { data?: Artifact[] })?.data
  return Array.isArray(arr) ? arr : []
}

/**
 * GET /policies/{policyResultId}
 */
export async function fetchPolicyResult(
  policyResultId: string
): Promise<PolicyResult | null> {
  const raw = await apiGet<unknown>(
    `/policies/${encodeURIComponent(policyResultId)}`
  )
  const data = raw as PolicyResult | null | undefined
  return data ?? null
}

/**
 * GET /memory/{memoryId}
 */
export async function fetchMemoryEntry(
  memoryId: string
): Promise<MemoryEntry | null> {
  const raw = await apiGet<unknown>(
    `/memory/${encodeURIComponent(memoryId)}`
  )
  const data = raw as MemoryEntry | null | undefined
  return data ?? null
}

/**
 * GET /memory?runId=&scope=&agentId=
 */
export async function fetchMemoryByRun(
  runId: string,
  scope?: string,
  agentId?: string
): Promise<MemoryEntry[]> {
  const search = new URLSearchParams({ runId })
  if (scope) search.set('scope', scope)
  if (agentId) search.set('agentId', agentId)
  const raw = await apiGet<unknown>(`/memory?${search.toString()}`)
  const data = raw as MemoryEntry[] | { data?: MemoryEntry[] } | null | undefined
  if (Array.isArray(data)) return data
  const arr = (data as { data?: MemoryEntry[] })?.data
  return Array.isArray(arr) ? arr : []
}
