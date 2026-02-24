/**
 * FiltersBar - Global search, status, owner, cronjob, environment, date range, duration filters.
 */

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, RefreshCw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RunsListParams, RunStatus } from '@/types/runs'

export interface FiltersBarProps {
  filters: RunsListParams
  onFiltersChange: (filters: Partial<RunsListParams>) => void
  onRefresh?: () => void
  isLoading?: boolean
}

const STATUSES: { value: RunStatus; label: string }[] = [
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'running', label: 'Running' },
  { value: 'pending', label: 'Pending' },
  { value: 'canceled', label: 'Canceled' },
]

const ENVIRONMENTS = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
]

export function FiltersBar({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading,
}: FiltersBarProps) {
  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.environment ||
    filters.startDate ||
    filters.endDate

  const clearFilters = () => {
    onFiltersChange({
      search: undefined,
      status: undefined,
      environment: undefined,
      startDate: undefined,
      endDate: undefined,
      minDuration: undefined,
      maxDuration: undefined,
      page: 1,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search runs, cronjobs, workflows..."
            value={filters.search ?? ''}
            onChange={(e) =>
              onFiltersChange({ search: e.target.value || undefined, page: 1 })
            }
            className="pl-9"
            aria-label="Search runs"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={
              Array.isArray(filters.status)
                ? filters.status[0] ?? 'all'
                : filters.status ?? 'all'
            }
            onValueChange={(v) =>
              onFiltersChange({
                status: v === 'all' ? undefined : (v as RunStatus),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(STATUSES ?? []).map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.environment ?? 'all'}
            onValueChange={(v) =>
              onFiltersChange({
                environment: v === 'all' ? undefined : v,
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All envs</SelectItem>
              {(ENVIRONMENTS ?? []).map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Input
              type="date"
              value={filters.startDate ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  startDate: e.target.value || undefined,
                  page: 1,
                })
              }
              className="w-[140px]"
              aria-label="Start date"
            />
            <span className="text-muted-foreground text-sm">–</span>
            <Input
              type="date"
              value={filters.endDate ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  endDate: e.target.value || undefined,
                  page: 1,
                })
              }
              className="w-[140px]"
              aria-label="End date"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1"
              aria-label="Clear filters"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh"
            >
              <RefreshCw
                className={cn('h-4 w-4', isLoading && 'animate-spin')}
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
