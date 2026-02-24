/**
 * ValidationMessages - Shared component for field-level errors and helper text.
 */

import { cn } from '@/lib/utils'

export interface ValidationMessagesProps {
  error?: string
  helper?: string
  id?: string
  className?: string
  /** Use aria-live for dynamic error announcements */
  live?: 'polite' | 'assertive' | 'off'
}

export function ValidationMessages({
  error,
  helper,
  id,
  className,
  live = 'assertive',
}: ValidationMessagesProps) {
  if (!error && !helper) return null

  return (
    <div className={cn('space-y-0.5', className)}>
      {error && (
        <p
          id={id ? `${id}-error` : undefined}
          className="text-sm text-destructive"
          role="alert"
          aria-live={live}
        >
          {error}
        </p>
      )}
      {helper && !error && (
        <p id={id ? `${id}-helper` : undefined} className="text-xs text-muted-foreground">
          {helper}
        </p>
      )}
    </div>
  )
}
