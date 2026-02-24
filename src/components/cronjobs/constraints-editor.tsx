/**
 * ConstraintsEditor - Max actions, spend limits, allowed tools.
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'
import type { CronjobConstraints } from '@/types/cronjobs'

interface ConstraintsEditorProps {
  value: CronjobConstraints | undefined
  onChange: (value: CronjobConstraints) => void
}

export function ConstraintsEditor({ value, onChange }: ConstraintsEditorProps) {
  const c = value ?? {}

  const handleChange = (key: keyof CronjobConstraints, val: unknown) => {
    onChange({ ...c, [key]: val })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Constraints
        </CardTitle>
        <CardDescription>
          Limits and safety boundaries for this cronjob.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="max-actions">Max actions</Label>
          <Input
            id="max-actions"
            type="number"
            min={1}
            value={c.maxActions ?? ''}
            onChange={(e) => {
              const v = e.target.value ? parseInt(e.target.value, 10) : undefined
              handleChange('maxActions', v)
            }}
            placeholder="10"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="spend-limit">Spend limit ($)</Label>
          <Input
            id="spend-limit"
            type="number"
            min={0}
            step={0.01}
            value={c.spendLimit ?? ''}
            onChange={(e) => {
              const v = e.target.value ? parseFloat(e.target.value) : undefined
              handleChange('spendLimit', v)
            }}
            placeholder="5.00"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="allowed-tools">Allowed tools (comma-separated)</Label>
          <Input
            id="allowed-tools"
            value={(c.allowedTools ?? []).join(', ')}
            onChange={(e) => {
              const tools = e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
              handleChange('allowedTools', tools)
            }}
            placeholder="search, generate, publish"
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  )
}
