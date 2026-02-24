/**
 * useContentDashboard - Data fetching and state for Content Dashboard.
 */

import { useState, useCallback, useEffect } from 'react'
import type { ContentItem, ContentStatus, CronJob, Approval, ContentTemplate, GlobalSearchFilters, MemoryEntry } from '@/types/content-dashboard'
import {
  fetchContentItems,
  updateContentItem,
  fetchTemplates,
  fetchMemoryEntries,
  createMemoryEntry,
  fetchContentApprovals,
  approveContentApproval,
  rejectContentApproval,
  fetchContentCronjobs,
  pauseContentCronjob,
  enableContentCronjob,
  createContentItem,
} from '@/api/content-dashboard'

export function useContentItems(filters?: GlobalSearchFilters & { search?: string }) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchContentItems({
        filters: filters ? { status: filters.status, authorId: filters.authorId } : undefined,
        search: filters?.search,
        page: 1,
        limit: 100,
      })
      const list = res?.items ?? []
      setItems(Array.isArray(list) ? list : [])
      setTotal(res?.total ?? list.length)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setItems([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [filters?.status, filters?.search])

  useEffect(() => {
    load()
  }, [load])

  const updateItem = useCallback(
    async (id: string, payload: Partial<ContentItem>) => {
      const updated = await updateContentItem(id, payload)
      setItems((prev) => (prev ?? []).map((i) => (i.id === id ? updated : i)))
      return updated
    },
    []
  )

  const createItem = useCallback(async (payload: Partial<ContentItem>) => {
    const created = await createContentItem(payload)
    setItems((prev) => [created, ...(prev ?? [])])
    setTotal((t) => t + 1)
    return created
  }, [])

  return { items, total, isLoading, error, updateItem, createItem, refetch: load }
}

export function useContentTemplates() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTemplates().then((data) => {
      setTemplates(Array.isArray(data) ? data : [])
      setIsLoading(false)
    })
  }, [])

  return { templates, isLoading }
}

export function useContentCronjobs() {
  const [cronjobs, setCronjobs] = useState<CronJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    const data = await fetchContentCronjobs()
    setCronjobs(Array.isArray(data) ? data : [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const pause = useCallback(async (id: string) => {
    await pauseContentCronjob(id)
    setCronjobs((prev) => (prev ?? []).map((c) => (c.id === id ? { ...c, enabled: false } : c)))
  }, [])

  const enable = useCallback(async (id: string) => {
    await enableContentCronjob(id)
    setCronjobs((prev) => (prev ?? []).map((c) => (c.id === id ? { ...c, enabled: true } : c)))
  }, [])

  return { cronjobs, isLoading, pause, enable, refetch: load }
}

export function useContentApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    const data = await fetchContentApprovals()
    setApprovals(Array.isArray(data) ? data : [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const approve = useCallback(
    async (id: string) => {
      await approveContentApproval(id)
      setApprovals((prev) => (prev ?? []).map((a) => (a.id === id ? { ...a, status: 'approved' as const } : a)))
    },
    []
  )

  const reject = useCallback(
    async (id: string, reason?: string) => {
      await rejectContentApproval(id, reason)
      setApprovals((prev) => (prev ?? []).map((a) => (a.id === id ? { ...a, status: 'rejected' as const } : a)))
    },
    []
  )

  return { approvals, isLoading, approve, reject, refetch: load }
}

export function useMemoryScope(scope: string, agentId?: string) {
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    const data = await fetchMemoryEntries(scope, agentId)
    setEntries(Array.isArray(data) ? data : [])
    setIsLoading(false)
  }, [scope, agentId])

  useEffect(() => {
    load()
  }, [load])

  const createEntry = useCallback(
    async (payload: Partial<MemoryEntry>) => {
      const created = await createMemoryEntry(payload)
      setEntries((prev) => [created, ...(prev ?? [])])
      return created
    },
    []
  )

  return { entries, isLoading, createEntry, refetch: load }
}

export function useContentDashboard() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [templates, setTemplates] = useState<Awaited<ReturnType<typeof fetchTemplates>>>([])
  const [memory, setMemory] = useState<Awaited<ReturnType<typeof fetchMemoryEntries>>>([])
  const [approvals, setApprovals] = useState<Awaited<ReturnType<typeof fetchContentApprovals>>>([])
  const [cronjobs, setCronjobs] = useState<Awaited<ReturnType<typeof fetchContentCronjobs>>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [itemsRes, templatesRes, memoryRes, approvalsRes, cronjobsRes] = await Promise.all([
        fetchContentItems(),
        fetchTemplates(),
        fetchMemoryEntries('content'),
        fetchContentApprovals(),
        fetchContentCronjobs(),
      ])
      setItems(Array.isArray(itemsRes?.items) ? itemsRes.items : [])
      setTemplates(Array.isArray(templatesRes) ? templatesRes : [])
      setMemory(Array.isArray(memoryRes) ? memoryRes : [])
      setApprovals(Array.isArray(approvalsRes) ? approvalsRes : [])
      setCronjobs(Array.isArray(cronjobsRes) ? cronjobsRes : [])
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const moveItem = useCallback(async (id: string, newStatus: ContentStatus) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    try {
      const updated = await updateContentItem(id, { status: newStatus })
      setItems((prev) => (prev ?? []).map((i) => (i.id === id ? updated : i)))
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to move'))
    }
  }, [items])

  const createItem = useCallback(async (payload: Partial<ContentItem>) => {
    try {
      const created = await createContentItem(payload)
      setItems((prev) => [...(prev ?? []), created])
      return created
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to create'))
      return null
    }
  }, [])

  const approveApproval = useCallback(async (id: string) => {
    try {
      await approveContentApproval(id)
      setApprovals((prev) => (prev ?? []).filter((a) => a.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to approve'))
    }
  }, [])

  const rejectApproval = useCallback(async (id: string) => {
    try {
      await rejectContentApproval(id)
      setApprovals((prev) => (prev ?? []).filter((a) => a.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to reject'))
    }
  }, [])

  return {
    items,
    templates,
    memory,
    approvals,
    cronjobs,
    isLoading,
    error,
    moveItem,
    createItem,
    approveApproval,
    rejectApproval,
    refetch: load,
  }
}
