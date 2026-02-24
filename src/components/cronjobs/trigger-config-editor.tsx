/**
 * TriggerConfigEditor - Time, event, and conditional triggers.
 */

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap } from 'lucide-react'
import type { CronjobTriggerType } from '@/types/cronjobs'

interface TriggerConfigEditorProps {
  triggerType: CronjobTriggerType
  onChange: (triggerType: CronjobTriggerType) => void
}

export function TriggerConfigEditor({ triggerType, onChange }: TriggerConfigEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Trigger
        </CardTitle>
        <CardDescription>
          How this cronjob is triggered: time-based, event-based, or conditional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="trigger-type">Trigger type</Label>
          <Select value={triggerType} onValueChange={(v) => onChange(v as CronjobTriggerType)}>
            <SelectTrigger id="trigger-type" className="mt-1">
              <SelectValue placeholder="Select trigger type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time-based (schedule)</SelectItem>
              <SelectItem value="event">Event-based</SelectItem>
              <SelectItem value="conditional">Conditional</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            {triggerType === 'time' &&
              'Runs at scheduled times (cron expression).'}
            {triggerType === 'event' &&
              'Runs when a specific event occurs (e.g. webhook, DB change).'}
            {triggerType === 'conditional' &&
              'Runs when conditions are met (e.g. data threshold reached).'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
