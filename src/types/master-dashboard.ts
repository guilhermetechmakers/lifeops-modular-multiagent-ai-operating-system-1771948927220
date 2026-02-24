/**
 * Master Dashboard data models and API response types.
 * All arrays default to [] when null/undefined for runtime safety.
 */

export type AgentStatus = 'active' | 'idle' | 'paused' | 'error'

export interface Agent {
  id: string
  name: string
  status: AgentStatus
  lastActive?: string
  memorySnapshot?: unknown
}

export type CronJobTriggerType = 'time' | 'event' | 'conditional'

export interface CronJobTarget {
  type: 'agent' | 'workflow'
  id: string
}

export interface CronJobConstraints {
  maxActions?: number
  spendLimit?: number
  allowedTools?: string[]
}

export interface CronJobSafetyRails {
  confirmationsRequired?: boolean
}

export interface CronJobRetryPolicy {
  maxRetries?: number
  backoffMs?: number
  deadLetter?: string
}

export interface CronJob {
  id: string
  name: string
  enabled: boolean
  paused?: boolean
  schedule: string
  timezone: string
  triggerType: CronJobTriggerType
  target: CronJobTarget
  inputPayload: string
  permissions: string
  constraints?: CronJobConstraints
  safetyRails?: CronJobSafetyRails
  retryPolicy?: CronJobRetryPolicy
  outputs?: { runHistory?: unknown[]; trace?: string[]; artifacts?: unknown[] }
  nextRun?: string
  lastRun?: string
}

export type RunStatus = 'success' | 'failure' | 'running' | 'queued'

export interface Run {
  id: string
  cronJobId: string
  status: RunStatus
  startTime?: string
  endTime?: string
  durationMs?: number
  costEstimate?: number
  traceId?: string
  logs?: string[]
}

export type ApprovalType = 'cronjob' | 'agent-change' | 'release' | 'financial'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type ApprovalPriority = 'low' | 'medium' | 'high'

export interface Approval {
  id: string
  type: ApprovalType
  status: ApprovalStatus
  requester: string
  createdAt: string
  details?: unknown
  priority?: ApprovalPriority
}

export type NotificationChannel = 'email' | 'in-app' | 'webhook' | 'push'

export type NotificationStatus = 'sent' | 'failed' | 'queued'

export interface Notification {
  id: string
  channel: NotificationChannel
  templateId?: string
  lastSent?: string
  status?: NotificationStatus
}

export interface SystemMetric {
  timestamp: string
  cpu?: number
  memory?: number
  latencyMs?: number
  throughput?: number
  errorRate?: number
}

export interface AuditLog {
  id: string
  action: string
  actor: string
  target: string
  timestamp: string
  explanation: string
  schemaVersion: string
}

export interface DashboardSummary {
  activeAgentsCount: number
  upcomingCronjobsCount: number
  pendingApprovalsCount: number
  recentRunsCount: number
  spendTotal: number
  spendForecast?: number
  spendRisk?: 'low' | 'medium' | 'high'
}

export interface DashboardHealth {
  agents: Agent[]
  systemMetrics?: SystemMetric[]
}

export interface TimelineEvent {
  id: string
  type: 'handoff' | 'alert' | 'milestone' | 'run'
  title: string
  timestamp: string
  traceId?: string
  details?: string
  module?: string
}

export interface GlobalSearchResult {
  id: string
  type: 'content' | 'run' | 'cronjob' | 'project' | 'transaction'
  title: string
  snippet?: string
  module: string
  href: string
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[]
  facets?: Record<string, number>
}
