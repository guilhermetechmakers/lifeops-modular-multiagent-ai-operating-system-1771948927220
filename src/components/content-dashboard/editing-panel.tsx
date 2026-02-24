/**
 * EditingPanel - Revision tracking, comments, approval gates.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Edit, MessageSquare, CheckCircle, Clock } from 'lucide-react'

interface EditingPanelProps {
  contentItemId?: string | null
  title?: string
  onApprove?: () => void
  onReject?: () => void
  disabled?: boolean
}

const SAMPLE_REVISIONS = [
  { id: 'r1', version: 2, date: '2024-01-15', author: 'User', comment: 'Initial edit' },
  { id: 'r2', version: 1, date: '2024-01-14', author: 'User', comment: 'First draft' },
]

export function EditingPanel({
  contentItemId: _contentItemId,
  title: _title,
  onApprove,
  onReject,
  disabled,
}: EditingPanelProps) {
  const [comment, setComment] = useState('')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5 text-primary" />
          Editing
        </CardTitle>
        <CardDescription>
          Revision tracking, comments, and approval gates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Revision History</p>
          <div className="space-y-2">
            {(SAMPLE_REVISIONS ?? []).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card/50"
              >
                <Badge variant="secondary">v{r.version}</Badge>
                <span className="text-xs text-muted-foreground">{r.date}</span>
                <span className="text-xs">{r.author}</span>
                <span className="text-xs text-muted-foreground truncate">{r.comment}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="edit-comment" className="text-sm font-medium mb-2 block flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Add Comment
          </label>
          <Textarea
            id="edit-comment"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
            disabled={disabled}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="default"
            size="sm"
            onClick={onApprove}
            disabled={disabled}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            disabled={disabled}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Request Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
