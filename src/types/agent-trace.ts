/**
 * Agent Trace Viewer - Type definitions for run trace, events, policy, and memory.
 * API contracts and data shapes for timeline visualization.
 */

export type EventType = 'message' | 'handoff' | 'negotiation' | 'alert' | 'consensus'

export interface RuleOutcome {
  ruleId: string
  result: 'allow' | 'deny' | 'modify'
  precedenceRank: number
  justification: string
}

export interface PolicyResult {
  policyResultId: string
  appliedRules: RuleOutcome[]
}

export interface MemoryAccess {
  memoryId: string
  accessType: 'read' | 'write'
  agentId: string
  ttlSeconds?: number
  scope: string
  valueSnapshot?: unknown
}

export interface MemoryEntry {
  memoryId: string
  scope: string
  ownerAgentId: string
  value: unknown
  ttl: string | null
  accessControls: string[]
}

export interface Event {
  eventId: string
  type: EventType
  timestamp: string
  fromAgentId: string | null
  toAgentId: string | null
  topic?: string
  details?: Record<string, unknown>
  policyResultId?: string
  memoryAccessIds?: string[]
  linkedRunArtifactIds?: string[]
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export interface Artifact {
  artifactId: string
  type: string
  name: string
  url: string
  metadata?: Record<string, unknown>
}

export interface RunTrace {
  runId: string
  events: Event[]
  artifacts: Artifact[]
  summary: string
}

export interface EventDetail extends Event {
  policyResult?: PolicyResult
  memoryAccess?: MemoryAccess[]
}

export interface Agent {
  agentId: string
  name: string
  capabilities: string[]
  config?: Record<string, unknown>
}

export interface TraceFilters {
  agentIds?: string[]
  topics?: string[]
  eventTypes?: EventType[]
  severity?: ('low' | 'medium' | 'high' | 'critical')[]
  timeRange?: { start: string; end: string }
  consensusOnly?: boolean
}

/** @deprecated Use TraceFilters */
export type AgentTraceFilters = TraceFilters
