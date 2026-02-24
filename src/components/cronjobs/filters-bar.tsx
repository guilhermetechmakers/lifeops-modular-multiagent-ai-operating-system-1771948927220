/**
 * FiltersBar - Filter by status, target type, owner.
 */

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatusFilter = 'all' | 'enabled' | 'paused' | 'disabled'
export type TargetTypeFilter = 'all' | 'agent' | 'template'

interface FiltersBarProps {
  status: StatusFilter
  targetType: TargetTypeFilter
  onStatusChange: (v: StatusFilter) => void
  onTargetTypeChange: (v: TargetTypeFilter) => void
  onClear?: () => void
  className?: string
}

export function FiltersBar({
  status,
  targetType,
  onStatusChange,
  onTargetTypeChange,
  onClear,
  className,
}: FiltersBarProps) {
  const hasFilters = status !== 'all' || targetType !== 'all'

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
        <SelectTrigger className="w-[140px]" aria-label="Filter by status">
          <Filter className="h-4 w-4" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="enabled">Enabled</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
          <SelectItem value="disabled">Disabled</SelectItem>
        </SelectContent>
      </Select>
      <Select value={targetType} onValueChange={(v) => onTargetTypeChange(v as TargetTypeFilter)}>
        <SelectTrigger className="w-[140px]" aria-label="Filter by target type">
          <SelectValue placeholder="Target" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All targets</SelectItem>
          <SelectItem value="agent">Agent</SelectItem>
          <SelectItem value="template">Template</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && onClear && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
