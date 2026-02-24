/**
 * useRuns - Fetch runs list with filters, pagination, and actions.
 * useRunDetail - Fetch single run with full detail payload.
 * All state initialized with safe defaults; null-safe data handling.
 */

import { useState, useEffect, useCallback } from 'react'
import type { Run, RunDetailPayload, RunsListParams } from '@/types/runs'
import {
  fetchRuns,
  fetchRun,
  fetchRunDetail,
  rerunRun,
  bulkRunsAction,
} from '@/api/runs'

export function useRuns(initialParams?: RunsListParams) {
  const [data, setData] = useState<Run[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialParams?.page ?? 1)
  const [pageSize, setPageSize] = useState(initialParams?.pageSize ?? 20)
  const [params, setParams] = useState<RunsListParams>(initialParams ?? {})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchRuns({ ...params, page, pageSize })
      const items = Array.isArray(res?.data) ? res.data : []
      setData(items)
      setTotal(res?.total ?? items.length)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load runs'))
      setData([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [params, page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  const setFilters = useCallback((newParams: Partial<RunsListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }))
    setPage(1)
  }, [])

  const handleRerun = useCallback(async (id: string) => {
    const updated = await rerunRun(id)
    if (updated) {
      setData((prev) => [updated, ...(prev ?? [])])
      setTotal((t) => t + 1)
      return updated
    }
    return null
  }, [])

  const handleBulkAction = useCallback(
    async (action: 'rerun' | 'export', ids: string[]) => {
      const result = await bulkRunsAction(action, ids ?? [])
      if (action === 'rerun' && result.success > 0) {
        load()
      }
      return result
    },
    [load]
  )

  return {
    data,
    total,
    page,
    pageSize,
    params,
    isLoading,
    error,
    refetch: load,
    setPage,
    setPageSize,
    setFilters,
    rerun: handleRerun,
    bulkAction: handleBulkAction,
  }
}

export function useRunDetail(id: string | undefined) {
  const [run, setRun] = useState<Run | null>(null)
  const [detail, setDetail] = useState<RunDetailPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    if (!id) {
      setRun(null)
      setDetail(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const [r, d] = await Promise.all([fetchRun(id), fetchRunDetail(id)])
      setRun(r ?? null)
      setDetail(d ?? null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load run'))
      setRun(null)
      setDetail(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleRerun = useCallback(async () => {
    if (!id) return null
    return rerunRun(id)
  }, [id])

  return {
    run,
    detail,
    isLoading,
    error,
    refetch: load,
    rerun: handleRerun,
  }
}
