/**
 * DiffsLinkModal - Modal for full payload diffs.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DiffViewer } from './diff-viewer'
import type { PayloadDiff } from '@/types/approvals'

export interface DiffsLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diffs: PayloadDiff[]
  title?: string
}

export function DiffsLinkModal({
  open,
  onOpenChange,
  diffs,
  title = 'Full payload diff',
}: DiffsLinkModalProps) {
  const items = Array.isArray(diffs) ? diffs : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No diffs available</p>
          ) : (
            items.map((diff, i) => (
              <DiffViewer key={i} diff={diff} defaultCollapsed={false} maxHeight={400} />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
