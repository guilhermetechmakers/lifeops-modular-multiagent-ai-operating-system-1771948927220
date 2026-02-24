/**
 * Workflow Editor API layer.
 * Templates, nodes, edges, versions, simulation, policies, agents.
 */

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import type {
  WorkflowTemplate,
  WorkflowNode,
  WorkflowEdge,
  TemplateVersion,
  WorkflowRun,
  SimulationResult,
  PolicyDocument,
  AgentCapability,
} from '@/types/workflow-editor'

const API_BASE = '/workflows'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 't1',
    name: 'Content Pipeline',
    description: 'End-to-end content automation',
    currentVersionId: 'v1',
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't2',
    name: 'Finance Close',
    description: 'Monthly finance close workflow',
    currentVersionId: 'v1',
    isPublished: false,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_NODES: WorkflowNode[] = [
  {
    id: 'n1',
    templateId: 't1',
    type: 'Trigger',
    config: {},
    position: { x: 100, y: 100 },
    size: { width: 160, height: 48 },
    label: 'Start',
  },
  {
    id: 'n2',
    templateId: 't1',
    type: 'Agent',
    config: { agentId: 'a1', memoryScope: 'content' },
    position: { x: 100, y: 200 },
    size: { width: 160, height: 48 },
    label: 'Idea Generator',
  },
]

const MOCK_EDGES: WorkflowEdge[] = [
  {
    id: 'e1',
    templateId: 't1',
    fromNodeId: 'n1',
    fromPort: 'out',
    toNodeId: 'n2',
    toPort: 'in',
  },
]

const MOCK_VERSIONS: TemplateVersion[] = [
  {
    id: 'v1',
    templateId: 't1',
    versionNumber: 1,
    changesSummary: 'Initial version',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
]

const MOCK_POLICIES: PolicyDocument[] = [
  {
    id: 'p1',
    type: 'Privacy',
    version: 1,
    content: 'Privacy Policy content...',
    effectiveDate: new Date().toISOString().split('T')[0] ?? '',
  },
  {
    id: 'p2',
    type: 'Terms',
    version: 1,
    content: 'Terms of Service content...',
    effectiveDate: new Date().toISOString().split('T')[0] ?? '',
  },
]

const MOCK_AGENTS: AgentCapability[] = [
  {
    id: 'a1',
    name: 'Content Ideas',
    tools: ['search', 'generate'],
    memoryScope: 'content',
    costLimit: 10,
  },
  {
    id: 'a2',
    name: 'Finance Close',
    tools: ['reconcile', 'report'],
    memoryScope: 'finance',
    costLimit: 20,
  },
]

// --- API functions ---

export async function fetchTemplates(): Promise<WorkflowTemplate[]> {
  if (USE_MOCK) {
    return [...MOCK_TEMPLATES]
  }
  const res = await apiGet<WorkflowTemplate[] | { data?: WorkflowTemplate[] }>(`${API_BASE}/templates`)
  return Array.isArray(res) ? res : res?.data ?? []
}

export async function fetchTemplate(id: string): Promise<WorkflowTemplate | null> {
  if (USE_MOCK) {
    const found = MOCK_TEMPLATES.find((t) => t.id === id)
    return found ?? null
  }
  try {
    const res = await apiGet<WorkflowTemplate>(`${API_BASE}/templates/${id}`)
    return res ?? null
  } catch {
    return null
  }
}

export async function createTemplate(input: {
  name: string
  description?: string
}): Promise<WorkflowTemplate> {
  if (USE_MOCK) {
    const newT: WorkflowTemplate = {
      id: `t${Date.now()}`,
      name: input.name,
      description: input.description ?? '',
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    MOCK_TEMPLATES.push(newT)
    return newT
  }
  const res = await apiPost<WorkflowTemplate>(`${API_BASE}/templates`, input)
  return res
}

export async function updateTemplate(
  id: string,
  updates: Partial<Pick<WorkflowTemplate, 'name' | 'description' | 'isPublished'>>
): Promise<WorkflowTemplate> {
  if (USE_MOCK) {
    const idx = MOCK_TEMPLATES.findIndex((t) => t.id === id)
    if (idx < 0) throw new Error('Template not found')
    const updated = { ...MOCK_TEMPLATES[idx], ...updates, updatedAt: new Date().toISOString() }
    MOCK_TEMPLATES[idx] = updated
    return updated
  }
  const res = await apiPut<WorkflowTemplate>(`${API_BASE}/templates/${id}`, updates)
  return res
}

export async function deleteTemplate(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_TEMPLATES.findIndex((t) => t.id === id)
    if (idx >= 0) MOCK_TEMPLATES.splice(idx, 1)
    return
  }
  await apiDelete(`${API_BASE}/templates/${id}`)
}

export async function fetchNodes(templateId: string): Promise<WorkflowNode[]> {
  if (USE_MOCK) {
    return (MOCK_NODES ?? []).filter((n) => n.templateId === templateId)
  }
  const res = await apiGet<WorkflowNode[] | { data?: WorkflowNode[] }>(
    `${API_BASE}/templates/${templateId}/nodes`
  )
  const data = Array.isArray(res) ? res : res?.data ?? []
  return data
}

export async function createNode(
  templateId: string,
  node: Omit<WorkflowNode, 'id' | 'templateId'>
): Promise<WorkflowNode> {
  if (USE_MOCK) {
    const newN: WorkflowNode = {
      ...node,
      id: `n${Date.now()}`,
      templateId,
    }
    MOCK_NODES.push(newN)
    return newN
  }
  const res = await apiPost<WorkflowNode>(`${API_BASE}/templates/${templateId}/nodes`, node)
  return res
}

export async function updateNode(
  templateId: string,
  nodeId: string,
  updates: Partial<WorkflowNode>
): Promise<WorkflowNode> {
  if (USE_MOCK) {
    const idx = MOCK_NODES.findIndex((n) => n.id === nodeId && n.templateId === templateId)
    if (idx < 0) throw new Error('Node not found')
    const updated = { ...MOCK_NODES[idx], ...updates }
    MOCK_NODES[idx] = updated
    return updated
  }
  const res = await apiPut<WorkflowNode>(
    `${API_BASE}/templates/${templateId}/nodes/${nodeId}`,
    updates
  )
  return res
}

export async function deleteNode(templateId: string, nodeId: string): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_NODES.findIndex((n) => n.id === nodeId && n.templateId === templateId)
    if (idx >= 0) MOCK_NODES.splice(idx, 1)
    const edgeIdx = MOCK_EDGES.findIndex(
      (e) => (e.fromNodeId === nodeId || e.toNodeId === nodeId) && e.templateId === templateId
    )
    if (edgeIdx >= 0) MOCK_EDGES.splice(edgeIdx, 1)
    return
  }
  await apiDelete(`${API_BASE}/templates/${templateId}/nodes/${nodeId}`)
}

