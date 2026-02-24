/**
 * SchedulingPanel - Platform toggles, schedule picker, timezone, recurrence for Create Content.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  { id: 'blog', name: 'Blog', type: 'CMS' },
  { id: 'social', name: 'Social', type: 'Social' },
  { id: 'newsletter', name: 'Newsletter', type: 'Newsletter' },
]

interface SchedulingPanelProps {
  contentId: string | null
  publishAt?: string | null
  timezone?: string
  enabledPlatforms?: string[]
  onSave?: (payload: { publishAt?: string; timezone: string; platforms: string[] }) => Promise<void>
  disabled?: boolean
}

export function SchedulingPanel({
  contentId,
  publishAt,
  timezone: initialTimezone = 'UTC',
  enabledPlatforms = [],
  onSave,
  disabled,
}: SchedulingPanelProps) {
  const [publishAtLocal, setPublishAtLocal] = useState(
    publishAt ? new Date(publishAt).toISOString().slice(0, 16) : ''
  )
  const [timezone, setTimezone] = useState(initialTimezone)
  const [platforms, setPlatforms] = useState<string[]>(enabledPlatforms ?? [])
  const [recurrence, setRecurrence] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (!contentId || !onSave) return
    setIsSaving(true)
    try {
      await onSave({
        publishAt: publishAtLocal ? new Date(publishAtLocal).toISOString() : undefined,
        timezone,
        platforms,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="publish-at">Publish Date & Time</Label>
          <div className="relative mt-1.5">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="publish-at"
              type="datetime-local"
              value={publishAtLocal}
              onChange={(e) => setPublishAtLocal(e.target.value)}
              className="pl-9"
              disabled={disabled}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <div className="relative mt-1.5">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="UTC"
              className="pl-9"
              disabled={disabled}
            />
          </div>
        </div>
        <div>
          <Label>Platforms</Label>
          <div className="mt-2 space-y-2">
            {(PLATFORMS ?? []).map((p) => (
              <label
                key={p.id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors',
                  platforms.includes(p.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={platforms.includes(p.id)}
                  onChange={() => togglePlatform(p.id)}
                  disabled={disabled}
                  className="rounded border-input"
                />
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground">({p.type})</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="recurrence">Recurrence (optional)</Label>
          <div className="relative mt-1.5">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              placeholder="e.g. 0 9 * * 1 (weekly Monday 9am)"
              className="pl-9 font-mono text-sm"
              disabled={disabled}
            />
          </div>
        </div>
        {onSave && (
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={disabled || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
