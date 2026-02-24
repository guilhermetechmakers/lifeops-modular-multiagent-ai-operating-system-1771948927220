/**
 * BulkActionBar - Appears when items selected; Schedule, Assign, Archive, Delete.
 */

import { useState, useCallback } from 'react'
import { Calendar, UserPlus, Archive, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface BulkActionBarProps {
  selectedCount: number
  onSchedule?: () => void
  onAssign?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onMoveToTemplate?: () => void
  onClearSelection: () => void
  isLoading?: boolean
  className?: string
}

export function BulkActionBar({
  selectedCount,
  onSchedule,
  onAssign,
  onArchive,
  onDelete,
  onMoveToTemplate,
  onClearSelection,
  isLoading = false,
  className,
}: BulkActionBarProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)

  const handleDelete = useCallback(() => {
    onDelete?.()
    setDeleteConfirmOpen(false)
  }, [onDelete])

  const handleArchive = useCallback(() => {
    onArchive?.()
    setArchiveConfirmOpen(false)
  }, [onArchive])

  if (selectedCount === 0) return null

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card animate-in-up',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{selectedCount} selected</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="gap-1"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {onSchedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSchedule}
              disabled={isLoading}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
          )}
          {onAssign && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAssign}
              disabled={isLoading}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Assign
            </Button>
          )}
          {onMoveToTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveToTemplate}
              disabled={isLoading}
            >
              Move to Template
            </Button>
          )}
          {onArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setArchiveConfirmOpen(true)}
              disabled={isLoading}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isLoading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedCount} item(s)?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The selected content will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={archiveConfirmOpen} onOpenChange={setArchiveConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive {selectedCount} item(s)?</DialogTitle>
            <DialogDescription>
              Archived items will be moved to the archive. You can restore them later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleArchive}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
