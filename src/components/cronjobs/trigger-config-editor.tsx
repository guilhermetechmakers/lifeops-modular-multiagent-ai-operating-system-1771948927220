/**
 * TriggerConfigEditor - Time, event, and conditional triggers with dynamic forms.
 */

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Play } from 'lucide-react'
import type {
  CronjobTriggerType,
  TriggerConfigEvent,
  TriggerConfigConditional,
} from '@/types/cronjobs'

export interface TriggerConfigValue {
  type: CronjobTriggerType
  eventSource?: string
  eventType?: string
  condition?: string
  fallback?: string
  mapping?: Record<string, string>
}

interface TriggerConfigEditorProps {
  triggerType: CronjobTriggerType
  triggerConfig?: TriggerConfigEvent | TriggerConfigConditional | Record<string, unknown>
  onChange: (triggerType: CronjobTriggerType, config?: TriggerConfigValue) => void
  onTestTrigger?: () => Promise<{ success: boolean; message?: string }>
}

export function TriggerConfigEditor({
  triggerType,
  triggerConfig = {},
  onChange,
  onTestTrigger,
}: TriggerConfigEditorProps) {
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const cfg = triggerConfig as Record<string, unknown>
  const mapping = (cfg?.mapping as Record<string, string>) ?? {}

  const handleTypeChange = (v: CronjobTriggerType) => {
    setTestResult(null)
    onChange(v, undefined)
  }

  const handleMappingChange = (key: string, value: string) => {
    const next = { ...mapping, [key]: value }
    onChange(triggerType, {
      type: triggerType,
      ...(triggerType === 'event' && {
        eventSource: cfg?.eventSource as string,
        eventType: cfg?.eventType as string,
        mapping: next,
      }),
      ...(triggerType === 'conditional' && {
        condition: cfg?.condition as string,
        fallback: cfg?.fallback as string,
        mapping: next,
      }),
    })
  }

  const handleTest = async () => {
    if (!onTestTrigger) return
    setIsTesting(true)
    setTestResult(null)
    try {
      const result = await onTestTrigger()
      setTestResult(result)
    } catch {
      setTestResult({ success: false, message: 'Test failed' })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Trigger Config
        </CardTitle>
        <CardDescription>
          How this cronjob is triggered: time-based, event-based, or conditional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="trigger-type">Trigger type</Label>
          <Select value={triggerType} onValueChange={(v) => handleTypeChange(v as CronjobTriggerType)}>
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
            {triggerType === 'time' && 'Runs at scheduled times (cron expression).'}
            {triggerType === 'event' &&
              'Runs when a specific event occurs (e.g. webhook, DB change).'}
            {triggerType === 'conditional' &&
              'Runs when conditions are met (e.g. data threshold reached).'}
          </p>
        </div>

        {triggerType === 'event' && (
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="event-source">Event source</Label>
              <Input
                id="event-source"
                value={(cfg?.eventSource as string) ?? ''}
                onChange={(e) =>
                  onChange(triggerType, {
                    type: triggerType,
                    eventSource: e.target.value,
                    eventType: cfg?.eventType as string,
                    mapping,
                  })
                }
                placeholder="e.g. webhook, db-change"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-type">Event type</Label>
              <Input
                id="event-type"
                value={(cfg?.eventType as string) ?? ''}
                onChange={(e) =>
                  onChange(triggerType, {
                    type: triggerType,
                    eventSource: cfg?.eventSource as string,
                    eventType: e.target.value,
                    mapping,
                  })
                }
                placeholder="e.g. content.published"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Field mapping (key → value)</Label>
              <div className="mt-2 space-y-2">
                {Object.entries(mapping).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <Input
                      value={k}
                      disabled
                      className="flex-1 font-mono text-sm"
                    />
                    <Input
                      value={v}
                      onChange={(e) => handleMappingChange(k, e.target.value)}
                      placeholder="value"
                      className="flex-1"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleMappingChange(`mapping_${Object.keys(mapping).length}`, '')
                  }
                >
                  Add mapping
                </Button>
              </div>
            </div>
          </div>
        )}

        {triggerType === 'conditional' && (
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                value={(cfg?.condition as string) ?? ''}
                onChange={(e) =>
                  onChange(triggerType, {
                    type: triggerType,
                    condition: e.target.value,
                    fallback: cfg?.fallback as string,
                    mapping,
                  })
                }
                placeholder="e.g. data.threshold > 100"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="fallback">Fallback</Label>
              <Input
                id="fallback"
                value={(cfg?.fallback as string) ?? ''}
                onChange={(e) =>
                  onChange(triggerType, {
                    type: triggerType,
                    condition: cfg?.condition as string,
                    fallback: e.target.value,
                    mapping,
                  })
                }
                placeholder="e.g. skip"
                className="mt-1"
              />
            </div>
          </div>
        )}

        {(triggerType === 'event' || triggerType === 'conditional') && onTestTrigger && (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isTesting}
            >
              <Play className="h-4 w-4 mr-2" />
              {isTesting ? 'Testing...' : 'Test trigger mapping'}
            </Button>
            {testResult && (
              <p
                className={`mt-2 text-sm ${
                  testResult.success ? 'text-success' : 'text-destructive'
                }`}
              >
                {testResult.success ? 'Test passed' : testResult.message ?? 'Test failed'}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
