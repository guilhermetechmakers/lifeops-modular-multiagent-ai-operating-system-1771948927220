/**
 * Content Dashboard API layer.
 * Uses mock data for prototyping; replace with real API when backend is ready.
 */

import type {
  ContentItem,
  ContentItemsResponse,
  ContentStatus,
  PipelineRun,
  CronJob,
  Approval,
  MemoryEntry,
  VectorMemoryBlock,
  ContentTemplate,
  GlobalSearchFilters,
} from '@/types/content-dashboard'
import { apiGet, apiPost, apiPut, apiPatch } from '@/lib/api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'ci1',
    title: '10 Tips for Remote Work',
    summary: 'Productivity and wellness tips for distributed teams',
    status: 'Idea',
    authorId: 'u1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: [],
    tags: ['remote', 'productivity'],
  },
  {
    id: 'ci2',
    title: 'AI in Content Creation',
    summary: 'How AI assists content teams',
    status: 'Research',
    authorId: 'u1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: [],
    tags: ['ai', 'content'],
  },
  {
    id: 'ci3',
    title: 'Q1 Product Launch Blog',
    summary: 'Announcing our new features',
    status: 'Draft',
    authorId: 'u1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: ['p1'],
    tags: ['product', 'launch'],
  },
  {
    id: 'ci4',
    title: 'Weekly Newsletter #42',
    summary: 'Curated industry updates',
    status: 'Edit',
    authorId: 'u1',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: ['p2'],
    tags: ['newsletter'],
  },
  {
    id: 'ci5',
    title: 'Social Post: Feature Highlight',
    summary: 'Twitter/LinkedIn post for new feature',
    status: 'Review',
    authorId: 'u1',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: ['p2', 'p3'],
    tags: ['social'],
  },
  {
    id: 'ci6',
    title: 'Blog: Getting Started Guide',
    summary: 'Step-by-step onboarding',
    status: 'Scheduled',
    authorId: 'u1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    publishAt: new Date(Date.now() + 86400000).toISOString(),
    platforms: ['p1'],
    tags: ['docs', 'onboarding'],
  },
  {
    id: 'ci7',
    title: 'Case Study: Enterprise Customer',
    summary: 'How Company X scaled with LifeOps',
    status: 'Published',
    authorId: 'u1',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    publishAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    platforms: ['p1'],
    tags: ['case-study'],
  },
]

const MOCK_TEMPLATES: ContentTemplate[] = [
  { id: 't1', name: 'Blog Post', description: 'Standard blog structure', structure: 'intro, body, conclusion', version: 1, createdAt: new Date().toISOString() },
  { id: 't2', name: 'Social Post', description: 'Short-form social', structure: 'hook, value, cta', version: 1, createdAt: new Date().toISOString() },
  { id: 't3', name: 'Newsletter', description: 'Email newsletter', structure: 'header, sections, footer', version: 1, createdAt: new Date().toISOString() },
]

