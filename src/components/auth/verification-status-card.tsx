/**
 * VerificationStatusCard - Presents verification status (success, failure, pending)
 * with descriptive text, ARIA roles, and action buttons.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type VerificationStatus = 'loading' | 'success' | 'failure' | 'already_verified'

export interface VerificationStatusCardProps {
  status: VerificationStatus
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
    loading?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  tertiaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function VerificationStatusCard({
  status,
  title,
  description,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  className,
}: VerificationStatusCardProps) {
  const isSuccess = status === 'success' || status === 'already_verified'
  const isFailure = status === 'failure'
  const isWarning = status === 'already_verified'

  const Icon =
    status === 'loading'
      ? Loader2
      : isSuccess
        ? CheckCircle
        : isWarning
          ? AlertCircle
          : XCircle

  const iconColorClass = isSuccess
    ? 'text-[#5ED36D]'
    : isFailure
      ? 'text-[#EF6464]'
      : isWarning
        ? 'text-[#FFD66C]'
        : 'text-primary'

  return (
    <Card
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Verification ${status}`}
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
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              'rounded-full p-4 flex items-center justify-center',
              status === 'loading' && 'bg-primary/10'
            )}
          >
            <Icon
              className={cn(
                'h-16 w-16',
                iconColorClass,
                status === 'loading' && 'animate-spin'
              )}
              aria-hidden
            />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-[#AEB2B8] text-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {primaryAction && (
          <Button
            className="w-full bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white shadow-md hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            onClick={primaryAction.onClick}
            disabled={primaryAction.loading}
          >
            {primaryAction.loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {primaryAction.label}
              </>
            ) : (
              primaryAction.label
            )}
          </Button>
        )}
        {secondaryAction && (
          <Button
            variant="outline"
            className="w-full border-[#26282C] text-[#AEB2B8] hover:bg-secondary/80"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
        {tertiaryAction && (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={tertiaryAction.onClick}
          >
            {tertiaryAction.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
