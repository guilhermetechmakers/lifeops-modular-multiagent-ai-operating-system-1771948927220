/**
 * Agent Console - Type definitions for agent management, memory, traces, and simulation.
 */

export type AgentStatus = 'online' | 'offline' | 'paused' | 'error'

export type AutomationLevel =
  | 'manual'
  | 'suggest-only'
  | 'conditional-auto'
  | 'bounded-autopilot'

export type TraceType = 'handoff' | 'negotiation' | 'alert' | 'consensus'

export interface CostControl {
  limits?: { daily?: number; monthly?: number }
  currency?: string
  spent?: number
}

export interface Agent {
  id: string
  name: string
  status: AgentStatus
  last_activity: string
  automation_level: AutomationLevel
  cost_control?: CostControl
  config?: AgentConfig
  permissions?: AgentPermissions
}

export interface AgentConfig {
  role?: string
  prompts?: Record<string, string>
  templates?: Record<string, string>
  allowedTools?: string[]
  memoryAccessPermissions?: string[]
  costControls?: CostControl
  rateLimits?: Record<string, number>
  safetyConstraints?: Record<string, unknown>
}

export interface AgentPermissions {
  subjects?: string[]
  resourceScopes?: string[]
  approvalRequired?: boolean
  allowedActions?: string[]
}

export interface MemoryEntry {
  id: string
  agent_id: string
  key: string
  value: unknown
  scope: string
  ttl: number | null
  created_at: string
  updated_at: string
  access_control?: Record<string, unknown>
}

export interface Run {
  id: string
  agent_id: string
  status: string
  started_at: string
  ended_at: string | null
  trace_id: string
  summary?: string
}

export interface Trace {
  id: string
  run_id: string
  sender_id: string
  receiver_id: string
  message: string
  timestamp: string
  type: TraceType
}

export interface Tool {
  id: string
  name: string
  version: string
  config_schema?: Record<string, unknown>
}

export interface RunSummary {
  runId: string
  agentId?: string
  status?: string
  handoffs?: number
  negotiations?: number
  alerts?: number
  consensus?: number
  consensusSteps?: number
}

export type AgentConfigUpdate = Partial<AgentConfig>

export interface MemoryWritePayload {
  key: string
  value: unknown
  scope: string
  ttl?: number
}

export interface SimulationPayload {
  promptTemplate?: string
  prompt?: string
  inputPayload?: Record<string, unknown>
}

export interface SimulationResult {
  runId: string
  trace: Trace[]
  status: string
}
