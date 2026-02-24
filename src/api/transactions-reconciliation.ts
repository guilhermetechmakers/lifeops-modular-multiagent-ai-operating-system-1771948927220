/**
 * Transactions & Reconciliation API layer.
 * Uses mock data for prototyping; replace with real API when backend is ready.
 */

import type {
  Transaction,
  Account,
  Category,
  Tag,
  Rule,
  Run,
  ExportJob,
  StatementItem,
  AuditLog,
  ReconciliationMetrics,
  TransactionFilters,
  BulkCategorizePayload,
  BulkTagPayload,
  BulkReconcilePayload,
  ExportPayload,
} from '@/types/transactions-reconciliation'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

// --- Mock data ---

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Food & Dining', color: '#4F8CFF' },
  { id: 'cat2', name: 'Shopping', color: '#5ED36D' },
  { id: 'cat3', name: 'Transport', color: '#FFD66C' },
  { id: 'cat4', name: 'Utilities', color: '#EF6464' },
  { id: 'cat5', name: 'Entertainment', color: '#9B8BFF' },
]

const MOCK_TAGS: Tag[] = [
  { id: 'tag1', name: 'Business', color: '#4F8CFF' },
  { id: 'tag2', name: 'Personal', color: '#5ED36D' },
  { id: 'tag3', name: 'Tax Deductible', color: '#FFD66C' },
]

const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Checking', type: 'checking', bank: 'Chase', last4: '1234', provider: 'plaid', currency: 'USD' },
  { id: 'acc2', name: 'Savings', type: 'savings', bank: 'Chase', last4: '5678', provider: 'plaid', currency: 'USD' },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    date: new Date().toISOString().slice(0, 10),
    description: 'Groceries',
    amount: -45.99,
    currency: 'USD',
    accountId: 'acc1',
    merchant: 'Whole Foods',
    categoryId: 'cat1',
    tagIds: ['tag2'],
    reconciled: false,
    reconciliationStatus: 'unreconciled',
    source: 'plaid',
    confidence: 0.95,
    category: MOCK_CATEGORIES[0],
    account: MOCK_ACCOUNTS[0],
    tags: [MOCK_TAGS[1]],
  },
  {
    id: 'tx2',
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    description: 'Ride',
    amount: -12.5,
    currency: 'USD',
    accountId: 'acc1',
    merchant: 'Uber',
    categoryId: 'cat3',
    tagIds: [],
    reconciled: true,
    reconciliationStatus: 'matched',
    source: 'plaid',
    confidence: 0.98,
    category: MOCK_CATEGORIES[2],
    account: MOCK_ACCOUNTS[0],
    tags: [],
  },
  {
    id: 'tx3',
    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    description: 'Salary',
    amount: 3200,
    currency: 'USD',
    accountId: 'acc1',
    merchant: 'Employer',
    categoryId: 'cat1',
    tagIds: ['tag1'],
    reconciled: false,
    reconciliationStatus: 'unreconciled',
    source: 'plaid',
    confidence: 1,
    category: MOCK_CATEGORIES[0],
    account: MOCK_ACCOUNTS[0],
    tags: [MOCK_TAGS[0]],
  },
  {
    id: 'tx4',
    date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    description: 'Large purchase',
    amount: -899.99,
    currency: 'USD',
    accountId: 'acc1',
    merchant: 'Unknown Vendor',
    categoryId: 'cat2',
    tagIds: [],
    reconciled: false,
    reconciliationStatus: 'unreconciled',
    source: 'plaid',
    confidence: 0.6,
    isAnomalous: true,
    category: MOCK_CATEGORIES[1],
    account: MOCK_ACCOUNTS[0],
    tags: [],
  },
  {
    id: 'tx5',
    date: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10),
    description: 'Subscription',
    amount: -89,
    currency: 'USD',
    accountId: 'acc1',
    merchant: 'Netflix',
    categoryId: 'cat5',
    tagIds: ['tag2'],
    reconciled: true,
    reconciliationStatus: 'matched',
    source: 'plaid',
    confidence: 0.99,
    category: MOCK_CATEGORIES[4],
    account: MOCK_ACCOUNTS[0],
    tags: [MOCK_TAGS[1]],
  },
]

