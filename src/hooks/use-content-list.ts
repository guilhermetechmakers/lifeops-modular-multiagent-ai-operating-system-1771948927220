/**
 * useContentList - Data fetching for Content List / Library.
 * Debounced search, filters, pagination, bulk actions.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { ContentItem, ContentListFilters, ContentPreview, ContentVersion } from '@/types/content-dashboard'
import {
  fetchContentList,
  fetchContentPreview,
  fetchContentVersions,
  bulkActionContent,
} from '@/api/content-dashboard'
import type { BulkActionRequest, BulkActionResponse } from '@/types/content-dashboard'

const DEFAULT_PAGE_SIZE = 20
const DEBOUNCE_MS = 300

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function useContentList(initialFilters?: Partial<ContentListFilters>) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ContentListFilters>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sort: 'updatedAt',
    sortOrder: 'desc',
    ...initialFilters,
  })
  const debouncedSearch = useDebounce(filters.search ?? '', DEBOUNCE_MS)
  const loadRef = useRef(0)

  const load = useCallback(async () => {
    const loadId = ++loadRef.current
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchContentList({
        ...filters,
        search: debouncedSearch || undefined,
      })
      if (loadId !== loadRef.current) return
      const list = res?.data ?? []
      setItems(Array.isArray(list) ? list : [])
      setTotalCount(res?.totalCount ?? list.length)
    } catch (e) {
      if (loadId !== loadRef.current) return
      setError(e instanceof Error ? e.message : 'Failed to load')
      setItems([])
      setTotalCount(0)
    } finally {
      if (loadId === loadRef.current) setIsLoading(false)
    }
  }, [filters.page, filters.pageSize, filters.status, filters.type, filters.authorId, filters.tags, filters.dateFrom, filters.dateTo, filters.sort, filters.sortOrder, filters.quickFilter, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  const updateFilters = useCallback((updates: Partial<ContentListFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates }
      if (updates.page === undefined && (updates.status !== undefined || updates.type !== undefined || updates.search !== undefined)) {
        next.page = 1
      }
      return next
    })
  }, [])

  const bulkAction = useCallback(
    async (payload: BulkActionRequest): Promise<BulkActionResponse> => {
      const res = await bulkActionContent(payload)
      if (res?.success) {
        load()
      }
      return res ?? { success: false, results: [] }
    },
    [load]
  )

  return {
    items,
    totalCount,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch: load,
    bulkAction,
  }
}

export function useContentPreview(contentId: string | null) {
  const [preview, setPreview] = useState<ContentPreview | null>(null)
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    if (!contentId) {
      setPreview(null)
      setVersions([])
      return
    }
    setIsLoading(true)
    try {
      const [previewRes, versionsRes] = await Promise.all([
        fetchContentPreview(contentId),
        fetchContentVersions(contentId),
      ])
      setPreview(previewRes ?? null)
      setVersions(Array.isArray(versionsRes) ? versionsRes : [])
    } catch {
      setPreview(null)
      setVersions([])
    } finally {
      setIsLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    load()
  }, [load])

  return { preview, versions, isLoading, refetch: load }
}
