/**
 * useEditContent - Hooks for Edit Content page: content, AI suggestions, comments, workflow, versions, activity, schedule.
 */

import { useState, useCallback, useEffect } from 'react'
import {
  fetchContentForEdit,
  updateContentForEdit,
  fetchAiSuggestions,
  generateAiSuggestions,
  updateAiSuggestionStatus,
  fetchComments,
  addComment,
  resolveComment,
  performWorkflowTransition,
  fetchVersions,
  createVersion,
  fetchActivityLog,
  fetchSchedule,
  saveSchedule,
} from '@/api/edit-content'
import type {
  ContentItem,
  AiSuggestion,
  Comment,
  ActivityLogEntry,
  ContentVersionFull,
  ScheduleRecord,
} from '@/types/content-dashboard'

export function useEditContent(contentId: string | null) {
  const [contentItem, setContentItem] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setContentItem(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const item = await fetchContentForEdit(contentId)
      setContentItem(item ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load content')
      setContentItem(null)
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
        const updated = await updateContentForEdit(contentId, payload)
        if (updated) setContentItem(updated)
        return updated
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update')
        return null
      }
    },
    [contentId]
  )

  return { contentItem, loading, error, refetch, update }
}

export function useEditAiSuggestions(contentId: string | null) {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const list = await fetchAiSuggestions(contentId)
      setSuggestions(Array.isArray(list) ? list : [])
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const generate = useCallback(async () => {
    if (!contentId) return []
    setGenerating(true)
    try {
      const list = await generateAiSuggestions(contentId)
      const newList = Array.isArray(list) ? list : []
      setSuggestions((prev) => [...newList, ...prev])
      return newList
    } catch {
      return []
    } finally {
      setGenerating(false)
    }
  }, [contentId])

  const acceptSuggestion = useCallback(
    async (suggestionId: string) => {
      const updated = await updateAiSuggestionStatus(suggestionId, 'accepted')
      if (updated) {
        setSuggestions((prev) =>
          prev.map((s) => (s.id === suggestionId ? updated : s))
        )
      }
      return updated
    },
    []
  )

  const rejectSuggestion = useCallback(
    async (suggestionId: string) => {
      const updated = await updateAiSuggestionStatus(suggestionId, 'rejected')
      if (updated) {
        setSuggestions((prev) =>
          prev.map((s) => (s.id === suggestionId ? updated : s))
        )
      }
      return updated
    },
    []
  )

  return {
    suggestions,
    loading,
    generating,
    refetch,
    generate,
    acceptSuggestion,
    rejectSuggestion,
  }
}

export function useEditComments(contentId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setComments([])
      return
    }
    setLoading(true)
    try {
      const list = await fetchComments(contentId)
      setComments(Array.isArray(list) ? list : [])
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const add = useCallback(
    async (text: string, parentId?: string | null) => {
      if (!contentId || !text?.trim()) return null
      const comment = await addComment(contentId, { text: text.trim(), parentId })
      if (comment) {
        setComments((prev) => [...prev, comment])
      }
      return comment
    },
    [contentId]
  )

  const resolve = useCallback(async (commentId: string) => {
    const updated = await resolveComment(commentId)
    if (updated) {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      )
    }
    return updated
  }, [])

  return { comments, loading, refetch, addComment: add, resolveComment: resolve }
}

export function useEditWorkflow(contentId: string | null, onSuccess?: (item: ContentItem) => void) {
  const [transitioning, setTransitioning] = useState(false)

  const transition = useCallback(
    async (toStatus: string) => {
      if (!contentId) return null
      setTransitioning(true)
      try {
        const updated = await performWorkflowTransition(contentId, { toStatus })
        if (updated) onSuccess?.(updated)
        return updated
      } catch {
        return null
      } finally {
        setTransitioning(false)
      }
    },
    [contentId, onSuccess]
  )

  return { transitioning, transition }
}

export function useEditVersions(contentId: string | null) {
  const [versions, setVersions] = useState<ContentVersionFull[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setVersions([])
      return
    }
    setLoading(true)
    try {
      const list = await fetchVersions(contentId)
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

  const create = useCallback(
    async (snapshot: string, authorId: string) => {
      if (!contentId) return null
      const v = await createVersion(contentId, { snapshot, authorId })
      if (v) {
        setVersions((prev) => [v, ...prev])
      }
      return v
    },
    [contentId]
  )

  return { versions, loading, refetch, createVersion: create }
}

export function useEditActivity(contentId: string | null) {
  const [activity, setActivity] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setActivity([])
      return
    }
    setLoading(true)
    try {
      const list = await fetchActivityLog(contentId)
      setActivity(Array.isArray(list) ? list : [])
    } catch {
      setActivity([])
    } finally {
      setLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { activity, loading, refetch }
}

export function useEditSchedule(contentId: string | null) {
  const [schedule, setSchedule] = useState<ScheduleRecord | null>(null)
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!contentId) {
      setSchedule(null)
      return
    }
    setLoading(true)
    try {
      const s = await fetchSchedule(contentId)
      setSchedule(s ?? null)
    } catch {
      setSchedule(null)
    } finally {
      setLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const save = useCallback(
    async (payload: { publishAt: string; platforms: string[]; timezone: string }) => {
      if (!contentId) return null
      const s = await saveSchedule(contentId, payload)
      if (s) setSchedule(s)
      return s
    },
    [contentId]
  )

  return { schedule, loading, refetch, saveSchedule: save }
}
