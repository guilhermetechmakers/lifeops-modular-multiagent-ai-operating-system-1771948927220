/**
 * Approvals API layer.
 * GET/POST approvals, approve, deny, request-info, bulk-action, audit logs.
 * All responses validated with null-safe patterns.
 */

import { apiGet, apiPost } from '@/lib/api'
import type {
  Approval,
  ApprovalComment,
  ApprovalDetail,
  AuditLogEntry,
  ApprovalsListParams,
  ApprovalsListResponse,
  ApprovePayload,
  DenyPayload,
  RequestInfoPayload,
  BulkActionPayload,
  SubmitApprovalActionPayload,
  TargetEntity,
  ResourceReference,
  ArtifactReference,
  AgentMessage,
  PayloadDiff,
  ApprovalHistoryEntry,
} from '@/types/approvals'

const API_BASE = '/approvals'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock ApprovalDetail (full context) ---

function mockApprovalToDetail(a: Approval): ApprovalDetail {
  const details = (a.details ?? {}) as Record<string, unknown>
  const proposedAction = (details.proposedAction as string) ?? a.summary
  const agentExplanations = Array.isArray(details.agentExplanations) ? details.agentExplanations : []
  const affectedResources = Array.isArray(details.affectedResources) ? details.affectedResources : []
  const runArtifacts = Array.isArray(details.runArtifacts) ? details.runArtifacts : []

  const targetEntities: TargetEntity[] = (a.contentItemId
    ? [{ id: a.contentItemId, type: 'content', name: (details.title as string) ?? a.summary }]
    : a.runId
      ? [{ id: a.runId, type: 'run', name: (details.title as string) ?? a.summary }]
      : [])

  const resources: ResourceReference[] = affectedResources.map((r: string, i: number) => ({
    id: `res-${i}`,
    type: 'resource',
    name: r,
    status: 'pending',
    impact: 'medium',
  }))

  const artifacts: ArtifactReference[] = runArtifacts.map((ra: { id?: string; type?: string; content?: string }, i: number) => ({
    id: (ra.id as string) ?? `art-${i}`,
    label: (ra.type as string) ?? 'Artifact',
    url: `#artifact-${i}`,
    type: (ra.type as string) ?? 'diff',
  }))

  const trace: AgentMessage[] = agentExplanations.map((ex: { agentId?: string; agentName?: string; message?: string; timestamp?: string }, i: number) => ({
    id: `msg-${i}`,
    agentId: ex.agentId ?? 'agent',
    timestamp: ex.timestamp ?? new Date().toISOString(),
    content: ex.message ?? '',
    type: 'handoff' as const,
  }))

  const diffs: PayloadDiff[] = runArtifacts.some((ra: { type?: string }) => ra.type === 'diff')
    ? [{
        type: 'json' as const,
        before: {},
        after: a.inputs ?? {},
      }]
    : []

  const slaDue = a.slaEnd ? new Date(a.slaEnd).getTime() : Date.now() + 24 * 60 * 60 * 1000
  const remainingMs = Math.max(0, slaDue - Date.now())
  const slaStatus = remainingMs === 0 ? 'overdue' as const : remainingMs < 3600000 ? 'escalated' as const : 'ok' as const

  return {
    id: a.id,
    status: a.status === 'pending-info' ? 'changes_requested' : (a.status as ApprovalDetail['status']),
    proposedAction,
    targetEntities,
    rationale: proposedAction,
    inputs: a.inputs ?? {},
    payload: a.inputs ?? {},
    resources,
    policy: {
      multiApproverRequired: a.multiApproverPolicy ?? false,
      requiredApprovers: [],
      slaHours: 24,
    },
    sla: {
      dueAt: new Date(slaDue).toISOString(),
      remainingMs,
      status: slaStatus,
    },
    history: [],
    comments: [],
    artifacts,
    trace,
    diffs,
  }
}

// --- Mock data ---

