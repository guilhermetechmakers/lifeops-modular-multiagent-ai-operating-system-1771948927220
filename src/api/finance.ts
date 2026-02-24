/**
 * Finance Dashboard API layer.
 * Uses mock data for prototyping; replace with real API when backend is ready.
 */

import type {
  Account,
  Transaction,
  Category,
  Subscription,
  Anomaly,
  Forecast,
  MonthlyClosure,
  ChecklistItem,
  CronJob,
  Approval,
  Connector,
  FinanceDashboardData,
  TransactionEditPayload,
} from '@/types/finance'
import { apiGet, apiPost, apiPatch } from '@/lib/api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Food & Dining', color: '#4F8CFF' },
  { id: 'cat2', name: 'Shopping', color: '#5ED36D' },
  { id: 'cat3', name: 'Transport', color: '#FFD66C' },
  { id: 'cat4', name: 'Utilities', color: '#EF6464' },
  { id: 'cat5', name: 'Entertainment', color: '#9B8BFF' },
]

const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Checking', type: 'checking', balance: 18500, currency: 'USD', last_updated: new Date().toISOString() },
  { id: 'acc2', name: 'Savings', type: 'savings', balance: 6000, currency: 'USD', last_updated: new Date().toISOString() },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx1', account_id: 'acc1', date: new Date().toISOString().slice(0, 10), amount: -45.99, category_id: 'cat1', merchant: 'Whole Foods', description: 'Groceries', status: 'posted', is_anomalous: false, created_at: new Date().toISOString(), category: MOCK_CATEGORIES[0] },
  { id: 'tx2', account_id: 'acc1', date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), amount: -12.50, category_id: 'cat3', merchant: 'Uber', description: 'Ride', status: 'posted', is_anomalous: false, created_at: new Date().toISOString(), category: MOCK_CATEGORIES[2] },
  { id: 'tx3', account_id: 'acc1', date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), amount: 3200, category_id: 'cat1', merchant: 'Employer', description: 'Salary', status: 'posted', is_anomalous: false, created_at: new Date().toISOString(), category: MOCK_CATEGORIES[0] },
  { id: 'tx4', account_id: 'acc1', date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10), amount: -899.99, category_id: 'cat2', merchant: 'Unknown Vendor', description: 'Large purchase', status: 'posted', is_anomalous: true, created_at: new Date().toISOString(), category: MOCK_CATEGORIES[1] },
  { id: 'tx5', account_id: 'acc1', date: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10), amount: -89.00, category_id: 'cat5', merchant: 'Netflix', description: 'Subscription', status: 'posted', is_anomalous: false, created_at: new Date().toISOString(), category: MOCK_CATEGORIES[4] },
]

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub1', user_id: 'u1', product: 'Netflix', status: 'active', renewal_date: new Date(Date.now() + 86400000 * 25).toISOString().slice(0, 10), next_billing_amount: 15.99, churn_score: 0.1 },
  { id: 'sub2', user_id: 'u1', product: 'Spotify', status: 'active', renewal_date: new Date(Date.now() + 86400000 * 12).toISOString().slice(0, 10), next_billing_amount: 9.99, churn_score: 0.3 },
  { id: 'sub3', user_id: 'u1', product: 'Adobe Creative', status: 'active', renewal_date: new Date(Date.now() + 86400000 * 45).toISOString().slice(0, 10), next_billing_amount: 54.99, churn_score: 0.6 },
]

const MOCK_ANOMALIES: Anomaly[] = [
  { id: 'an1', transaction_id: 'tx4', severity: 'high', detected_at: new Date().toISOString(), assigned_agent_id: 'agent1', notes: 'Unusual amount for category', transaction: MOCK_TRANSACTIONS[3] },
]

const MOCK_FORECAST_POINTS: { month: string; baseline: number; optimistic: number; pessimistic: number }[] = [
  { month: 'Mar', baseline: 18500, optimistic: 19200, pessimistic: 17800 },
  { month: 'Apr', baseline: 19100, optimistic: 20100, pessimistic: 18100 },
  { month: 'May', baseline: 19700, optimistic: 21000, pessimistic: 18400 },
  { month: 'Jun', baseline: 20300, optimistic: 21900, pessimistic: 18700 },
]

const MOCK_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'ci1', closure_id: 'mc1', item: 'Reconcile bank statements', status: 'complete', due_date: new Date().toISOString().slice(0, 10) },
  { id: 'ci2', closure_id: 'mc1', item: 'Review expense categories', status: 'in_progress', due_date: new Date().toISOString().slice(0, 10) },
  { id: 'ci3', closure_id: 'mc1', item: 'Approve anomaly resolutions', status: 'pending', due_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10) },
]

const MOCK_MONTHLY_CLOSURE: MonthlyClosure = {
  id: 'mc1',
  period_start: new Date(Date.now() - 86400000 * 30).toISOString().slice(0, 10),
  period_end: new Date().toISOString().slice(0, 10),
  status: 'in_progress',
  checklist_items: MOCK_CHECKLIST_ITEMS,
}

