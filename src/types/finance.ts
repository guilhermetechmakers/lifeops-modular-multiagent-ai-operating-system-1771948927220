/**
 * Finance Dashboard types.
 * Data models for accounts, transactions, categories, subscriptions,
 * anomalies, forecasts, monthly close, cronjobs, approvals, connectors.
 */

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  last_updated: string
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface Transaction {
  id: string
  account_id: string
  date: string
  amount: number
  category_id: string
  merchant: string
  description: string
  status: 'pending' | 'posted' | 'reconciled'
  is_anomalous: boolean
  created_at: string
  category?: Category
}

export interface Subscription {
  id: string
  user_id: string
  product: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  renewal_date: string
  next_billing_amount: number
  churn_score: number
}

export interface Anomaly {
  id: string
  transaction_id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  detected_at: string
  resolved_at?: string
  assigned_agent_id?: string
  notes?: string
  transaction?: Transaction
}

export interface ForecastPoint {
  month: string
  value: number
  confidence_low?: number
  confidence_high?: number
}

export interface Forecast {
  id: string
  horizon_months: number
  scenario: 'baseline' | 'optimistic' | 'pessimistic'
  value: number
  confidence: number
  created_at: string
  points?: ForecastPoint[]
}

export interface ChecklistItem {
  id: string
  closure_id: string
  item: string
  status: 'pending' | 'in_progress' | 'complete'
  due_date: string
}

export interface MonthlyClosure {
  id: string
  period_start: string
  period_end: string
  status: 'draft' | 'in_progress' | 'complete'
  checklist_items: ChecklistItem[]
}

export interface CronJob {
  id: string
  name: string
  enabled: boolean
  schedule: string
  timezone: string
  trigger_type: 'time' | 'event' | 'conditional'
  target_type: string
  input_payload: string
  last_run_at?: string
  next_run_at?: string
  last_run_outcome?: 'success' | 'failed' | 'skipped'
  permissions?: string
  constraints?: Record<string, unknown>
  safety_rails?: Record<string, unknown>
  retry_policy?: { maxRetries: number; backoffMs: number }
}

export interface Approval {
  id: string
  cronjob_id: string
  status: 'pending' | 'approved' | 'rejected'
  requested_by: string
  requested_at: string
  comments?: string
}

export interface Connector {
  id: string
  name: string
  provider: 'github' | 'plaid' | 'stripe' | 'healthkit' | 'ci_cd' | 'cicd'
  oauth_status: 'connected' | 'disconnected' | 'expired' | 'pending'
  last_sync?: string
}

export interface FinanceDashboardData {
  balance: number
  netIncome: number
  cashFlow: number
  balanceTrend: number
  netIncomeTrend: number
  cashFlowTrend: number
  pendingCategorization?: number
  anomalyCount?: number
}

/** @deprecated Use FinanceDashboardData */
export type FinanceDashboardMetrics = FinanceDashboardData

export interface TransactionEditPayload {
  categoryId?: string
  note?: string
  status?: Transaction['status']
}
