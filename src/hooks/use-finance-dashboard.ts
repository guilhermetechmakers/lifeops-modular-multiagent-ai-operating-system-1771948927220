/**
 * useFinanceDashboard - Data fetching and state for Finance Dashboard.
 */

import { useState, useCallback, useEffect } from 'react'
import type {
  Account,
  FinanceDashboardData,
  Transaction,
  Category,
  Subscription,
  Anomaly,
  Forecast,
  MonthlyClosure,
  CronJob,
  Approval,
  Connector,
  TransactionEditPayload,
} from '@/types/finance'
import {
  fetchFinanceDashboard,
  fetchAccounts,
  fetchTransactions,
  editTransaction,
  fetchCategories,
  fetchSubscriptions,
  fetchAnomalies,
  resolveAnomaly,
  assignAnomalyAgent,
  fetchForecasts,
  fetchMonthlyClose,
  startMonthlyClose,
  fetchCronjobs,
  triggerCronjob,
  fetchApprovals,
  approveApproval,
  rejectApproval,
  fetchConnectors,
  initiateOAuth,
} from '@/api/finance'

export interface TransactionFilters {
  accountId?: string
  from?: string
  to?: string
  category?: string
}

export function useFinanceDashboard() {
  const [dashboard, setDashboard] = useState<FinanceDashboardData | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [monthlyClose, setMonthlyClose] = useState<MonthlyClosure | null>(null)
  const [cronjobs, setCronjobs] = useState<CronJob[]>([])
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (txFilters?: TransactionFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const [
        dashRes,
        acctsRes,
        txRes,
        catsRes,
        subsRes,
        anomRes,
        foreRes,
        closeRes,
        cronRes,
        apprRes,
        connRes,
      ] = await Promise.all([
        fetchFinanceDashboard(),
        fetchAccounts(),
        fetchTransactions(txFilters),
        fetchCategories(),
        fetchSubscriptions(),
        fetchAnomalies(),
        fetchForecasts(),
        fetchMonthlyClose(),
        fetchCronjobs(),
        fetchApprovals(),
        fetchConnectors(),
      ])
      setDashboard(dashRes)
      setAccounts(Array.isArray(acctsRes) ? acctsRes : [])
      setTransactions(Array.isArray(txRes) ? txRes : [])
      setCategories(Array.isArray(catsRes) ? catsRes : [])
      setSubscriptions(Array.isArray(subsRes) ? subsRes : [])
      setAnomalies(Array.isArray(anomRes) ? anomRes : [])
      setForecasts(Array.isArray(foreRes) ? foreRes : [])
      setMonthlyClose(closeRes ?? null)
      setCronjobs(Array.isArray(cronRes) ? cronRes : [])
      setApprovals(Array.isArray(apprRes) ? apprRes : [])
      setConnectors(Array.isArray(connRes) ? connRes : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const refetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    const txRes = await fetchTransactions(filters)
    setTransactions(Array.isArray(txRes) ? txRes : [])
  }, [])

  const editTransactionItem = useCallback(
    async (id: string, payload: TransactionEditPayload) => {
      const updated = await editTransaction(id, payload)
      setTransactions((prev) => (prev ?? []).map((t) => (t.id === id ? updated : t)))
      return updated
    },
    []
  )

  const startClose = useCallback(async () => {
    const result = await startMonthlyClose()
    setMonthlyClose(result)
    return result
  }, [])

  const triggerCronjobRun = useCallback(async (id: string) => {
    await triggerCronjob(id)
    const cronRes = await fetchCronjobs()
    setCronjobs(Array.isArray(cronRes) ? cronRes : [])
  }, [])

  const approveItem = useCallback(async (id: string) => {
    await approveApproval(id)
    setApprovals((prev) => (prev ?? []).filter((a) => a.id !== id))
  }, [])

  const rejectItem = useCallback(async (id: string) => {
    await rejectApproval(id)
    setApprovals((prev) => (prev ?? []).filter((a) => a.id !== id))
  }, [])

  const triageAnomaly = useCallback(async (id: string, action: 'resolve' | 'assign') => {
    if (action === 'resolve') {
      await resolveAnomaly(id)
      setAnomalies((prev) => (prev ?? []).filter((a) => a.id !== id))
    } else {
      await assignAnomalyAgent(id, 'agent1')
      setAnomalies((prev) => (prev ?? []).map((a) => (a.id === id ? { ...a, assigned_agent_id: 'agent1' } : a)))
    }
  }, [])

  const initOAuth = useCallback(async (connectorId: string, _provider: string) => {
    const { url } = await initiateOAuth(connectorId, window.location.origin + '/dashboard/finance/integrations')
    window.location.href = url
  }, [])

  return {
    dashboard,
    accounts,
    transactions,
    categories,
    subscriptions,
    anomalies,
    forecasts,
    monthlyClose,
    cronjobs,
    approvals,
    connectors,
    isLoading,
    error,
    refetch: load,
    refetchTransactions,
    editTransactionItem,
    startClose,
    triggerCronjobRun,
    approveItem,
    rejectItem,
    triageAnomaly,
    initOAuth,
  }
}
