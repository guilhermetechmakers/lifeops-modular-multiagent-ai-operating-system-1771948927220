/**
 * Cronjobs Dashboard data models.
 * All arrays default to [] when null/undefined for runtime safety.
 */

export type CronjobTriggerType = 'time' | 'event' | 'conditional'

export type CronjobPermission =
  | 'suggest'
  | 'approval_required'
  | 'conditional_auto_execute'
  | 'bounded_autopilot'

export interface CronjobTarget {
  type: 'agent' | 'template'
  id: string
  name?: string
}

export interface CronjobConstraints {
  maxActions?: number
  spendLimit?: number
  allowedTools?: string[]
}

export interface CronjobSafetyRails {
  confirmationsRequired?: boolean
  safeguards?: string[]
  requiredPrompts?: string[]
  reversibleActions?: boolean
}

export type RetryBackoffStrategy = 'exponential' | 'fixed' | 'linear'

export interface CronjobRetryPolicy {
  maxRetries: number
  backoffMs: number
  backoffStrategy?: RetryBackoffStrategy
  deadLetter?: string
}

export interface TriggerConfigTime {
  type: 'time'
  schedule?: string
}

export interface TriggerConfigEvent {
  type: 'event'
  eventSource?: string
  eventType?: string
  mapping?: Record<string, string>
}

export interface TriggerConfigConditional {
  type: 'conditional'
  condition?: string
  fallback?: string
  mapping?: Record<string, string>
}

export type TriggerConfig =
  | TriggerConfigTime
  | TriggerConfigEvent
  | TriggerConfigConditional

export interface CronjobInputTemplate {
  promptTemplate?: string
  variables?: Record<string, string | number | boolean>
  scope?: string
}

export interface CronjobSchedule {
  cron?: string
  timezone: string
  humanReadable?: string
}

export interface Cronjob {
  id: string
  name: string
  enabled: boolean
  paused: boolean
  schedule: string | CronjobSchedule
  timezone: string
  triggerType: CronjobTriggerType
  triggerConfig?: TriggerConfig
  targetType: 'agent' | 'template'
  targetId: string
  target?: CronjobTarget
  inputTemplate: CronjobInputTemplate | string
  permissions: CronjobPermission | string
  automationLevel?: string
  constraints?: CronjobConstraints
  safetyRails?: CronjobSafetyRails
  retryPolicy?: CronjobRetryPolicy
  outputs?: {
    latestRun?: CronjobRun
    runHistory?: CronjobRun[]
    logs?: string[]
    traces?: string[]
    artifacts?: unknown[]
  }
  ownerId?: string
  createdAt: string
  updatedAt: string
  nextRun?: string
  lastRun?: string
}

export type CronjobRunStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'skipped'

export interface CronjobRunTraceNode {
  agentId: string
  agentName?: string
  timestamp?: string
  durationMs?: number
  message?: string
  nextAgentId?: string
}

export interface CronjobRun {
  id: string
  cronjobId: string
  startedAt: string
  finishedAt?: string
  status: CronjobRunStatus
  outcome?: {
    result?: unknown
    summary?: string
    diffs?: unknown[]
    artifacts?: unknown[]
  }
  logs?: string[]
  traceId?: string
  inputs?: Record<string, unknown>
  outputs?: Record<string, unknown>
  trace?: CronjobRunTraceNode[] | Record<string, unknown>
  diffs?: unknown[]
  artifacts?: unknown[]
  errors?: string[]
}

export type ApprovalStatus = 'open' | 'approved' | 'rejected'

export interface CronjobApproval {
  id: string
  cronjobId: string
  runId?: string
  approvers: string[]
  status: ApprovalStatus
  SLAStart?: string
  SLAEnd?: string
  comments?: { author: string; text: string; timestamp: string }[]
  createdAt: string
  updatedAt: string
}

export interface CronjobTemplate {
  id: string
  name: string
  version: number
  content: unknown
  type: 'cronjob' | 'workflow'
  description?: string
  createdAt: string
  updatedAt: string
}

export interface AuditEntry {
  id: string
  cronjobId: string
  userId: string
  action: string
  timestamp: string
  before?: unknown
  after?: unknown
}

export interface PolicyJustification {
  id: string
  cronjobId: string
  reason: string
  justifiedBy: string
  appliedAt: string
  newState?: unknown
}

export interface CronjobsListResponse {
  data: Cronjob[]
  total: number
}

export interface CronjobRunsResponse {
  data: CronjobRun[]
  total: number
}

export interface CronjobCreateInput {
  name: string
  schedule: string | CronjobSchedule
  timezone: string
  triggerType: CronjobTriggerType
  triggerConfig?: TriggerConfig
  targetType: 'agent' | 'template'
  targetId: string
  inputTemplate: CronjobInputTemplate | string
  permissions?: CronjobPermission | string
  constraints?: CronjobConstraints
  safetyRails?: CronjobSafetyRails
  retryPolicy?: CronjobRetryPolicy
}
