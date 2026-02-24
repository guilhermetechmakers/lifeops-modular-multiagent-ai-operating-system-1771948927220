/**
 * PasswordMeter - Accessible strength indicator for password input.
 * Shows weak/medium/strong with color cues (red/yellow/green).
 */

import { cn } from '@/lib/utils'

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'empty'

export interface PasswordMeterProps {
  strength: PasswordStrength
  id?: string
  className?: string
  /** Accessible label for screen readers */
  'aria-label'?: string
}

const strengthConfig: Record<PasswordStrength, { width: string; color: string; label: string }> = {
  empty: { width: 'w-0', color: 'bg-muted', label: 'No password entered' },
  weak: { width: 'w-1/3', color: 'bg-destructive', label: 'Weak password' },
  medium: { width: 'w-2/3', color: 'bg-warning', label: 'Medium strength password' },
  strong: { width: 'w-full', color: 'bg-success', label: 'Strong password' },
}

export function PasswordMeter({
  strength,
  id,
  className,
  'aria-label': ariaLabel,
}: PasswordMeterProps) {
  const config = strengthConfig[strength] ?? strengthConfig.empty

  return (
    <div
      id={id}
      role="progressbar"
      aria-valuenow={strength === 'empty' ? 0 : strength === 'weak' ? 33 : strength === 'medium' ? 66 : 100}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? config.label}
      className={cn('space-y-1', className)}
    >
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            config.width,
            config.color
          )}
        />
      </div>
      {strength !== 'empty' && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {config.label}
        </p>
      )}
    </div>
  )
}

/**
 * Calculate password strength from string.
 * Weak: < 8 chars or only one char type
 * Medium: 8+ chars, 2 char types (e.g. letters + numbers)
 * Strong: 8+ chars, 3+ char types (upper, lower, number, symbol)
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) return 'empty'
  if (password.length < 8) return 'weak'

  let types = 0
  if (/[a-z]/.test(password)) types++
  if (/[A-Z]/.test(password)) types++
  if (/[0-9]/.test(password)) types++
  if (/[^a-zA-Z0-9]/.test(password)) types++

  if (types >= 3) return 'strong'
  if (types >= 2) return 'medium'
  return 'weak'
}
