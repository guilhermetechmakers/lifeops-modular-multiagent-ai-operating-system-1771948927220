/**
 * CronjobsSearchFilterBar - Debounced search, status, target type filters.
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
import type { CronjobsFilters } from '@/hooks/use-cronjobs'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'enabled', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'disabled', label: 'Disabled' },
]

const TARGET_OPTIONS = [
  { value: 'all', label: 'All targets' },
  { value: 'agent', label: 'Agent' },
  { value: 'template', label: 'Template' },
]

export interface CronjobsSearchFilterBarProps {
  filters: CronjobsFilters
  onFiltersChange: (updates: Partial<CronjobsFilters>) => void
  className?: string
}

export function CronjobsSearchFilterBar({
  filters,
  onFiltersChange,
  className,
}: CronjobsSearchFilterBarProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ search: e.target.value || undefined, page: 1 })
    },
    [onFiltersChange]
  )

  const handleStatusChange = useCallback(
    (value: string) => {
      onFiltersChange({
        status: value === 'all' ? undefined : (value as CronjobsFilters['status']),
        page: 1,
      })
    },
    [onFiltersChange]
  )

  const handleTargetChange = useCallback(
    (value: string) => {
      onFiltersChange({
        targetType: value === 'all' ? undefined : (value as 'agent' | 'template'),
        page: 1,
      })
    },
    [onFiltersChange]
  )

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      search: undefined,
      status: undefined,
      targetType: undefined,
      page: 1,
    })
  }, [onFiltersChange])

  const hasActiveFilters =
    (filters.search?.length ?? 0) > 0 ||
    filters.status !== undefined ||
    filters.targetType !== undefined

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 lg:col-span-4 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            placeholder="Search cronjobs..."
            value={filters.search ?? ''}
            onChange={handleSearchChange}
            className="pl-9"
            aria-label="Search cronjobs"
          />
        </div>
        <div className="col-span-6 md:col-span-3 lg:col-span-2">
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
        <div className="col-span-6 md:col-span-3 lg:col-span-2">
          <Select
            value={filters.targetType ?? 'all'}
            onValueChange={handleTargetChange}
          >
            <SelectTrigger aria-label="Filter by target type">
              <SelectValue placeholder="Target" />
            </SelectTrigger>
            <SelectContent>
              {(TARGET_OPTIONS ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <div className="col-span-12 md:col-span-3 lg:col-span-2 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground"
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
