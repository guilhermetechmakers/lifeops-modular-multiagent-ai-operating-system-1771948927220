/**
 * EditSchedulingPanel - Publish date, platforms, cross-post options; time zone handling.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  { id: 'blog', name: 'Blog', type: 'CMS' },
  { id: 'social', name: 'Social', type: 'Social' },
  { id: 'newsletter', name: 'Newsletter', type: 'Newsletter' },
]

export interface EditSchedulingPanelProps {
  contentId: string | null
  publishAt?: string | null
  platforms?: string[]
  timezone?: string
  onSave?: (payload: {
    publishAt: string
    platforms: string[]
    timezone: string
  }) => Promise<unknown>
  disabled?: boolean
}

export function EditSchedulingPanel({
  contentId,
  publishAt,
  platforms: initialPlatforms = [],
  timezone: initialTimezone = 'UTC',
  onSave,
  disabled,
}: EditSchedulingPanelProps) {
  const [publishAtLocal, setPublishAtLocal] = useState(
    publishAt ? new Date(publishAt).toISOString().slice(0, 16) : ''
  )
  const [timezone, setTimezone] = useState(initialTimezone)
  const [platforms, setPlatforms] = useState<string[]>(initialPlatforms ?? [])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPublishAtLocal(
      publishAt ? new Date(publishAt).toISOString().slice(0, 16) : ''
    )
    setPlatforms(initialPlatforms ?? [])
    setTimezone(initialTimezone ?? 'UTC')
  }, [publishAt, initialPlatforms, initialTimezone])

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (!contentId || !onSave) return
    setError(null)
    if (!publishAtLocal) {
      setError('Please select a publish date and time')
      return
    }
    const publishDate = new Date(publishAtLocal)
    if (publishDate.getTime() < Date.now()) {
      setError('Publish date must be in the future')
      return
    }
    setIsSaving(true)
    try {
      await onSave({
        publishAt: publishDate.toISOString(),
        platforms,
        timezone,
      })
    } catch {
      setError('Failed to save schedule')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Schedule & Publish
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <div>
          <Label htmlFor="edit-publish-at">Publish Date & Time</Label>
          <div className="relative mt-1.5">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="edit-publish-at"
              type="datetime-local"
              value={publishAtLocal}
              onChange={(e) => setPublishAtLocal(e.target.value)}
              className="pl-9"
              disabled={disabled}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="edit-timezone">Timezone</Label>
          <div className="relative mt-1.5">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="edit-timezone"
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
