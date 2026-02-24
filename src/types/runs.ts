/**
 * Run History types.
 * Run, RunDetail, RunArtifact, RunLog, RunDiff.
 * All arrays guarded with null-safe patterns.
 */

export type RunStatus = 'pending' | 'running' | 'success' | 'failed' | 'canceled'

export interface Run {
  id: string
  cronjobId?: string
  workflowId?: string
  cronjobName?: string
  workflowName?: string
  ownerId: string
  owner?: string
  status: RunStatus
  startTime: string
  endTime?: string
  durationMs?: number
  environment: string
  inputSnapshot?: unknown
  outputSnapshot?: unknown
  trace?: unknown
  logs?: unknown
  artifacts?: unknown
  diffs?: unknown
  errors?: unknown
  reversible?: boolean
  tags?: string[]
  projectId?: string
  createdAt: string
  updatedAt: string
}

export interface RunArtifact {
  id: string
  runId?: string
  name: string
  type: string
  url?: string
  preview?: string
  createdAt?: string
}

export interface RunLog {
  id: string
  runId?: string
  timestamp: string
  level: string
  message: string
  meta?: unknown
}

export interface RunDiff {
  id: string
  runId?: string
  path: string
  diff: string
}

export interface AgentTraceStep {
  id: string
  agentId?: string
  agentName?: string
  type?: string
  content?: string
  timestamp?: string
  metadata?: unknown
}

export interface RunDetailPayload {
  inputs?: unknown
  outputs?: unknown
  trace?: AgentTraceStep[]
  logs?: RunLog[]
  artifacts?: RunArtifact[]
  diffs?: RunDiff[]
  errors?: unknown

  reversible?: boolean
}

export interface RunsListParams {
  search?: string
  status?: RunStatus | RunStatus[]
  ownerId?: string
  cronjobId?: string
  workflowId?: string
  projectId?: string
  environment?: string
  startDate?: string
  endDate?: string
  minDuration?: number
  maxDuration?: number
  page?: number
  pageSize?: number
  sort?: string
}

export interface RunsListResponse {
  data: Run[]
  total: number
  page: number
  pageSize: number
}

/** Alias for RunsListParams for API/hook compatibility */
export type RunListParams = RunsListParams

export interface BulkActionPayload {
  action: 'rerun' | 'export'
  runIds: string[]
}

export interface BulkActionResponse {
  success: number
  failed: number
  exportedUrl?: string
}
