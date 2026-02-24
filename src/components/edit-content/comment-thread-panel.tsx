/**
 * CommentThreadPanel - Threaded review comments with reply, resolve, assign.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Comment } from '@/types/content-dashboard'

export interface CommentThreadPanelProps {
  comments?: Comment[]
  loading?: boolean
  onAddComment?: (text: string, parentId?: string | null) => Promise<Comment | null>
  onResolveComment?: (commentId: string) => Promise<Comment | null>
  disabled?: boolean
}

function buildThread(comments: Comment[]): Comment[] {
  const byId = new Map<string, Comment & { replies?: Comment[] }>()
  ;(comments ?? []).forEach((c) => byId.set(c.id, { ...c, replies: [] }))
  const roots: (Comment & { replies?: Comment[] })[] = []
  ;(comments ?? []).forEach((c) => {
    const node = byId.get(c.id)
    if (!node) return
    if (!c.parentId) {
      roots.push(node)
    } else {
      const parent = byId.get(c.parentId)
      if (parent) {
        parent.replies = parent.replies ?? []
        parent.replies.push(node)
      } else {
        roots.push(node)
      }
    }
  })
  return roots
}

function CommentItem({
  comment,
  onReply,
  onResolve,
  disabled,
  depth = 0,
}: {
  comment: Comment & { replies?: Comment[] }
  onReply?: (parentId: string, text: string) => void
  onResolve?: (commentId: string) => void
  disabled?: boolean
  depth?: number
}) {
  const [replyText, setReplyText] = useState('')
  const [showReply, setShowReply] = useState(false)

  const handleReply = async () => {
    if (!replyText.trim() || !onReply) return
    await onReply(comment.id, replyText.trim())
    setReplyText('')
    setShowReply(false)
  }

  const replies = comment.replies ?? []

  return (
    <div className={cn('space-y-2', depth > 0 && 'ml-4 pl-4 border-l-2 border-border')}>
      <div
        className={cn(
          'rounded-lg border p-3',
          comment.status === 'resolved'
            ? 'border-border bg-muted/30 opacity-80'
            : 'border-border bg-card'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm">{comment.text}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>{comment.authorId}</span>
              <span>•</span>
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
              {comment.status === 'resolved' && (
                <Badge variant="secondary" className="text-xs">
                  Resolved
                </Badge>
              )}
            </div>
          </div>
          {comment.status === 'open' && onResolve && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onResolve(comment.id)}
              disabled={disabled}
              className="shrink-0 gap-1"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Resolve
            </Button>
          )}
        </div>
        {comment.status === 'open' && onReply && (
          <div className="mt-2">
            {!showReply ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowReply(true)}
                disabled={disabled}
              >
                Reply
              </Button>
            ) : (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="resize-none"
                  disabled={disabled}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleReply} disabled={disabled || !replyText.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowReply(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              onReply={onReply}
              onResolve={onResolve}
              disabled={disabled}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentThreadPanel({
  comments = [],
  loading,
  onAddComment,
  onResolveComment,
  disabled,
}: CommentThreadPanelProps) {
  const [newCommentText, setNewCommentText] = useState('')

  const roots = buildThread(comments ?? [])

  const handleAddRoot = async () => {
    if (!newCommentText.trim() || !onAddComment) return
    await onAddComment(newCommentText.trim(), null)
    setNewCommentText('')
  }

  const handleReply = async (parentId: string, text: string) => {
    await onAddComment?.(text, parentId)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Review Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="resize-none"
            disabled={disabled}
          />
          <Button
            size="sm"
            className="mt-2 gap-2"
            onClick={handleAddRoot}
            disabled={disabled || !newCommentText.trim()}
          >
            <Send className="h-3.5 w-3.5" />
            Add Comment
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground py-4">Loading comments...</div>
        ) : roots.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No comments yet. Add a comment to start the discussion.
          </p>
        ) : (
          <div className="space-y-3">
            {roots.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                onReply={handleReply}
                onResolve={onResolveComment}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
