/**
 * TransactionTable - Sortable grid with pagination, selection, per-row actions.
 */

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Transaction, Category, Tag as TagType } from '@/types/transactions-reconciliation'

export type SortColumn =
  | 'date'
  | 'description'
  | 'amount'
  | 'account'
  | 'category'
  | 'reconciled'
  | 'confidence'
export type SortOrder = 'asc' | 'desc'

export interface TransactionTableProps {
  transactions: Transaction[]
  categories: Category[]
  tags: TagType[]
  isLoading?: boolean
  page?: number
  limit?: number
  count?: number
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onSingleAction?: (id: string, action: 'categorize' | 'tag' | 'reconcile') => void
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  sortColumn?: SortColumn
  sortOrder?: SortOrder
  onSort?: (column: SortColumn, order: SortOrder) => void
  onCategorize?: (id: string, categoryId: string) => void
}

export function TransactionTable({
  transactions = [],
  categories = [],
  tags = [],
  isLoading,
  page = 1,
  limit = 20,
  count = 0,
  selectedIds = [],
  onSelectionChange,
  onSingleAction,
  onPageChange,
  onLimitChange,
  sortColumn = 'date',
  sortOrder = 'desc',
  onSort,
  onCategorize,
}: TransactionTableProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editCategoryValue, setEditCategoryValue] = useState<string>('')

  const items = Array.isArray(transactions) ? transactions : []
  const totalPages = Math.max(1, Math.ceil(count / limit))

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === items.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map((t) => t.id))
    }
  }, [items, selectedIds.length, onSelectionChange])

  const handleSelectOne = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((x) => x !== id))
      } else {
        onSelectionChange([...selectedIds, id])
      }
    },
    [selectedIds, onSelectionChange]
  )

  const handleSortClick = useCallback(
    (col: SortColumn) => {
      if (!onSort) return
      const next = sortColumn === col && sortOrder === 'desc' ? 'asc' : 'desc'
      onSort(col, next)
    },
    [sortColumn, sortOrder, onSort]
  )

  const getCategoryName = (catId?: string) => {
    const cat = (categories ?? []).find((c) => c.id === catId)
    return cat?.name ?? 'Uncategorized'
  }

  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)

  const SortHeader = ({
    col,
    label,
    className,
  }: {
    col: SortColumn
    label: string
    className?: string
  }) => (
    <button
      type="button"
      onClick={() => handleSortClick(col)}
      className={cn(
        'flex items-center gap-1 font-medium hover:text-primary transition-colors',
        className
      )}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {sortColumn === col ? (
        sortOrder === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )
      ) : null}
    </button>
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Transactions</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {count} total · Page {page} of {totalPages}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => onLimitChange?.(Number(v))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="grid" aria-label="Transactions">
              <thead>
                <tr className="border-b border-border bg-muted/30 sticky top-0">
                  <th className="w-12 p-3 text-left">
                    <Checkbox
                      checked={items.length > 0 && selectedIds.length === items.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="p-3 text-left min-w-[100px]">
                    <SortHeader col="date" label="Date" />
                  </th>
                  <th className="p-3 text-left min-w-[180px]">
                    <SortHeader col="description" label="Description" />
                  </th>
                  <th className="p-3 text-right min-w-[100px]">
                    <SortHeader col="amount" label="Amount" />
                  </th>
                  <th className="p-3 text-left min-w-[120px]">Account</th>
                  <th className="p-3 text-left min-w-[120px]">
                    <SortHeader col="category" label="Category" />
                  </th>
                  <th className="p-3 text-left min-w-[100px]">Tags</th>
                  <th className="p-3 text-left min-w-[100px]">
                    <SortHeader col="reconciled" label="Status" />
                  </th>
                  <th className="p-3 text-left min-w-[80px]">Conf.</th>
                  <th className="p-3 text-right w-12">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-muted-foreground">
                      No transactions match your filters
                    </td>
                  </tr>
                ) : (
                  items.map((t) => (
                    <tr
                      key={t.id}
                      className={cn(
                        'border-b border-border hover:bg-muted/20 transition-colors',
                        selectedIds.includes(t.id) && 'bg-primary/5'
                      )}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedIds.includes(t.id)}
                          onCheckedChange={() => handleSelectOne(t.id)}
                          aria-label={`Select ${t.merchant}`}
                        />
                      </td>
                      <td className="p-3 text-sm">{t.date}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-sm">{t.merchant}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {t.description}
                          </p>
                        </div>
                      </td>
                      <td
                        className={cn(
                          'p-3 text-sm font-medium text-right',
                          t.amount >= 0 ? 'text-success' : 'text-destructive'
                        )}
                      >
                        {formatAmount(t.amount, t.currency ?? 'USD')}
                      </td>
                      <td className="p-3 text-sm">{t.account?.name ?? t.accountId}</td>
                      <td className="p-3">
                        {editingCategoryId === t.id ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={editCategoryValue}
                              onValueChange={setEditCategoryValue}
                            >
                              <SelectTrigger className="h-8 w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(categories ?? []).map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                onCategorize?.(t.id, editCategoryValue)
                                setEditingCategoryId(null)
                              }}
                            >
                              ✓
                            </Button>
                          </div>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs cursor-pointer"
                            onClick={() => {
                              setEditingCategoryId(t.id)
                              setEditCategoryValue(t.categoryId ?? '')
                            }}
                          >
                            {getCategoryName(t.categoryId)}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(t.tags ?? t.tagIds ?? []).map((tag) => {
                            const tagObj = typeof tag === 'string'
                              ? (tags ?? []).find((x) => x.id === tag)
                              : tag
                            return tagObj ? (
                              <Badge
                                key={tagObj.id}
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: tagObj.color }}
                              >
                                {tagObj.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            t.reconciliationStatus === 'matched'
                              ? 'default'
                              : t.reconciliationStatus === 'archived'
                                ? 'secondary'
                                : 'outline'
                          }
                          className={cn(
                            'text-xs',
                            t.reconciliationStatus === 'matched' && 'bg-success/20 text-success',
                            t.reconciliationStatus === 'unreconciled' && 'text-warning'
                          )}
                        >
                          {t.reconciliationStatus}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {t.isAnomalous ? (
                          <AlertTriangle className="h-4 w-4 text-warning" aria-label="Anomaly" />
                        ) : t.confidence != null ? (
                          <span className="text-xs text-muted-foreground">
                            {Math.round((t.confidence ?? 0) * 100)}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onSingleAction?.(t.id, 'categorize')}
                            >
                              Categorize
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSingleAction?.(t.id, 'tag')}>
                              Tag
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onSingleAction?.(t.id, 'reconcile')}
                            >
                              Reconcile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, count)} of {count}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
