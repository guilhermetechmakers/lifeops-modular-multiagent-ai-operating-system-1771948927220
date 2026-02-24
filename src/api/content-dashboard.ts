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
  ContentVersion,
  ContentPreview,
  BulkActionRequest,
  BulkActionResponse,
  ContentListFilters,
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
  listFilters?: ContentListFilters
}): Promise<ContentItemsResponse> {
  if (USE_MOCK) {
    let items = [...MOCK_CONTENT_ITEMS]
    const search = (params?.search ?? params?.listFilters?.search)?.toLowerCase()
    if (search) {
      items = items.filter((i) => i.title.toLowerCase().includes(search) || (i.summary ?? '').toLowerCase().includes(search))
    }
    const status = params?.filters?.status ?? params?.listFilters?.status
    if (status) {
      items = items.filter((i) => {
        if (['draft', 'in_review', 'published', 'archived'].includes(String(status))) {
          return i.contentStatus === status || i.status === status
        }
        return i.status === status
      })
    }
    const typeFilter = params?.listFilters?.type
    if (typeFilter) items = items.filter((i) => i.type === typeFilter)
    const tags = params?.listFilters?.tags
    if (tags?.length) {
      items = items.filter((i) => (i.tags ?? []).some((t) => tags.includes(t)))
    }
    const authorId = params?.filters?.authorId ?? params?.listFilters?.authorId
    if (authorId) items = items.filter((i) => i.authorId === authorId)
    const dateFrom = params?.listFilters?.dateFrom
    if (dateFrom) items = items.filter((i) => i.createdAt >= dateFrom)
    const dateTo = params?.listFilters?.dateTo
    if (dateTo) items = items.filter((i) => i.createdAt <= dateTo)
    const sort = params?.listFilters?.sort ?? 'updatedAt'
    const sortOrder = params?.listFilters?.sortOrder ?? 'desc'
    items = [...items].sort((a, b) => {
      const aVal = sort === 'title' ? a.title : sort === 'createdAt' ? a.createdAt : sort === 'publishedAt' ? (a.publishAt ?? '') : a.updatedAt
      const bVal = sort === 'title' ? b.title : sort === 'createdAt' ? b.createdAt : sort === 'publishedAt' ? (b.publishAt ?? '') : b.updatedAt
      const cmp = aVal.localeCompare(bVal)
      return sortOrder === 'asc' ? cmp : -cmp
    })
    const total = items.length
    const page = params?.page ?? params?.listFilters?.page ?? 1
    const limit = params?.limit ?? params?.listFilters?.pageSize ?? 50
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

export async function fetchContentPreview(id: string): Promise<ContentPreview | null> {
  if (USE_MOCK) {
    const item = MOCK_CONTENT_ITEMS.find((i) => i.id === id)
    if (!item) return null
    return {
      id: item.id,
      title: item.title,
      excerpt: item.summary ?? '',
      bodyPreview: item.summary?.slice(0, 300),
      version: item.version ?? 1,
      author: item.authorId,
      createdAt: item.createdAt,
    }
  }
  try {
    const res = await apiGet<ContentPreview | { data: ContentPreview }>(`/content/${id}/preview`)
    return (res as { data?: ContentPreview })?.data ?? (res as ContentPreview) ?? null
  } catch {
    return null
  }
}

export async function fetchContentVersions(id: string): Promise<ContentVersion[]> {
  if (USE_MOCK) {
    const item = MOCK_CONTENT_ITEMS.find((i) => i.id === id)
    if (!item) return []
    return [
      {
        id: 'v1',
        contentId: item.id,
        versionNumber: item.version ?? 1,
        snapshot: JSON.stringify({ title: item.title, summary: item.summary }),
        changedBy: item.authorId,
        changedAt: item.updatedAt,
      },
    ]
  }
  try {
    const res = await apiGet<ContentVersion[] | { data: ContentVersion[] }>(`/content/${id}/versions`)
    const data = res as { data?: ContentVersion[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function bulkContentAction(payload: BulkActionRequest): Promise<BulkActionResponse> {
  if (USE_MOCK) {
    const results = (payload.itemIds ?? []).map((id) => ({
      id,
      status: 'success' as const,
      message: `${payload.action} completed`,
    }))
    if (payload.action === 'archive') {
      payload.itemIds.forEach((id) => {
        const idx = MOCK_CONTENT_ITEMS.findIndex((i) => i.id === id)
        if (idx >= 0) MOCK_CONTENT_ITEMS[idx] = { ...MOCK_CONTENT_ITEMS[idx], contentStatus: 'archived' }
      })
    }
    if (payload.action === 'delete') {
      payload.itemIds.forEach((id) => {
        const idx = MOCK_CONTENT_ITEMS.findIndex((i) => i.id === id)
        if (idx >= 0) MOCK_CONTENT_ITEMS.splice(idx, 1)
      })
    }
    return { success: true, results }
  }
  const res = await apiPost<BulkActionResponse>('/content/bulk-action', payload)
  return res ?? { success: false, results: [] }
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

/** Content List / Library API */

export interface ContentListResponse {
  data: ContentItem[]
  totalCount: number
}

export async function fetchContentList(filters?: ContentListFilters): Promise<ContentListResponse> {
  if (USE_MOCK) {
    let items = [...MOCK_CONTENT_ITEMS]
    const search = (filters?.search ?? '').toLowerCase()
    if (search) {
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(search) ||
          (i.summary ?? '').toLowerCase().includes(search)
      )
    }
    const status = filters?.status
    if (status && status !== 'all') {
      items = items.filter((i) => i.status === status)
    }
    const type = filters?.type
    if (type) {
      items = items.filter((i) => (i as { type?: string }).type === type)
    }
    const authorId = filters?.authorId
    if (authorId) items = items.filter((i) => i.authorId === authorId)
    const tags = filters?.tags ?? []
    if (tags.length > 0) {
      items = items.filter((i) => (i.tags ?? []).some((t) => tags.includes(t)))
    }
    const dateFrom = filters?.dateFrom
    if (dateFrom) items = items.filter((i) => i.createdAt >= dateFrom)
    const dateTo = filters?.dateTo
    if (dateTo) items = items.filter((i) => i.createdAt <= dateTo)
    const sort = filters?.sort ?? 'updatedAt'
    const sortOrder = filters?.sortOrder ?? 'desc'
    items.sort((a, b) => {
      const aVal = a[sort] ?? ''
      const bVal = b[sort] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortOrder === 'asc' ? cmp : -cmp
    })
    const totalCount = items.length
    const page = filters?.page ?? 1
    const pageSize = Math.min(Math.max(filters?.pageSize ?? 20, 10), 100)
    const start = (page - 1) * pageSize
    items = items.slice(start, start + pageSize)
    return { data: items, totalCount }
  }
  const q = new URLSearchParams()
  if (filters?.search) q.set('q', filters.search)
  if (filters?.status) q.set('status', String(filters.status))
  if (filters?.type) q.set('type', String(filters.type))
  if (filters?.authorId) q.set('authorId', filters.authorId)
  if (filters?.dateFrom) q.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) q.set('dateTo', filters.dateTo)
  if (filters?.page) q.set('page', String(filters.page))
  if (filters?.pageSize) q.set('pageSize', String(filters.pageSize))
  if (filters?.sort) q.set('sort', filters.sort)
  if (filters?.sortOrder) q.set('sortOrder', filters.sortOrder)
  const res = await apiGet<ContentListResponse | { data: ContentItem[]; totalCount?: number }>(`/content?${q}`)
  const data = res as { data?: ContentItem[]; totalCount?: number }
  const list = Array.isArray(data?.data) ? data.data : []
  return { data: list, totalCount: data?.totalCount ?? list.length }
}

export async function bulkActionContent(payload: BulkActionRequest): Promise<BulkActionResponse> {
  if (USE_MOCK) {
    const results = (payload.itemIds ?? []).map((id) => ({
      id,
      status: 'success' as const,
      message: 'OK',
    }))
    if (payload.action === 'archive') {
      payload.itemIds.forEach((id) => {
        const idx = MOCK_CONTENT_ITEMS.findIndex((i) => i.id === id)
        if (idx >= 0) MOCK_CONTENT_ITEMS[idx] = { ...MOCK_CONTENT_ITEMS[idx], contentStatus: 'archived' }
      })
    }
    if (payload.action === 'delete') {
      payload.itemIds.forEach((id) => {
        const idx = MOCK_CONTENT_ITEMS.findIndex((i) => i.id === id)
        if (idx >= 0) MOCK_CONTENT_ITEMS.splice(idx, 1)
      })
    }
    return { success: true, results }
  }
  const res = await apiPost<BulkActionResponse>('/content/bulk-action', payload)
  return res
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
