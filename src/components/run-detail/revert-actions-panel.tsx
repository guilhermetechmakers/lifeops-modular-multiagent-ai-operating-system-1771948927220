/**
 * RevertActionsPanel - Reversible actions with confirmation prompts.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RotateCcw } from 'lucide-react'

export interface RevertActionsPanelProps {
  reversible?: boolean
  onRevert?: () => Promise<void> | void
  isLoading?: boolean
}

export function RevertActionsPanel({
  reversible,
  onRevert,
  isLoading,
}: RevertActionsPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRevert = async () => {
    if (!onRevert) return
    setIsSubmitting(true)
    try {
      await onRevert()
      setConfirmOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!reversible) {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Reversible Actions</CardTitle>
          <CardDescription>This run can be reverted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setConfirmOpen(true)}
            disabled={isLoading}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Revert Run
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revert Run</DialogTitle>
            <DialogDescription>
              This will revert the run to its previous state. This action may affect other
              dependent systems. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevert} disabled={isSubmitting}>
              {isSubmitting ? 'Reverting...' : 'Revert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
