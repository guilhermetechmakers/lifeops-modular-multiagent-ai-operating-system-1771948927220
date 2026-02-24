/**
 * StepContainer - Wrapper for each step with title, description, and actions.
 * Provides consistent layout and navigation affordances.
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  backLabel?: string
  showBack?: boolean
  showNext?: boolean
  isNextDisabled?: boolean
  isNextLoading?: boolean
  className?: string
}

export function StepContainer({
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = 'Next',
  backLabel = 'Back',
  showBack = true,
  showNext = true,
  isNextDisabled = false,
  isNextLoading = false,
  className,
}: StepContainerProps) {
  return (
    <div className={cn('space-y-6 animate-in-up', className)}>
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="min-h-[200px]">{children}</div>

      <div className="flex justify-between gap-4 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={!showBack || !onBack}
          className="min-w-[100px]"
          aria-label={backLabel}
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Button>
        {showNext && (
          <Button
            onClick={onNext}
            disabled={isNextDisabled || isNextLoading}
            className="min-w-[120px]"
            aria-label={nextLabel}
          >
            {isNextLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <>
                {nextLabel}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
