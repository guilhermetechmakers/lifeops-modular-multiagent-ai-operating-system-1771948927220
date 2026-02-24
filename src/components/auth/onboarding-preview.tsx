/**
 * OnboardingPreview - Optional panel showing what onboarding will cover based on module selection.
 */

import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AVAILABLE_MODULES } from './module-selector'

const STEPS = [
  { id: 1, title: 'Choose modules', description: 'Select which areas to automate' },
  { id: 2, title: 'Connect integrations', description: 'Link your tools and accounts' },
  { id: 3, title: 'Create first cronjob', description: 'Set up your first automation' },
  { id: 4, title: 'Summary', description: 'Review and launch' },
]

interface OnboardingPreviewProps {
  selectedModules: string[]
  className?: string
}

export function OnboardingPreview({ selectedModules, className }: OnboardingPreviewProps) {
  const modules = selectedModules ?? []
  const moduleNames = (AVAILABLE_MODULES ?? [])
    .filter((m) => modules.includes(m.id))
    .map((m) => m.name)

  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card/50 p-4 space-y-4',
        className
      )}
    >
      <h3 className="text-sm font-semibold text-foreground">What you&apos;ll do next</h3>
      <p className="text-xs text-muted-foreground">
        After signup, we&apos;ll guide you through setting up your workspace.
      </p>
      <div className="flex gap-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden"
            title={s.title}
          >
            <div className="h-full w-1/4 bg-primary/30 rounded-full" />
          </div>
        ))}
      </div>
      <ul className="space-y-2">
        {STEPS.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-sm">
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{s.title}</span>
          </li>
        ))}
      </ul>
      {moduleNames.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
          <Check className="h-4 w-4 text-success shrink-0" />
          <span className="text-xs text-muted-foreground">
            Modules: {moduleNames.join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}
