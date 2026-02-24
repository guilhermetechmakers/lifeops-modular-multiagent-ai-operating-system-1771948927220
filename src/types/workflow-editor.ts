/**
 * Workflow Editor data models.
 * All arrays default to [] when null/undefined for runtime safety.
 */

export type WorkflowNodeType =
  | 'Agent'
  | 'Handoff'
  | 'Condition'
  | 'Retry'
  | 'Output'
  | 'Trigger'
  | 'SubWorkflow'

export interface WorkflowNodePosition {
  x: number
  y: number
}

export interface WorkflowNodeSize {
  width: number
  height: number
}

export interface WorkflowNodeConfig {
  agentId?: string
  toolset?: string[]
  memoryScope?: string
  costLimit?: number
  promptTemplate?: string
  condition?: string
  maxRetries?: number
  subWorkflowId?: string
  [key: string]: unknown
}

export interface WorkflowNode {
  id: string
  templateId: string
  type: WorkflowNodeType
  config: WorkflowNodeConfig
  position: WorkflowNodePosition
  size: WorkflowNodeSize
  label?: string
}

export interface WorkflowEdge {
  id: string
  templateId: string
  fromNodeId: string
  fromPort: string
  toNodeId: string
  toPort: string
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  currentVersionId?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface TemplateVersion {
  id: string
  templateId: string
  versionNumber: number
  changesSummary: string
  diff?: Record<string, unknown>
  createdAt: string
}

export type RunStatus =
  | 'pending'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'canceled'

export interface WorkflowRun {
  id: string
  templateId: string
  status: RunStatus
  startedAt: string
  finishedAt?: string
  logs?: string[]
  trace?: SimulationTraceEntry[]
}

export interface SimulationTraceEntry {
  step: number
  agentId?: string
  agentName?: string
  timestamp: string
  type: 'prompt' | 'handoff' | 'decision' | 'output' | 'error'
  message?: string
  payload?: Record<string, unknown>
}

export interface SimulationResult {
  success: boolean
  verdict?: string
  trace: SimulationTraceEntry[]
  confidence?: number
  discrepancies?: string[]
}

export interface PolicyDocumentType {
  type: 'Privacy' | 'Terms' | 'DPA' | 'Cookie'
}

export interface PolicyDocument {
  id: string
  type: PolicyDocumentType['type']
  version: number
  content: string
  effectiveDate: string
}

export interface AgentCapability {
  id: string
  name: string
  tools: string[]
  memoryScope?: string
  costLimit?: number
}