const MOCK_MEMORY: MemoryEntry[] = [
  { id: 'm1', agentId: 'a1', scope: 'content', key: 'last_topic', value: 'AI', ttl: 86400, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const MOCK_APPROVALS: Approval[] = [
  { id: 'ap1', runId: 'r1', contentItemId: 'ci5', requestedBy: 'Content Agent', status: 'pending', createdAt: new Date().toISOString() },
]

const MOCK_CRONJOBS: CronJob[] = [
  { id: 'c1', name: 'Weekly Content Ideas', enabled: true, scheduleCron: '0 9 * * 1', timezone: 'UTC', triggerType: 'time', target: 'content-ideas', inputPayload: '{}', permissions: 'read,write', constraints: {}, safetyRails: {}, retryPolicy: { maxRetries: 3, backoffMs: 1000 }, outputs: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), nextRun: new Date(Date.now() + 7200000).toISOString(), lastRun: new Date(Date.now() - 86400000).toISOString() },
]

// --- API functions ---

export async function fetchContentItems(params?: {
  filters?: GlobalSearchFilters
  page?: number
  limit?: number
  search?: string
}): Promise<ContentItemsResponse> {
  if (USE_MOCK) {
    let items = [...MOCK_CONTENT_ITEMS]
    const search = params?.search?.toLowerCase()
    if (search) {
      items = items.filter((i) => i.title.toLowerCase().includes(search) || (i.summary ?? '').toLowerCase().includes(search))
    }
    const status = params?.filters?.status
    if (status) items = items.filter((i) => i.status === status)
    const total = items.length
    const page = params?.page ?? 1
    const limit = params?.limit ?? 50
    const start = (page - 1) * limit
    items = items.slice(start, start + limit)
    return { items, total, page, limit }
  }
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  if (params?.search) q.set('search', params.search)
  if (params?.filters?.status) q.set('status', params.filters.status)
  const res = await apiGet<ContentItemsResponse | { data: ContentItem[]; total?: number }>(`/content-items?${q}`)
  const data = res as { data?: ContentItem[]; items?: ContentItem[]; total?: number }
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : []
  return { items: list, total: data?.total ?? list.length }
}

export async function fetchContentItem(id: string): Promise<ContentItem | null> {
  if (USE_MOCK) return MOCK_CONTENT_ITEMS.find((i) => i.id === id) ?? null
  try {
    const res = await apiGet<ContentItem | { data: ContentItem }>(`/content-items/${id}`)
    return (res as { data?: ContentItem })?.data ?? (res as ContentItem) ?? null
  } catch {
    return null
  }
}

export async function createContentItem(payload: Partial<ContentItem>): Promise<ContentItem> {
  if (USE_MOCK) {
    const item: ContentItem = {
      id: `ci-${Date.now()}`,
      title: payload.title ?? 'Untitled',
      status: (payload.status as ContentStatus) ?? 'Idea',
      authorId: payload.authorId ?? 'u1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      platforms: payload.platforms ?? [],
      ...payload,
    }
    MOCK_CONTENT_ITEMS.push(item)
    return item
  }
  const res = await apiPost<ContentItem | { data: ContentItem }>('/content-items', payload)
  return (res as { data?: ContentItem })?.data ?? (res as ContentItem)
}

export async function updateContentItem(id: string, payload: Partial<ContentItem>): Promise<ContentItem> {
  if (USE_MOCK) {
    const idx = MOCK_CONTENT_ITEMS.findIndex((i) => i.id === id)
    if (idx >= 0) {
      MOCK_CONTENT_ITEMS[idx] = { ...MOCK_CONTENT_ITEMS[idx], ...payload, updatedAt: new Date().toISOString() }
      return MOCK_CONTENT_ITEMS[idx]
    }
    throw new Error('Not found')
  }
  const res = await apiPut<ContentItem | { data: ContentItem }>(`/content-items/${id}`, payload)
  return (res as { data?: ContentItem })?.data ?? (res as ContentItem)
}

export async function fetchPipelineRuns(contentItemId?: string): Promise<PipelineRun[]> {
  if (USE_MOCK) return []
  const q = contentItemId ? `?contentItemId=${contentItemId}` : ''
  const res = await apiGet<PipelineRun[] | { data: PipelineRun[] }>(`/pipeline-runs${q}`)
  const data = res as { data?: PipelineRun[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchTemplates(): Promise<ContentTemplate[]> {
  if (USE_MOCK) return MOCK_TEMPLATES
  const res = await apiGet<ContentTemplate[] | { data: ContentTemplate[] }>('/content-templates')
  const data = res as { data?: ContentTemplate[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchMemoryEntries(scope: string, agentId?: string): Promise<MemoryEntry[]> {
  if (USE_MOCK) return MOCK_MEMORY.filter((m) => m.scope === scope)
  const q = new URLSearchParams({ scope })
  if (agentId) q.set('agentId', agentId)
  const res = await apiGet<MemoryEntry[] | { data: MemoryEntry[] }>(`/memory/scope?${q}`)
  const data = res as { data?: MemoryEntry[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function createMemoryEntry(payload: Partial<MemoryEntry>): Promise<MemoryEntry> {
  if (USE_MOCK) {
    const entry: MemoryEntry = {
      id: `m-${Date.now()}`,
      agentId: payload.agentId ?? 'a1',
      scope: payload.scope ?? 'content',
      key: payload.key ?? 'key',
      value: payload.value,
      ttl: payload.ttl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    }
    MOCK_MEMORY.push(entry)
    return entry
  }
  const res = await apiPost<MemoryEntry | { data: MemoryEntry }>('/memory/scope', payload)
  return (res as { data?: MemoryEntry })?.data ?? (res as MemoryEntry)
}

export async function fetchVectorMemory(scope: string): Promise<VectorMemoryBlock[]> {
  if (USE_MOCK) return []
  const res = await apiGet<VectorMemoryBlock[] | { data: VectorMemoryBlock[] }>(`/vector-memory?scope=${scope}`)
  const data = res as { data?: VectorMemoryBlock[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchContentApprovals(): Promise<Approval[]> {
  if (USE_MOCK) return MOCK_APPROVALS.filter((a) => a.status === 'pending')
  const res = await apiGet<Approval[] | { data: Approval[] }>('/approvals')
  const data = res as { data?: Approval[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function approveContentApproval(id: string): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (a) a.status = 'approved'
    return
  }
  await apiPost(`/approvals/${id}/approve`)
}

export async function rejectContentApproval(id: string, reason?: string): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (a) a.status = 'rejected'
    return
  }
  await apiPost(`/approvals/${id}/reject`, { reason })
}

export async function fetchContentCronjobs(): Promise<CronJob[]> {
  if (USE_MOCK) return MOCK_CRONJOBS
  const res = await apiGet<CronJob[] | { data: CronJob[] }>('/cronjobs')
  const data = res as { data?: CronJob[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function pauseContentCronjob(id: string): Promise<void> {
  if (USE_MOCK) {
    const c = MOCK_CRONJOBS.find((x) => x.id === id)
    if (c) c.enabled = false
    return
  }
  await apiPatch(`/cronjobs/${id}`, { enabled: false })
}

export async function enableContentCronjob(id: string): Promise<void> {
  if (USE_MOCK) {
    const c = MOCK_CRONJOBS.find((x) => x.id === id)
    if (c) c.enabled = true
    return
  }
  await apiPatch(`/cronjobs/${id}`, { enabled: true })
}

export interface GlobalSearchResult {
  id: string
  type: 'content' | 'run' | 'cronjob' | 'project' | 'transaction'
  title: string
  snippet?: string
  module: string
  href: string
}

export async function globalContentSearch(query: string, filters?: Record<string, string>): Promise<GlobalSearchResult[]> {
  if (USE_MOCK) {
    const q = query.toLowerCase()
    const results: GlobalSearchResult[] = []
    MOCK_CONTENT_ITEMS.forEach((i) => {
      if (!q || i.title.toLowerCase().includes(q) || (i.summary ?? '').toLowerCase().includes(q)) {
        results.push({ id: i.id, type: 'content', title: i.title, snippet: i.summary, module: 'Content', href: `/dashboard/content?item=${i.id}` })
      }
    })
    MOCK_CRONJOBS.forEach((c) => {
      if (!q || c.name.toLowerCase().includes(q)) {
        results.push({ id: c.id, type: 'cronjob', title: c.name, module: 'Cronjobs', href: `/dashboard/cronjobs/${c.id}` })
      }
    })
    return results
  }
  const params = new URLSearchParams({ q: query, ...filters })
  const res = await apiGet<GlobalSearchResult[] | { results: GlobalSearchResult[] }>(`/search?${params}`)
  const data = res as { results?: GlobalSearchResult[] }
  return Array.isArray(data?.results) ? data.results : Array.isArray(res) ? res : []
}
