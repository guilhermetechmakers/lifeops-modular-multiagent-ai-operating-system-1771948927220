/**
 * CronjobDetailPanel - Collapsible sections for Schedule, Trigger, Input, Constraints, etc.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Cronjob } from '@/types/cronjobs'
import { ScheduleBuilder } from './schedule-builder'

function getScheduleDisplay(schedule: string | { cron?: string; humanReadable?: string }): string {
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
        className="w-full flex items-center justify-between py-4 text-left hover:bg-muted/20 transition-colors"
        aria-expanded={open}
      >
        <div>
          <h4 className="font-semibold">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

export interface CronjobDetailPanelProps {
  cronjob: Cronjob
  onScheduleChange?: (schedule: string | Cronjob['schedule'], timezone: string) => void
  isEditing?: boolean
}

export function CronjobDetailPanel({
  cronjob,
  onScheduleChange,
  isEditing = false,
}: CronjobDetailPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>Schedule, triggers, and payload</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        <Section title="Schedule" description="Cron expression and timezone" defaultOpen>
          {isEditing && onScheduleChange ? (
            <ScheduleBuilder
              schedule={cronjob.schedule}
              timezone={cronjob.timezone ?? 'UTC'}
              onChange={onScheduleChange as (s: string | import('@/types/cronjobs').CronjobSchedule, tz: string) => void}
            />
          ) : (
            <div className="space-y-1">
              <p className="font-mono text-sm">{getScheduleDisplay(cronjob.schedule)}</p>
              <p className="text-sm text-muted-foreground">Timezone: {cronjob.timezone}</p>
            </div>
          )}
        </Section>

        <Section title="Trigger" description="Trigger type" defaultOpen>
          <Badge variant="secondary">{cronjob.triggerType}</Badge>
        </Section>

        <Section title="Target" description="Agent or workflow template" defaultOpen>
          <p className="text-sm">
            {cronjob.target?.name ?? cronjob.targetType} ({cronjob.targetId})
          </p>
        </Section>

        <Section title="Permissions" description="Automation level" defaultOpen={false}>
          <Badge variant="outline">{cronjob.permissions}</Badge>
        </Section>

        <Section title="Retry Policy" description="Backoff and retries" defaultOpen={false}>
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
        </Section>

        <Section title="Constraints" description="Limits and safety" defaultOpen={false}>
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
                  <p>Allowed tools: {cronjob.constraints.allowedTools?.join(', ')}</p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No constraints</p>
            )}
          </div>
        </Section>

        <Section title="Safety Rails" description="Confirmations" defaultOpen={false}>
          <div className="text-sm">
            {cronjob.safetyRails?.confirmationsRequired ? (
              <p>Confirmations required</p>
            ) : (
              <p className="text-muted-foreground">No safety rails</p>
            )}
          </div>
        </Section>
      </CardContent>
    </Card>
  )
}
