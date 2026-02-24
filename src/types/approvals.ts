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
