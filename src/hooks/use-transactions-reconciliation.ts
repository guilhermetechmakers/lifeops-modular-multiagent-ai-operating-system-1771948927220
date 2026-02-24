/**
 * useTransactionsReconciliation - Data fetching and state for Transactions & Reconciliation.
 */

import { useState, useCallback, useEffect } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import type {
  Transaction,
  Account,
  Category,
  Tag,
  Rule,
  ExportJob,
  ReconciliationMetrics,
  TransactionFilters,
  BulkCategorizePayload,
  BulkTagPayload,
  BulkReconcilePayload,
  ExportPayload,
} from '@/types/transactions-reconciliation'
import {
  fetchTransactions,
  fetchAccounts,
  fetchCategories,
  fetchTags,
  fetchRules,
  createRule,
  updateRule,
  deleteRule,
  createExport,
  bulkCategorize,
  bulkTag,
  bulkReconcile,
  fetchReconciliationMetrics,
} from '@/api/transactions-reconciliation'

const DEFAULT_FILTERS: TransactionFilters = {
  page: 1,
  limit: 20,
}

export function useTransactionsReconciliation() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [count, setCount] = useState(0)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [metrics, setMetrics] = useState<ReconciliationMetrics | null>(null)
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [exportStatus, setExportStatus] = useState<ExportJob | null>(null)

  const debouncedSearch = useDebounce(filters.searchQuery ?? '', 300)

  const loadTransactions = useCallback(
    async (f?: TransactionFilters) => {
      const params = { ...filters, ...f, searchQuery: debouncedSearch || filters.searchQuery }
      setError(null)
      try {
        const res = await fetchTransactions(params)
        const list = Array.isArray(res?.data) ? res.data : []
        const total = typeof res?.count === 'number' ? res.count : list.length
        setTransactions(list)
        setCount(total)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load transactions')
        setTransactions([])
        setCount(0)
      }
    },
    [filters, debouncedSearch]
  )

  const loadMetadata = useCallback(async () => {
    try {
      const [acctsRes, catsRes, tagsRes, rulesRes, metricsRes] = await Promise.all([
        fetchAccounts(),
        fetchCategories(),
        fetchTags(),
        fetchRules(),
        fetchReconciliationMetrics(),
      ])
      setAccounts(Array.isArray(acctsRes) ? acctsRes : [])
      setCategories(Array.isArray(catsRes) ? catsRes : [])
      setTags(Array.isArray(tagsRes) ? tagsRes : [])
      setRules(Array.isArray(rulesRes) ? rulesRes : [])
      setMetrics(metricsRes ?? null)
    } catch {
      setAccounts([])
      setCategories([])
      setTags([])
      setRules([])
      setMetrics(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    Promise.all([
      loadTransactions(filters),
      loadMetadata(),
    ])
      .then(() => {
        if (!cancelled) setIsLoading(false)
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filters.page, filters.limit, filters.accountIds, filters.categoryIds, filters.tagIds, filters.status, filters.dateFrom, filters.dateTo, debouncedSearch, loadTransactions, loadMetadata])


  const updateFilters = useCallback((updates: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleBulkCategorize = useCallback(
    async (payload: BulkCategorizePayload) => {
      setBulkLoading(true)
      try {
        await bulkCategorize(payload)
        await loadTransactions(filters)
        await loadMetadata()
      } finally {
        setBulkLoading(false)
      }
    },
    [filters]
  )

  const handleBulkTag = useCallback(
    async (payload: BulkTagPayload) => {
      setBulkLoading(true)
      try {
        await bulkTag(payload)
        await loadTransactions(filters)
      } finally {
        setBulkLoading(false)
      }
    },
    [filters]
  )

  const handleBulkReconcile = useCallback(
    async (payload: BulkReconcilePayload) => {
      setBulkLoading(true)
      try {
        await bulkReconcile(payload)
        await loadTransactions(filters)
        await loadMetadata()
      } finally {
        setBulkLoading(false)
      }
    },
    [filters]
  )

  const handleExport = useCallback(
    async (payload: ExportPayload) => {
      setExportStatus({ id: '', format: payload.format, status: 'running', createdAt: new Date().toISOString() })
      try {
        const job = await createExport(payload)
        setExportStatus(job)
        return job
      } catch {
        setExportStatus(null)
        throw new Error('Export failed')
      }
    },
    []
  )

  const handleCreateRule = useCallback(
    async (rule: Omit<Rule, 'id'>) => {
      const created = await createRule(rule)
      setRules((prev) => [...(prev ?? []), created])
      return created
    },
    []
  )

  const handleUpdateRule = useCallback(
    async (id: string, updates: Partial<Rule>) => {
      const updated = await updateRule(id, updates)
      setRules((prev) => (prev ?? []).map((r) => (r.id === id ? updated : r)))
      return updated
    },
    []
  )

  const handleDeleteRule = useCallback(async (id: string) => {
    await deleteRule(id)
    setRules((prev) => (prev ?? []).filter((r) => r.id !== id))
  }, [])

  return {
    transactions,
    count,
    accounts,
    categories,
    tags,
    rules,
    metrics,
    filters,
    isLoading,
    error,
    bulkLoading,
    exportStatus,
    updateFilters,
    loadTransactions,
    handleBulkCategorize,
    handleBulkTag,
    handleBulkReconcile,
    handleExport,
    handleCreateRule,
    handleUpdateRule,
    handleDeleteRule,
  }
}
