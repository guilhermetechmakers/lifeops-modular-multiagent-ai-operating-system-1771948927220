/**
 * Projects API layer.
 * Uses mock data for prototyping; replace with real API calls when backend is ready.
 */

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api'
import type {
  Project,
  Roadmap,
  Milestone,
  Ticket,
  PR,
  Release,
  CITrigger,
  AutomationTemplate,
  IntegrationConnector,
  RunArtifact,
  AgentJob,
  RunHistory,
} from '@/types/projects'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'LifeOps Platform',
    description: 'Modular multi-agent AI operating system',
    ticketsCount: 12,
    prsCount: 3,
    lastSync: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'p2',
    name: 'Marketing Site',
    description: 'Marketing and landing pages',
    ticketsCount: 5,
    prsCount: 1,
    lastSync: new Date(Date.now() - 3600000).toISOString(),
  },
]

const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Implement Projects Dashboard',
    description: 'Build comprehensive projects workspace',
    status: 'in-progress',
    priority: 'high',
    assigneeName: 'AI Agent',
    aiTriage: { summary: 'Core feature for developer workflow', suggestedPriority: 'high' },
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Add Kanban drag-and-drop',
    status: 'todo',
    priority: 'medium',
    aiTriage: { summary: 'Improves ticket management UX' },
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Integrate GitHub PRs',
    status: 'backlog',
    priority: 'high',
  },
]

const MOCK_PRS: PR[] = [
  { id: 'pr1', projectId: 'p1', provider: 'github', prNumber: 42, title: 'Add Projects Dashboard', status: 'open', checks: [{ name: 'CI', status: 'passing' }] },
  { id: 'pr2', projectId: 'p1', provider: 'github', prNumber: 41, title: 'Fix auth flow', status: 'merged' },
]

const MOCK_RELEASES: Release[] = [
  { id: 'r1', projectId: 'p1', version: 'v1.2.0', artifacts: [], status: 'published', releaseNotes: 'Projects Dashboard' },
]

const MOCK_CI_TRIGGERS: CITrigger[] = [
  { id: 'ci1', projectId: 'p1', name: 'Deploy on merge', config: {}, enabled: true },
]

const MOCK_TEMPLATES: AutomationTemplate[] = [
  { id: 'tm1', name: 'Release Pipeline', type: 'release', content: '{{version}}\n{{changelog}}', updatedAt: new Date().toISOString() },
]

const MOCK_INTEGRATIONS: IntegrationConnector[] = [
  { id: 'i1', provider: 'github', status: 'connected', scopes: ['repo'] },
  { id: 'i2', provider: 'gitlab', status: 'disconnected' },
]

// --- API functions ---

