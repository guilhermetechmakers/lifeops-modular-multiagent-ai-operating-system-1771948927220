/**
 * Cronjobs Dashboard data hooks.
 * Fetches cronjobs list, detail, runs, approvals, templates, health.
 */

import { useState, useEffect, useCallback } from 'react'
import type { Cronjob, CronjobRun, CronjobApproval, CronjobTemplate } from '@/types/cronjobs'
import type { CronjobCreateInput } from '@/types/cronjobs'
import {
  fetchCronjobs,
  fetchCronjob,
  createCronjob,
  updateCronjob,
  triggerCronjob,
  pauseCronjob,
  resumeCronjob,
  enableCronjob,
  disableCronjob,
  fetchCronjobRuns,
  fetchApprovals,
  approveApproval,
  rejectApproval,
  fetchTemplates,
  fetchHealth,
} from '@/api/cronjobs'
import { useDebounce } from '@/hooks/use-debounce'

export interface CronjobsFilters {
  search?: string
  status?: 'enabled' | 'paused' | 'disabled'
  targetType?: 'agent' | 'template'
  owner?: string
  page?: number
  limit?: number
}

export function useCronjobs(filters: CronjobsFilters = {}) {
  const [cronjobs, setCronjobs] = useState<Cronjob[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const debouncedSearch = useDebounce(filters.search ?? '', 300)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchCronjobs({
        ...filters,
        search: debouncedSearch || undefined,
      })
      const data = Array.isArray(res?.data) ? res.data : []
      setCronjobs(data)
      setTotal(res?.total ?? data.length)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load cronjobs'))
      setCronjobs([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, filters.search, filters.status, filters.targetType, filters.owner, filters.page, filters.limit])

  useEffect(() => {
    load()
  }, [load])

  const handleTrigger = useCallback(async (id: string) => {
    await triggerCronjob(id)
    load()
  }, [load])

  const handlePause = useCallback(async (id: string) => {
    await pauseCronjob(id)
    setCronjobs((prev) => prev.map((c) => (c.id === id ? { ...c, paused: true } : c)))
  }, [])

  const handleResume = useCallback(async (id: string) => {
    await resumeCronjob(id)
    setCronjobs((prev) => prev.map((c) => (c.id === id ? { ...c, paused: false } : c)))
  }, [])

  const handleEnable = useCallback(async (id: string) => {
    await enableCronjob(id)
    setCronjobs((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: true, paused: false } : c)))
  }, [])

  const handleDisable = useCallback(async (id: string) => {
    await disableCronjob(id)
    setCronjobs((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: false } : c)))
  }, [])

  return {
    cronjobs,
    total,
    isLoading,
    error,
    refetch: load,
    triggerCronjob: handleTrigger,
    pauseCronjob: handlePause,
    resumeCronjob: handleResume,
    enableCronjob: handleEnable,
    disableCronjob: handleDisable,
  }
}

export function useCronjobDetail(id: string | undefined) {
  const [cronjob, setCronjob] = useState<Cronjob | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    if (!id || id === 'new') {
      setCronjob(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchCronjob(id)
      setCronjob(data ?? null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load cronjob'))
      setCronjob(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const update = useCallback(async (updates: Partial<CronjobCreateInput>) => {
    if (!id || id === 'new') return
    try {
      const updated = await updateCronjob(id, updates)
      setCronjob(updated)
      return updated
    } catch (e) {
      throw e
    }
  }, [id])

  const trigger = useCallback(async () => {
    if (!id || id === 'new') return
    await triggerCronjob(id)
    load()
  }, [id, load])

  const pause = useCallback(async () => {
    if (!id || id === 'new') return
    await pauseCronjob(id)
    setCronjob((prev) => (prev ? { ...prev, paused: true } : null))
  }, [id])

  const enable = useCallback(async () => {
    if (!id || id === 'new') return
    await enableCronjob(id)
    setCronjob((prev) => (prev ? { ...prev, enabled: true, paused: false } : null))
  }, [id])

  const disable = useCallback(async () => {
    if (!id || id === 'new') return
    await disableCronjob(id)
    setCronjob((prev) => (prev ? { ...prev, enabled: false } : null))
  }, [id])

  return {
    cronjob,
    isLoading,
    error,
    refetch: load,
    update,
    trigger,
    pause,
    enable,
    disable,
  }
}

export function useCronjobRuns(cronjobId: string | undefined, params?: { page?: number; limit?: number }) {
  const [runs, setRuns] = useState<CronjobRun[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!cronjobId) {
      setRuns([])
      setTotal(0)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const res = await fetchCronjobRuns(cronjobId, params)
      const data = Array.isArray(res?.data) ? res.data : []
      setRuns(data)
      setTotal(res?.total ?? data.length)
    } catch {
      setRuns([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [cronjobId, params?.page, params?.limit])

  useEffect(() => {
    load()
  }, [load])

  return { runs, total, isLoading, refetch: load }
}

export function useCronjobApprovals() {
  const [approvals, setApprovals] = useState<CronjobApproval[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchApprovals()
      setApprovals(Array.isArray(data) ? data : [])
    } catch {
      setApprovals([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const approve = useCallback(async (id: string, comments?: string) => {
    await approveApproval(id, comments)
    setApprovals((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const reject = useCallback(async (id: string, comments?: string) => {
    await rejectApproval(id, comments)
    setApprovals((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return {
    approvals,
    isLoading,
    refetch: load,
    approveApproval: approve,
    rejectApproval: reject,
  }
}

export function useCronjobTemplates() {
  const [templates, setTemplates] = useState<CronjobTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchTemplates()
      setTemplates(Array.isArray(data) ? data : [])
    } catch {
      setTemplates([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { templates, isLoading, refetch: load }
}

export function useCronjobHealth() {
  const [health, setHealth] = useState<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    cronjobsActive: number
    cronjobsPaused: number
  } | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchHealth()
      setHealth(data)
    } catch {
      setHealth(null)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { health, refetch: load }
}

export function useCreateCronjob() {
  const [isCreating, setIsCreating] = useState(false)

  const create = useCallback(async (input: CronjobCreateInput) => {
    setIsCreating(true)
    try {
      const created = await createCronjob(input)
      return created
    } finally {
      setIsCreating(false)
    }
  }, [])

  return { create, isCreating }
}
