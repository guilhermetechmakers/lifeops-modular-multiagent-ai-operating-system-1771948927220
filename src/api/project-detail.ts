/**
 * Project Detail API layer.
 * Uses mock data for prototyping; replace with real API calls when backend is ready.
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import type {
  ProjectDetail,
  RoadmapDetail,
  RoadmapMilestone,
  BacklogTicket,
  AgentJobDetail,
  RunHistoryDetail,
  ArtifactDetail,
  AutomationTemplateDetail,
  AuditLogEntry,
} from '@/types/project-detail'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_PROJECT: ProjectDetail = {
  id: 'p1',
  name: 'LifeOps Platform',
  description: 'Modular multi-agent AI operating system',
  status: 'active',
  healthScore: 87,
  integrationsStatus: { github: 'connected', gitlab: 'disconnected' },
  lastUpdated: new Date(Date.now() - 120000).toISOString(),
}

const MOCK_MILESTONES: RoadmapMilestone[] = [
  { id: 'm1', title: 'Q1 Launch', dueDate: '2025-03-31', status: 'in-progress', owner: 'AI Agent', notes: 'Core features' },
  { id: 'm2', title: 'Q2 Features', dueDate: '2025-06-30', status: 'pending', owner: 'Team' },
]

const MOCK_TICKETS: BacklogTicket[] = [
  { id: 't1', projectId: 'p1', title: 'Implement Projects Dashboard', status: 'in-progress', priority: 'high', assignee: 'AI Agent', tags: ['core'], sprint: 'S1', createdAt: new Date().toISOString() },
  { id: 't2', projectId: 'p1', title: 'Add Kanban drag-and-drop', status: 'todo', priority: 'medium', tags: ['ux'], sprint: 'S1' },
  { id: 't3', projectId: 'p1', title: 'Integrate GitHub PRs', status: 'backlog', priority: 'high', tags: ['integration'] },
]

const MOCK_AGENT_JOBS: AgentJobDetail[] = [
  { id: 'aj1', projectId: 'p1', agentName: 'Triage Agent', action: 'ticket_triage', status: 'completed', startedAt: new Date(Date.now() - 3600000).toISOString(), endedAt: new Date(Date.now() - 3500000).toISOString(), traceId: 'tr-001' },
  { id: 'aj2', projectId: 'p1', agentName: 'Release Agent', action: 'release_draft', status: 'pending', needsApproval: true, initiatedAt: new Date().toISOString(), traceId: 'tr-002' },
]

const MOCK_RUNS: RunHistoryDetail[] = [
  { id: 'rh1', projectId: 'p1', runDate: new Date(Date.now() - 86400000).toISOString(), status: 'success', durationMs: 60000, resultSummary: 'Deploy completed', traceId: 'tr-001' },
  { id: 'rh2', projectId: 'p1', runDate: new Date(Date.now() - 172800000).toISOString(), status: 'failure', durationMs: 12000, resultSummary: 'Build failed', traceId: 'tr-002' },
]

const MOCK_ARTIFACTS: ArtifactDetail[] = [
  { id: 'a1', projectId: 'p1', type: 'artifact', name: 'build-output.zip', sizeBytes: 1024000, retentionPolicy: '30d', createdAt: new Date().toISOString() },
  { id: 'a2', projectId: 'p1', type: 'log', name: 'deploy.log', sizeBytes: 4096, retentionPolicy: '60d', createdAt: new Date().toISOString() },
]

const MOCK_TEMPLATES: AutomationTemplateDetail[] = [
  { id: 'tm1', type: 'release', config: {}, permissions: ['edit'], constraints: {} },
  { id: 'tm2', type: 'pr_triage', config: {}, permissions: ['view'], constraints: {} },
]

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'al1', action: 'milestone_updated', userName: 'System', timestamp: new Date().toISOString(), traceId: 'tr-001' },
]

// --- API functions ---

export async function getProjectDetail(projectId: string): Promise<ProjectDetail | null> {
  if (USE_MOCK) return { ...MOCK_PROJECT, id: projectId }
  try {
    const data = await apiGet<ProjectDetail | { data: ProjectDetail }>(`/projects/${projectId}`)
    return (data as { data?: ProjectDetail })?.data ?? (data as ProjectDetail) ?? null
  } catch {
    return null
  }
}

export async function getRoadmap(projectId: string): Promise<RoadmapDetail | null> {
  if (USE_MOCK) {
    return { id: 'rm1', projectId, milestones: MOCK_MILESTONES, status: 'active' }
  }
  try {
    const data = await apiGet<RoadmapDetail | { data: RoadmapDetail }>(`/projects/${projectId}/roadmap`)
    return (data as { data?: RoadmapDetail })?.data ?? (data as RoadmapDetail) ?? null
  } catch {
    return null
  }
}

export async function createMilestone(projectId: string, payload: Partial<RoadmapMilestone>): Promise<RoadmapMilestone> {
  if (USE_MOCK) {
    return { id: `m${Date.now()}`, title: payload.title ?? 'New Milestone', status: 'pending', ...payload }
  }
  const data = await apiPost<RoadmapMilestone>(`/projects/${projectId}/roadmap/milestones`, payload)
  return data
}

export async function updateMilestone(projectId: string, milestoneId: string, payload: Partial<RoadmapMilestone>): Promise<RoadmapMilestone> {
  if (USE_MOCK) return { ...MOCK_MILESTONES[0], ...payload, id: milestoneId }
  return apiPatch<RoadmapMilestone>(`/projects/${projectId}/roadmap/milestones/${milestoneId}`, payload)
}

export async function deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
  if (USE_MOCK) return
  await apiDelete(`/projects/${projectId}/roadmap/milestones/${milestoneId}`)
}

export async function getBacklog(projectId: string): Promise<BacklogTicket[]> {
  if (USE_MOCK) return MOCK_TICKETS.filter((t) => t.projectId === projectId)
  const data = await apiGet<BacklogTicket[] | { tickets: BacklogTicket[] }>(`/projects/${projectId}/backlog`)
  const list = Array.isArray(data) ? data : (data?.tickets ?? [])
  return list ?? []
}

export async function updateTicket(projectId: string, ticketId: string, payload: Partial<BacklogTicket>): Promise<BacklogTicket> {
  if (USE_MOCK) return { ...MOCK_TICKETS[0], ...payload, id: ticketId }
  return apiPatch<BacklogTicket>(`/projects/${projectId}/backlog/${ticketId}`, payload)
}

export async function getAgentJobs(projectId: string): Promise<AgentJobDetail[]> {
  if (USE_MOCK) return MOCK_AGENT_JOBS.filter((j) => j.projectId === projectId)
  const data = await apiGet<AgentJobDetail[] | { data: AgentJobDetail[] }>(`/projects/${projectId}/agents/jobs`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function approveAgentJob(projectId: string, jobId: string): Promise<void> {
  if (USE_MOCK) return
  await apiPost(`/projects/${projectId}/agents/jobs/${jobId}/approve`, {})
}

export async function getRunHistory(projectId: string): Promise<RunHistoryDetail[]> {
  if (USE_MOCK) return MOCK_RUNS.filter((r) => r.projectId === projectId)
  const data = await apiGet<RunHistoryDetail[] | { data: RunHistoryDetail[] }>(`/projects/${projectId}/runs`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function getArtifacts(projectId: string): Promise<ArtifactDetail[]> {
  if (USE_MOCK) return MOCK_ARTIFACTS.filter((a) => a.projectId === projectId)
  const data = await apiGet<ArtifactDetail[] | { data: ArtifactDetail[] }>(`/projects/${projectId}/artifacts`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function getSignedUrl(artifactId: string, expirationMinutes?: number): Promise<string> {
  if (USE_MOCK) return `https://example.com/artifacts/${artifactId}?token=mock`
  const data = await apiPost<{ url: string }>(`/artifacts/${artifactId}/signed-url`, { expirationMinutes })
  return data?.url ?? ''
}

export async function getTemplates(projectId: string): Promise<AutomationTemplateDetail[]> {
  if (USE_MOCK) return MOCK_TEMPLATES
  const data = await apiGet<AutomationTemplateDetail[] | { data: AutomationTemplateDetail[] }>(`/projects/${projectId}/templates`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function getAuditLogs(projectId: string): Promise<AuditLogEntry[]> {
  if (USE_MOCK) return MOCK_AUDIT_LOGS
  const data = await apiGet<AuditLogEntry[] | { data: AuditLogEntry[] }>(`/projects/${projectId}/audit`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}
