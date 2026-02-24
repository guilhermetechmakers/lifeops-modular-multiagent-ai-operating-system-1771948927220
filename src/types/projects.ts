/**
 * Projects Dashboard data models.
 * All arrays default to [] when null/undefined for runtime safety.
 */

export interface Project {
  id: string
  name: string
  description?: string
  ownerId?: string
  createdAt?: string
  updatedAt?: string
  roadmapId?: string
  context?: string
  ticketsCount?: number
  prsCount?: number
  lastSync?: string
}

export interface Milestone {
  id: string
  title: string
  dueDate?: string
  status: 'pending' | 'in-progress' | 'completed'
  tickets?: Ticket[]
}

export interface Roadmap {
  id: string
  projectId: string
  milestones: Milestone[]
  status?: string
  aiInsights?: string
}

export type TicketStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export interface AITriage {
  summary?: string
  suggestedPriority?: TicketPriority
  suggestedAssignee?: string
  rationale?: string
}

export interface Ticket {
  id: string
  projectId: string
  title: string
  description?: string
  status: TicketStatus
  priority: TicketPriority
  assigneeId?: string
  assigneeName?: string
  createdAt?: string
  updatedAt?: string
  aiTriage?: AITriage
}

export type PRStatus = 'open' | 'merged' | 'closed'

export interface PR {
  id: string
  projectId: string
  provider: 'github' | 'gitlab'
  prNumber: number
  title?: string
  author?: string
  status: PRStatus
  linkedReleaseId?: string
  checks?: { name: string; status: string }[]
  createdAt?: string
}

export type ReleaseStatus = 'draft' | 'published'

export interface Artifact {
  id: string
  type: string
  url?: string
  name?: string
}

export interface Release {
  id: string
  projectId: string
  version: string
  artifacts: Artifact[]
  status: ReleaseStatus
  releaseNotes?: string
  createdAt?: string
}

export interface CITrigger {
  id: string
  projectId?: string
  name: string
  config: Record<string, unknown>
  templateId?: string
  enabled: boolean
}

export type AutomationTemplateType = 'release' | 'changelog' | 'agent-prompt' | 'runbook'

export interface AutomationTemplate {
  id: string
  name: string
  type: AutomationTemplateType
  content: string
  createdBy?: string
  updatedAt?: string
}

export interface IntegrationConnector {
  id: string
  provider: 'github' | 'gitlab' | 'plaid' | 'stripe' | 'healthkit'
  config?: Record<string, unknown>
  oauthState?: string
  status: 'connected' | 'disconnected' | 'error'
  ownerId?: string
  scopes?: string[]
}

export interface RunArtifact {
  id: string
  runId: string
  type: string
  payload?: unknown
  createdAt?: string
  logs?: string[]
}

export interface AgentJob {
  id: string
  agentId: string
  status: 'pending' | 'running' | 'success' | 'failure'
  startedAt?: string
  endedAt?: string
  logs?: string[]
}

export interface RunHistory {
  id: string
  runId: string
  status: 'success' | 'failure' | 'running'
  duration?: number
  summary?: string
  metrics?: Record<string, unknown>
}
