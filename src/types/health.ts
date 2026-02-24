/**
 * Health Dashboard data models.
 * Aligned with LifeOps Health Module and wearables integration.
 */

export interface Habit {
  id: string
  name: string
  isCompleted: boolean
  streak: number
  target: string
  lastUpdated: string
}

export type PlanType = 'training' | 'meal'

export interface Plan {
  id: string
  type: PlanType
  title: string
  progress: number
  agentSuggestion?: AgentSuggestion
}

export interface RecoveryMetrics {
  id: string
  hrV: number
  restingHR: number
  recoveryScore: number
  sleepQuality: number
  sleepDurationHours: number
  timestamp: string
}

export interface SleepStages {
  light: number
  deep: number
  REM: number
}

export interface SleepData {
  date: string
  duration: number
  quality: number
  stages: SleepStages
}

export interface Wearable {
  id: string
  name: string
  connected: boolean
  lastSync: string
  dataGaps: boolean
}

export type AgentSuggestionStatus = 'pending' | 'approved' | 'rejected'

export interface AgentSuggestion {
  id: string
  title: string
  summary: string
  impact: number
  status: AgentSuggestionStatus
  runId: string
  createdAt: string
}

export interface RunArtifact {
  id: string
  prompt: string
  variables: Record<string, unknown>
  scope: string
  logs: string[]
  diffs: string[]
  artifacts: string[]
  outcome: 'success' | 'failure'
  timestamp: string
}

export interface ApprovalQueue {
  id: string
  suggestionId: string
  status: 'pending' | 'approved' | 'declined'
  requestedBy: string
  requestedAt: string
  constraints: Record<string, unknown>
}

export interface TodayOverview {
  steps: number
  activeMinutes: number
  sleepHours: number
  hrV: number
  restingHR: number
}

export interface WorkloadSuggestion {
  id: string
  title: string
  summary: string
  suggestedAdjustments: string[]
  suggestedChange?: string
  impact: number
  status?: 'pending' | 'applied' | 'declined'
}

export interface HealthNotification {
  id: string
  type: 'approval' | 'safety' | 'health' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface TimelineEvent {
  id: string
  type: 'handoff' | 'run' | 'artifact' | 'log'
  title: string
  description?: string
  timestamp: string
  runId?: string
}
