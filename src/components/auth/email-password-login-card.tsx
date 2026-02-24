/**
 * EmailPasswordLoginCard - Email/password form with validation, remember me, and links.
 */

import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import { getRememberMe, setRememberMe } from '@/api/auth'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

interface EmailPasswordLoginCardProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  isLoading?: boolean
  error?: string
  disabled?: boolean
}

export function EmailPasswordLoginCard({
  onSubmit,
  isLoading = false,
  error,
  disabled = false,
}: EmailPasswordLoginCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const remembered = getRememberMe()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: remembered,
    },
    mode: 'onChange',
  })

  const rememberValue = watch('remember')

  useEffect(() => {
    if (rememberValue !== undefined) {
      setRememberMe(rememberValue)
    }
  }, [rememberValue])

  const isFormValid = isValid && !disabled

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={disabled}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <Link
            to="/password-reset"
            className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={disabled}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={cn(
              'pr-10',
              errors.password && 'border-destructive focus-visible:ring-destructive'
            )}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="login-remember"
          disabled={disabled}
          className="h-4 w-4 rounded border-input bg-background text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Remember me"
          {...register('remember')}
        />
        <Label htmlFor="login-remember" className="font-normal cursor-pointer text-sm">
          Remember me
        </Label>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Sign up
        </Link>
      </p>
    </form>
  )
}