const MOCK_APPROVALS: Approval[] = [
  {
    id: 'ap1',
    module: 'finance',
    actionType: 'monthly-close',
    status: 'pending',
    priority: 'high',
    ageSeconds: 7200,
    requesterId: 'u1',
    requester: 'Finance Close Agent',
    approverGroupId: 'finance-approvers',
    summary: 'Finance Close - January',
    details: {
      title: 'Finance Close - January',
      proposedAction: 'Categorize 47 transactions, 3 require manual review',
      transactions: 47,
      categorized: 44,
      pending: 3,
      anomalies: 1,
      agentExplanations: [
        { agentId: 'a1', agentName: 'Finance Processor', message: 'Suggested categorization for 47 transactions. 3 require manual review.', timestamp: new Date().toISOString() },
        { agentId: 'a2', agentName: 'Anomaly Detector', message: '1 anomaly flagged: Unusual subscription charge ($99).', timestamp: new Date().toISOString() },
      ],
      affectedResources: ['transactions', 'categories'],
      runArtifacts: [
        { id: 'r1', type: 'diff', content: JSON.stringify({ transactions: 47, categorized: 44, pending: 3, anomalies: 1 }, null, 2), timestamp: new Date().toISOString() },
      ],
    },
    inputs: { period: '2025-01', scope: 'all' },
    artifacts: ['run-tr-001', 'trace-001'],
    runId: 'r1',
    auditTrailId: 'audit-1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ap2',
    module: 'content',
    actionType: 'publish',
    status: 'pending',
    priority: 'medium',
    ageSeconds: 18000,
    requesterId: 'u2',
    requester: 'Content Ideas Agent',
    approverGroupId: 'content-approvers',
    summary: 'Content Publish - Blog Post',
    details: {
      title: 'Content Publish - Blog Post',
      proposedAction: 'Publish "Getting Started with LifeOps" to blog',
      platform: 'blog',
      agentExplanations: [
        { agentId: 'a3', agentName: 'Content Publisher', message: 'Draft ready. Scheduled for 2pm UTC.', timestamp: new Date().toISOString() },
      ],
      affectedResources: ['blog', 'twitter', 'linkedin'],
    },
    inputs: { contentId: 'c1', platforms: ['blog'] },
    artifacts: [],
    contentItemId: 'c1',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ap3',
    module: 'projects',
    actionType: 'release',
    status: 'pending',
    priority: 'high',
    ageSeconds: 86400,
    requesterId: 'u3',
    requester: 'Projects Agent',
    approverGroupId: 'release-approvers',
    summary: 'Release v1.2.0',
    details: {
      title: 'Release v1.2.0',
      proposedAction: 'Tag and deploy v1.2.0 to production',
      version: '1.2.0',
      agentExplanations: [
        { agentId: 'a4', agentName: 'Release Manager', message: 'All tests passed. Changelog generated.', timestamp: new Date().toISOString() },
      ],
      affectedResources: ['github', 'production'],
    },
    inputs: { version: '1.2.0', changelog: '...' },
    artifacts: ['diff-001'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ap4',
    module: 'cronjob',
    actionType: 'execute',
    status: 'pending',
    priority: 'critical',
    ageSeconds: 3600,
    requesterId: 'system',
    requester: 'Cronjob Scheduler',
    approverGroupId: 'cronjob-approvers',
    summary: 'Weekly Content Ideas - Scheduled run',
    details: { title: 'Weekly Content Ideas', cronjobId: 'c1' },
    inputs: { cronjobId: 'c1', trigger: 'schedule' },
    runId: 'r3',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_COMMENTS: ApprovalComment[] = [
  {
    id: 'ac1',
    approvalId: 'ap1',
    authorId: 'u1',
    author: 'Finance Close Agent',
    comment: '47 transactions processed. 3 require manual review.',
    createdAt: new Date(Date.now() - 7000000).toISOString(),
  },
]

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    actionType: 'approval_created',
    actionId: 'ap1',
    actorId: 'system',
    actor: 'Finance Close Agent',
    summary: 'Approval requested for Finance Close - January',
    schemaVersion: '1.0',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
]

// --- API functions ---

export async function fetchApprovals(
  params?: ApprovalsListParams
): Promise<ApprovalsListResponse> {
  if (USE_MOCK) {
    let items = [...MOCK_APPROVALS]
    if (params?.module) {
      items = items.filter((a) => a.module === params.module)
    }
    if (params?.status) {
      items = items.filter((a) => a.status === params.status)
    }
    if (params?.priority) {
      items = items.filter((a) => a.priority === params.priority)
    }
    if (params?.requesterId) {
      items = items.filter((a) => a.requesterId === params.requesterId)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      items = items.filter(
        (a) =>
          a.summary.toLowerCase().includes(q) ||
          (a.details?.title as string)?.toLowerCase?.()?.includes?.(q)
      )
    }
    const total = items.length
    const page = params?.page ?? 1
    const size = params?.size ?? 20
    const start = (page - 1) * size
    const data = items.slice(start, start + size)
    return { data, total, page, size }
  }
  const q = new URLSearchParams()
  if (params?.module) q.set('module', params.module)
  if (params?.status) q.set('status', params.status)
  if (params?.priority) q.set('priority', params.priority)
  if (params?.page != null) q.set('page', String(params.page))
  if (params?.size != null) q.set('size', String(params.size))
  if (params?.search) q.set('search', params.search)
  const res = await apiGet<{ data?: Approval[]; total?: number; page?: number; size?: number }>(
    `${API_BASE}?${q.toString()}`
  )
  const data = Array.isArray(res?.data) ? res.data : []
  return {
    data,
    total: res?.total ?? data.length,
    page: res?.page ?? params?.page ?? 1,
    size: res?.size ?? params?.size ?? 20,
  }
}

export async function fetchApproval(id: string): Promise<Approval | null> {
  if (USE_MOCK) {
    const found = MOCK_APPROVALS.find((a) => a.id === id)
    return found ?? null
  }
  try {
    const res = await apiGet<Approval>(`${API_BASE}/${id}`)
    return res ?? null
  } catch {
    return null
  }
}

export async function approveApproval(
  id: string,
  payload?: ApprovePayload
): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (a) {
      a.status = 'approved'
      a.updatedAt = new Date().toISOString()
    }
    return
  }
  await apiPost(`${API_BASE}/${id}/approve`, payload ?? {})
}

