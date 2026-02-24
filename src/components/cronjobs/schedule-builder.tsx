/**
 * ScheduleBuilder - Cron expression editor with UI builder, timezone, next-run preview.
 */

import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { CronjobSchedule } from '@/types/cronjobs'

const COMMON_CRON_PRESETS = [
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 0 * * *', label: 'Daily at midnight' },
  { value: '0 9 * * 1-5', label: 'Weekdays at 9 AM' },
  { value: '0 9 * * 1', label: 'Mondays at 9 AM' },
  { value: '0 0 1 * *', label: '1st of month' },
  { value: '*/15 * * * *', label: 'Every 15 minutes' },
]

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
]

export interface ScheduleBuilderProps {
  schedule: string | CronjobSchedule
  timezone: string
  onChange: (schedule: string | CronjobSchedule, timezone: string) => void
  className?: string
}

export function ScheduleBuilder({
  schedule,
  timezone,
  onChange,
  className,
}: ScheduleBuilderProps) {
  const cronStr = typeof schedule === 'string' ? schedule : schedule?.cron ?? ''
  const humanReadable = typeof schedule === 'object' ? schedule?.humanReadable : undefined

  const handleCronChange = useCallback(
    (value: string) => {
      onChange(value, timezone)
    },
    [timezone, onChange]
  )

  const handleTimezoneChange = useCallback(
    (tz: string) => {
      onChange(typeof schedule === 'string' ? schedule : { ...schedule }, tz)
    },
    [schedule, onChange]
  )

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <Label htmlFor="cron-expr">Cron expression</Label>
        <Input
          id="cron-expr"
          value={cronStr}
          onChange={(e) => handleCronChange(e.target.value)}
          placeholder="0 9 * * 1"
          className="font-mono mt-1"
        />
        {humanReadable && (
          <p className="text-sm text-muted-foreground mt-1">{humanReadable}</p>
        )}
      </div>

      <div>
        <Label>Quick presets</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {(COMMON_CRON_PRESETS ?? []).map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handleCronChange(preset.value)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                cronStr === preset.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="timezone">Timezone</Label>
        <Select value={timezone} onValueChange={handleTimezoneChange}>
          <SelectTrigger id="timezone" className="mt-1">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {(TIMEZONES ?? []).map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Next run preview is calculated server-side based on the cron expression and timezone.
      </p>
    </div>
  )
}
