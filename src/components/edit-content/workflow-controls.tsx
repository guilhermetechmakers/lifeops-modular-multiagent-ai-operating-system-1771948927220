/**
 * WorkflowControls - State transition controls (Move to Review, Schedule, Publish).
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Workflow, Loader2 } from 'lucide-react'
import type { ContentStatus } from '@/types/content-dashboard'

const STATUS_ORDER: ContentStatus[] = [
  'Idea',
  'Research',
  'Draft',
  'Edit',
  'Review',
  'Scheduled',
  'Published',
]

export interface WorkflowControlsProps {
  currentStatus?: ContentStatus
  onTransition?: (toStatus: string) => Promise<ContentItem | null>
  transitioning?: boolean
  userPermissions?: string[]
  disabled?: boolean
}

export function WorkflowControls({
  currentStatus = 'Draft',
  onTransition,
  transitioning,
  userPermissions = [],
  disabled,
}: WorkflowControlsProps) {
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null)

  const currentIdx = STATUS_ORDER.indexOf(currentStatus)
  const nextStatuses = STATUS_ORDER.slice(currentIdx + 1).filter((s) => s !== currentStatus)

  const handleTransition = async (toStatus: string) => {
    if (['Scheduled', 'Published'].includes(toStatus)) {
      setConfirmTarget(toStatus)
      return
    }
    await onTransition?.(toStatus)
  }

  const handleConfirm = async () => {
    if (!confirmTarget) return
    await onTransition?.(confirmTarget)
    setConfirmTarget(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" />
            Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current:</span>
            <span className="text-sm font-medium">{currentStatus}</span>
          </div>
          {nextStatuses.length > 0 && onTransition ? (
            <Select
              onValueChange={handleTransition}
              disabled={disabled || transitioning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Move to..." />
              </SelectTrigger>
              <SelectContent>
                {nextStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              {currentStatus === 'Published'
                ? 'Content is published.'
                : 'No further transitions available.'}
            </p>
          )}
          {transitioning && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm transition</DialogTitle>
            <DialogDescription>
              Are you sure you want to move this content to &quot;{confirmTarget}&quot;? This action
              may trigger publishing or scheduling.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={transitioning}>
              {transitioning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
