/**
 * DecisionControls - Approve, Deny, Request Changes with confirmation.
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
import { Textarea } from '@/components/ui/textarea'
import { Check, X, MessageSquare } from 'lucide-react'

export type DecisionAction = 'approve' | 'deny' | 'changes_requested'

export interface DecisionControlsProps {
  disabled?: boolean
  requiresCommentForDeny?: boolean
  requiresCommentForChanges?: boolean
  onAction: (payload: {
    action: DecisionAction
    comments?: string
  }) => Promise<void>
  className?: string
}

export function DecisionControls({
  disabled,
  requiresCommentForDeny = false,
  requiresCommentForChanges = false,
  onAction,
  className,
}: DecisionControlsProps) {
  const [modalAction, setModalAction] = useState<DecisionAction | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpen = (action: DecisionAction) => {
    setModalAction(action)
    setComment('')
  }

  const handleConfirm = async () => {
    if (!modalAction) return
    if (modalAction === 'deny' && requiresCommentForDeny && !comment.trim()) return
    if (modalAction === 'changes_requested' && requiresCommentForChanges && !comment.trim()) return

    setIsSubmitting(true)
    try {
      await onAction({ action: modalAction, comments: comment.trim() || undefined })
      setModalAction(null)
      setComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setModalAction(null)
      setComment('')
    }
  }

  const needsComment =
    (modalAction === 'deny' && requiresCommentForDeny) ||
    (modalAction === 'changes_requested' && requiresCommentForChanges)

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
          <CardDescription>
            Approve, deny, or request changes with optional comments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {!disabled ? (
            <>
              <Button className="w-full gap-2" variant="success" onClick={() => handleOpen('approve')}>
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={() => handleOpen('deny')}
              >
                <X className="h-4 w-4" />
                Deny
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleOpen('changes_requested')}
              >
                <MessageSquare className="h-4 w-4" />
                Request Changes
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-2">This approval has been resolved.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalAction !== null} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalAction === 'approve' && 'Approve'}
              {modalAction === 'deny' && 'Deny'}
              {modalAction === 'changes_requested' && 'Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {modalAction === 'approve' && 'Add an optional comment for the audit trail.'}
              {modalAction === 'deny' &&
                (requiresCommentForDeny ? 'A reason for denial is required.' : 'Add a reason for denial (recommended).')}
              {modalAction === 'changes_requested' &&
                (requiresCommentForChanges
                  ? 'Specify the required changes.'
                  : 'Specify the required changes (optional).')}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              modalAction === 'deny'
                ? 'Reason for denial...'
                : modalAction === 'changes_requested'
                  ? 'Describe the required changes...'
                  : 'Comment (optional)'
            }
            rows={3}
            className="resize-none"
            disabled={isSubmitting}
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || (needsComment && !comment.trim())}
            >
              {isSubmitting ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
