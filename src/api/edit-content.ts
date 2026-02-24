/**
 * Edit Content API - Content item, AI suggestions, comments, workflow, versions, activity, schedule.
 * Future-ready endpoints; uses mock data for prototyping.
 */

import type {
  ContentItem,
  AiSuggestion,
  Comment,
  ActivityLogEntry,
  ContentVersionFull,
  ScheduleRecord,
} from '@/types/content-dashboard'
import { apiGet, apiPost, apiPatch } from '@/lib/api'
import { fetchContentItem, updateContentItem } from '@/api/content-dashboard'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_AI_SUGGESTIONS: AiSuggestion[] = []
const MOCK_COMMENTS: Comment[] = []
const MOCK_ACTIVITY: ActivityLogEntry[] = []
const MOCK_SCHEDULES: ScheduleRecord[] = []

// --- API functions ---

export async function fetchContentForEdit(id: string): Promise<ContentItem | null> {
  const item = await fetchContentItem(id)
  return item ?? null
}

export async function updateContentForEdit(
  id: string,
  payload: Partial<ContentItem>
): Promise<ContentItem | null> {
  try {
    const updated = await updateContentItem(id, payload)
    return updated ?? null
  } catch {
    return null
  }
}

export async function fetchAiSuggestions(contentId: string): Promise<AiSuggestion[]> {
  if (USE_MOCK) {
    const list = MOCK_AI_SUGGESTIONS.filter((s) => s.contentId === contentId)
    return list ?? []
  }
  try {
    const res = await apiGet<AiSuggestion[] | { data: AiSuggestion[] }>(
      `/contents/${contentId}/ai-suggestions`
    )
    const data = res as { data?: AiSuggestion[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function generateAiSuggestions(contentId: string): Promise<AiSuggestion[]> {
  if (USE_MOCK) {
    const suggestions: AiSuggestion[] = [
      {
        id: `as-${Date.now()}-1`,
        contentId,
        snippet: 'Consider adding a stronger opening hook to capture reader attention.',
        rationale: 'Improves engagement in the first paragraph.',
        createdAt: new Date().toISOString(),
        status: 'pending',
      },
      {
        id: `as-${Date.now()}-2`,
        contentId,
        snippet: 'Add a call-to-action at the end to drive conversions.',
        rationale: 'CTAs improve conversion rates by 20-30%.',
        createdAt: new Date().toISOString(),
        status: 'pending',
      },
    ]
    MOCK_AI_SUGGESTIONS.push(...suggestions)
    return suggestions
  }
  try {
    const res = await apiPost<AiSuggestion[] | { data: AiSuggestion[] }>(
      `/contents/${contentId}/ai-suggestions`,
      {}
    )
    const data = res as { data?: AiSuggestion[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function updateAiSuggestionStatus(
  suggestionId: string,
  status: AiSuggestion['status']
): Promise<AiSuggestion | null> {
  if (USE_MOCK) {
    const idx = MOCK_AI_SUGGESTIONS.findIndex((s) => s.id === suggestionId)
    if (idx >= 0) {
      MOCK_AI_SUGGESTIONS[idx] = { ...MOCK_AI_SUGGESTIONS[idx], status }
      return MOCK_AI_SUGGESTIONS[idx]
    }
    return null
  }
  try {
    const res = await apiPatch<AiSuggestion | { data: AiSuggestion }>(
      `/contents/ai-suggestions/${suggestionId}`,
      { status }
    )
    return (res as { data?: AiSuggestion })?.data ?? (res as AiSuggestion) ?? null
  } catch {
    return null
  }
}

export async function fetchComments(contentId: string): Promise<Comment[]> {
  if (USE_MOCK) {
    const list = (MOCK_COMMENTS ?? []).filter((c) => c.contentId === contentId)
    return list
  }
  try {
    const res = await apiGet<Comment[] | { data: Comment[] }>(`/contents/${contentId}/comments`)
    const data = res as { data?: Comment[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function addComment(
  contentId: string,
  payload: { text: string; parentId?: string | null }
): Promise<Comment | null> {
  if (USE_MOCK) {
    const comment: Comment = {
      id: `c-${Date.now()}`,
      contentId,
      parentId: payload.parentId ?? null,
      authorId: 'u1',
      text: payload.text,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    MOCK_COMMENTS.push(comment)
    return comment
  }
  try {
    const res = await apiPost<Comment | { data: Comment }>(`/contents/${contentId}/comments`, payload)
    return (res as { data?: Comment })?.data ?? (res as Comment) ?? null
  } catch {
    return null
  }
}

export async function resolveComment(commentId: string): Promise<Comment | null> {
  if (USE_MOCK) {
    const idx = MOCK_COMMENTS.findIndex((c) => c.id === commentId)
    if (idx >= 0) {
      MOCK_COMMENTS[idx] = {
        ...MOCK_COMMENTS[idx],
        status: 'resolved',
        updatedAt: new Date().toISOString(),
      }
      return MOCK_COMMENTS[idx]
    }
    return null
  }
  try {
    const res = await apiPatch<Comment | { data: Comment }>(
      `/contents/comments/${commentId}`,
      { status: 'resolved' }
    )
    return (res as { data?: Comment })?.data ?? (res as Comment) ?? null
  } catch {
    return null
  }
}

export async function performWorkflowTransition(
  contentId: string,
  payload: { toStatus: string }
): Promise<ContentItem | null> {
  if (USE_MOCK) {
    return updateContentItem(contentId, { status: payload.toStatus as ContentItem['status'] })
  }
  try {
    const res = await apiPost<ContentItem | { data: ContentItem }>(
      `/contents/${contentId}/transitions`,
      payload
    )
    return (res as { data?: ContentItem })?.data ?? (res as ContentItem) ?? null
  } catch {
    return null
  }
}

export async function fetchVersions(contentId: string): Promise<ContentVersionFull[]> {
  const { fetchContentVersions } = await import('@/api/content-create')
  try {
    const list = await fetchContentVersions(contentId)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export async function createVersion(
  contentId: string,
  payload: { snapshot: string; authorId: string }
): Promise<ContentVersionFull | null> {
  const { createContentVersion } = await import('@/api/content-create')
  try {
    const v = await createContentVersion(contentId, {
      changes: payload.snapshot,
      authorId: payload.authorId,
    })
    return v
  } catch {
    return null
  }
}

export async function fetchActivityLog(contentId: string): Promise<ActivityLogEntry[]> {
  if (USE_MOCK) {
    const list = (MOCK_ACTIVITY ?? []).filter((a) => a.contentId === contentId)
    return list
  }
  try {
    const res = await apiGet<ActivityLogEntry[] | { data: ActivityLogEntry[] }>(
      `/contents/${contentId}/activity`
    )
    const data = res as { data?: ActivityLogEntry[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function fetchSchedule(contentId: string): Promise<ScheduleRecord | null> {
  if (USE_MOCK) {
    const s = (MOCK_SCHEDULES ?? []).find((x) => x.contentId === contentId)
    return s ?? null
  }
  try {
    const res = await apiGet<ScheduleRecord | { data: ScheduleRecord }>(
      `/contents/${contentId}/schedule`
    )
    return (res as { data?: ScheduleRecord })?.data ?? (res as ScheduleRecord) ?? null
  } catch {
    return null
  }
}

export async function saveSchedule(
  contentId: string,
  payload: { publishAt: string; platforms: string[]; timezone: string }
): Promise<ScheduleRecord | null> {
  if (USE_MOCK) {
    const existing = MOCK_SCHEDULES.findIndex((x) => x.contentId === contentId)
    const record: ScheduleRecord = {
      id: `s-${Date.now()}`,
      contentId,
      publishAt: payload.publishAt,
      platforms: payload.platforms ?? [],
      timezone: payload.timezone ?? 'UTC',
      status: 'scheduled',
    }
    if (existing >= 0) {
      MOCK_SCHEDULES[existing] = record
    } else {
      MOCK_SCHEDULES.push(record)
    }
    return record
  }
  try {
    const res = await apiPost<ScheduleRecord | { data: ScheduleRecord }>(
      `/contents/${contentId}/schedule`,
      payload
    )
    return (res as { data?: ScheduleRecord })?.data ?? (res as ScheduleRecord) ?? null
  } catch {
    return null
  }
}
