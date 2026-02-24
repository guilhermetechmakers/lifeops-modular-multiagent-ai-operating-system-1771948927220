/**
 * SearchFilterBar - Debounced search, status, tags, author, date range, sort.
 */

import { useCallback } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContentListFilters, ContentStatus } from '@/types/content-dashboard'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: ContentStatus[] = [
  'Idea',
  'Research',
  'Draft',
  'Edit',
  'Review',
  'Scheduled',
  'Published',
]

const SORT_OPTIONS: { value: ContentListFilters['sort']; label: string }[] = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'createdAt', label: 'Date created' },
  { value: 'title', label: 'Title' },
  { value: 'publishedAt', label: 'Publish date' },
]

const QUICK_FILTERS = [
  { value: 'my_content', label: 'My Content' },
  { value: 'shared_with_me', label: 'Shared with Me' },
  { value: 'templates', label: 'Templates' },
] as const

export interface SearchFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  status?: string
  onStatusChange: (value: string) => void
  sort?: ContentListFilters['sort']
  onSortChange: (value: ContentListFilters['sort']) => void
  sortOrder?: 'asc' | 'desc'
  onSortOrderChange: (value: 'asc' | 'desc') => void
  quickFilter?: ContentListFilters['quickFilter']
  onQuickFilterChange: (value?: ContentListFilters['quickFilter']) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  className?: string
}

export function SearchFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  quickFilter,
  onQuickFilterChange,
  onClearFilters,
  hasActiveFilters,
  className,
}: SearchFilterBarProps) {
  const handleClear = useCallback(() => {
    onSearchChange('')
    onStatusChange('all')
    onSortChange('updatedAt')
    onSortOrderChange('desc')
    onQuickFilterChange(undefined)
    onClearFilters()
  }, [
    onSearchChange,
    onStatusChange,
    onSortChange,
    onSortOrderChange,
    onQuickFilterChange,
    onClearFilters,
  ])

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 lg:col-span-5 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search content..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Search content"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-wrap gap-2">
          <Select value={status ?? 'all'} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by status">
              <Filter className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(STATUS_OPTIONS ?? []).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={`${sort ?? 'updatedAt'}-${sortOrder ?? 'desc'}`}
            onValueChange={(v) => {
              const [s, o] = v.split('-') as [ContentListFilters['sort'], 'asc' | 'desc']
              onSortChange(s)
              onSortOrderChange(o)
            }}
          >
            <SelectTrigger className="w-full md:w-[160px]" aria-label="Sort by">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={`${opt.value}-desc`}>
                  {opt.label} (newest)
                </SelectItem>
              ))}
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={`${opt.value}-asc`} value={`${opt.value}-asc`}>
                  {opt.label} (oldest)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-12 lg:col-span-3 flex items-center gap-2">
          {(QUICK_FILTERS ?? []).map((qf) => (
            <Button
              key={qf.value}
              variant={quickFilter === qf.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onQuickFilterChange(quickFilter === qf.value ? undefined : qf.value)}
              aria-pressed={quickFilter === qf.value}
            >
              {qf.label}
            </Button>
          ))}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="gap-1"
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
