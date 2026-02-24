/**
 * PasswordResetRequestForm - Email input to request password reset.
 * Neutral success message to avoid user enumeration.
 */

import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export type PasswordResetRequestFormData = z.infer<typeof schema>

export interface PasswordResetRequestFormProps {
  onSubmit: (data: PasswordResetRequestFormData) => Promise<void>
  isSubmitting?: boolean
  isSubmitSuccessful?: boolean
  error?: string
  className?: string
}

export function PasswordResetRequestForm({
  onSubmit,
  isSubmitting = false,
  isSubmitSuccessful = false,
  error,
  className,
}: PasswordResetRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
    mode: 'onChange',
  })

  if (isSubmitSuccessful) {
    return (
      <div className={cn('space-y-4', className)}>
        <p className="text-sm text-muted-foreground">
          If this email is registered, a reset link has been sent. Check your inbox and spam folder.
          The link typically arrives within a few minutes and expires in 1 hour.
        </p>
        <Link to="/login">
          <Button variant="outline" className="w-full">
            Back to login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-4', className)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'reset-email-error' : undefined}
          className={cn(
            errors.email && 'border-destructive focus-visible:ring-destructive animate-shake'
          )}
          {...register('email')}
        />
        {errors.email && (
          <p id="reset-email-error" className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send reset link'}
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
