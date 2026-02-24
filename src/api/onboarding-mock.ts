/**
 * Mock data for onboarding when API is unavailable.
 * Used for development and demo.
 */
import type { Connector, ModuleConfig, CronjobTemplate, TutorialVideo } from '@/types/onboarding'

export const MOCK_CONNECTORS: Connector[] = [
  { id: '1', provider_key: 'github', user_id: '', status: 'not_connected', connected_at: null, last_used_at: null, display_name: 'GitHub', icon: 'github' },
  { id: '2', provider_key: 'cicd', user_id: '', status: 'not_connected', connected_at: null, last_used_at: null, display_name: 'CI/CD', icon: 'cicd' },
  { id: '3', provider_key: 'plaid', user_id: '', status: 'not_connected', connected_at: null, last_used_at: null, display_name: 'Plaid', icon: 'plaid' },
  { id: '4', provider_key: 'stripe', user_id: '', status: 'not_connected', connected_at: null, last_used_at: null, display_name: 'Stripe', icon: 'stripe' },
  { id: '5', provider_key: 'healthkit', user_id: '', status: 'not_connected', connected_at: null, last_used_at: null, display_name: 'HealthKit', icon: 'heart' },
]

export const MOCK_MODULES: ModuleConfig[] = [
  { id: '1', module_key: 'projects', name: 'Developer Projects', description: 'Roadmaps, tickets, PRs, CI', recommended: true },
  { id: '2', module_key: 'content', name: 'Content', description: 'Content pipeline, publishing', recommended: true },
  { id: '3', module_key: 'finance', name: 'Finance', description: 'Transactions, reconciliation', recommended: false },
  { id: '4', module_key: 'health', name: 'Health', description: 'Habits, training, recovery', recommended: false },
]

export const MOCK_CRONJOB_TEMPLATES: CronjobTemplate[] = [
  {
    id: 'weekly-content',
    name: 'Weekly Content Ideas',
    description: 'Suggests content ideas every Monday. Requires approval before adding to pipeline.',
    schedule: '0 9 * * 1',
    target_type: 'agent',
    target_id: 'content-ideas',
    default_inputs: { timezone: 'UTC', max_suggestions: 5 },
    permissions: ['read_calendar', 'suggest_content'],
    safety_rails: { max_actions: 10, require_approval: true },
    retry_policy: { max_retries: 2, backoff: 'exponential' },
  },
  {
    id: 'daily-sync',
    name: 'Daily Sync',
    description: 'Syncs data from connected integrations daily at 6am.',
    schedule: '0 6 * * *',
    target_type: 'workflow',
    target_id: 'daily-sync',
    default_inputs: { timezone: 'UTC' },
    permissions: ['read_all'],
    safety_rails: { max_actions: 50 },
    retry_policy: { max_retries: 3, backoff: 'exponential' },
  },
  {
    id: 'finance-close',
    name: 'Finance Close',
    description: 'Runs finance reconciliation weekly. Requires approval for any writes.',
    schedule: '0 17 * * 5',
    target_type: 'agent',
    target_id: 'finance-close',
    default_inputs: { timezone: 'UTC' },
    permissions: ['read_finance', 'suggest'],
    safety_rails: { max_actions: 20, require_approval: true },
    retry_policy: { max_retries: 2 },
  },
]

export const MOCK_VIDEOS: TutorialVideo[] = [
  { id: 'v1', title: 'Welcome to LifeOps', description: 'Overview of the platform', thumbnail_url: '', video_url: '', duration_seconds: 120 },
  { id: 'v2', title: 'Connecting Integrations', description: 'How to connect GitHub, Stripe, and more', thumbnail_url: '', video_url: '', duration_seconds: 180 },
  { id: 'v3', title: 'Creating Your First Cronjob', description: 'Set up automated workflows', thumbnail_url: '', video_url: '', duration_seconds: 240 },
]
