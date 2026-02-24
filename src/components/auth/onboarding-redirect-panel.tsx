/**
 * OnboardingRedirectPanel - Shows next steps when user is in onboarding flow.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, FolderKanban, FileText, Wallet, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

const ONBOARDING_STEPS = [
  { id: 'modules', title: 'Choose modules', icon: FolderKanban },
  { id: 'integrations', title: 'Connect integrations', icon: FileText },
  { id: 'cronjob', title: 'Create first cronjob', icon: Wallet },
  { id: 'summary', title: 'Summary', icon: Heart },
]

export interface OnboardingRedirectPanelProps {
  onContinue: () => void
  onSkip?: () => void
  className?: string
}

export function OnboardingRedirectPanel({
  onContinue,
  onSkip,
  className,
}: OnboardingRedirectPanelProps) {
  return (
    <Card
      className={cn(
        'rounded-2xl border-[#26282C] shadow-card transition-all duration-300',
        'hover:shadow-card-hover',
        className
      )}
      style={{
        backgroundColor: '#232429',
        borderColor: 'rgba(38, 40, 44, 0.6)',
      }}
    >
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-xl font-bold text-white">
          Next steps
        </CardTitle>
        <CardDescription className="text-[#AEB2B8]">
          Complete your setup with module selection and first integrations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {(ONBOARDING_STEPS ?? []).map((step) => (
            <li
              key={step.id}
              className="flex items-center gap-3 text-sm text-[#AEB2B8]"
            >
              <div className="rounded-lg p-2 bg-primary/10">
                <step.icon className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <span>{step.title}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            className="flex-1 bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white"
            onClick={onContinue}
          >
            Continue onboarding
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
          {onSkip && (
            <Button
              variant="outline"
              className="border-[#26282C] text-[#AEB2B8] hover:bg-secondary/80"
              onClick={onSkip}
            >
              Go to Dashboard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
