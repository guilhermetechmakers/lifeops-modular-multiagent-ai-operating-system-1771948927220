/**
 * SchedulingPanel - Edit Content: Publish date, platforms, timezone.
 * Validates future publish times; time zone aware.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScheduleRecord } from '@/types/content-dashboard'

const PLATFORMS = [
  { id: 'blog', name: 'Blog', type: 'CMS' },
  { id: 'social', name: 'Social', type: 'Social' },
  { id: 'newsletter', name: 'Newsletter', type: 'Newsletter' },
]

export interface EditSchedulingPanelProps {
  contentId: string | null
  schedule?: ScheduleRecord | null
  loading?: boolean
  onSave?: (payload: { publishAt: string; platforms: string[]; timezone: string }) => Promise<ScheduleRecord | null>
  disabled?: boolean
}

function toLocalDatetime(iso: string | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const offset = d.getTimezoneOffset() * 60000
    const local = new Date(d.getTime() - offset)
    return local.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

export function EditSchedulingPanel({
  contentId,
  schedule,
  loading,
  onSave,
  disabled,
}: EditSchedulingPanelProps) {
  const [publishAtLocal, setPublishAtLocal] = useState(toLocalDatetime(schedule?.publishAt))
  const [timezone, setTimezone] = useState(schedule?.timezone ?? 'UTC')
  const [platforms, setPlatforms] = useState<string[]>(schedule?.platforms ?? [])
  const [isSaving, setIsSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    setPublishAtLocal(toLocalDatetime(schedule?.publishAt))
    setTimezone(schedule?.timezone ?? 'UTC')
    setPlatforms(schedule?.platforms ?? [])
  }, [schedule?.publishAt, schedule?.timezone, schedule?.platforms])

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (!contentId || !onSave) return
    setValidationError(null)
    if (!publishAtLocal?.trim()) {
      setValidationError('Please select a publish date and time')
      return
    }
    const chosen = new Date(publishAtLocal).getTime()
    if (chosen <= Date.now()) {
      setValidationError('Publish date must be in the future')
      return
    }
    const publishAt = new Date(publishAtLocal).toISOString()
    setIsSaving(true)
    try {
      await onSave({ publishAt, platforms, timezone })
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
        <div>
          <Label htmlFor="edit-publish-at">Publish Date & Time</Label>
          <div className="relative mt-1.5">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="edit-publish-at"
              type="datetime-local"
              value={publishAtLocal}
              onChange={(e) => {
                setPublishAtLocal(e.target.value)
                setValidationError(null)
              }}
              className="pl-9"
              disabled={disabled}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
            />
          </div>
          {validationError && (
            <p className="text-xs text-destructive mt-1">{validationError}</p>
          )}
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
            disabled={disabled || isSaving || loading}
          >
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