const MOCK_CRONJOBS: CronJob[] = [
  { id: 'cj1', name: 'Daily Transaction Sync', enabled: true, schedule: '0 6 * * *', timezone: 'UTC', trigger_type: 'time', target_type: 'plaid-sync', input_payload: '{}', permissions: 'read,write', constraints: {}, safety_rails: {}, retry_policy: { maxRetries: 3, backoffMs: 1000 }, last_run_at: new Date(Date.now() - 3600000).toISOString(), next_run_at: new Date(Date.now() + 86400000).toISOString(), last_run_outcome: 'success' },
  { id: 'cj2', name: 'Weekly Forecast', enabled: true, schedule: '0 9 * * 1', timezone: 'UTC', trigger_type: 'time', target_type: 'forecast', input_payload: '{}', permissions: 'read', constraints: {}, safety_rails: {}, retry_policy: { maxRetries: 2, backoffMs: 500 }, last_run_at: new Date(Date.now() - 86400000 * 2).toISOString(), next_run_at: new Date(Date.now() + 86400000 * 5).toISOString(), last_run_outcome: 'success' },
]

const MOCK_APPROVALS: Approval[] = [
  { id: 'ap1', cronjob_id: 'cj1', status: 'pending', requested_by: 'Finance Agent', requested_at: new Date().toISOString(), comments: 'Large batch sync requested' },
]

const MOCK_CONNECTORS: Connector[] = [
  { id: 'conn1', name: 'Plaid', provider: 'plaid', oauth_status: 'connected', last_sync: new Date(Date.now() - 3600000).toISOString() },
  { id: 'conn2', name: 'Stripe', provider: 'stripe', oauth_status: 'disconnected' },
  { id: 'conn3', name: 'GitHub', provider: 'github', oauth_status: 'connected', last_sync: new Date(Date.now() - 7200000).toISOString() },
]

// --- API functions ---

export async function fetchFinanceDashboard(): Promise<FinanceDashboardData> {
  if (USE_MOCK) {
    const totalBalance = MOCK_ACCOUNTS.reduce((s, a) => s + (a.balance ?? 0), 0)
    return {
      balance: totalBalance,
      netIncome: 2100,
      cashFlow: 450,
      balanceTrend: 2.4,
      netIncomeTrend: 5.2,
      cashFlowTrend: -1.1,
      pendingCategorization: 7,
      anomalyCount: (MOCK_ANOMALIES ?? []).filter((a) => !a.resolved_at).length,
    }
  }
  const res = await apiGet<FinanceDashboardData | { data: FinanceDashboardData }>('/finance/dashboard')
  const data = res as { data?: FinanceDashboardData }
  return data?.data ?? (res as FinanceDashboardData)
}

