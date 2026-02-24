/**
 * Content Dashboard - Data models and API contracts.
 * All types align with LifeOps Content Pipeline specifications.
 */

export type ContentStatus =
  | 'Idea'
  | 'Research'
  | 'Draft'
  | 'Edit'
  | 'Review'
  | 'Scheduled'
  | 'Published'

export interface ContentItem {
  id: string
  title: string
  summary?: string
  status: ContentStatus
  templatesId?: string
  authorId: string
  createdAt: string
  updatedAt: string
  publishAt?: string
  platforms: string[]
  memoryScope?: string
  version?: number
  tags?: string[]
}

export type PipelineRunStatus = 'pending' | 'running' | 'success' | 'failed'

export interface PipelineRun {
  id: string
  contentItemId: string
  stage: string
  startedAt: string
  endedAt?: string
  status: PipelineRunStatus
  logs?: string[]
  artifacts?: string[]
  agentTraceId?: string
}

export interface IdeaMemory {
  id: string
  agentId: string
  scope: string
  key: string
  value: unknown
  ttl?: number
  createdAt: string
  updatedAt: string
}

export interface VectorMemory {
  id: string
  contentItemId?: string
  agentId: string
  embeddings: number[]
  ttl?: number
  permissions: string[]
  createdAt: string
}

export interface CronJob {
  id: string
  name: string
  enabled: boolean
  scheduleCron?: string
  timezone: string
  triggerType: 'time' | 'event' | 'conditional'
  target: string
  inputPayload: string
  permissions: string
  constraints: Record<string, unknown>
  safetyRails: Record<string, unknown>
  retryPolicy: { maxRetries: number; backoffMs: number; deadLetter?: string }
  outputs: Record<string, unknown>
  createdAt: string
  updatedAt: string
  nextRun?: string
  lastRun?: string
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Approval {
  id: string
  runId: string
  contentItemId: string
  requestedBy: string
  status: ApprovalStatus
  reason?: string
  createdAt: string
  reviewedAt?: string
  reviewerId?: string
}

export interface Platform {
  id: string
  name: string
  type: 'CMS' | 'Social' | 'Newsletter'
  config?: Record<string, unknown>
}

export interface ContentTemplate {
  id: string
  name: string
  description?: string
  structure?: string
  type?: 'brief' | 'outline' | 'structure'
  content?: string
  version?: number
  createdAt: string
}

export interface PublishStatus {
  platformId: string
  status: 'pending' | 'in-progress' | 'success' | 'failed'
  publishedAt?: string
}

export interface GlobalSearchFilters {
  status?: ContentStatus
  authorId?: string
  templateId?: string
  platformIds?: string[]
  dateFrom?: string
  dateTo?: string
  tags?: string[]
}

export interface ContentItemsResponse {
  items: ContentItem[]
  total: number
  page?: number
  limit?: number
}

export interface MemoryEntry {
  id: string
  agentId: string
  scope: string
  key: string
  value: unknown
  ttl?: number
  createdAt: string
  updatedAt: string
}

export interface VectorMemoryBlock {
  id: string
  contentItemId?: string
  agentId: string
  embeddings: number[]
  ttl?: number
  permissions: string[]
  createdAt: string
}
