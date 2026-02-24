/**
 * FinanceDashboardPage - Financial control center.
 * Top metrics, transactions, subscriptions, anomalies, forecasting, monthly close.
 * Master Dashboard rail with cronjobs, approvals, health.
 */

import { useFinanceDashboard } from '@/hooks/use-finance-dashboard'
import {
  TopMetricsCard,
  TransactionsPanel,
  CategoriesOverview,
  SubscriptionsPanel,
  AnomaliesPanel,
  ForecastPanel,
  MonthlyClosePanel,
  QuickActionsBar,
  MasterDashboardMini,
} from '@/components/finance'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export function FinanceDashboardPage() {
  const {
    dashboard,
    transactions,
    categories,
    subscriptions,
    anomalies,
    forecasts,
    monthlyClose,
    cronjobs,
    approvals,
    isLoading,
    error,
    editTransactionItem,
    startClose,
    approveItem,
    rejectItem,
    triggerCronjobRun,
    triageAnomaly,
  } = useFinanceDashboard()

  const handleEditTransaction = async (
    id: string,
    payload: { categoryId?: string; note?: string }
  ) => {
    try {
      await editTransactionItem(id, { categoryId: payload.categoryId })
    } catch {
      toast.error('Failed to update transaction')
    }
  }

  const handleStartClose = async () => {
    try {
      await startClose()
      toast.success('Monthly close started')
    } catch {
      toast.error('Failed to start monthly close')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveItem(id)
      toast.success('Approved')
    } catch {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectItem(id)
      toast.success('Rejected')
    } catch {
      toast.error('Failed to reject')
    }
  }

  const handleTriggerCronjob = async (id: string) => {
    try {
      await triggerCronjobRun(id)
      toast.success('Cronjob triggered')
    } catch {
      toast.error('Failed to trigger cronjob')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Financial control center: accounts, categorization, subscriptions, anomalies, forecasting
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Top metrics */}
      <TopMetricsCard data={dashboard} isLoading={isLoading} />

      {/* Quick actions */}
      <QuickActionsBar />

      {/* Main content: 12-column grid with right rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="mt-4">
              <TransactionsPanel
                transactions={transactions ?? []}
                categories={categories ?? []}
                isLoading={isLoading}
                onEdit={handleEditTransaction}
              />
            </TabsContent>
            <TabsContent value="subscriptions" className="mt-4">
              <SubscriptionsPanel
                subscriptions={subscriptions ?? []}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="anomalies" className="mt-4">
              <AnomaliesPanel
                anomalies={anomalies ?? []}
                isLoading={isLoading}
                onTriage={(id, action) => void triageAnomaly(id, action)}
              />
            </TabsContent>
            <TabsContent value="forecast" className="mt-4">
              <ForecastPanel
                forecasts={forecasts ?? []}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>

          <div className="grid md:grid-cols-2 gap-6">
            <CategoriesOverview
              transactions={transactions ?? []}
              categories={categories ?? []}
              isLoading={isLoading}
            />
            <MonthlyClosePanel
              monthlyClose={monthlyClose}
              isLoading={isLoading}
              onStart={handleStartClose}
            />
          </div>
        </div>

        {/* Right rail: Master Dashboard Mini */}
        <div className="lg:col-span-4">
          <div className="sticky top-4">
            <MasterDashboardMini
              cronjobs={cronjobs ?? []}
              approvals={approvals ?? []}
              isLoading={isLoading}
              onApprove={handleApprove}
              onReject={handleReject}
              onTriggerCronjob={handleTriggerCronjob}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
