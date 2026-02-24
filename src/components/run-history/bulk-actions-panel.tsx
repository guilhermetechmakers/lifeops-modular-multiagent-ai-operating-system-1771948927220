/**
 * BulkActionsPanel - Sticky/floating panel for bulk actions when rows are selected.
 * Re-run, Export Logs (CSV/JSON), with clear selection.
 */

import { Button } from '@/components/ui/button'
import { RotateCcw, Download, X } from 'lucide-react'

export interface BulkActionsPanelProps {
  selectedCount: number
  onRerun: () => void
  onExportLogs: () => void
  onClearSelection: () => void
  isLoading?: boolean
}

export function BulkActionsPanel({
  selectedCount,
  onRerun,
  onExportLogs,
  onClearSelection,
  isLoading,
}: BulkActionsPanelProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card animate-in"
      role="toolbar"
      aria-label="Bulk actions"
    >
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRerun}
          disabled={isLoading}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Re-run
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportLogs}
          disabled={isLoading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        disabled={isLoading}
      >
        <X className="h-4 w-4" />
        Clear selection
      </Button>
    </div>
  )
}
