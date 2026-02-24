/**
 * RetryPolicyEditor - Backoff strategy, max retries, dead-letter sink.
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RotateCcw } from 'lucide-react'
import type { CronjobRetryPolicy, RetryBackoffStrategy } from '@/types/cronjobs'

const BACKOFF_STRATEGIES: { value: RetryBackoffStrategy; label: string }[] = [
  { value: 'exponential', label: 'Exponential' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'linear', label: 'Linear' },
]

interface RetryPolicyEditorProps {
  value: CronjobRetryPolicy | undefined
  onChange: (value: CronjobRetryPolicy) => void
}

export function RetryPolicyEditor({ value, onChange }: RetryPolicyEditorProps) {
  const r = value ?? { maxRetries: 3, backoffMs: 1000 }
  const strategy = r.backoffStrategy ?? 'exponential'

  const handleChange = (key: keyof CronjobRetryPolicy, val: unknown) => {
    onChange({ ...r, [key]: val })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Retry Policy
        </CardTitle>
        <CardDescription>
          Backoff strategy, max retries, and dead-letter sink configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="backoff-strategy">Backoff strategy</Label>
          <Select
            value={strategy}
            onValueChange={(v) => handleChange('backoffStrategy', v as RetryBackoffStrategy)}
          >
            <SelectTrigger id="backoff-strategy" className="mt-1">
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              {(BACKOFF_STRATEGIES ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {strategy === 'exponential' && 'Delay doubles each retry.'}
            {strategy === 'fixed' && 'Same delay between retries.'}
            {strategy === 'linear' && 'Delay increases linearly.'}
          </p>
        </div>
        <div>
          <Label htmlFor="max-retries">Max retries</Label>
          <Input
            id="max-retries"
            type="number"
            min={0}
            value={r.maxRetries ?? 3}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              handleChange('maxRetries', isNaN(v) ? 3 : v)
            }}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="backoff-ms">Backoff (ms)</Label>
          <Input
            id="backoff-ms"
            type="number"
            min={100}
            value={r.backoffMs ?? 1000}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              handleChange('backoffMs', isNaN(v) ? 1000 : v)
            }}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Base delay between retries.
          </p>
        </div>
        <div>
          <Label htmlFor="dead-letter">Dead-letter sink</Label>
          <Input
            id="dead-letter"
            value={r.deadLetter ?? ''}
            onChange={(e) => handleChange('deadLetter', e.target.value || undefined)}
            placeholder="dlq-cronjob-failed"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Failed runs after max retries are sent here.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
