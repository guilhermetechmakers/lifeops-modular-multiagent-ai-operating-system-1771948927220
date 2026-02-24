/**
 * Project Detail page data models.
 * All arrays default to [] when null/undefined for runtime safety.
 */

export interface ProjectDetail {
  id: string
  name: string
  description?: string
  status?: string
  healthScore?: number
  integrationsStatus?: Record<string, 'connected' | 'disconnected' | 'error'>
  lastUpdated?: string
  createdAt?: string
  updatedAt?: string
}

export interface RoadmapMilestone {
  id: string
  title: string
  dueDate?: string
  status: 'pending' | 'in-progress' | 'completed'
  owner?: string
  ownerId?: string
  notes?: string
}

export interface RoadmapDetail {
  id: string
  projectId: string
  milestones: RoadmapMilestone[]
  status?: string
}

export type BacklogTicketStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'

export type BacklogTicketPriority = 'low' | 'medium' | 'high' | 'critical'

export interface BacklogTicket {
  id: string
  projectId: string
  title: string
  description?: string
  status: BacklogTicketStatus
  priority: BacklogTicketPriority
  assignee?: string
  assigneeId?: string
  tags?: string[]
  sprint?: string
  createdAt?: string
  updatedAt?: string
}

export type AgentJobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface AgentJobDetail {
  id: string
  projectId: string
  agentName: string
  agentId?: string
  action: string
  status: AgentJobStatus
  startedAt?: string
  endedAt?: string
  initiatedAt?: string
  dueAt?: string
  traceId?: string
  needsApproval?: boolean
  handoffs?: Array<{ from: string; to: string; at: string }>
  messages?: Array<{ role: string; content: string; at: string }>
}

export type RunStatus = 'success' | 'failure' | 'running' | 'pending'

export interface RunHistoryDetail {
  id: string
  projectId: string
  runDate: string
  status: RunStatus
  durationMs?: number
  resultSummary?: string
  traceId?: string
}

export type ArtifactType = 'artifact' | 'diff' | 'log' | 'generated'

export interface ArtifactDetail {
  id: string
  projectId: string
  type: ArtifactType
  name: string
  createdAt?: string
  sizeBytes?: number
  retentionPolicy?: string
  signedUrl?: string
}

export interface AutomationTemplateDetail {
  id: string
  type: string
  config?: Record<string, unknown>
  permissions?: string[]
  constraints?: Record<string, unknown>
  name?: string
  createdAt?: string
}

export interface AuditLogEntry {
  id: string
  action: string
  userId?: string
  userName?: string
  timestamp: string
  traceId?: string
  rationale?: string
  reversible?: boolean
}