export async function fetchAccounts(): Promise<Account[]> {
  if (USE_MOCK) return MOCK_ACCOUNTS
  const res = await apiGet<Account[] | { data: Account[] }>('/finance/accounts')
  const data = res as { data?: Account[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchTransactions(params?: {
  accountId?: string
  from?: string
  to?: string
  category?: string
}): Promise<Transaction[]> {
  if (USE_MOCK) {
    let items = MOCK_TRANSACTIONS.map((t) => ({ ...t, category: MOCK_CATEGORIES.find((c) => c.id === t.category_id) }))
    if (params?.accountId) items = items.filter((t) => t.account_id === params.accountId)
    if (params?.category) items = items.filter((t) => t.category_id === params.category)
    return items
  }
  const q = new URLSearchParams()
  if (params?.accountId) q.set('accountId', params.accountId)
  if (params?.from) q.set('from', params.from)
  if (params?.to) q.set('to', params.to)
  if (params?.category) q.set('category', params.category)
  const res = await apiGet<Transaction[] | { data: Transaction[] }>(`/finance/transactions?${q}`)
  const data = res as { data?: Transaction[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function editTransaction(id: string, payload: TransactionEditPayload): Promise<Transaction> {
  if (USE_MOCK) {
    const idx = MOCK_TRANSACTIONS.findIndex((t) => t.id === id)
    if (idx >= 0) {
      if (payload.categoryId) MOCK_TRANSACTIONS[idx].category_id = payload.categoryId
      return { ...MOCK_TRANSACTIONS[idx], category: MOCK_CATEGORIES.find((c) => c.id === MOCK_TRANSACTIONS[idx].category_id) }
    }
    throw new Error('Not found')
  }
  const res = await apiPost<Transaction | { data: Transaction }>(`/finance/transactions/${id}/edit`, payload)
  const data = res as { data?: Transaction }
  return data?.data ?? (res as Transaction)
}

export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) return MOCK_CATEGORIES
  const res = await apiGet<Category[] | { data: Category[] }>('/finance/categories')
  const data = res as { data?: Category[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  if (USE_MOCK) return MOCK_SUBSCRIPTIONS
  const res = await apiGet<Subscription[] | { data: Subscription[] }>('/finance/subscriptions')
  const data = res as { data?: Subscription[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchAnomalies(): Promise<Anomaly[]> {
  if (USE_MOCK) {
    return MOCK_ANOMALIES.map((a) => ({
      ...a,
      transaction: MOCK_TRANSACTIONS.find((t) => t.id === a.transaction_id),
    }))
  }
  const res = await apiGet<Anomaly[] | { data: Anomaly[] }>('/finance/anomalies')
  const data = res as { data?: Anomaly[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function resolveAnomaly(id: string, notes?: string): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_ANOMALIES.find((x) => x.id === id)
    if (a) a.resolved_at = new Date().toISOString()
    return
  }
  await apiPost(`/finance/anomalies/${id}/resolve`, { notes })
}

export async function assignAnomalyAgent(id: string, agentId: string): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_ANOMALIES.find((x) => x.id === id)
    if (a) a.assigned_agent_id = agentId
    return
  }
  await apiPost(`/finance/anomalies/${id}/assign`, { agentId })
}

export async function fetchForecasts(params?: { scenario?: string; horizon?: string }): Promise<Forecast[]> {
  if (USE_MOCK) {
    const scenario = params?.scenario ?? 'baseline'
    const points = MOCK_FORECAST_POINTS.map((p: { month: string; baseline: number; optimistic: number; pessimistic: number }) => {
      const val = (p[scenario as keyof typeof p] as number) ?? p.baseline
      return {
        month: p.month,
        value: val,
        confidence_low: val * 0.95,
        confidence_high: val * 1.05,
      }
    })
    const lastVal = points[points.length - 1]?.value ?? 0
    return [
      {
        id: 'f1',
        horizon_months: 4,
        scenario: scenario as 'baseline' | 'optimistic' | 'pessimistic',
        value: lastVal,
        confidence: 0.85,
        created_at: new Date().toISOString(),
        points,
      },
    ]
  }
  const q = new URLSearchParams()
  if (params?.scenario) q.set('scenario', params.scenario)
  if (params?.horizon) q.set('horizon', params.horizon)
  const res = await apiGet<Forecast[] | { data: Forecast[] }>(`/finance/forecasts?${q}`)
  const data = res as { data?: Forecast[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchMonthlyClose(): Promise<MonthlyClosure | null> {
  if (USE_MOCK) return MOCK_MONTHLY_CLOSURE
  const res = await apiGet<MonthlyClosure | { data: MonthlyClosure }>('/finance/monthly-close')
  const data = res as { data?: MonthlyClosure }
  return data?.data ?? (res as MonthlyClosure) ?? null
}

export async function startMonthlyClose(): Promise<MonthlyClosure> {
  if (USE_MOCK) return MOCK_MONTHLY_CLOSURE
  const res = await apiPost<MonthlyClosure | { data: MonthlyClosure }>('/finance/monthly-close/start')
  const data = res as { data?: MonthlyClosure }
  return data?.data ?? (res as MonthlyClosure)
}

export async function updateChecklistItem(closureId: string, itemId: string, status: ChecklistItem['status']): Promise<void> {
  if (USE_MOCK) {
    const item = MOCK_CHECKLIST_ITEMS.find((c) => c.id === itemId && c.closure_id === closureId)
    if (item) (item as ChecklistItem).status = status
    return
  }
  await apiPatch(`/finance/monthly-close/${closureId}/items/${itemId}`, { status })
}

export async function fetchConnectors(): Promise<Connector[]> {
  if (USE_MOCK) return MOCK_CONNECTORS
  const res = await apiGet<Connector[] | { data: Connector[] }>('/integrations/connectors')
  const data = res as { data?: Connector[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function initiateOAuth(connectorId: string, redirectUri: string): Promise<{ url: string }> {
  if (USE_MOCK) {
    const conn = MOCK_CONNECTORS.find((c) => c.id === connectorId)
    if (conn) conn.oauth_status = 'pending'
    return { url: `https://oauth.example.com/authorize?client_id=lifeops&redirect_uri=${encodeURIComponent(redirectUri)}` }
  }
  const res = await apiPost<{ url: string } | { data: { url: string } }>(`/integrations/connectors/${connectorId}/oauth`, { redirect_uri: redirectUri })
  const data = res as { data?: { url: string } }
  return data?.data ?? (res as { url: string })
}

export async function fetchCronjobs(): Promise<CronJob[]> {
  if (USE_MOCK) return MOCK_CRONJOBS
  const res = await apiGet<CronJob[] | { data: CronJob[] }>('/cronjobs')
  const data = res as { data?: CronJob[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function triggerCronjob(id: string): Promise<void> {
  if (USE_MOCK) return
  await apiPost(`/cronjobs/${id}/trigger`)
}

export async function fetchApprovals(): Promise<Approval[]> {
  if (USE_MOCK) return MOCK_APPROVALS.filter((a) => a.status === 'pending')
  const res = await apiGet<Approval[] | { data: Approval[] }>('/approvals')
  const data = res as { data?: Approval[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function approveApproval(id: string): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (a) a.status = 'approved'
    return
  }
  await apiPost(`/approvals/${id}/approve`)
}

export async function rejectApproval(id: string, reason?: string): Promise<void> {
  if (USE_MOCK) {
    const a = MOCK_APPROVALS.find((x) => x.id === id)
    if (a) a.status = 'rejected'
    return
  }
  await apiPost(`/approvals/${id}/reject`, { reason })
}
