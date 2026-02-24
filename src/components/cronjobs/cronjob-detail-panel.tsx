/**
 * CronjobDetailPanel - Full configuration with Schedule, Trigger, Payload, Constraints,
 * Safety Rails, Retry Policy, Permissions. Collapsible sections, editable when isEditing.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type {
  Cronjob,
  CronjobSchedule,
  CronjobTriggerType,
  CronjobInputTemplate,
  CronjobConstraints,
  CronjobSafetyRails,
  CronjobRetryPolicy,
  CronjobPermission,
} from '@/types/cronjobs'
import { ScheduleBuilder } from './schedule-builder'
import { TriggerConfigEditor } from './trigger-config-editor'
import { InputPayloadTemplateEditor } from './input-payload-template-editor'
import { ConstraintsEditor } from './constraints-editor'
import { SafetyRailsEditor } from './safety-rails-editor'
import { RetryPolicyEditor } from './retry-policy-editor'
import { PermissionsPanel } from './permissions-panel'

function getScheduleDisplay(schedule: string | CronjobSchedule | undefined): string {
  if (!schedule) return '—'
  if (typeof schedule === 'string') return schedule
  return schedule?.humanReadable ?? schedule?.cron ?? '—'
}

interface SectionProps {
  title: string
  description?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ title, description, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-muted/20 transition-colors rounded-lg"
        aria-expanded={open}
      >
        <div>
          <h4 className="font-semibold">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

export interface CronjobDetailPanelProps {
  cronjob: Cronjob
  onScheduleChange?: (schedule: string | CronjobSchedule, timezone: string) => void
  onTriggerChange?: (triggerType: CronjobTriggerType, config?: Record<string, unknown>) => void
  onInputTemplateChange?: (value: CronjobInputTemplate | string) => void
  onConstraintsChange?: (value: CronjobConstraints) => void
  onSafetyRailsChange?: (value: CronjobSafetyRails) => void
  onRetryPolicyChange?: (value: CronjobRetryPolicy) => void
  onPermissionsChange?: (value: CronjobPermission | string) => void
  onTestTrigger?: () => Promise<{ success: boolean; message?: string }>
  isEditing?: boolean
}

export function CronjobDetailPanel({
  cronjob,
  onScheduleChange,
  onTriggerChange,
  onInputTemplateChange,
  onConstraintsChange,
  onSafetyRailsChange,
  onRetryPolicyChange,
  onPermissionsChange,
  onTestTrigger,
  isEditing = false,
}: CronjobDetailPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Schedule, triggers, payload, constraints, safety rails, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        <Section title="Schedule" description="Cron expression and timezone" defaultOpen>
          {isEditing && onScheduleChange ? (
            <ScheduleBuilder
              schedule={cronjob.schedule}
              timezone={cronjob.timezone ?? 'UTC'}
              nextRun={cronjob.nextRun}
              onChange={
                onScheduleChange as (
                  s: string | CronjobSchedule,
                  tz: string
                ) => void
              }
            />
          ) : (
            <div className="space-y-1">
              <p className="font-mono text-sm">{getScheduleDisplay(cronjob.schedule)}</p>
              <p className="text-sm text-muted-foreground">
                Timezone: {cronjob.timezone ?? 'UTC'}
              </p>
              {cronjob.nextRun && (
                <p className="text-sm text-muted-foreground">
                  Next run: {new Date(cronjob.nextRun).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </Section>

        <Section title="Trigger" description="Trigger type and config" defaultOpen>
          {isEditing && onTriggerChange ? (
            <TriggerConfigEditor
              triggerType={cronjob.triggerType}
              triggerConfig={(cronjob.triggerConfig ?? {}) as unknown as Record<string, unknown>}
              onChange={(type, config) => onTriggerChange(type, config as unknown as Record<string, unknown>)}
              onTestTrigger={onTestTrigger}
            />
          ) : (
            <div className="space-y-2">
              <Badge variant="secondary">{cronjob.triggerType}</Badge>
              <p className="text-sm text-muted-foreground">
                {cronjob.triggerType === 'time' && 'Runs at scheduled times (cron).'}
                {cronjob.triggerType === 'event' && 'Runs when a specific event occurs.'}
                {cronjob.triggerType === 'conditional' &&
                  'Runs when conditions are met.'}
              </p>
            </div>
          )}
        </Section>

        <Section title="Input Payload" description="Prompt template and variables" defaultOpen>
          {isEditing && onInputTemplateChange ? (
            <InputPayloadTemplateEditor
              value={cronjob.inputTemplate}
              onChange={onInputTemplateChange}
            />
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-mono whitespace-pre-wrap">
                {typeof cronjob.inputTemplate === 'string'
                  ? cronjob.inputTemplate
                  : cronjob.inputTemplate?.promptTemplate ?? '—'}
              </p>
              {(typeof cronjob.inputTemplate === 'object' &&
                cronjob.inputTemplate?.scope) && (
                <p className="text-sm text-muted-foreground">
                  Scope: {cronjob.inputTemplate.scope}
                </p>
              )}
            </div>
          )}
        </Section>

        <Section title="Target" description="Agent or workflow template" defaultOpen={false}>
          <p className="text-sm">
            {cronjob.target?.name ?? cronjob.targetType} ({cronjob.targetId})
          </p>
        </Section>

        <Section title="Permissions" description="Automation level" defaultOpen={false}>
          {isEditing && onPermissionsChange ? (
            <PermissionsPanel
              value={cronjob.permissions}
              onChange={(updates) => {
                if (updates.permissions != null) onPermissionsChange(updates.permissions)
              }}
            />
          ) : (
            <Badge variant="outline">{cronjob.permissions}</Badge>
          )}
        </Section>

        <Section title="Retry Policy" description="Backoff and retries" defaultOpen={false}>
          {isEditing && onRetryPolicyChange ? (
            <RetryPolicyEditor
              value={cronjob.retryPolicy}
              onChange={onRetryPolicyChange}
            />
          ) : (
            <div className="text-sm space-y-1">
              {cronjob.retryPolicy ? (
                <>
                  <p>Max retries: {cronjob.retryPolicy.maxRetries ?? 3}</p>
                  <p>Backoff: {cronjob.retryPolicy.backoffMs ?? 1000}ms</p>
                  {cronjob.retryPolicy.deadLetter && (
                    <p>Dead letter: {cronjob.retryPolicy.deadLetter}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Default (3 retries, 1s backoff)</p>
              )}
            </div>
          )}
        </Section>

        <Section title="Constraints" description="Limits and safety" defaultOpen={false}>
          {isEditing && onConstraintsChange ? (
            <ConstraintsEditor
              value={cronjob.constraints}
              onChange={onConstraintsChange}
            />
          ) : (
            <div className="text-sm space-y-1">
              {cronjob.constraints ? (
                <>
                  {cronjob.constraints.maxActions != null && (
                    <p>Max actions: {cronjob.constraints.maxActions}</p>
                  )}
                  {cronjob.constraints.spendLimit != null && (
                    <p>Spend limit: ${cronjob.constraints.spendLimit}</p>
                  )}
                  {(cronjob.constraints.allowedTools?.length ?? 0) > 0 && (
                    <p>
                      Allowed tools: {cronjob.constraints.allowedTools?.join(', ')}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No constraints</p>
              )}
            </div>
          )}
        </Section>

        <Section title="Safety Rails" description="Confirmations" defaultOpen={false}>
          {isEditing && onSafetyRailsChange ? (
            <SafetyRailsEditor
              value={cronjob.safetyRails}
              onChange={onSafetyRailsChange}
            />
          ) : (
            <div className="text-sm">
              {cronjob.safetyRails?.confirmationsRequired ? (
                <p>Confirmations required</p>
              ) : (
                <p className="text-muted-foreground">No safety rails</p>
              )}
            </div>
          )}
        </Section>
      </CardContent>
    </Card>
  )
}
