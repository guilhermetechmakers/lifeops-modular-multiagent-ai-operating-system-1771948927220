/**
 * useContentLibrary - Data fetching and state for Content List / Library.
 * Supports debounced search, filters, pagination, bulk actions.
 */

import { useState, useCallback, useEffect } from 'react'
import type { ContentItem, ContentListFilters, ContentPreview, ContentVersion } from '@/types/content-dashboard'
import {
  fetchContentItems,
  fetchContentPreview,
  fetchContentVersions,
  bulkContentAction,
  updateContentItem,
} from '@/api/content-dashboard'
import { useDebounce } from '@/hooks/use-debounce'

export function useContentLibrary(initialFilters?: Partial<ContentListFilters>) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<ContentListFilters>({
    page: 1,
    pageSize: 24,
    sort: 'updatedAt',
    sortOrder: 'desc',
    ...initialFilters,
  })

  const debouncedSearch = useDebounce(filters.search ?? '', 300)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const statusFilter = filters.status && filters.status !== 'all'
        ? (filters.status as import('@/types/content-dashboard').ContentStatus)
        : undefined
      const res = await fetchContentItems({
        search: debouncedSearch || undefined,
        filters: statusFilter ? { status: statusFilter } : undefined,
        listFilters: {
          ...filters,
          search: debouncedSearch || undefined,
          status: statusFilter,
        },
        page: filters.page ?? 1,
        limit: filters.pageSize ?? 24,
      })
      const list = res?.items ?? []
      setItems(Array.isArray(list) ? list : [])
      setTotalCount(res?.total ?? (Array.isArray(list) ? list.length : 0))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load content')
      setItems([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filters.status, filters.page, filters.pageSize, filters.tags, filters.authorId, filters.dateFrom, filters.dateTo, filters.sort, filters.sortOrder])

  useEffect(() => {
    load()
  }, [load])

  const updateFilters = useCallback((updates: Partial<ContentListFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      pageSize: 24,
      sort: 'updatedAt',
      sortOrder: 'desc',
    })
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? (prev ?? []).filter((x) => x !== id) : [...(prev ?? []), id]
    )
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === (items ?? []).length) {
      setSelectedIds([])
    } else {
      setSelectedIds((items ?? []).map((i) => i.id))
    }
  }, [selectedIds.length, items])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const fetchPreview = useCallback(async (id: string): Promise<ContentPreview | null> => {
    return fetchContentPreview(id)
  }, [])

  const fetchVersions = useCallback(async (id: string): Promise<ContentVersion[]> => {
    const data = await fetchContentVersions(id)
    return Array.isArray(data) ? data : []
  }, [])

  const performBulkAction = useCallback(
    async (action: import('@/types/content-dashboard').BulkActionType, payload?: Record<string, unknown>) => {
      const ids = selectedIds.length > 0 ? selectedIds : []
      if (ids.length === 0) return { success: false, results: [] }
      const res = await bulkContentAction({ action, itemIds: ids, payload })
      if (res.success) {
        setSelectedIds([])
        await load()
      }
      return res
    },
    [selectedIds, load]
  )

  const updateItem = useCallback(async (id: string, payload: Partial<ContentItem>) => {
    const updated = await updateContentItem(id, payload)
    setItems((prev) => (prev ?? []).map((i) => (i.id === id ? updated : i)))
    return updated
  }, [])

  return {
    items,
    totalCount,
    loading,
    error,
    selectedIds,
    filters,
    updateFilters,
    clearFilters,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    fetchPreview,
    fetchVersions,
    performBulkAction,
    updateItem,
    refetch: load,
  }
}
