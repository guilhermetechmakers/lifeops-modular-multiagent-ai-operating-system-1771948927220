/**
 * CreateCronjobForm - Guided builder for new cronjobs.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScheduleBuilder } from './schedule-builder'
import { TriggerConfigEditor } from './trigger-config-editor'
import { InputPayloadTemplateEditor } from './input-payload-template-editor'
import { ConstraintsEditor } from './constraints-editor'
import { RetryPolicyEditor } from './retry-policy-editor'
import { toast } from 'sonner'
import type { CronjobCreateInput, CronjobSchedule } from '@/types/cronjobs'

interface CreateCronjobFormProps {
  onSubmit: (input: CronjobCreateInput) => Promise<{ id: string }>
  templates?: { id: string; name: string; type: string }[]
}

export function CreateCronjobForm({ onSubmit, templates = [] }: CreateCronjobFormProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<Partial<CronjobCreateInput>>({
    name: '',
    schedule: '0 9 * * 1',
    timezone: 'UTC',
    triggerType: 'time',
    targetType: 'agent',
    targetId: '',
    inputTemplate: { promptTemplate: '', variables: {}, scope: '' },
    permissions: 'approval_required',
    constraints: { maxActions: 10, spendLimit: 5 },
    safetyRails: { confirmationsRequired: true },
    retryPolicy: { maxRetries: 3, backoffMs: 1000 },
  })

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      toast.error('Name is required')
      return
    }
    if (!form.targetId && (templates?.length ?? 0) === 0) {
      form.targetId = 'default'
    }
    setIsSubmitting(true)
    try {
      const created = await onSubmit(form as CronjobCreateInput)
      toast.success('Cronjob created')
      navigate(`/dashboard/cronjobs/${created.id}`)
    } catch {
      toast.error('Failed to create cronjob')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`h-2 flex-1 rounded-full transition-colors ${
              step >= s ? 'bg-primary' : 'bg-muted'
            }`}
            aria-label={`Step ${s}`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic info</CardTitle>
            <CardDescription>Name and target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Weekly Content Ideas"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="target-type">Target type</Label>
              <Select
                value={form.targetType ?? 'agent'}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, targetType: v as 'agent' | 'template' }))
                }
              >
                <SelectTrigger id="target-type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target">Target</Label>
              <Select
                value={form.targetId ?? ''}
                onValueChange={(v) => setForm((p) => ({ ...p, targetId: v }))}
              >
                <SelectTrigger id="target" className="mt-1">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  {templates.length > 0 ? (
                    templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.type})
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="a1">Content Ideas Agent</SelectItem>
                      <SelectItem value="a2">Finance Close Agent</SelectItem>
                      <SelectItem value="w1">Daily Sync Workflow</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setStep(2)}>Next</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <ScheduleBuilder
            schedule={form.schedule ?? '0 9 * * 1'}
            timezone={form.timezone ?? 'UTC'}
            onChange={(s, tz) => setForm((p) => ({ ...p, schedule: s, timezone: tz }))}
          />
          <TriggerConfigEditor
            triggerType={form.triggerType ?? 'time'}
            onChange={(v) => setForm((p) => ({ ...p, triggerType: v }))}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Next</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <InputPayloadTemplateEditor
            value={form.inputTemplate ?? {}}
            onChange={(v) => setForm((p) => ({ ...p, inputTemplate: v }))}
          />
          <ConstraintsEditor
            value={form.constraints}
            onChange={(v) => setForm((p) => ({ ...p, constraints: v }))}
          />
          <RetryPolicyEditor
            value={form.retryPolicy}
            onChange={(v) => setForm((p) => ({ ...p, retryPolicy: v }))}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => setStep(4)}>Next</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & create</CardTitle>
            <CardDescription>Confirm and create your cronjob</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/30 p-4 space-y-2 text-sm">
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Schedule:</strong> {typeof form.schedule === 'string' ? form.schedule : (form.schedule as CronjobSchedule)?.cron}</p>
              <p><strong>Timezone:</strong> {form.timezone}</p>
              <p><strong>Target:</strong> {form.targetType} / {form.targetId}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Cronjob'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
