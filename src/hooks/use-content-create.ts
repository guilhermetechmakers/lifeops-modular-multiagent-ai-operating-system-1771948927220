/**
 * useContentCreate - Hooks for Create Content editor, versioning, memory, artifacts, audit.
 */

import { useState, useCallback, useEffect } from 'react'
import {
  updateContent,
  fetchContentById,
  createContentVersion,
  fetchContentVersions,
  triggerPublish,
  fetchContentMemory,
  writeContentMemory,
  fetchContentArtifacts,
  fetchContentAudit,
} from '@/api/content-create'
import type {
  ContentItem,
  ContentVersionFull,
  MemoryScope,
  RunArtifact,
  AuditLog,
  PlatformPublishRecord,
} from '@/types/content-dashboard'

export function useContentCreate(contentId: string | null) {
  const [content, setContent] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setContent(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const item = await fetchContentById(contentId)
      setContent(item ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load content')
      setContent(null)
    } finally {
      setLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const update = useCallback(
    async (payload: Partial<ContentItem>) => {
      if (!contentId) return null
      try {
        const updated = await updateContent(contentId, payload)
        setContent(updated)
        return updated
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update')
        return null
      }
    },
    [contentId]
  )

  return { content, loading, error, refetch, update }
}

export function useContentVersions(contentId: string | null) {
  const [versions, setVersions] = useState<ContentVersionFull[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setVersions([])
      return
    }
    setLoading(true)
    try {
      const list = await fetchContentVersions(contentId)
      setVersions(Array.isArray(list) ? list : [])
    } catch {
      setVersions([])
    } finally {
      setLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const createVersion = useCallback(
    async (changes: string, authorId: string, isDiff?: boolean) => {
      if (!contentId) return null
      try {
        const v = await createContentVersion(contentId, { changes, authorId, isDiff })
        setVersions((prev) => [...prev, v].sort((a, b) => b.versionNumber - a.versionNumber))
        return v
      } catch {
        return null
      }
    },
    [contentId]
  )

  return { versions, loading, refetch, createVersion }
}

export function useContentMemory(contentId: string | null) {
  const [entries, setEntries] = useState<MemoryScope[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setEntries([])
      return
    }
    setLoading(true)
    try {
      const list = await fetchContentMemory(contentId)
      setEntries(Array.isArray(list) ? list : [])
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const write = useCallback(
    async (payload: Partial<MemoryScope>) => {
      if (!contentId) return null
      try {
        const scope = await writeContentMemory(contentId, payload)
        setEntries((prev) => [...prev, scope])
        return scope
      } catch {
        return null
      }
    },
    [contentId]
  )

  return { entries, loading, refetch, write }
}

export function useContentArtifacts(contentId: string | null) {
  const [artifacts, setArtifacts] = useState<RunArtifact[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setArtifacts([])
      return
    }
    setLoading(true)
    try {
      const list = await fetchContentArtifacts(contentId)
      setArtifacts(Array.isArray(list) ? list : [])
    } catch {
      setArtifacts([])
    } finally {
      setLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { artifacts, loading, refetch }
}

export function useContentAudit(contentId: string | null) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setLogs([])
      return
    }
    setLoading(true)
    try {
      const list = await fetchContentAudit(contentId)
      setLogs(Array.isArray(list) ? list : [])
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { logs, loading, refetch }
}

export function useContentPublish(contentId: string | null) {
  const [publishing, setPublishing] = useState(false)

  const publish = useCallback(
    async (platforms?: string[]): Promise<PlatformPublishRecord[]> => {
      if (!contentId) return []
      setPublishing(true)
      try {
        const records = await triggerPublish(contentId, platforms)
        return records ?? []
      } catch {
        return []
      } finally {
        setPublishing(false)
      }
    },
    [contentId]
  )

  return { publishing, publish }
}
