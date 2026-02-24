/**
 * Cronjob Detail Page - Full editor with schedule, trigger, payload, constraints,
 * safety rails, retry policy, permissions, outputs, policy justifications, audit trail.
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Play,
  Pause,
  PlayCircle,
  History,
  Save,
  Calendar,
  Zap,
  FileText,
  Shield,
  ShieldCheck,
  RotateCcw as RetryIcon,
  Lock,
  GitBranch,
} from 'lucide-react'
import { useCronjobDetail, useCronjobRuns } from '@/hooks/use-cronjobs'
import {
  ScheduleBuilder,
  TriggerConfigEditor,
  InputPayloadTemplateEditor,
  ConstraintsEditor,
  RetryPolicyEditor,
  SafetyRailsEditor,
  PermissionsPanel,
  OutputsPanel,
  RunTraceViewer,
  AuditTrailViewer,
} from '@/components/cronjobs'
import {
  fetchCronjobAuditTrail,
  triggerTestCronjob,
} from '@/api/cronjobs'
import type { AuditEntry, CronjobCreateInput } from '@/types/cronjobs'
import { toast } from 'sonner'

function formatTime(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export function CronjobDetailPage() {
  const { id } = useParams()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<Partial<CronjobCreateInput>>({})
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [auditLoading, setAuditLoading] = useState(false)

  const {
    cronjob,
    isLoading,
    error,
    refetch,
    update,
    trigger,
    pause,
    enable,
  } = useCronjobDetail(id)

  const { runs, total: runsTotal, isLoading: runsLoading, refetch: refetchRuns } =
    useCronjobRuns(id, { limit: 10 })

  const loadAudit = useCallback(async () => {
    if (!id) return
    setAuditLoading(true)
    try {
      const entries = await fetchCronjobAuditTrail(id)
      setAuditEntries(entries ?? [])
    } catch {
      setAuditEntries([])
    } finally {
      setAuditLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadAudit()
  }, [loadAudit])

  useEffect(() => {
    if (cronjob && isEditing) {
      setForm({
        schedule: cronjob.schedule,
        timezone: cronjob.timezone,
        triggerType: cronjob.triggerType,
        inputTemplate: cronjob.inputTemplate,
        permissions: cronjob.permissions,
        constraints: cronjob.constraints,
        safetyRails: cronjob.safetyRails,
        retryPolicy: cronjob.retryPolicy,
      })
    }
  }, [cronjob, isEditing])

  const handleScheduleChange = (
    schedule: string | { cron?: string; humanReadable?: string },
    timezone: string
  ) => {
    const scheduleValue =
      typeof schedule === 'string'
        ? schedule
        : { cron: schedule?.cron ?? '', timezone, humanReadable: schedule?.humanReadable }
    setForm((p) => ({ ...p, schedule: scheduleValue, timezone }))
  }

  const handleSave = async () => {
    if (!id) return
    setIsSaving(true)
    try {
      await update(form)
      toast.success('Cronjob updated')
      setIsEditing(false)
      loadAudit()
    } catch {
      toast.error('Failed to update cronjob')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRunNow = async () => {
    try {
      await trigger()
      toast.success('Cronjob triggered')
      refetchRuns()
    } catch {
      toast.error('Failed to trigger cronjob')
    }
  }

  const handleTestTrigger = useCallback(async () => {
    if (!id) return { success: false, message: 'No cronjob' }
    return triggerTestCronjob(id)
  }, [id])

  if (isLoading && !cronjob) {
    return (
      <div className="space-y-8 animate-in-up">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted/30 animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-muted/30 rounded-xl animate-pulse" />
            <div className="h-48 bg-muted/30 rounded-xl animate-pulse" />
          </div>
          <div className="h-48 bg-muted/30 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !cronjob) {
    return (
      <div className="space-y-8 animate-in-up">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/cronjobs">
            <Button variant="ghost" size="icon" aria-label="Back to cronjobs">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="py-8">
            <p className="text-destructive">{error?.message ?? 'Cronjob not found'}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Link to="/dashboard/cronjobs">
                <Button>Back to Cronjobs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusLabel = cronjob.paused
    ? 'Paused'
    : cronjob.enabled
      ? 'Active'
      : 'Disabled'

  return (
    <div className="space-y-8 animate-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/cronjobs">
            <Button variant="ghost" size="icon" aria-label="Back to cronjobs">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold truncate">{cronjob.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
              <span>Cronjob #{cronjob.id}</span>
              <Badge variant={cronjob.enabled && !cronjob.paused ? 'success' : 'secondary'}>
                {statusLabel}
              </Badge>
              {cronjob.ownerId && (
                <span className="text-sm">Owner: {cronjob.ownerId}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Last run: </span>
            {formatTime(cronjob.lastRun)}
          </div>
          <div>
            <span className="text-muted-foreground">Next run: </span>
            {formatTime(cronjob.nextRun)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
          {cronjob.enabled && !cronjob.paused && (
            <Button onClick={handleRunNow}>
              <Play className="h-4 w-4 mr-2" />
              Re-run
            </Button>
          )}
          {(!cronjob.enabled || cronjob.paused) && (
            <Button variant="success" onClick={() => enable()}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Enable
            </Button>
          )}
          {cronjob.enabled && !cronjob.paused && (
            <Button variant="outline" onClick={() => pause()}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          <Link to={`/dashboard/runs?cronjobId=${cronjob.id}`}>
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              Run History
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="trigger" className="gap-2">
            <Zap className="h-4 w-4" />
            Trigger
          </TabsTrigger>
          <TabsTrigger value="payload" className="gap-2">
            <FileText className="h-4 w-4" />
            Payload
          </TabsTrigger>
          <TabsTrigger value="constraints" className="gap-2">
            <Shield className="h-4 w-4" />
            Constraints
          </TabsTrigger>
          <TabsTrigger value="safety" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Safety Rails
          </TabsTrigger>
          <TabsTrigger value="retry" className="gap-2">
            <RetryIcon className="h-4 w-4" />
            Retry
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Lock className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="outputs" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Outputs
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Cron expression, timezone, and next-run previews.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <ScheduleBuilder
                  schedule={form.schedule ?? cronjob.schedule}
                  timezone={form.timezone ?? cronjob.timezone ?? 'UTC'}
                  onChange={handleScheduleChange}
                />
              ) : (
                <div className="space-y-2">
                  <p className="font-mono text-sm">
                    {typeof cronjob.schedule === 'string'
                      ? cronjob.schedule
                      : (cronjob.schedule as { cron?: string; humanReadable?: string })?.humanReadable ??
                        (cronjob.schedule as { cron?: string })?.cron ??
                        '—'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Timezone: {cronjob.timezone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trigger">
          <TriggerConfigEditor
            triggerType={form.triggerType ?? cronjob.triggerType}
            triggerConfig={((isEditing ? form.triggerConfig : cronjob.triggerConfig) ?? {}) as Record<string, unknown>}
            onChange={(triggerType, config) => {
              setForm((p) => ({ ...p, triggerType, triggerConfig: config }))
            }}
            onTestTrigger={isEditing ? handleTestTrigger : undefined}
          />
        </TabsContent>

        <TabsContent value="payload">
          <Card>
            <CardHeader>
              <CardTitle>Input Payload</CardTitle>
              <CardDescription>
                Prompt template with variables and live preview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <InputPayloadTemplateEditor
                  value={form.inputTemplate ?? cronjob.inputTemplate}
                  onChange={(v) => setForm((p) => ({ ...p, inputTemplate: v }))}
                />
              ) : (
                <pre className="p-4 rounded-lg bg-muted/30 text-sm overflow-x-auto">
                  {JSON.stringify(
                    typeof cronjob.inputTemplate === 'string'
                      ? { promptTemplate: cronjob.inputTemplate }
                      : cronjob.inputTemplate,
                    null,
                    2
                  )}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constraints">
          <Card>
            <CardHeader>
              <CardTitle>Constraints</CardTitle>
              <CardDescription>
                Max actions, spend limits, allowed tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <ConstraintsEditor
                  value={form.constraints ?? cronjob.constraints}
                  onChange={(v) => setForm((p) => ({ ...p, constraints: v }))}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety">
          <SafetyRailsEditor
            value={form.safetyRails ?? cronjob.safetyRails}
            onChange={(v) => setForm((p) => ({ ...p, safetyRails: v }))}
          />
        </TabsContent>

        <TabsContent value="retry">
          <RetryPolicyEditor
            value={form.retryPolicy ?? cronjob.retryPolicy}
            onChange={(v) => setForm((p) => ({ ...p, retryPolicy: v }))}
          />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsPanel
            value={form.permissions ?? cronjob.permissions}
            automationLevel={cronjob.automationLevel}
            agentLevelPermissions={(cronjob as { agentLevelPermissions?: boolean }).agentLevelPermissions}
            onChange={(updates) =>
              setForm((p) => ({ ...p, ...updates }))
            }
          />
        </TabsContent>

        <TabsContent value="outputs">
          <div className="space-y-6">
            <OutputsPanel
              runs={runs}
              cronjobId={cronjob.id}
              total={runsTotal}
              isLoading={runsLoading}
              onLoadMore={refetchRuns}
            />
            {(runs?.length ?? 0) > 0 && runs?.[0] && (
              <RunTraceViewer run={runs[0]} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrailViewer
            entries={auditEntries}
            isLoading={auditLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
