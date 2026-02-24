/**
 * ErrorGuard - Renders safe fallback when API data is missing.
 */

import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ErrorGuardProps {
  children?: ReactNode
  hasData: boolean
  message?: string
  error?: Error
  onRetry?: () => void
  fallback?: ReactNode
  className?: string
}

export function ErrorGuard({
  children,
  hasData,
  message = 'Data unavailable',
  error,
  onRetry,
  fallback,
  className,
}: ErrorGuardProps) {
  if (hasData && children !== null) {
    return <>{children}</>
  }

  const displayFallback = fallback ?? (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card/50 p-8 text-center',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{error?.message ?? message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
        >
          Retry
        </button>
      )}
    </div>
  )

  return <>{displayFallback}</>
}
