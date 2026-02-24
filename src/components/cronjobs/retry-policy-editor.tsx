/**
 * RetryPolicyEditor - Backoff, max retries, dead-letter.
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RotateCcw } from 'lucide-react'
import type { CronjobRetryPolicy } from '@/types/cronjobs'

interface RetryPolicyEditorProps {
  value: CronjobRetryPolicy | undefined
  onChange: (value: CronjobRetryPolicy) => void
}

export function RetryPolicyEditor({ value, onChange }: RetryPolicyEditorProps) {
  const r = value ?? { maxRetries: 3, backoffMs: 1000 }

  const handleChange = (key: keyof CronjobRetryPolicy, val: unknown) => {
    onChange({ ...r, [key]: val })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Retry policy
        </CardTitle>
        <CardDescription>
          Exponential backoff, max retries, and dead-letter queue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            Base delay between retries (exponential backoff applied).
          </p>
        </div>
        <div>
          <Label htmlFor="dead-letter">Dead-letter queue</Label>
          <Input
            id="dead-letter"
            value={r.deadLetter ?? ''}
            onChange={(e) => handleChange('deadLetter', e.target.value || undefined)}
            placeholder="dlq-cronjob-failed"
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  )
}