export async function denyApproval(
  id: string,
  payload?: DenyPayload
): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (a) {
      a.status = 'denied'
      a.updatedAt = new Date().toISOString()
    }
    return
  }
  await apiPost(`${API_BASE}/${id}/deny`, payload ?? {})
}

export async function requestInfoApproval(
  id: string,
  payload?: RequestInfoPayload
): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (a) {
      a.status = 'pending-info'
      a.updatedAt = new Date().toISOString()
    }
    return
  }
  await apiPost(`${API_BASE}/${id}/request-info`, payload ?? {})
}

export async function bulkActionApprovals(
  payload: BulkActionPayload
): Promise<{ success: number; failed: number }> {
  if (USE_MOCK) {
    const ids = payload.ids ?? []
    let success = 0
    for (const id of ids) {
      const a = MOCK_APPROVALS.find((x) => x.id === id)
      if (a && a.status === 'pending') {
        if (payload.action === 'approve') a.status = 'approved'
        else if (payload.action === 'deny') a.status = 'denied'
        else if (payload.action === 'request-info') a.status = 'pending-info'
        a.updatedAt = new Date().toISOString()
        success++
      }
    }
    return { success, failed: ids.length - success }
  }
  const res = await apiPost<{ success?: number; failed?: number }>(
    `${API_BASE}/bulk-action`,
    payload
  )
  return {
    success: res?.success ?? 0,
    failed: res?.failed ?? 0,
  }
}

export async function fetchApprovalComments(
  approvalId: string
): Promise<ApprovalComment[]> {
  if (USE_MOCK) {
    return (MOCK_COMMENTS ?? []).filter((c) => c.approvalId === approvalId)
  }
  const res = await apiGet<ApprovalComment[] | { data?: ApprovalComment[] }>(
    `${API_BASE}/${approvalId}/comments`
  )
  return Array.isArray(res) ? res : res?.data ?? []
}

