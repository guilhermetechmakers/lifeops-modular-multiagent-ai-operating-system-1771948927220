/**
 * Approvals Queue data models.
 * Aligned with LifeOps Approvals spec: module, actionType, status, RBAC, audit trail.
 * All arrays default to [] when null/undefined for runtime safety.
 */

export type ApprovalModule =
  | 'content'
  | 'finance'
  | 'projects'
  | 'health'
  | 'cronjob'
  | 'release'
  | 'agent-change'

export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'pending-info'

export type ApprovalPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Approval {
  id: string
  module: ApprovalModule
  actionType: string
  status: ApprovalStatus
  priority: ApprovalPriority
  ageSeconds: number
  requesterId: string
  requester?: string
  approverGroupId?: string
  summary: string
  details?: Record<string, unknown>
  inputs?: Record<string, unknown>
  artifacts?: string[]
  runId?: string
  contentItemId?: string
  auditTrailId?: string
  createdAt: string
  updatedAt: string
  slaEnd?: string
  multiApproverPolicy?: boolean
}

export interface ApprovalComment {
  id: string
  approvalId: string
  authorId: string
  author?: string
  comment: string
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  actionType: string
  actionId: string
  actorId: string
  actor?: string
  summary: string
  detailsJson?: Record<string, unknown>
  schemaVersion: string
  reversibleActionJson?: Record<string, unknown>
  createdAt: string
}

export interface ApprovalsListParams {
  module?: ApprovalModule
  approverGroupId?: string
  priority?: ApprovalPriority
  requesterId?: string
  status?: ApprovalStatus
  ageMin?: number
  ageMax?: number
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  size?: number
}

export interface ApprovalsListResponse {
  data: Approval[]
  total: number
  page: number
  size: number
}

export interface ApprovePayload {
  comment?: string
  additionalData?: Record<string, unknown>
}

export interface DenyPayload {
  comment?: string
}

export interface RequestInfoPayload {
  comment?: string
  questions?: string[]
}

export interface BulkActionPayload {
  action: 'approve' | 'deny' | 'request-info'
  ids: string[]
  comment?: string
}

// --- Approval Detail (full context) ---

export type ApprovalDetailStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'changes_requested'
  | 'completed'
  | 'pending-info'

export interface TargetEntity {
  id: string
  type: string
  name: string
}

export interface ApprovalPolicy {
  multiApproverRequired?: boolean
  requiredApprovers?: string[]
  slaHours?: number
  escalationRules?: Record<string, unknown>
}

export interface ApprovalSLA {
  dueAt: string
  remainingMs: number
  status: 'ok' | 'escalated' | 'overdue'
}

export interface ApprovalHistoryEntry {
  id: string
  action: string
  actorId: string
  actor?: string
  timestamp: string
  comment?: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
}

export interface ApprovalCommentDetail {
  id: string
  authorId: string
  author?: string
  text: string
  createdAt: string
  attachmentUrls?: string[]
  inReplyToCommentId?: string
}

export interface AgentMessage {
  id: string
  agentId: string
  role?: string
  timestamp: string
  content: string
  type: 'handoff' | 'negotiation' | 'alert' | 'consensus'
}

export interface ResourceReference {
  id: string
  type: string
  name: string
  status: string
  impact?: string
  links?: string[]
}

export interface ArtifactReference {
  id: string
  label: string
  url: string
  type: string
}

export interface PayloadDiff {
  type: 'json' | 'text'
  before: string | Record<string, unknown>
  after: string | Record<string, unknown>
}

export interface ApprovalDetail {
  id: string
  status: ApprovalDetailStatus
  proposedAction: string
  targetEntities?: TargetEntity[]
  rationale?: string
  inputs?: Record<string, unknown>
  payload?: Record<string, unknown>
  resources?: ResourceReference[]
  policy?: ApprovalPolicy
  sla?: ApprovalSLA
  history?: ApprovalHistoryEntry[]
  comments?: ApprovalCommentDetail[]
  artifacts?: ArtifactReference[]
  trace?: AgentMessage[]
  diffs?: PayloadDiff[]
}

export interface SubmitApprovalActionPayload {
  action: 'approve' | 'deny' | 'changes_requested'
  comments?: string
  attachments?: string[]
  relatedActionId?: string
}
