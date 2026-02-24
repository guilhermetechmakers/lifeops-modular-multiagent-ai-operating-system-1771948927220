/**
 * Onboarding / Setup Wizard types.
 * Aligned with LifeOps data models and API shapes.
 */

export type ConnectorStatus = 'not_connected' | 'connected' | 'error' | 'refreshing' | 'disconnected'

export interface Connector {
  id: string
  provider_key: string
  user_id: string
  status: ConnectorStatus
  connected_at: string | null
  last_used_at: string | null
  display_name?: string
  icon?: string
}

export interface ModuleConfig {
  id: string
  module_key: string
  name: string
  description: string
  recommended?: boolean
  enabled_at?: string | null
}

export interface DataImport {
  id: string
  user_id: string
  source_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result_summary: Record<string, unknown> | null
  created_at: string
  updated_at?: string
}

export interface CronjobTemplate {
  id: string
  name: string
  description: string
  schedule: string
  target_type: string
  target_id: string
  default_inputs: Record<string, unknown>
  permissions: string[]
  safety_rails: Record<string, unknown>
  retry_policy: Record<string, unknown>
}

export interface Cronjob {
  id: string
  user_id: string
  name: string
  template_id?: string
  enabled: boolean
  schedule: string
  timezone: string
  target_type: string
  target_id: string
  input_payload: Record<string, unknown>
  permissions: string[]
  safety_rails: Record<string, unknown>
  retry_policy: Record<string, unknown>
  status: string
  next_run: string | null
  last_run_outcome: string | null
}

export interface TutorialVideo {
  id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  duration_seconds: number
  watch_progress?: number
}

export interface UserOnboardingSession {
  id: string
  user_id: string
  steps_completed: number
  current_step: number
  state: OnboardingState
  created_at: string
  updated_at: string
}

export interface OnboardingState {
  connectors: Connector[]
  selectedModules: string[]
  dataImports: DataImport[]
  cronjob: Cronjob | null
  cronjobTemplateId: string | null
  videoProgress: Record<string, number>
  completedAt: string | null
}

export const ONBOARDING_STEPS = [
  { id: 1, key: 'welcome', title: 'Welcome', description: 'Get started with LifeOps' },
  { id: 2, key: 'integrations', title: 'Connect Integrations', description: 'Link your tools and accounts' },
  { id: 3, key: 'modules', title: 'Choose Modules', description: 'Select areas to automate' },
  { id: 4, key: 'import', title: 'Import Data', description: 'Bring in your data' },
  { id: 5, key: 'cronjob', title: 'First Cronjob', description: 'Create your first automation' },
  { id: 6, key: 'videos', title: 'Tutorial Videos', description: 'Learn the basics' },
  { id: 7, key: 'summary', title: 'Summary & Start', description: 'Review and launch' },
] as const

export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number]['key']
