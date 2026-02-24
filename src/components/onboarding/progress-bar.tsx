/**
 * ProgressBar - Shows step index with responsive layout.
 * Design: dark mode, 12-column grid, accent blue.
 */

import { cn } from '@/lib/utils'
import type { OnboardingStepKey } from '@/store/onboarding-store'
import { ONBOARDING_STEPS } from '@/types/onboarding'

interface ProgressBarProps {
  /** 1-based step number (1-7) or step key */
  currentStep?: number
  currentStepKey?: OnboardingStepKey
  onStepClick?: (step: number) => void
  className?: string
}

export function ProgressBar({ currentStep, currentStepKey, onStepClick, className }: ProgressBarProps) {
  const steps = ONBOARDING_STEPS ?? []
  const currentIdx =
    typeof currentStep === 'number' && currentStep >= 1
      ? Math.min(currentStep - 1, steps.length - 1)
      : currentStepKey
        ? steps.findIndex((s) => s.key === currentStepKey)
        : 0
  const progress = currentIdx >= 0 ? (currentIdx / Math.max(1, steps.length - 1)) * 100 : 0

  return (
    <div className={cn('w-full', className)} role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Onboarding progress">
      <div className="flex gap-2 mb-4">
        {(steps ?? []).map((step, idx) => {
          const isCompleted = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isClickable = Boolean(onStepClick)
          const El = isClickable ? 'button' : 'div'
          return (
            <El
              key={step.key}
              type={isClickable ? 'button' : undefined}
              onClick={isClickable ? () => onStepClick?.(idx + 1) : undefined}
              className={cn(
                'h-2 flex-1 rounded-full transition-all duration-300',
                isCompleted && 'bg-primary',
                isCurrent && 'bg-primary shadow-glow',
                !isCompleted && !isCurrent && 'bg-muted',
                isClickable && 'cursor-pointer'
              )}
              aria-hidden={!isClickable}
              aria-label={isClickable ? `Go to step ${idx + 1}` : undefined}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Step {currentIdx + 1} of {steps.length}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
