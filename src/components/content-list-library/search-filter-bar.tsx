/**
 * SearchFilterBar - Debounced search, status, tags, author, date range, sort.
 */

import { useCallback } from 'react'
import { Search, X, LayoutGrid, List } from 'lucide-react'
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
import type { ContentListFilters, ContentLibraryStatus, ContentStatus } from '@/types/content-dashboard'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'Idea', label: 'Idea' },
  { value: 'Research', label: 'Research' },
  { value: 'Draft', label: 'Draft (Pipeline)' },
  { value: 'Edit', label: 'Edit' },
  { value: 'Review', label: 'Review' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Published', label: 'Published (Pipeline)' },
]

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'template', label: 'Template' },
]

const SORT_OPTIONS: { value: ContentListFilters['sort']; label: string }[] = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'createdAt', label: 'Created' },
  { value: 'title', label: 'Title' },
  { value: 'publishedAt', label: 'Published' },
]

const QUICK_FILTERS: { value: ContentListFilters['quickFilter']; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'my_content', label: 'My Content' },
  { value: 'shared_with_me', label: 'Shared with Me' },
  { value: 'templates', label: 'Templates' },
]

export interface SearchFilterBarProps {
  filters: ContentListFilters
  onFiltersChange: (updates: Partial<ContentListFilters>) => void
  className?: string
}

export function SearchFilterBar({
  filters,
  onFiltersChange,
  className,
}: SearchFilterBarProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ search: e.target.value || undefined })
    },
    [onFiltersChange]
  )

  const handleStatusChange = useCallback(
    (value: string) => {
      onFiltersChange({
        status: value === 'all' ? undefined : (value as ContentLibraryStatus | ContentStatus),
      })
    },
    [onFiltersChange]
  )

  const handleTypeChange = useCallback(
    (value: string) => {
      onFiltersChange({
        type: value === 'all' ? undefined : (value as 'draft' | 'published' | 'template'),
      })
    },
    [onFiltersChange]
  )

  const handleSortChange = useCallback(
    (value: string) => {
      onFiltersChange({ sort: value as ContentListFilters['sort'] })
    },
    [onFiltersChange]
  )

  const handleSortOrderChange = useCallback(
    (value: string) => {
      onFiltersChange({ sortOrder: value as 'asc' | 'desc' })
    },
    [onFiltersChange]
  )

  const handleViewChange = useCallback(
    (view: 'grid' | 'list') => {
      onFiltersChange({ view })
    },
    [onFiltersChange]
  )

  const handleQuickFilterChange = useCallback(
    (value: ContentListFilters['quickFilter']) => {
      onFiltersChange({ quickFilter: value })
    },
    [onFiltersChange]
  )

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      search: undefined,
      status: undefined,
      type: undefined,
      authorId: undefined,
      tags: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: 1,
    })
  }, [onFiltersChange])

  const hasActiveFilters =
    (filters.search?.length ?? 0) > 0 ||
    filters.status !== undefined ||
    filters.type !== undefined ||
    filters.authorId !== undefined ||
    (filters.tags?.length ?? 0) > 0 ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 lg:col-span-4 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            placeholder="Search content..."
            value={filters.search ?? ''}
            onChange={handleSearchChange}
            className="pl-9"
            aria-label="Search content"
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
            value={filters.type ?? 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger aria-label="Filter by type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {(TYPE_OPTIONS ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-6 md:col-span-3 lg:col-span-2">
          <Select
            value={filters.sort ?? 'updatedAt'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger aria-label="Sort by">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {(SORT_OPTIONS ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value ?? 'updatedAt'}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-6 md:col-span-3 lg:col-span-2 flex items-center gap-2">
          <Select
            value={filters.sortOrder ?? 'desc'}
            onValueChange={handleSortOrderChange}
          >
            <SelectTrigger className="w-full" aria-label="Sort order">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
            <Button
              variant={filters.view === 'grid' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => handleViewChange('grid')}
              aria-label="Grid view"
              className="rounded-none border-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={filters.view === 'list' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => handleViewChange('list')}
              aria-label="List view"
              className="rounded-none border-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(QUICK_FILTERS ?? []).map((qf) => (
          <Button
            key={qf.value ?? 'all'}
            variant={filters.quickFilter === qf.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilterChange(qf.value)}
          >
            {qf.label}
          </Button>
        ))}
        {hasActiveFilters && (
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
        )}
      </div>
    </div>
  )
}
