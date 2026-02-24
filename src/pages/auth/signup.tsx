/**
 * SignupPage - Full registration flow for LifeOps.
 * Supports email/password, OAuth (Google, GitHub), optional quick onboarding.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PasswordMeter,
  getPasswordStrength,
  ValidationMessages,
  TermsCheckbox,
  SocialSignupRow,
  ModuleSelector,
  OnboardingPreview,
  EmailVerificationModal,
  SecurityNotice,
} from '@/components/auth'
import type { SignupOAuthProvider } from '@/components/auth'
import { signup, signupWithOAuth } from '@/api/auth'
import { cn } from '@/lib/utils'

const MIN_PASSWORD_STRENGTH: 'weak' | 'medium' | 'strong' = 'medium'

const signupSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (val) => {
        const s = getPasswordStrength(val)
        return s === 'medium' || s === 'strong'
      },
      {
        message:
          'Password must be at least medium strength (8+ chars, mix of letters, numbers, or symbols)',
      }
    ),
  terms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
})

type SignupForm = z.infer<typeof signupSchema>

export function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showQuickOnboarding, setShowQuickOnboarding] = useState(false)
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [verificationModalOpen, setVerificationModalOpen] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      name: '',
      company: '',
      password: '',
      terms: false as unknown as true,
    },
    mode: 'onChange',
  })

  const passwordValue = watch('password')
  const passwordStrength = getPasswordStrength(passwordValue ?? '')
  const onboardingPreferred = showQuickOnboarding

  const isPasswordStrongEnough =
    passwordStrength === 'strong' ||
    (passwordStrength === 'medium' && MIN_PASSWORD_STRENGTH !== 'strong') ||
    (passwordStrength === 'weak' && MIN_PASSWORD_STRENGTH === 'weak')

  const canSubmit = isPasswordStrongEnough && (passwordValue?.length ?? 0) >= 8

  const onSubmit = async (data: SignupForm) => {
    if (!canSubmit) return

    try {
      const result = await signup(data.email, data.password, {
        name: data.name,
        company: data.company,
        modules: selectedModules,
        onboardingPreferred,
      })

      if (!result.ok) {
        toast.error(result.error ?? 'Sign up failed')
        return
      }

      if (result.needsEmailVerification) {
        setVerificationEmail(data.email)
        setVerificationModalOpen(true)
        toast.success('Account created. Please verify your email.')
      } else {
        toast.success('Account created successfully')
        navigate(onboardingPreferred ? '/onboarding' : '/dashboard', { replace: true })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      toast.error(message)
    }
  }

  const handleOAuthClick = async (provider: SignupOAuthProvider) => {
    try {
      const result = await signupWithOAuth(provider, {
        onboardingPreferred,
      })

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
        return
      }
      if (result.ok) {
        toast.success('Signed up successfully')
        navigate(onboardingPreferred ? '/onboarding' : '/dashboard', { replace: true })
      } else {
        toast.error(result.error ?? `Sign up with ${provider} failed`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth sign-up failed. Please try again.'
      toast.error(message)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: '#18191C' }}
    >
      <div className="w-full max-w-md animate-in-up">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-2xl font-bold text-white hover:text-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#18191C] rounded"
          >
            LifeOps
          </Link>
        </div>

        <Card
          className={cn(
            'rounded-2xl border-[#26282C] shadow-card transition-all duration-300',
            'hover:shadow-card-hover'
          )}
          style={{
            backgroundColor: '#232429',
            borderColor: 'rgba(38, 40, 44, 0.6)',
          }}
        >
          <CardHeader className="space-y-1.5">
            <CardTitle className="text-2xl font-bold text-white">
              Create an account
            </CardTitle>
            <CardDescription className="text-[#AEB2B8]">
              Start your automation journey with LifeOps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'signup-email-error' : undefined}
                  className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
                  {...register('email')}
                />
                <ValidationMessages
                  error={errors.email?.message}
                  id="signup-email"
                  live="assertive"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'signup-name-error' : undefined}
                  className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
                  {...register('name')}
                />
                <ValidationMessages
                  error={errors.name?.message}
                  id="signup-name"
                  live="assertive"
                />
              </div>

              {/* Company (optional) */}
              <div className="space-y-2">
                <Label htmlFor="signup-company">Company (optional)</Label>
                <Input
                  id="signup-company"
                  type="text"
                  placeholder="Acme Inc"
                  autoComplete="organization"
                  {...register('company')}
                />
              </div>

              {/* Password with strength meter */}
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? 'signup-password-error' : 'password-strength'
                    }
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
                <PasswordMeter
                  id="password-strength"
                  strength={passwordStrength}
                  aria-label="Password strength"
                />
                {!canSubmit && (passwordValue?.length ?? 0) >= 8 && (
                  <p className="text-xs text-warning" role="status">
                    Use a mix of letters, numbers, and symbols for a stronger password
                  </p>
                )}
                <ValidationMessages
                  error={errors.password?.message}
                  id="signup-password"
                  live="assertive"
                />
              </div>

              {/* Terms */}
              <Controller
                control={control}
                name="terms"
                render={({ field }) => (
                  <TermsCheckbox
                    id="signup-terms"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    error={errors.terms?.message}
                  />
                )}
              />

              {/* Quick onboarding toggle */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowQuickOnboarding(!showQuickOnboarding)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          aria-pressed={showQuickOnboarding}
                >
                  <Sparkles className="h-4 w-4" />
                  Use quick onboarding
                </button>
              </div>

              {showQuickOnboarding && (
                <div
                  className="rounded-xl border border-border bg-card/30 p-4 space-y-4 animate-in"
                  role="region"
                  aria-label="Quick onboarding options"
                >
                  <ModuleSelector
                    selected={selectedModules}
                    onChange={setSelectedModules}
                  />
                  <OnboardingPreview selectedModules={selectedModules} />
                </div>
              )}

              {/* Primary CTA */}
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : onboardingPreferred ? (
                  'Start onboarding'
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            {/* Social signup */}
            <SocialSignupRow
              onProviderClick={handleOAuthClick}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            />

            <SecurityNotice />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <EmailVerificationModal
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
        email={verificationEmail}
      />
    </div>
  )
}
