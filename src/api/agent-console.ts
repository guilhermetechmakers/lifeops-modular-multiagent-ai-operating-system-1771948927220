/**
 * Agent Console API layer.
 * Memory, orchestration, SDK tooling, simulation.
 */

import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from '@/lib/api'
import type {
  Agent,
  MemoryEntry,
  Trace,
  Tool,
  RunSummary,
  AgentConfigUpdate,
  MemoryWritePayload,
  SimulationPayload,
  SimulationResult,
} from '@/types/agent-console'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_AGENTS: Agent[] = [
  {
    id: 'a1',
    name: 'Content Ideas Agent',
    status: 'online',
    last_activity: new Date().toISOString(),
    automation_level: 'conditional-auto',
    cost_control: { limits: { daily: 100 }, currency: 'USD', spent: 24 },
    config: {
      role: 'Generate content ideas from prompts',
      allowedTools: ['web_search', 'memory_read', 'memory_write'],
    },
    permissions: { approvalRequired: false },
  },
  {
    id: 'a2',
    name: 'Finance Processor',
    status: 'online',
    last_activity: new Date(Date.now() - 3600000).toISOString(),
    automation_level: 'suggest-only',
    cost_control: { limits: { monthly: 50 }, currency: 'USD', spent: 12 },
    config: { role: 'Process transactions and reconcile' },
    permissions: { approvalRequired: true },
  },
  {
    id: 'a3',
    name: 'Anomaly Detector',
    status: 'offline',
    last_activity: new Date(Date.now() - 86400000).toISOString(),
    automation_level: 'manual',
    config: { role: 'Detect anomalies in metrics' },
  },
]

const MOCK_MEMORY: MemoryEntry[] = [
  {
    id: 'm1',
    agent_id: 'a1',
    key: 'last_topic',
    value: 'AI productivity',
    scope: 'content',
    ttl: 86400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm2',
    agent_id: 'a1',
    key: 'preferences',
    value: { tone: 'professional', length: 'medium' },
    scope: 'user',
    ttl: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const MOCK_TRACES: Trace[] = [
  {
    id: 't1',
    run_id: 'r1',
    sender_id: 'a1',
    receiver_id: 'a2',
    message: 'Handoff: Content ideas ready for review',
    timestamp: new Date().toISOString(),
    type: 'handoff',
  },
  {
    id: 't2',
    run_id: 'r1',
    sender_id: 'a2',
    receiver_id: 'a1',
    message: 'Consensus: Approved for publishing',
    timestamp: new Date(Date.now() + 1000).toISOString(),
    type: 'consensus',
  },
]

const MOCK_TOOLS: Tool[] = [
  { id: 't1', name: 'web_search', version: '1.0', config_schema: {} },
  { id: 't2', name: 'memory_read', version: '1.0', config_schema: {} },
  { id: 't3', name: 'memory_write', version: '1.0', config_schema: {} },
]

// --- API functions ---

export async function fetchAgents(): Promise<Agent[]> {
  if (USE_MOCK) return MOCK_AGENTS
  const data = await apiGet<Agent[] | { items: Agent[] }>('/agents')
  return Array.isArray(data) ? data : (data?.items ?? [])
}

export async function fetchAgent(agentId: string): Promise<Agent | null> {
  if (USE_MOCK) {
    const agent = MOCK_AGENTS.find((a) => a.id === agentId)
    return agent ?? null
  }
  try {
    const data = await apiGet<Agent>(`/agents/${agentId}`)
    return data ?? null
  } catch {
    return null
  }
}

export async function updateAgentConfig(
  agentId: string,
  config: AgentConfigUpdate
): Promise<Agent> {
  if (USE_MOCK) {
    const agent = MOCK_AGENTS.find((a) => a.id === agentId)
    if (!agent) throw new Error('Agent not found')
    return { ...agent, config: { ...agent.config, ...config } }
  }
  const data = await apiPatch<Agent>(`/agents/${agentId}/config`, config)
  return data
}

export async function updateAgentPermissions(
  agentId: string,
  permissions: Record<string, unknown>
): Promise<void> {
  if (USE_MOCK) return
  await apiPatch(`/agents/${agentId}/permissions`, permissions)
}

export async function fetchAgentMemory(
  agentId: string,
  params?: { scope?: string; limit?: number; offset?: number }
): Promise<MemoryEntry[]> {
  if (USE_MOCK) {
    let items = MOCK_MEMORY.filter((m) => m.agent_id === agentId)
    if (params?.scope) items = items.filter((m) => m.scope === params.scope)
    return items
  }
  const q = new URLSearchParams()
  if (params?.scope) q.set('scope', params.scope)
  if (params?.limit != null) q.set('limit', String(params.limit))
  if (params?.offset != null) q.set('offset', String(params.offset))
  const data = await apiGet<MemoryEntry[] | { items: MemoryEntry[] }>(
    `/agents/${agentId}/memory?${q}`
  )
  return Array.isArray(data) ? data : (data?.items ?? [])
}

export async function writeAgentMemory(
  agentId: string,
  payload: MemoryWritePayload
): Promise<MemoryEntry> {
  if (USE_MOCK) {
    const entry: MemoryEntry = {
      id: `m${Date.now()}`,
      agent_id: agentId,
      key: payload.key,
      value: payload.value,
      scope: payload.scope,
      ttl: payload.ttl ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return entry
  }
  const data = await apiPost<MemoryEntry>(
    `/agents/${agentId}/memory`,
    payload
  )
  return data
}

export async function deleteAgentMemory(
  agentId: string,
  memoryId: string
): Promise<void> {
  if (USE_MOCK) return
  await apiDelete(`/agents/${agentId}/memory/${memoryId}`)
}

export async function fetchAgentTrace(
  agentId: string,
  params?: { runId?: string; limit?: number }
): Promise<Trace[]> {
  if (USE_MOCK) return MOCK_TRACES
  const q = new URLSearchParams()
  if (params?.runId) q.set('runId', params.runId)
  if (params?.limit != null) q.set('limit', String(params.limit))
  const data = await apiGet<Trace[] | { items: Trace[] }>(
    `/agents/${agentId}/trace?${q}`
  )
  return Array.isArray(data) ? data : (data?.items ?? [])
}

export async function runSimulation(
  agentId: string,
  payload: SimulationPayload
): Promise<SimulationResult> {
  const normalized = {
    promptTemplate: payload.promptTemplate ?? payload.prompt,
    inputPayload: payload.inputPayload,
  }
  if (USE_MOCK) {
    return {
      runId: `r-sim-${Date.now()}`,
      trace: MOCK_TRACES,
      status: 'success',
    }
  }
  const data = await apiPost<SimulationResult>(
    `/agents/${agentId}/simulate`,
    normalized
  )
  return data
}

export async function fetchRunSummary(runId: string): Promise<RunSummary | null> {
  if (USE_MOCK) {
    return {
      runId,
      status: 'success',
      handoffs: 1,
      negotiations: 0,
      alerts: 0,
      consensus: 1,
    }
  }
  try {
    const data = await apiGet<RunSummary>(
      `/orchestrator/run/${runId}/summary`
    )
    return data ?? null
  } catch {
    return null
  }
}

export async function fetchTools(): Promise<Tool[]> {
  if (USE_MOCK) return MOCK_TOOLS
  const data = await apiGet<Tool[] | { items: Tool[] }>('/tools')
  return Array.isArray(data) ? data : (data?.items ?? [])
}
