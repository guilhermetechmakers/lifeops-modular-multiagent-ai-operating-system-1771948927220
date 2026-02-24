/**
 * Password policy validation utilities.
 * Enforces min length, complexity, and provides real-time feedback.
 */

import { getPasswordStrength, type PasswordStrength } from '@/components/auth/password-meter'

export const PASSWORD_POLICY = {
  minLength: 8,
  requireMediumOrStrong: true,
} as const

export interface PasswordPolicyResult {
  valid: boolean
  strength: PasswordStrength
  errors: string[]
  hints: string[]
}

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const strength = getPasswordStrength(password ?? '')
  const errors: string[] = []
  const hints: string[] = []

  if (!password || password.length === 0) {
    return {
      valid: false,
      strength: 'empty',
      errors: [],
      hints: [
        `At least ${PASSWORD_POLICY.minLength} characters`,
        'Mix of uppercase, lowercase, numbers, or symbols',
      ],
    }
  }

  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters`)
  }

  if (PASSWORD_POLICY.requireMediumOrStrong && (strength === 'weak' || strength === 'empty')) {
    errors.push('Password must include a mix of letters, numbers, or symbols')
  }

  if (strength === 'empty' || strength === 'weak') {
    hints.push('Add uppercase, numbers, or symbols for a stronger password')
  }

  const valid = errors.length === 0

  return {
    valid,
    strength,
    errors,
    hints: valid ? [] : hints,
  }
}
