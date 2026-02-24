/**
 * RunHistoryPage - Searchable, paginated index of workflow and cronjob runs.
 * 12-column grid, filters bar, run table, pagination, bulk actions.
 */

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRuns } from '@/hooks/use-runs'
import {
  FiltersBar,
  RunTable,
  PaginationBar,
  BulkActionsPanel,
} from '@/components/run-history'

export function RunHistoryPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  const {
    data,
    total,
    page,
    pageSize,
    params,
    isLoading,
    error,
    refetch,
    setPage,
    setPageSize,
    setFilters,
    rerun,
    bulkAction,
  } = useRuns({ page: 1, pageSize: 20 })

  const runs = data ?? []

  const handleRerun = useCallback(
    async (id: string) => {
      try {
        const updated = await rerun(id)
        if (updated) {
          toast.success('Run queued for re-execution')
          refetch()
        } else {
          toast.error('Failed to re-run')
        }
      } catch {
        toast.error('Failed to re-run')
      }
    },
    [rerun, refetch]
  )

  const handleBulkRerun = useCallback(async () => {
    if (selectedIds.length === 0) return
    setIsBulkLoading(true)
    try {
      const result = await bulkAction('rerun', selectedIds)
      toast.success(`${result.success} run(s) queued for re-execution`)
      if (result.failed > 0) {
        toast.warning(`${result.failed} could not be processed`)
      }
      setSelectedIds([])
      refetch()
    } catch {
      toast.error('Bulk re-run failed')
    } finally {
      setIsBulkLoading(false)
    }
  }, [selectedIds, bulkAction, refetch])

  const handleBulkExport = useCallback(async () => {
    if (selectedIds.length === 0) return
    setIsBulkLoading(true)
    try {
      const result = await bulkAction('export', selectedIds)
      toast.success(`Exported ${result.success} run(s)`)
      if (result.exportedUrl) {
        window.open(result.exportedUrl, '_blank')
      }
      setSelectedIds([])
    } catch {
      toast.error('Export failed')
    } finally {
      setIsBulkLoading(false)
    }
  }, [selectedIds, bulkAction])

  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-3xl font-bold">Run History</h1>
        <p className="text-muted-foreground mt-1">
          Browse and inspect past runs. Re-run when allowed.
        </p>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="py-4">
            <p className="text-destructive">{error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <FiltersBar
            filters={params}
            onFiltersChange={setFilters}
            onRefresh={refetch}
            isLoading={isLoading}
          />
          {selectedIds.length > 0 && (
            <BulkActionsPanel
              selectedCount={selectedIds.length}
              onRerun={handleBulkRerun}
              onExportLogs={handleBulkExport}
              onClearSelection={() => setSelectedIds([])}
              isLoading={isBulkLoading}
            />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <RunTable
            runs={runs}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRerun={handleRerun}
            isLoading={isLoading}
          />
          {runs.length > 0 && (
            <PaginationBar
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s)
                setPage(1)
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
