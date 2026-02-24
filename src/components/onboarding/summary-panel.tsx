/**
 * SummaryPanel - Aggregates selections with "Start Using LifeOps" CTA.
 */
import { StepCard } from './step-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Github, Workflow, Wallet, CreditCard, Heart, Clock } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding-store'

const PROVIDER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  cicd: Workflow,
  plaid: Wallet,
  stripe: CreditCard,
  healthkit: Heart,
}

export interface SummaryPanelProps {
  onStart: () => void
  onBackToStep?: (step: number) => void
  isCompleting?: boolean
}

export function SummaryPanel({ onStart, onBackToStep, isCompleting }: SummaryPanelProps) {
  const { state } = useOnboardingStore()
  const connectors = state.connectors ?? []
  const selectedModules = state.selectedModules ?? []
  const dataImports = state.dataImports ?? []
  const cronjob = state.cronjob

  const connected = (connectors ?? []).filter((c) => c.status === 'connected')
  const modules = selectedModules ?? []
  const imports = dataImports ?? []

  return (
    <StepCard
      title="Summary & Start"
      description="Review your setup. Click Start to launch LifeOps."
      tip="You can revisit any step before starting."
    >
      <div className="space-y-6">
        {/* Integrations */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-white">Integrations</p>
            {onBackToStep && (
              <button
                type="button"
                onClick={() => onBackToStep(2)}
                className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Edit
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {connected.length > 0 ? (
              connected.map((c) => {
                const Icon = PROVIDER_ICONS[c.provider_key]
                return (
                  <Badge key={c.id} variant="success" className="gap-1">
                    {Icon && <Icon className="h-3 w-3" />}
                    {c.display_name ?? c.provider_key}
                  </Badge>
                )
              })
            ) : (
              <span className="text-sm text-muted-foreground">None connected</span>
            )}
          </div>
        </div>

        {/* Modules */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-white">Modules</p>
            {onBackToStep && (
              <button
                type="button"
                onClick={() => onBackToStep(3)}
                className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Edit
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {modules.length > 0 ? (
              modules.map((m) => (
                <Badge key={m} variant="secondary">
                  {m}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">None selected</span>
            )}
          </div>
        </div>

        {/* Data import */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-white">Data import</p>
            {onBackToStep && (
              <button
                type="button"
                onClick={() => onBackToStep(4)}
                className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Edit
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {imports.length > 0
              ? `${imports.filter((i) => i.status === 'completed').length} import(s) completed`
              : 'No imports'}
          </p>
        </div>

        {/* Cronjob */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-white">First cronjob</p>
            {onBackToStep && (
              <button
                type="button"
                onClick={() => onBackToStep(5)}
                className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Edit
              </button>
            )}
          </div>
          {cronjob ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{cronjob.name}</p>
                <p className="text-xs text-muted-foreground">
                  Next run: {cronjob.next_run ? new Date(cronjob.next_run).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No cronjob created</p>
          )}
        </div>

        {/* CTA */}
        <div className="pt-6 border-t border-border">
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2 text-base px-8"
            onClick={onStart}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>Completing...</>
            ) : (
              <>
                Start Using LifeOps
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            You can always adjust settings from the dashboard.
          </p>
        </div>
      </div>
    </StepCard>
  )
}
