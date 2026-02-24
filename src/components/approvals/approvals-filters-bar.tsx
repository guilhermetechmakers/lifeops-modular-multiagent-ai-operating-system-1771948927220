/**
 * ApprovalsFiltersBar - Filter controls for Approvals Queue.
 * Module, priority, requester, age, date range, search.
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
import { Search, RefreshCw, Download, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApprovalsListParams, ApprovalModule, ApprovalPriority } from '@/types/approvals'

export interface ApprovalsFiltersBarProps {
  filters: ApprovalsListParams
  onFiltersChange: (filters: Partial<ApprovalsListParams>) => void
  onRefresh?: () => void
  onExport?: () => void
  canCreate?: boolean
  onCreate?: () => void
  isLoading?: boolean
}

const MODULES: { value: ApprovalModule; label: string }[] = [
  { value: 'content', label: 'Content' },
  { value: 'finance', label: 'Finance' },
  { value: 'projects', label: 'Projects' },
  { value: 'health', label: 'Health' },
  { value: 'cronjob', label: 'Cronjob' },
  { value: 'release', label: 'Release' },
  { value: 'agent-change', label: 'Agent Change' },
]

const PRIORITIES: { value: ApprovalPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'pending-info', label: 'Pending Info' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
]

export function ApprovalsFiltersBar({
  filters,
  onFiltersChange,
  onRefresh,
  onExport,
  canCreate,
  onCreate,
  isLoading,
}: ApprovalsFiltersBarProps) {
  const hasActiveFilters =
    filters.module ||
    filters.priority ||
    filters.status ||
    filters.search

  const clearFilters = () => {
    onFiltersChange({
      module: undefined,
      priority: undefined,
      status: undefined,
      search: undefined,
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
            placeholder="Search approvals..."
            value={filters.search ?? ''}
            onChange={(e) => onFiltersChange({ search: e.target.value || undefined, page: 1 })}
            className="pl-9"
            aria-label="Search approvals"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.module ?? 'all'}
            onValueChange={(v) =>
              onFiltersChange({
                module: v === 'all' ? undefined : (v as ApprovalModule),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {(MODULES ?? []).map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.priority ?? 'all'}
            onValueChange={(v) =>
              onFiltersChange({
                priority: v === 'all' ? undefined : (v as ApprovalPriority),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {(PRIORITIES ?? []).map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(v) =>
              onFiltersChange({
                status: v === 'all' ? undefined : (v as ApprovalsListParams['status']),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[120px]">
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
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
              aria-label="Export"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          {canCreate && onCreate && (
            <Button size="sm" onClick={onCreate} className="gap-2">
              New Approval
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
