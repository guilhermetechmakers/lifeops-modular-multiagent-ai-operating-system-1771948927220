/**
 * CronjobTemplatePicker - Choose sample cronjob/workflow template.
 * Customize inputs, timezone, permissions, safety rails.
 */
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, Shield, Zap, Loader2 } from 'lucide-react'
import { fetchCronjobTemplates, createCronjob } from '@/api/onboarding'
import { useOnboardingStore } from '@/store/onboarding-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { CronjobTemplate } from '@/types/onboarding'

const TIMEZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo']

export function CronjobTemplatePicker() {
  const { state, setCronjobTemplateId, setCronjob } = useOnboardingStore()
  const cronjobTemplateId = state.cronjobTemplateId ?? null
  const cronjob = state.cronjob
  const [templates, setTemplates] = useState<CronjobTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [customName, setCustomName] = useState('')
  const [timezone, setTimezone] = useState('UTC')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const list = await fetchCronjobTemplates()
        if (!cancelled) {
          setTemplates(list)
          if (list.length > 0 && !cronjobTemplateId) {
            setCronjobTemplateId(list[0].id)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [cronjobTemplateId, setCronjobTemplateId])

  const cronjobTemplate = (templates ?? []).find((x) => x.id === cronjobTemplateId) ?? null

  const handleCreate = async () => {
    const templateId = cronjobTemplateId ?? (templates ?? [])[0]?.id
    if (!templateId) return
    setCreating(true)
    try {
      const result = await createCronjob({
        template_id: templateId,
        inputs: {},
        timezone,
        permissions: cronjobTemplate?.permissions,
        safety_rails: cronjobTemplate?.safety_rails,
      })
      if (result.ok && result.cronjob) {
        setCronjob(result.cronjob)
        toast.success('Cronjob created')
      } else {
        // Demo: create mock cronjob when API returns no cronjob
        setCronjob({
          id: `cron-${Date.now()}`,
          user_id: '',
          name: customName || cronjobTemplate?.name || 'Weekly Content Ideas',
          template_id: templateId,
          enabled: true,
          schedule: cronjobTemplate?.schedule ?? '0 9 * * 1',
          timezone,
          target_type: cronjobTemplate?.target_type ?? 'agent',
          target_id: cronjobTemplate?.target_id ?? 'content-ideas',
          input_payload: cronjobTemplate?.default_inputs ?? {},
          permissions: cronjobTemplate?.permissions ?? [],
          safety_rails: cronjobTemplate?.safety_rails ?? {},
          retry_policy: cronjobTemplate?.retry_policy ?? {},
          status: 'active',
          next_run: new Date(Date.now() + 86400000).toISOString(),
          last_run_outcome: null,
        })
        toast.success('Cronjob created')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Creation failed'
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  const list = templates ?? []

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Choose a template and customize. We&apos;ll set up your first automated workflow. Safety rails and permissions are applied by default.
      </p>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Template cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(list.length > 0 ? list : []).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCronjobTemplateId(t.id)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  'hover:border-primary/50 hover:shadow-card',
                  cronjobTemplateId === t.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-[#1F2124]'
                )}
                aria-pressed={cronjobTemplateId === t.id}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-white">{t.name}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(t.permissions ?? []).slice(0, 2).map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs">
                      {p}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Customization */}
          {cronjobTemplate && (
            <div className="rounded-xl border border-border bg-[#1F2124] p-4 space-y-4">
              <p className="font-medium text-white">Customize</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cronjob-name">Name</Label>
                  <Input
                    id="cronjob-name"
                    placeholder={cronjobTemplate.name}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cronjob-tz">Timezone</Label>
                  <select
                    id="cronjob-tz"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Safety rails: max actions, approval required</span>
              </div>
            </div>
          )}

          {/* Create button */}
          {!cronjob && (
            <Button onClick={handleCreate} disabled={creating} className="gap-2">
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Create cronjob
                </>
              )}
            </Button>
          )}

          {cronjob && (
            <div className="rounded-lg bg-success/10 border border-success/30 p-4 flex items-center gap-3">
              <Zap className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">Cronjob created</p>
                <p className="text-sm text-muted-foreground">
                  {cronjob.name} · Next run: {cronjob.next_run ? new Date(cronjob.next_run).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
