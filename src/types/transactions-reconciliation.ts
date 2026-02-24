/**
 * Transactions & Reconciliation types.
 * Data models for transactions, accounts, categories, tags, rules,
 * reconciliation, exports, and audit logs.
 */

export type ReconciliationStatus = 'unreconciled' | 'matched' | 'archived'

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  currency: string
  accountId: string
  merchant: string
  categoryId?: string
  tagIds: string[]
  reconciled: boolean
  reconciliationStatus: ReconciliationStatus
  source: string
  runId?: string
  confidence?: number
  notes?: string
  isAnomalous?: boolean
  category?: Category
  account?: Account
  tags?: Tag[]
}

export interface Account {
  id: string
  name: string
  type: string
  bank?: string
  last4?: string
  provider?: string
  currency?: string
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface RuleCondition {
  field: string
  operator: string
  value: string | number
}

export interface RuleAction {
  type: 'categorize' | 'tag' | 'flag_anomaly'
  value?: string
}

export interface Rule {
  id: string
  name: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  isActive: boolean
}

export interface Run {
  id: string
  type: string
  status: 'pending' | 'running' | 'success' | 'failed'
  startedAt: string
  finishedAt?: string
  artifacts?: string[]
}

export interface ExportJob {
  id: string
  format: 'csv' | 'excel' | 'json' | 'artifact'
  status: 'pending' | 'running' | 'complete' | 'failed'
  progress?: number
  createdAt: string
  completedAt?: string
  downloadUrl?: string
}

export interface ReconciliationMatch {
  transactionId: string
  statementItemId: string
  score: number
  ruleAppliedId?: string
}

export interface StatementItem {
  id: string
  date: string
  amount: number
  description: string
  reconciledWithTransactionId?: string
}

export interface AuditLog {
  id: string
  action: string
  userId: string
  timestamp: string
  details?: Record<string, unknown>
}

export interface ReconciliationMetrics {
  total: number
  unreconciled: number
  matched: number
  archived: number
  anomalyCount: number
  byCategory: { categoryId: string; categoryName: string; count: number }[]
}

export interface TransactionFilters {
  dateFrom?: string
  dateTo?: string
  accountIds?: string[]
  categoryIds?: string[]
  tagIds?: string[]
  status?: ReconciliationStatus
  amountMin?: number
  amountMax?: number
  searchQuery?: string
  source?: string
  runId?: string
  page?: number
  limit?: number
}

export interface BulkCategorizePayload {
  transactionIds: string[]
  categoryId: string
  note?: string
}

export interface BulkTagPayload {
  transactionIds: string[]
  tagId: string
}

export interface BulkReconcilePayload {
  transactionIds: string[]
  statementItemId?: string
}

export interface ExportPayload {
  format: 'csv' | 'excel' | 'json' | 'artifact'
  fields: string[]
  filterIds?: string[]
}
