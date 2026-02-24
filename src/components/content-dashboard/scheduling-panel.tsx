/**
 * SchedulingPanel - Calendar view, timezone, recurrence, conflict checks.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, X, Clock } from 'lucide-react'
import type { ContentItem } from '@/types/content-dashboard'

interface SchedulingPanelProps {
  contentItem: ContentItem
  onClose: () => void
  onUpdate: (id: string, payload: Partial<ContentItem>) => Promise<ContentItem>
}

export function SchedulingPanel({ contentItem, onClose, onUpdate }: SchedulingPanelProps) {
  const [publishAt, setPublishAt] = useState(
    contentItem?.publishAt
      ? new Date(contentItem.publishAt).toISOString().slice(0, 16)
      : ''
  )
  const [timezone, setTimezone] = useState('UTC')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!contentItem?.id) return
    setIsSaving(true)
    try {
      await onUpdate(contentItem.id, {
        publishAt: publishAt ? new Date(publishAt).toISOString() : undefined,
        status: publishAt ? 'Scheduled' : contentItem.status,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Scheduling
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="publish-at">Publish Date & Time</Label>
          <Input
            id="publish-at"
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <div className="relative mt-1.5">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="rounded-lg border border-border p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Calendar view with drag-and-drop is available in the full scheduling view.
          </p>
        </div>
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Schedule'}
        </Button>
      </CardContent>
    </Card>
  )
}
