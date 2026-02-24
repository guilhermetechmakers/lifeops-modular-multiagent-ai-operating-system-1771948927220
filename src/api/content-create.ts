/**
 * Content Create API - Editor, versioning, scheduling, memory, artifacts, audit.
 * Uses mock data for prototyping; replace with real API when backend is ready.
 */

import type {
  ContentItem,
  ContentVersionFull,
  Schedule,
  MemoryScope,
  RunArtifact,
  AuditLog,
  PlatformPublishRecord,
} from '@/types/content-dashboard'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import {
  createContentItem,
  updateContentItem,
  fetchContentItem,
} from '@/api/content-dashboard'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_VERSIONS: ContentVersionFull[] = []
const MOCK_SCHEDULES: Schedule[] = []
const MOCK_MEMORY_SCOPES: MemoryScope[] = []
const MOCK_ARTIFACTS: RunArtifact[] = []
const MOCK_AUDIT_LOGS: AuditLog[] = []
const MOCK_PUBLISH_RECORDS: PlatformPublishRecord[] = []

// --- Content CRUD (delegates to content-dashboard) ---

export async function createContent(payload: Partial<ContentItem>): Promise<ContentItem> {
  return createContentItem({ ...payload, status: payload.status ?? 'Draft' })
}

export async function fetchContentById(id: string): Promise<ContentItem | null> {
  return fetchContentItem(id)
}

export async function updateContent(id: string, payload: Partial<ContentItem>): Promise<ContentItem> {
  return updateContentItem(id, payload)
}

export async function deleteContent(id: string): Promise<void> {
  if (!USE_MOCK) {
    await apiDelete(`/content/${id}`)
  }
}

export async function createContentVersion(
  contentId: string,
  payload: { changes: string; authorId: string; isDiff?: boolean }
): Promise<ContentVersionFull> {
  if (USE_MOCK) {
    const versions = MOCK_VERSIONS.filter((v) => v.contentItemId === contentId)
    const nextNum = versions.length > 0 ? Math.max(...versions.map((v) => v.versionNumber)) + 1 : 1
    const version: ContentVersionFull = {
      id: `v-${Date.now()}`,
      contentItemId: contentId,
      versionNumber: nextNum,
      changes: payload.changes,
      authorId: payload.authorId,
      createdAt: new Date().toISOString(),
      isDiff: payload.isDiff ?? true,
    }
    MOCK_VERSIONS.push(version)
    MOCK_AUDIT_LOGS.push({
      id: `al-${Date.now()}`,
      contentItemId: contentId,
      action: 'version_created',
      actorId: payload.authorId,
      timestamp: version.createdAt,
      details: { versionNumber: nextNum },
    })
    return version
  }
  const res = await apiPost<ContentVersionFull | { data: ContentVersionFull }>(
    `/content/${contentId}/versions`,
    payload
  )
  return (res as { data?: ContentVersionFull })?.data ?? (res as ContentVersionFull)
}

export async function fetchContentVersions(contentId: string): Promise<ContentVersionFull[]> {
  if (USE_MOCK) {
    return MOCK_VERSIONS.filter((v) => v.contentItemId === contentId)
  }
  try {
    const res = await apiGet<ContentVersionFull[] | { data: ContentVersionFull[] }>(
      `/content/${contentId}/versions`
    )
    const data = res as { data?: ContentVersionFull[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function triggerPublish(contentId: string, platforms?: string[]): Promise<PlatformPublishRecord[]> {
  if (USE_MOCK) {
    const records: PlatformPublishRecord[] = (platforms ?? ['blog']).map((p, i) => ({
      id: `pr-${Date.now()}-${i}`,
      contentItemId: contentId,
      platform: p,
      status: 'completed' as const,
      scheduledAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      logs: 'Published successfully',
    }))
    MOCK_PUBLISH_RECORDS.push(...records)
    return records
  }
  const res = await apiPost<PlatformPublishRecord[] | { data: PlatformPublishRecord[] }>(
    `/content/${contentId}/publish`,
    { platforms }
  )
  const data = res as { data?: PlatformPublishRecord[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchContentMemory(contentId: string): Promise<MemoryScope[]> {
  if (USE_MOCK) {
    return MOCK_MEMORY_SCOPES.filter((m) => m.contentItemId === contentId)
  }
  try {
    const res = await apiGet<MemoryScope[] | { data: MemoryScope[] }>(`/content/${contentId}/memory`)
    const data = res as { data?: MemoryScope[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function writeContentMemory(
  contentId: string,
  payload: Partial<MemoryScope>
): Promise<MemoryScope> {
  if (USE_MOCK) {
    const scope: MemoryScope = {
      id: `ms-${Date.now()}`,
      contentItemId: contentId,
      scopeName: payload.scopeName ?? 'default',
      dataBlob: payload.dataBlob ?? {},
      ttlSeconds: payload.ttlSeconds ?? 86400,
      accessControls: payload.accessControls ?? {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    }
    MOCK_MEMORY_SCOPES.push(scope)
    return scope
  }
  const res = await apiPost<MemoryScope | { data: MemoryScope }>(`/content/${contentId}/memory`, payload)
  return (res as { data?: MemoryScope })?.data ?? (res as MemoryScope)
}

export async function fetchContentArtifacts(contentId: string): Promise<RunArtifact[]> {
  if (USE_MOCK) {
    return MOCK_ARTIFACTS.filter((a) => a.contentItemId === contentId)
  }
  try {
    const res = await apiGet<RunArtifact[] | { data: RunArtifact[] }>(`/content/${contentId}/artifacts`)
    const data = res as { data?: RunArtifact[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function fetchContentAudit(contentId: string): Promise<AuditLog[]> {
  if (USE_MOCK) {
    return MOCK_AUDIT_LOGS.filter((a) => a.contentItemId === contentId)
  }
  try {
    const res = await apiGet<AuditLog[] | { data: AuditLog[] }>(`/content/${contentId}/audit`)
    const data = res as { data?: AuditLog[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function createSchedule(payload: Partial<Schedule>): Promise<Schedule> {
  if (USE_MOCK) {
    const schedule: Schedule = {
      id: `s-${Date.now()}`,
      name: payload.name ?? 'Schedule',
      enabled: payload.enabled ?? true,
      cronExpression: payload.cronExpression ?? '0 9 * * 1',
      timezone: payload.timezone ?? 'UTC',
      targetContentId: payload.targetContentId ?? '',
      inputPayload: payload.inputPayload ?? {},
      permissions: payload.permissions ?? 'approval-required',
      constraints: payload.constraints ?? {},
      safetyRails: payload.safetyRails ?? [],
      retryPolicy: payload.retryPolicy ?? { backoffMs: 1000, maxRetries: 3 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    }
    MOCK_SCHEDULES.push(schedule)
    return schedule
  }
  const res = await apiPost<Schedule | { data: Schedule }>('/schedules', payload)
  return (res as { data?: Schedule })?.data ?? (res as Schedule)
}

export async function fetchScheduleRuns(scheduleId: string): Promise<PlatformPublishRecord[]> {
  if (USE_MOCK) {
    return []
  }
  try {
    const res = await apiGet<PlatformPublishRecord[] | { data: PlatformPublishRecord[] }>(
      `/schedules/${scheduleId}/run`
    )
    const data = res as { data?: PlatformPublishRecord[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  } catch {
    return []
  }
}
