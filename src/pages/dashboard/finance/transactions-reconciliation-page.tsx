/**
 * TransactionsReconciliationPage - Transaction ledger, reconciliation, rules, export.
 */

import { useState, useCallback } from 'react'
import { useTransactionsReconciliation } from '@/hooks/use-transactions-reconciliation'
import {
  TransactionTable,
  FiltersPanel,
  BulkActionsBar,
  ReconciliationWorkspace,
  RuleEnginePanel,
  ExportPanel,
  AnalyticsPanel,
} from '@/components/transactions-reconciliation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import type { SortColumn, SortOrder } from '@/components/transactions-reconciliation'

export function TransactionsReconciliationPage() {
  const {
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
  } = useTransactionsReconciliation()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortColumn, setSortColumn] = useState<SortColumn>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [statementItems] = useState<{ id: string; date: string; amount: number; description: string; reconciledWithTransactionId?: string }[]>([])

  const selectedTransactions = (transactions ?? []).filter((t) => selectedIds.includes(t.id))

  const handleBulkCategorizeSubmit = useCallback(
    (categoryId: string, note?: string) => {
      handleBulkCategorize({
        transactionIds: selectedIds,
        categoryId,
        note,
      })
      setSelectedIds([])
      toast.success('Transactions categorized')
    },
    [selectedIds, handleBulkCategorize]
  )

  const handleBulkTagSubmit = useCallback(
    (tagId: string) => {
      handleBulkTag({ transactionIds: selectedIds, tagId })
      setSelectedIds([])
      toast.success('Transactions tagged')
    },
    [selectedIds, handleBulkTag]
  )

  const handleBulkReconcileSubmit = useCallback(() => {
    handleBulkReconcile({ transactionIds: selectedIds })
    setSelectedIds([])
    toast.success('Transactions reconciled')
  }, [selectedIds, handleBulkReconcile])

  const handleExportSubmit = useCallback(() => {
    handleExport({
      format: 'csv',
      fields: ['date', 'description', 'amount', 'account', 'category', 'status'],
    })
    toast.success('Export started')
  }, [handleExport])

  const handleMatch = useCallback(
    (_transactionId: string, _statementItemId: string) => {
      // In a real app, call API
      toast.success('Match recorded')
      loadTransactions(filters)
    },
    [filters, loadTransactions]
  )

  const handleUnmatch = useCallback(
    (_transactionId: string) => {
      loadTransactions(filters)
    },
    [filters, loadTransactions]
  )

  const handleCategorize = useCallback(
    (id: string, categoryId: string) => {
      handleBulkCategorize({ transactionIds: [id], categoryId })
      toast.success('Transaction categorized')
    },
    [handleBulkCategorize]
  )

  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-3xl font-bold">Transactions & Reconciliation</h1>
        <p className="text-muted-foreground mt-1">
          Transaction ledger, categorization, reconciliation, rules, and export
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <FiltersPanel
        filters={filters}
        accounts={accounts}
        categories={categories}
        tags={tags}
        onFiltersChange={updateFilters}
      />

      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          categories={categories}
          tags={tags}
          onBulkCategorize={handleBulkCategorizeSubmit}
          onBulkTag={handleBulkTagSubmit}
          onBulkReconcile={handleBulkReconcileSubmit}
          onExport={handleExportSubmit}
          onClearSelection={() => setSelectedIds([])}
          isLoading={bulkLoading}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <TransactionTable
            transactions={transactions}
            categories={categories}
            tags={tags}
            isLoading={isLoading}
            page={filters.page ?? 1}
            limit={filters.limit ?? 20}
            count={count}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onPageChange={(p) => updateFilters({ page: p })}
            onLimitChange={(l) => updateFilters({ limit: l })}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={(col, order) => {
              setSortColumn(col)
              setSortOrder(order)
              loadTransactions({ ...filters, page: 1 })
            }}
            onCategorize={handleCategorize}
          />

          <Tabs defaultValue="rules" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rules" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Rule Engine
              </TabsTrigger>
              <TabsTrigger value="reconcile" className="gap-2">
                <FileText className="h-4 w-4" />
                Reconcile
              </TabsTrigger>
            </TabsList>
            <TabsContent value="rules" className="mt-4">
              <RuleEnginePanel
                rules={rules}
                categories={categories}
                onCreate={async (r) => { await handleCreateRule(r) }}
                onUpdate={async (id, u) => { await handleUpdateRule(id, u) }}
                onDelete={handleDeleteRule}
              />
            </TabsContent>
            <TabsContent value="reconcile" className="mt-4">
              <ReconciliationWorkspace
                selectedTransactions={selectedTransactions}
                statementItems={statementItems}
                onMatch={handleMatch}
                onUnmatch={handleUnmatch}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-4 space-y-6">
            <ExportPanel
              onExport={(format, fields) =>
                handleExport({ format, fields, filterIds: selectedIds.length ? selectedIds : undefined })
              }
              exportStatus={exportStatus}
            />
            <AnalyticsPanel metrics={metrics} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}
