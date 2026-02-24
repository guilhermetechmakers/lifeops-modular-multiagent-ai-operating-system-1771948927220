/**
 * useApprovals - Fetch approvals list with filters, pagination, and actions.
 * useApprovalDetail - Fetch single approval with comments and audit logs.
 * All state initialized with safe defaults; null-safe data handling.
 */

import { useState, useEffect, useCallback } from 'react'
import type {
  Approval,
  ApprovalComment,
  ApprovalDetail,
  AuditLogEntry,
  ApprovalsListParams,
  SubmitApprovalActionPayload,
} from '@/types/approvals'
import {
  fetchApprovals,
  fetchApproval,
  fetchApprovalDetail,
  approveApproval,
  denyApproval,
  requestInfoApproval,
  submitApprovalAction,
  bulkActionApprovals,
  fetchApprovalComments,
  addApprovalComment,
  fetchAuditLogs,
} from '@/api/approvals'

export function useApprovals(initialParams?: ApprovalsListParams) {
  const [data, setData] = useState<Approval[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialParams?.page ?? 1)
  const [size, setSize] = useState(initialParams?.size ?? 20)
  const [params, setParams] = useState<ApprovalsListParams>(initialParams ?? {})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchApprovals({ ...params, page, size })
      const items = Array.isArray(res?.data) ? res.data : []
      setData(items)
      setTotal(res?.total ?? items.length)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load approvals'))
      setData([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [params, page, size])

  useEffect(() => {
    load()
  }, [load])

  const setFilters = useCallback((newParams: Partial<ApprovalsListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }))
    setPage(1)
  }, [])

  const handleApprove = useCallback(async (id: string, comment?: string) => {
    await approveApproval(id, { comment })
    setData((prev) => prev.filter((a) => a.id !== id))
    setTotal((t) => Math.max(0, t - 1))
  }, [])

  const handleDeny = useCallback(async (id: string, comment?: string) => {
    await denyApproval(id, { comment })
    setData((prev) => prev.filter((a) => a.id !== id))
    setTotal((t) => Math.max(0, t - 1))
  }, [])

  const handleRequestInfo = useCallback(async (id: string, payload?: { comment?: string; questions?: string[] }) => {
    await requestInfoApproval(id, payload ?? {})
    load()
  }, [load])

  const handleBulkAction = useCallback(
    async (action: 'approve' | 'deny' | 'request-info', ids: string[], comment?: string) => {
      const result = await bulkActionApprovals({ action, ids, comment })
      const removed = result.success
      setData((prev) => prev.filter((a) => !ids.includes(a.id)))
      setTotal((t) => Math.max(0, t - removed))
      return result
    },
    []
  )

  return {
    data,
    total,
    page,
    size,
    params,
    isLoading,
    error,
    refetch: load,
    setPage,
    setSize,
    setFilters,
    approve: handleApprove,
    deny: handleDeny,
    requestInfo: handleRequestInfo,
    bulkAction: handleBulkAction,
  }
}

export function useApprovalDetail(id: string | undefined) {
  const [approval, setApproval] = useState<Approval | null>(null)
  const [detail, setDetail] = useState<ApprovalDetail | null>(null)
  const [comments, setComments] = useState<ApprovalComment[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    if (!id) {
      setApproval(null)
      setDetail(null)
      setComments([])
      setAuditLogs([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const [d, a, c, logs] = await Promise.all([
        fetchApprovalDetail(id),
        fetchApproval(id),
        fetchApprovalComments(id),
        fetchAuditLogs(id),
      ])
      setDetail(d ?? null)
      setApproval(a ?? null)
      setComments(Array.isArray(c) ? c : [])
      setAuditLogs(Array.isArray(logs) ? logs : [])
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load approval'))
      setApproval(null)
      setDetail(null)
      setComments([])
      setAuditLogs([])
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = useCallback(
    async (comment?: string) => {
      if (!id) return
      await submitApprovalAction(id, { action: 'approve', comments: comment })
      load()
    },
    [id, load]
  )

  const handleDeny = useCallback(
    async (comment?: string) => {
      if (!id) return
      await submitApprovalAction(id, { action: 'deny', comments: comment })
      load()
    },
    [id, load]
  )

  const handleRequestChanges = useCallback(
    async (comment?: string) => {
      if (!id) return
      await submitApprovalAction(id, { action: 'changes_requested', comments: comment })
      load()
    },
    [id, load]
  )

  const handleRequestInfo = useCallback(
    async (payload?: { comment?: string; questions?: string[] }) => {
      if (!id) return
      await requestInfoApproval(id, payload ?? {})
      load()
    },
    [id, load]
  )

  const handleAddComment = useCallback(async (text: string) => {
    if (!id) return null
    const newComment = await addApprovalComment(id, text)
    if (newComment) {
      setComments((prev) => [...prev, newComment])
      return {
        id: newComment.id,
        authorId: newComment.authorId,
        author: newComment.author,
        text: newComment.comment,
        createdAt: newComment.createdAt,
      }
    }
    return null
  }, [id])

  const handleSubmitAction = useCallback(
    async (payload: SubmitApprovalActionPayload) => {
      if (!id) return
      const { action, comments: comment } = payload ?? {}
      if (action === 'approve') await handleApprove(comment)
      else if (action === 'deny') await handleDeny(comment)
      else if (action === 'changes_requested') await handleRequestChanges(comment)
    },
    [id, handleApprove, handleDeny, handleRequestChanges]
  )

  return {
    approval,
    detail,
    comments,
    auditLogs,
    isLoading,
    error,
    refetch: load,
    approve: handleApprove,
    deny: handleDeny,
    requestChanges: handleRequestChanges,
    requestInfo: handleRequestInfo,
    addComment: handleAddComment,
    submitAction: handleSubmitAction,
  }
}