export async function fetchEdges(templateId: string): Promise<WorkflowEdge[]> {
  if (USE_MOCK) {
    return (MOCK_EDGES ?? []).filter((e) => e.templateId === templateId)
  }
  const res = await apiGet<WorkflowEdge[] | { data?: WorkflowEdge[] }>(
    `${API_BASE}/templates/${templateId}/edges`
  )
  const data = Array.isArray(res) ? res : res?.data ?? []
  return data
}

export async function createEdge(
  templateId: string,
  edge: Omit<WorkflowEdge, 'id' | 'templateId'>
): Promise<WorkflowEdge> {
  if (USE_MOCK) {
    const newE: WorkflowEdge = {
      ...edge,
      id: `e${Date.now()}`,
      templateId,
    }
    MOCK_EDGES.push(newE)
    return newE
  }
  const res = await apiPost<WorkflowEdge>(`${API_BASE}/templates/${templateId}/edges`, edge)
  return res
}

export async function deleteEdge(templateId: string, edgeId: string): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_EDGES.findIndex((e) => e.id === edgeId && e.templateId === templateId)
    if (idx >= 0) MOCK_EDGES.splice(idx, 1)
    return
  }
  await apiDelete(`${API_BASE}/templates/${templateId}/edges/${edgeId}`)
}

export async function fetchVersions(templateId: string): Promise<TemplateVersion[]> {
  if (USE_MOCK) {
    return (MOCK_VERSIONS ?? []).filter((v) => v.templateId === templateId)
  }
  const res = await apiGet<TemplateVersion[] | { data?: TemplateVersion[] }>(
    `${API_BASE}/templates/${templateId}/versions`
  )
  const data = Array.isArray(res) ? res : res?.data ?? []
  return data
}