export async function fetchProjects(): Promise<Project[]> {
  if (USE_MOCK) return MOCK_PROJECTS
  const data = await apiGet<Project[] | { data: Project[] }>('/projects')
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function fetchProject(id: string): Promise<Project | null> {
  if (USE_MOCK) return MOCK_PROJECTS.find((p) => p.id === id) ?? null
  try {
    return await apiGet<Project>(`/projects/${id}`)
  } catch {
    return null
  }
}

export async function createProject(payload: Partial<Project>): Promise<Project> {
  if (USE_MOCK) {
    const p: Project = { id: `p${Date.now()}`, name: payload.name ?? 'New Project', ...payload }
    return p
  }
  return apiPost<Project>('/projects', payload)
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  if (USE_MOCK) return { ...MOCK_PROJECTS[0], ...payload, id }
  return apiPut<Project>(`/projects/${id}`, payload)
}

export async function deleteProject(id: string): Promise<void> {
  if (USE_MOCK) return
  await apiDelete(`/projects/${id}`)
}

export async function fetchRoadmap(projectId: string): Promise<Roadmap | null> {
  if (USE_MOCK) {
    const milestones: Milestone[] = [
      { id: 'm1', title: 'Q1 Launch', dueDate: '2025-03-31', status: 'in-progress', tickets: MOCK_TICKETS.slice(0, 2) },
      { id: 'm2', title: 'Q2 Features', dueDate: '2025-06-30', status: 'pending' },
    ]
    return { id: 'rm1', projectId, milestones, status: 'active', aiInsights: 'Focus on high-priority tickets first' }
  }
  try {
    return await apiGet<Roadmap>(`/projects/${projectId}/roadmap`)
  } catch {
    return null
  }
}

export async function fetchTickets(projectId: string): Promise<Ticket[]> {
  if (USE_MOCK) return MOCK_TICKETS.filter((t) => t.projectId === projectId)
  const data = await apiGet<Ticket[] | { data: Ticket[] }>(`/projects/${projectId}/tickets`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function createTicket(projectId: string, payload: Partial<Ticket>): Promise<Ticket> {
  if (USE_MOCK) {
    return { id: `t${Date.now()}`, projectId, title: payload.title ?? '', status: 'backlog', priority: 'medium', ...payload }
  }
  return apiPost<Ticket>(`/projects/${projectId}/tickets`, payload)
}

export async function updateTicket(id: string, payload: Partial<Ticket>): Promise<Ticket> {
  if (USE_MOCK) return { ...MOCK_TICKETS[0], ...payload, id }
  return apiPatch<Ticket>(`/tickets/${id}`, payload)
}

export async function fetchPRs(projectId: string): Promise<PR[]> {
  if (USE_MOCK) return MOCK_PRS.filter((p) => p.projectId === projectId)
  const data = await apiGet<PR[] | { data: PR[] }>(`/projects/${projectId}/prs`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function fetchReleases(projectId: string): Promise<Release[]> {
  if (USE_MOCK) return MOCK_RELEASES.filter((r) => r.projectId === projectId)
  const data = await apiGet<Release[] | { data: Release[] }>(`/projects/${projectId}/releases`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function fetchCITriggers(projectId?: string): Promise<CITrigger[]> {
  if (USE_MOCK) return projectId ? MOCK_CI_TRIGGERS.filter((c) => c.projectId === projectId) : MOCK_CI_TRIGGERS
  const q = projectId ? `?projectId=${projectId}` : ''
  const data = await apiGet<CITrigger[] | { data: CITrigger[] }>(`/ci-triggers${q}`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function createCITrigger(payload: Partial<CITrigger>): Promise<CITrigger> {
  if (USE_MOCK) return { id: `ci${Date.now()}`, name: payload.name ?? '', config: {}, enabled: true, ...payload }
  return apiPost<CITrigger>('/ci-triggers', payload)
}

export async function updateCITrigger(id: string, payload: Partial<CITrigger>): Promise<CITrigger> {
  if (USE_MOCK) return { ...MOCK_CI_TRIGGERS[0], ...payload, id }
  return apiPatch<CITrigger>(`/ci-triggers/${id}`, payload)
}

export async function fetchAutomationTemplates(): Promise<AutomationTemplate[]> {
  if (USE_MOCK) return MOCK_TEMPLATES
  const data = await apiGet<AutomationTemplate[] | { data: AutomationTemplate[] }>('/automation-templates')
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function createAutomationTemplate(payload: Partial<AutomationTemplate>): Promise<AutomationTemplate> {
  if (USE_MOCK) return { id: `tm${Date.now()}`, name: payload.name ?? '', type: 'release', content: '', ...payload }
  return apiPost<AutomationTemplate>('/automation-templates', payload)
}

export async function updateAutomationTemplate(id: string, payload: Partial<AutomationTemplate>): Promise<AutomationTemplate> {
  if (USE_MOCK) return { ...MOCK_TEMPLATES[0], ...payload, id }
  return apiPatch<AutomationTemplate>(`/automation-templates/${id}`, payload)
}

export async function fetchIntegrations(): Promise<IntegrationConnector[]> {
  if (USE_MOCK) return MOCK_INTEGRATIONS
  const data = await apiGet<IntegrationConnector[] | { data: IntegrationConnector[] }>('/integrations')
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function connectIntegration(provider: string): Promise<{ url: string }> {
  if (USE_MOCK) return { url: `https://${provider}.com/oauth/authorize` }
  return apiPost<{ url: string }>(`/integrations/${provider}/connect`, {})
}

export async function fetchAgentJobs(projectId: string): Promise<AgentJob[]> {
  if (USE_MOCK) {
    return [
      { id: 'aj1', agentId: 'a1', status: 'success', startedAt: new Date(Date.now() - 3600000).toISOString(), endedAt: new Date(Date.now() - 3500000).toISOString() },
    ]
  }
  const data = await apiGet<AgentJob[] | { data: AgentJob[] }>(`/projects/${projectId}/agent-jobs`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function fetchRunHistory(projectId: string): Promise<RunHistory[]> {
  if (USE_MOCK) {
    return [
      { id: 'rh1', runId: 'r1', status: 'success', duration: 60000, summary: 'Deploy completed' },
    ]
  }
  const data = await apiGet<RunHistory[] | { data: RunHistory[] }>(`/projects/${projectId}/run-history`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function fetchRunArtifacts(runId: string): Promise<RunArtifact[]> {
  if (USE_MOCK) return []
  const data = await apiGet<RunArtifact[] | { data: RunArtifact[] }>(`/run-artifacts/${runId}`)
  return Array.isArray(data) ? data : (data?.data ?? [])
}
