/**
 * BulkActionBar - Appears when items selected. Schedule, Assign, Archive, Delete.
 * Confirmation dialogs for destructive actions.
 */

import { useState, useCallback } from 'react'
import {
  Calendar,
  UserPlus,
  Archive,
  Trash2,
  Move,
  Loader2,
} from 'lucide-react'
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
import type { BulkActionType } from '@/types/content-dashboard'

export interface BulkActionBarProps {
  selectedIds: string[]
  onSchedule?: (ids: string[]) => void
  onAssign?: (ids: string[]) => void
  onArchive?: (ids: string[]) => void
  onDelete?: (ids: string[]) => void
  onMoveToTemplate?: (ids: string[]) => void
  onClearSelection?: () => void
  isLoading?: boolean
  className?: string
}

export function BulkActionBar({
  selectedIds,
  onSchedule,
  onAssign,
  onArchive,
  onDelete,
  onMoveToTemplate,
  onClearSelection,
  isLoading = false,
  className,
}: BulkActionBarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkActionType | null>(null)

  const count = selectedIds?.length ?? 0
  if (count === 0) return null

  const handleAction = useCallback(
    (action: BulkActionType, handler?: (ids: string[]) => void) => {
      const ids = selectedIds ?? []
      if (action === 'delete' || action === 'archive') {
        setConfirmAction(action)
      } else {
        handler?.(ids)
      }
    },
    [selectedIds]
  )

  const handleConfirm = useCallback(() => {
    const ids = selectedIds ?? []
    if (confirmAction === 'delete') {
      onDelete?.(ids)
    } else if (confirmAction === 'archive') {
      onArchive?.(ids)
    }
    setConfirmAction(null)
  }, [confirmAction, selectedIds, onDelete, onArchive])

  const handleCancelConfirm = useCallback(() => {
    setConfirmAction(null)
  }, [])

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card',
          'animate-fade-in',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {count} item{count !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            aria-label="Clear selection"
          >
            Clear
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onSchedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('schedule', onSchedule)}
              disabled={isLoading}
              className="gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Schedule
            </Button>
          )}
          {onAssign && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('assign', onAssign)}
              disabled={isLoading}
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              Assign
            </Button>
          )}
          {onArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('archive')}
              disabled={isLoading}
              className="gap-1.5"
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          )}
          {onMoveToTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('move_to_template', onMoveToTemplate)}
              disabled={isLoading}
              className="gap-1.5"
            >
              <Move className="h-4 w-4" />
              Move to Template
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction('delete')}
              disabled={isLoading}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Dialog open={confirmAction !== null} onOpenChange={(open) => !open && handleCancelConfirm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'delete' ? 'Delete content?' : 'Archive content?'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'delete'
                ? `This will permanently delete ${count} item(s). This action cannot be undone.`
                : `This will archive ${count} item(s). You can restore them later.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelConfirm}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              {confirmAction === 'delete' ? 'Delete' : 'Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