export async function createVersion(
  templateId: string,
  input: { changesSummary: string }
): Promise<TemplateVersion> {
  if (USE_MOCK) {
    const versions = (MOCK_VERSIONS ?? []).filter((v) => v.templateId === templateId)
    const nextNum = versions.length > 0 ? Math.max(...versions.map((v) => v.versionNumber)) + 1 : 1
    const newV: TemplateVersion = {
      id: `v${Date.now()}`,
      templateId,
      versionNumber: nextNum,
      changesSummary: input.changesSummary,
      createdAt: new Date().toISOString(),
    }
    MOCK_VERSIONS.push(newV)
    return newV
  }
  const res = await apiPost<TemplateVersion>(
    `${API_BASE}/templates/${templateId}/versions`,
    input
  )
  return res
}

export async function simulateWorkflow(templateId: string): Promise<SimulationResult> {
  if (USE_MOCK) {
    return {
      success: true,
      verdict: 'Simulation completed successfully',
      trace: [
        {
          step: 1,
          agentId: 'a1',
          agentName: 'Idea Generator',
          timestamp: new Date().toISOString(),
          type: 'prompt',
          message: 'Prompt sent',
        },
        {
          step: 2,
          timestamp: new Date().toISOString(),
          type: 'output',
          message: 'Generated 5 ideas',
        },
      ],
      confidence: 0.92,
    }
  }
  const res = await apiPost<SimulationResult>(`${API_BASE}/templates/${templateId}/simulate`, {})
  return res
}

export async function publishTemplate(templateId: string): Promise<WorkflowTemplate> {
  if (USE_MOCK) {
    const t = MOCK_TEMPLATES.find((x) => x.id === templateId)
    if (!t) throw new Error('Template not found')
    t.isPublished = true
    t.updatedAt = new Date().toISOString()
    return t
  }
  const res = await apiPost<WorkflowTemplate>(`${API_BASE}/templates/${templateId}/publish`, {})
  return res
}

export async function rollbackTemplate(
  templateId: string,
  versionId: string
): Promise<WorkflowTemplate> {
  if (USE_MOCK) {
    const t = MOCK_TEMPLATES.find((x) => x.id === templateId)
    if (!t) throw new Error('Template not found')
    t.currentVersionId = versionId
    t.updatedAt = new Date().toISOString()
    return t
  }
  const res = await apiPost<WorkflowTemplate>(
    `${API_BASE}/templates/${templateId}/rollback`,
    { versionId }
  )
  return res
}

export async function fetchPolicyDocuments(): Promise<PolicyDocument[]> {
  if (USE_MOCK) {
    return [...MOCK_POLICIES]
  }
  const res = await apiGet<PolicyDocument[] | { data?: PolicyDocument[] }>('/policies')
  return Array.isArray(res) ? res : res?.data ?? []
}

export async function updatePolicyDocument(
  id: string,
  updates: Partial<Pick<PolicyDocument, 'content' | 'version'>>
): Promise<PolicyDocument> {
  if (USE_MOCK) {
    const idx = MOCK_POLICIES.findIndex((p) => p.id === id)
    if (idx < 0) throw new Error('Policy not found')
    const updated = { ...MOCK_POLICIES[idx], ...updates }
    MOCK_POLICIES[idx] = updated
    return updated
  }
  const res = await apiPut<PolicyDocument>(`/policies/${id}`, updates)
  return res
}

export async function fetchAgents(): Promise<AgentCapability[]> {
  if (USE_MOCK) {
    return [...MOCK_AGENTS]
  }
  const res = await apiGet<AgentCapability[] | { data?: AgentCapability[] }>('/agents')
  return Array.isArray(res) ? res : res?.data ?? []
}

export async function fetchCronjobsForTemplate(templateId: string): Promise<WorkflowRun[]> {
  if (USE_MOCK) {
    return [
      {
        id: 'r1',
        templateId,
        status: 'succeeded',
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        finishedAt: new Date(Date.now() - 3540000).toISOString(),
      },
    ]
  }
  const res = await apiGet<WorkflowRun[] | { data?: WorkflowRun[] }>(
    `${API_BASE}/templates/${templateId}/runs`
  )
  return Array.isArray(res) ? res : res?.data ?? []
}
