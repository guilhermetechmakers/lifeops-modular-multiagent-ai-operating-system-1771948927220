/**
 * SafetyRailsEditor - Confirmation steps, required prompts, reversible actions.
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ShieldCheck, Plus, X } from 'lucide-react'
import type { CronjobSafetyRails } from '@/types/cronjobs'

interface SafetyRailsEditorProps {
  value: CronjobSafetyRails | undefined
  onChange: (value: CronjobSafetyRails) => void
}

export function SafetyRailsEditor({ value, onChange }: SafetyRailsEditorProps) {
  const s = value ?? {}
  const safeguards = Array.isArray(s.safeguards) ? s.safeguards : []
  const requiredPrompts = Array.isArray(s.requiredPrompts) ? s.requiredPrompts : []

  const handleChange = (key: keyof CronjobSafetyRails, val: unknown) => {
    onChange({ ...s, [key]: val })
  }

  const addSafeguard = () => {
    const next = [...safeguards, '']
    handleChange('safeguards', next)
  }

  const updateSafeguard = (idx: number, v: string) => {
    const next = [...safeguards]
    next[idx] = v
    handleChange('safeguards', next)
  }

  const removeSafeguard = (idx: number) => {
    const next = safeguards.filter((_, i) => i !== idx)
    handleChange('safeguards', next)
  }

  const addRequiredPrompt = () => {
    const next = [...requiredPrompts, '']
    handleChange('requiredPrompts', next)
  }

  const updateRequiredPrompt = (idx: number, v: string) => {
    const next = [...requiredPrompts]
    next[idx] = v
    handleChange('requiredPrompts', next)
  }

  const removeRequiredPrompt = (idx: number) => {
    const next = requiredPrompts.filter((_, i) => i !== idx)
    handleChange('requiredPrompts', next)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Safety Rails
        </CardTitle>
        <CardDescription>
          Required confirmations, multi-step approvals, and reversible actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <Checkbox
            id="confirmations-required"
            checked={s.confirmationsRequired ?? false}
            onCheckedChange={(checked) =>
              handleChange('confirmationsRequired', checked === true)
            }
          />
          <Label htmlFor="confirmations-required" className="cursor-pointer">
            Require human confirmation before execution
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="reversible-actions"
            checked={s.reversibleActions ?? false}
            onCheckedChange={(checked) =>
              handleChange('reversibleActions', checked === true)
            }
          />
          <Label htmlFor="reversible-actions" className="cursor-pointer">
            Enable reversible actions (rollback available)
          </Label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Safeguards</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSafeguard}
              aria-label="Add safeguard"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {(safeguards ?? []).map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateSafeguard(idx, e.target.value)}
                  placeholder="e.g. max-spend-check"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSafeguard(idx)}
                  aria-label="Remove safeguard"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Required prompts</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRequiredPrompt}
              aria-label="Add required prompt"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {(requiredPrompts ?? []).map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateRequiredPrompt(idx, e.target.value)}
                  placeholder="e.g. confirm-publish"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRequiredPrompt(idx)}
                  aria-label="Remove required prompt"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
