/**
 * PasswordResetConfirmForm - Set new password with strength indicator.
 * Used when user lands from Supabase recovery link (hash contains session).
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordMeter, getPasswordStrength } from '@/components/auth/password-meter'
import { validatePasswordPolicy } from '@/lib/password-policy'
import { cn } from '@/lib/utils'

const MIN_STRENGTH: 'medium' | 'strong' = 'medium'

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(
        (val) => {
          const s = getPasswordStrength(val ?? '')
          return s === 'medium' || s === 'strong'
        },
        {
          message: 'Password must include a mix of letters, numbers, or symbols',
        }
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type PasswordResetConfirmFormData = z.infer<typeof schema>

export interface PasswordResetConfirmFormProps {
  onSubmit: (data: PasswordResetConfirmFormData) => Promise<void>
  isSubmitting?: boolean
  isSuccess?: boolean
  error?: string
  className?: string
}

export function PasswordResetConfirmForm({
  onSubmit,
  isSubmitting = false,
  isSuccess = false,
  error,
  className,
}: PasswordResetConfirmFormProps) {
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordResetConfirmFormData>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  })

  const newPasswordValue = watch('newPassword') ?? ''
  const confirmPasswordValue = watch('confirmPassword') ?? ''
  const strength = getPasswordStrength(newPasswordValue)
  const policyResult = validatePasswordPolicy(newPasswordValue)

  const isPasswordStrongEnough =
    strength === 'strong' || (strength === 'medium' && MIN_STRENGTH !== 'strong')
  const passwordsMatch = newPasswordValue === confirmPasswordValue && confirmPasswordValue.length > 0
  const canSubmit =
    isPasswordStrongEnough &&
    newPasswordValue.length >= 8 &&
    passwordsMatch &&
    !isSubmitting

  if (isSuccess) {
    return (
      <div className={cn('space-y-4', className)}>
        <p className="text-sm text-muted-foreground">
          Your password has been updated successfully. You can now sign in with your new password.
        </p>
        <Link to="/login">
          <Button className="w-full">Sign in</Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-4', className)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showNewPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.newPassword}
            aria-describedby={
              errors.newPassword ? 'new-password-error' : 'new-password-strength'
            }
            className={cn(
              'pr-10',
              errors.newPassword && 'border-destructive focus-visible:ring-destructive animate-shake'
            )}
            {...register('newPassword')}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-1"
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        <PasswordMeter
          strength={strength}
          id="new-password-strength"
          aria-label="Password strength"
        />
        {errors.newPassword && (
          <p id="new-password-error" className="text-sm text-destructive" role="alert">
            {errors.newPassword.message}
          </p>
        )}
        {policyResult.hints.length > 0 && !errors.newPassword && (
          <p className="text-xs text-muted-foreground">
            {policyResult.hints.join('. ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            className={cn(
              'pr-10',
              errors.confirmPassword && 'border-destructive focus-visible:ring-destructive animate-shake'
            )}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-1"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? 'Updating...' : 'Update password'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          to="/login"
          className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          Back to login
        </Link>
      </p>
    </form>
  )
}