export async function addApprovalComment(
  approvalId: string,
  comment: string
): Promise<ApprovalComment | null> {
  if (USE_MOCK) {
    const newComment: ApprovalComment = {
      id: `ac${Date.now()}`,
      approvalId,
      authorId: 'current-user',
      author: 'Current User',
      comment,
      createdAt: new Date().toISOString(),
    }
    MOCK_COMMENTS.push(newComment)
    return newComment
  }
  const res = await apiPost<ApprovalComment>(`${API_BASE}/${approvalId}/comments`, {
    comment,
  })
  return res ?? null
}

export async function fetchAuditLogs(approvalId?: string): Promise<AuditLogEntry[]> {
  if (USE_MOCK) {
    const logs = approvalId
      ? (MOCK_AUDIT_LOGS ?? []).filter((l) => l.actionId === approvalId)
      : (MOCK_AUDIT_LOGS ?? [])
    return logs
  }
  const q = approvalId ? `?approvalId=${approvalId}` : ''
  const res = await apiGet<AuditLogEntry[] | { data?: AuditLogEntry[] }>(
    `/audit-logs${q}`
  )
  return Array.isArray(res) ? res : res?.data ?? []
}

// --- Approval Detail (full context) ---

export async function fetchApprovalDetail(id: string): Promise<ApprovalDetail | null> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (!a) return null
    const detail = mockApprovalToDetail(a)
    const comments = (MOCK_COMMENTS ?? []).filter((c) => c.approvalId === id)
    const logs = (MOCK_AUDIT_LOGS ?? []).filter((l) => l.actionId === id)
    detail.comments = comments.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      author: c.author,
      text: c.comment,
      createdAt: c.createdAt,
    }))
    detail.history = logs.map((l) => ({
      id: l.id,
      action: l.actionType,
      actorId: l.actorId,
      actor: l.actor,
      timestamp: l.createdAt,
      comment: l.summary,
    }))
    return detail
  }
  try {
    const res = await apiGet<ApprovalDetail>(`${API_BASE}/${id}`)
    return res ?? null
  } catch {
    return null
  }
}

export async function fetchApprovalTrace(id: string): Promise<AgentMessage[]> {
  if (USE_MOCK) {
    const detail = await fetchApprovalDetail(id)
    return (detail?.trace ?? []) as AgentMessage[]
  }
  const res = await apiGet<AgentMessage[] | { data?: AgentMessage[] }>(
    `${API_BASE}/${id}/trace`
  )
  return Array.isArray(res) ? res : res?.data ?? []
}

export async function fetchApprovalDiffs(id: string): Promise<PayloadDiff[]> {
  if (USE_MOCK) {
    const detail = await fetchApprovalDetail(id)
    return detail?.diffs ?? []
  }
  const res = await apiGet<PayloadDiff[] | { data?: PayloadDiff[] }>(
    `${API_BASE}/${id}/diffs`
  )
  return Array.isArray(res) ? res : res?.data ?? []
}

export async function fetchApprovalAudit(id: string): Promise<ApprovalHistoryEntry[]> {
  if (USE_MOCK) {
    const detail = await fetchApprovalDetail(id)
    return detail?.history ?? []
  }
  const res = await apiGet<ApprovalHistoryEntry[] | { data?: ApprovalHistoryEntry[] }>(
    `${API_BASE}/${id}/audit`
  )
  return Array.isArray(res) ? res : res?.data ?? []
}

export async function submitApprovalAction(
  id: string,
  payload: SubmitApprovalActionPayload
): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (a) {
      if (payload.action === 'approve') a.status = 'approved'
      else if (payload.action === 'deny') a.status = 'denied'
      else if (payload.action === 'changes_requested') a.status = 'pending-info'
      a.updatedAt = new Date().toISOString()
    }
    return
  }
  await apiPost(`${API_BASE}/${id}/actions`, payload)
}

