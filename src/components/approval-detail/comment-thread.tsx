/**
 * CommentThread - Per-approval comment UI with per-comment attachments, timestamps.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send } from 'lucide-react'
import type { ApprovalCommentDetail } from '@/types/approvals'

export interface CommentThreadProps {
  comments: ApprovalCommentDetail[]
  onAddComment: (text: string) => Promise<ApprovalCommentDetail | null>
  disabled?: boolean
  className?: string
}

export function CommentThread({
  comments = [],
  onAddComment,
  disabled,
  className,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const list = Array.isArray(comments) ? comments : []

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    setIsSubmitting(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Comments
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="resize-none"
            disabled={disabled || isSubmitting}
            aria-label="Comment"
          />
          <Button
            size="sm"
            className="mt-2 gap-2"
            onClick={handleSubmit}
            disabled={disabled || isSubmitting || !newComment.trim()}
          >
            <Send className="h-3.5 w-3.5" />
            Add Comment
          </Button>
        </div>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {list.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3 bg-card">
                <p className="text-sm">{c.text}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{c.author ?? c.authorId}</span>
                  <span>•</span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