const MOCK_RULES: Rule[] = [
  {
    id: 'rule1',
    name: 'Netflix → Entertainment',
    conditions: [{ field: 'merchant', operator: 'contains', value: 'Netflix' }],
    actions: [{ type: 'categorize', value: 'cat5' }],
    isActive: true,
  },
  {
    id: 'rule2',
    name: 'Large amounts → Flag anomaly',
    conditions: [{ field: 'amount', operator: 'lt', value: -500 }],
    actions: [{ type: 'flag_anomaly' }],
    isActive: true,
  },
]

// --- API functions ---

export async function fetchTransactions(params?: TransactionFilters): Promise<{ data: Transaction[]; count: number }> {
  if (USE_MOCK) {
    let items = [...MOCK_TRANSACTIONS]
    if (params?.accountIds?.length) {
      items = items.filter((t) => params.accountIds?.includes(t.accountId))
    }
    if (params?.categoryIds?.length) {
      items = items.filter((t) => t.categoryId && params.categoryIds?.includes(t.categoryId))
    }
    if (params?.status) {
      items = items.filter((t) => t.reconciliationStatus === params.status)
    }
    if (params?.searchQuery) {
      const q = params.searchQuery.toLowerCase()
      items = items.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    }
    const page = params?.page ?? 1
    const limit = params?.limit ?? 20
    const start = (page - 1) * limit
    const paginated = items.slice(start, start + limit)
    return { data: paginated, count: items.length }
  }
  const q = new URLSearchParams()
  if (params?.dateFrom) q.set('dateFrom', params.dateFrom)
  if (params?.dateTo) q.set('dateTo', params.dateTo)
  if (params?.accountIds?.length) params.accountIds.forEach((id) => q.append('accountId', id))
  if (params?.categoryIds?.length) params.categoryIds.forEach((id) => q.append('categoryId', id))
  if (params?.tagIds?.length) params.tagIds.forEach((id) => q.append('tagId', id))
  if (params?.status) q.set('status', params.status)
  if (params?.amountMin != null) q.set('amountMin', String(params.amountMin))
  if (params?.amountMax != null) q.set('amountMax', String(params.amountMax))
  if (params?.searchQuery) q.set('search', params.searchQuery)
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  const res = await apiGet<{ data?: Transaction[]; count?: number } | Transaction[]>(
    `/transactions?${q}`
  )
  const data = res as { data?: Transaction[]; count?: number }
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
  const count = typeof data?.count === 'number' ? data.count : list.length
  return { data: list, count }
}

export async function bulkCategorize(payload: BulkCategorizePayload): Promise<void> {
  if (USE_MOCK) {
    payload.transactionIds.forEach((id) => {
      const t = MOCK_TRANSACTIONS.find((x) => x.id === id)
      if (t) t.categoryId = payload.categoryId
    })
    return
  }
  await apiPost('/transactions/bulkCategorize', payload)
}

export async function bulkTag(payload: BulkTagPayload): Promise<void> {
  if (USE_MOCK) {
    payload.transactionIds.forEach((id) => {
      const t = MOCK_TRANSACTIONS.find((x) => x.id === id)
      if (t && !t.tagIds.includes(payload.tagId)) t.tagIds = [...(t.tagIds ?? []), payload.tagId]
    })
    return
  }
  await apiPost('/transactions/bulkTag', payload)
}

export async function bulkReconcile(payload: BulkReconcilePayload): Promise<void> {
  if (USE_MOCK) {
    payload.transactionIds.forEach((id) => {
      const t = MOCK_TRANSACTIONS.find((x) => x.id === id)
      if (t) {
        t.reconciled = true
        t.reconciliationStatus = 'matched'
      }
    })
    return
  }
  await apiPost('/transactions/bulkReconcile', payload)
}

