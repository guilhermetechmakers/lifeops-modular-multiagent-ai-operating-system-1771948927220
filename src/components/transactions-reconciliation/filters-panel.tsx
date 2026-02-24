/**
 * FiltersPanel - Date range, accounts, categories, tags, status, amount range, search.
 */

import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type {
  TransactionFilters,
  ReconciliationStatus,
  Account,
  Category,
  Tag,
} from '@/types/transactions-reconciliation'

export interface FiltersPanelProps {
  filters: TransactionFilters
  accounts: Account[]
  categories: Category[]
  tags: Tag[]
  onFiltersChange: (updates: Partial<TransactionFilters>) => void
  className?: string
}

const STATUS_OPTIONS: { value: ReconciliationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'unreconciled', label: 'Unreconciled' },
  { value: 'matched', label: 'Matched' },
  { value: 'archived', label: 'Archived' },
]

export function FiltersPanel({
  filters,
  accounts = [],
  categories = [],
  tags = [],
  onFiltersChange,
  className,
}: FiltersPanelProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ searchQuery: e.target.value || undefined, page: 1 })
    },
    [onFiltersChange]
  )

  const handleDateFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ dateFrom: e.target.value || undefined, page: 1 })
    },
    [onFiltersChange]
  )

  const handleDateToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ dateTo: e.target.value || undefined, page: 1 })
    },
    [onFiltersChange]
  )

  const handleAccountChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        onFiltersChange({ accountIds: undefined, page: 1 })
      } else {
        onFiltersChange({ accountIds: [value], page: 1 })
      }
    },
    [onFiltersChange]
  )

  const handleCategoryChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        onFiltersChange({ categoryIds: undefined, page: 1 })
      } else {
        onFiltersChange({ categoryIds: [value], page: 1 })
      }
    },
    [onFiltersChange]
  )

  const handleTagChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        onFiltersChange({ tagIds: undefined, page: 1 })
      } else {
        onFiltersChange({ tagIds: [value], page: 1 })
      }
    },
    [onFiltersChange]
  )

  const handleStatusChange = useCallback(
    (value: string) => {
      onFiltersChange({
        status: value === 'all' ? undefined : (value as ReconciliationStatus),
        page: 1,
      })
    },
    [onFiltersChange]
  )

  const handleAmountMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      const num = v === '' ? undefined : Number(v)
      onFiltersChange({
        amountMin: num != null && !Number.isNaN(num) ? num : undefined,
        page: 1,
      })
    },
    [onFiltersChange]
  )

  const handleAmountMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      const num = v === '' ? undefined : Number(v)
      onFiltersChange({
        amountMax: num != null && !Number.isNaN(num) ? num : undefined,
        page: 1,
      })
    },
    [onFiltersChange]
  )

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      searchQuery: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      accountIds: undefined,
      categoryIds: undefined,
      tagIds: undefined,
      status: undefined,
      amountMin: undefined,
      amountMax: undefined,
      page: 1,
    })
  }, [onFiltersChange])

  const hasActiveFilters =
    (filters.searchQuery?.length ?? 0) > 0 ||
    filters.dateFrom != null ||
    filters.dateTo != null ||
    (filters.accountIds?.length ?? 0) > 0 ||
    (filters.categoryIds?.length ?? 0) > 0 ||
    (filters.tagIds?.length ?? 0) > 0 ||
    filters.status != null ||
    filters.amountMin != null ||
    filters.amountMax != null

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            placeholder="Search description, merchant..."
            value={filters.searchQuery ?? ''}
            onChange={handleSearchChange}
            className="pl-9"
            aria-label="Search transactions"
          />
        </div>
        <div className="col-span-6 md:col-span-2">
          <Input
            type="date"
            placeholder="From"
            value={filters.dateFrom ?? ''}
            onChange={handleDateFromChange}
            aria-label="Date from"
          />
        </div>
        <div className="col-span-6 md:col-span-2">
          <Input
            type="date"
            placeholder="To"
            value={filters.dateTo ?? ''}
            onChange={handleDateToChange}
            aria-label="Date to"
          />
        </div>
        <div className="col-span-6 md:col-span-2">
          <Select
            value={filters.accountIds?.[0] ?? 'all'}
            onValueChange={handleAccountChange}
          >
            <SelectTrigger aria-label="Filter by account">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {(accounts ?? []).map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-6 md:col-span-2">
          <Select
            value={filters.categoryIds?.[0] ?? 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-6 md:col-span-2">
          <Select value={filters.tagIds?.[0] ?? 'all'} onValueChange={handleTagChange}>
            <SelectTrigger aria-label="Filter by tag">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {(tags ?? []).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-6 md:col-span-2">
          <Select
            value={filters.status ?? 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {(STATUS_OPTIONS ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-6 md:col-span-2">
          <Input
            type="number"
            placeholder="Min amount"
            value={filters.amountMin ?? ''}
            onChange={handleAmountMinChange}
            aria-label="Minimum amount"
          />
        </div>
        <div className="col-span-6 md:col-span-2">
          <Input
            type="number"
            placeholder="Max amount"
            value={filters.amountMax ?? ''}
            onChange={handleAmountMaxChange}
            aria-label="Maximum amount"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground gap-1"
          aria-label="Clear all filters"
        >
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
