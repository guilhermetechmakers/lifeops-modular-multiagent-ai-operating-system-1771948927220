import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Clock, Bot, Shield, Zap, ChevronDown, ChevronUp } from 'lucide-react'

export interface ExplainerStep {
  id: string
  label: string
  description?: string
}

export interface TrustBadge {
  id: string
  label: string
  icon?: React.ReactNode
}

export interface CronjobsExplainerProps {
  steps?: ExplainerStep[]
  trustBadges?: TrustBadge[]
  diagramSvg?: React.ReactNode
  ctaLabel?: string
  ctaHref?: string
  className?: string
}

const DEFAULT_STEPS: ExplainerStep[] = [
  { id: '1', label: 'Plan', description: 'Define schedules and triggers' },
  { id: '2', label: 'Execute', description: 'Agents run with scoped memory' },
  { id: '3', label: 'Logs', description: 'Traceable message bus' },
  { id: '4', label: 'Artifacts', description: 'Schema-validated outputs' },
]

const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  { id: 'audit', label: 'Auditability', icon: <Shield className="h-4 w-4" /> },
  { id: 'reversible', label: 'Reversible Actions', icon: <Zap className="h-4 w-4" /> },
]

export function CronjobsExplainer({
  steps = DEFAULT_STEPS,
  trustBadges = DEFAULT_TRUST_BADGES,
  diagramSvg,
  ctaLabel = 'Explore Master Dashboard',
  ctaHref = '/dashboard',
  className,
}: CronjobsExplainerProps) {
  const [expanded, setExpanded] = useState(false)
  const stepList = Array.isArray(steps) ? steps : DEFAULT_STEPS
  const badges = Array.isArray(trustBadges) ? trustBadges : DEFAULT_TRUST_BADGES

  return (
    <section
      className={cn('py-24 lg:py-32 px-4 lg:px-8 bg-card/50', className)}
      aria-labelledby="cronjobs-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2
              id="cronjobs-heading"
              className="text-3xl lg:text-4xl font-bold mb-6"
            >
              Cronjobs & Agents,{' '}
              <span className="text-primary">First-Class</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Every cronjob is a first-class object: schedule, triggers, payloads,
              permissions, constraints, safety rails, retry policies. Agents
              communicate via a traceable message bus with shared scoped memory.
              All actions are schema-validated, permissioned, logged, explainable,
              and reversible.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" aria-hidden />
                <span>Cronjobs Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" aria-hidden />
                <span>Multi-Agent Orchestration</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" aria-hidden />
                <span>Policy Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" aria-hidden />
                <span>Suggest → Approve → Autopilot</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium"
                >
                  {badge.icon}
                  {badge.label}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to={ctaHref}>
                <Button
                  size="lg"
                  className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  aria-label={ctaLabel}
                >
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          </div>

          <Card className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            {diagramSvg ? (
              <div role="img" aria-label="Cronjobs orchestration diagram">
                {diagramSvg}
              </div>
            ) : (
              <div className="space-y-6" role="list" aria-label="Orchestration steps">
                {stepList.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-card/50"
                    role="listitem"
                  >
                    <span className="font-medium">{step.label}</span>
                    {step.description && (
                      <span className="text-muted-foreground text-sm">
                        {step.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-expanded={expanded}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  More details
                </>
              )}
            </button>
            {expanded && (
              <div className="mt-4 p-4 rounded-lg bg-card/30 text-sm text-muted-foreground">
                <p>
                  Automation levels: Suggest-only (default), Approval Required for
                  Finance & Health, Bounded Autopilot with spend limits. All
                  actions are logged and reversible.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