export async function fetchAccounts(): Promise<Account[]> {
  if (USE_MOCK) return MOCK_ACCOUNTS
  const res = await apiGet<Account[] | { data: Account[] }>('/accounts')
  const data = res as { data?: Account[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) return MOCK_CATEGORIES
  const res = await apiGet<Category[] | { data: Category[] }>('/categories')
  const data = res as { data?: Category[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchTags(): Promise<Tag[]> {
  if (USE_MOCK) return MOCK_TAGS
  const res = await apiGet<Tag[] | { data: Tag[] }>('/tags')
  const data = res as { data?: Tag[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function fetchRules(): Promise<Rule[]> {
  if (USE_MOCK) return MOCK_RULES
  const res = await apiGet<Rule[] | { data: Rule[] }>('/rules')
  const data = res as { data?: Rule[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function createRule(rule: Omit<Rule, 'id'>): Promise<Rule> {
  if (USE_MOCK) {
    const newRule: Rule = { ...rule, id: `rule${Date.now()}` }
    MOCK_RULES.push(newRule)
    return newRule
  }
  const res = await apiPost<Rule | { data: Rule }>('/rules', rule)
  const data = res as { data?: Rule }
  return data?.data ?? (res as Rule)
}

export async function updateRule(id: string, rule: Partial<Rule>): Promise<Rule> {
  if (USE_MOCK) {
    const idx = MOCK_RULES.findIndex((r) => r.id === id)
    if (idx >= 0) {
      MOCK_RULES[idx] = { ...MOCK_RULES[idx], ...rule }
      return MOCK_RULES[idx]
    }
    throw new Error('Not found')
  }
  const res = await apiPut<Rule | { data: Rule }>(`/rules/${id}`, rule)
  const data = res as { data?: Rule }
  return data?.data ?? (res as Rule)
}

export async function deleteRule(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_RULES.findIndex((r) => r.id === id)
    if (idx >= 0) MOCK_RULES.splice(idx, 1)
    return
  }
  await apiDelete(`/rules/${id}`)
}

export async function createExport(payload: ExportPayload): Promise<ExportJob> {
  if (USE_MOCK) {
    return {
      id: `exp${Date.now()}`,
      format: payload.format,
      status: 'complete',
      progress: 100,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      downloadUrl: '#',
    }
  }
  const res = await apiPost<ExportJob | { data: ExportJob }>('/exports', payload)
  const data = res as { data?: ExportJob }
  return data?.data ?? (res as ExportJob)
}

export async function fetchRun(runId: string): Promise<Run | null> {
  if (USE_MOCK) {
    return {
      id: runId,
      type: 'reconciliation',
      status: 'success',
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      finishedAt: new Date().toISOString(),
      artifacts: [],
    }
  }
  const res = await apiGet<Run | { data: Run }>(`/runs/${runId}`)
  const data = res as { data?: Run }
  return data?.data ?? (res as Run) ?? null
}

export async function fetchAuditLogs(transactionId?: string): Promise<AuditLog[]> {
  if (USE_MOCK) return []
  const q = transactionId ? `?transactionId=${transactionId}` : ''
  const res = await apiGet<AuditLog[] | { data: AuditLog[] }>(`/audit/logs${q}`)
  const data = res as { data?: AuditLog[] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(res) ? res : []
}

export async function createReconciliationMatch(
  transactionId: string,
  statementItemId: string,
  reason?: string
): Promise<void> {
  if (USE_MOCK) {
    const t = MOCK_TRANSACTIONS.find((x) => x.id === transactionId)
    if (t) {
      t.reconciled = true
      t.reconciliationStatus = 'matched'
    }
    return
  }
  await apiPost('/reconciliation/match', { transactionId, statementItemId, reason })
}

export async function fetchReconciliationMetrics(): Promise<ReconciliationMetrics> {
  if (USE_MOCK) {
    const txs = MOCK_TRANSACTIONS ?? []
    return {
      total: txs.length,
      unreconciled: txs.filter((t) => t.reconciliationStatus === 'unreconciled').length,
      matched: txs.filter((t) => t.reconciliationStatus === 'matched').length,
      archived: txs.filter((t) => t.reconciliationStatus === 'archived').length,
      anomalyCount: txs.filter((t) => t.isAnomalous).length,
      byCategory: (MOCK_CATEGORIES ?? []).map((c) => ({
        categoryId: c.id,
        categoryName: c.name,
        count: txs.filter((t) => t.categoryId === c.id).length,
      })),
    }
  }
  const res = await apiGet<ReconciliationMetrics | { data: ReconciliationMetrics }>(
    '/transactions/metrics'
  )
  const data = res as { data?: ReconciliationMetrics }
  return data?.data ?? (res as ReconciliationMetrics)
}
