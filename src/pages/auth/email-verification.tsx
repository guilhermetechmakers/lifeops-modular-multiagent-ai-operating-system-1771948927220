/**
 * EmailVerificationPage - Validates email verification token from URL,
 * handles success/failure states, and integrates with onboarding flow.
 */

import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  verifyEmailToken,
  getSessionAfterUrlVerification,
} from '@/api/auth'
import type { VerifyEmailResult } from '@/api/auth'
import {
  VerificationStatusCard,
  ErrorDetailPanel,
  OnboardingRedirectPanel,
} from '@/components/auth'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type PageState =
  | 'loading'
  | 'success'
  | 'failure'
  | 'no_token'

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [state, setState] = useState<PageState>('loading')
  const [result, setResult] = useState<VerifyEmailResult | null>(null)

  const goToDashboard = () => navigate('/dashboard', { replace: true })
  const goToOnboarding = () => navigate('/onboarding', { replace: true })
  const goToLogin = () => navigate('/login', { replace: true })

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const tokenVal = (searchParams.get('token') ?? searchParams.get('token_hash') ?? '').trim()

      if (tokenVal) {
        try {
          const res = await verifyEmailToken(tokenVal)
          if (cancelled) return
          setResult(res)
          if (res.ok) {
            setState('success')
          } else {
            setState('failure')
          }
        } catch {
          if (cancelled) return
          setResult({
            ok: false,
            status: 'invalid',
            error: 'Verification failed. Please try again.',
          })
          setState('failure')
        }
        return
      }

      const hash = window.location.hash
      if (hash && (hash.includes('access_token') || hash.includes('refresh_token'))) {
        await new Promise((r) => setTimeout(r, 500))
        if (cancelled) return
        try {
          const sessionRes = await getSessionAfterUrlVerification()
          if (cancelled) return
          if (sessionRes.hasSession) {
            setResult({
              ok: true,
              status: 'verified',
              user: sessionRes.user,
              needsOnboarding: sessionRes.needsOnboarding,
            })
            setState('success')
          } else {
            setState('no_token')
          }
        } catch {
          if (cancelled) return
          setState('no_token')
        }
        return
      }

      setState('no_token')
    }

    run()
    return () => {
      cancelled = true
    }
  }, [searchParams])

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

        {state === 'loading' && (
          <div
            className={cn(
              'rounded-2xl border-[#26282C] p-8 space-y-6',
              'border shadow-card'
            )}
            style={{
              backgroundColor: '#232429',
              borderColor: 'rgba(38, 40, 44, 0.6)',
            }}
          >
            <div className="flex justify-center">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <div className="space-y-2 text-center">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="flex justify-center gap-2">
              <Skeleton className="h-11 w-32" />
              <Skeleton className="h-11 w-32" />
            </div>
            <p
              className="text-sm text-[#AEB2B8] text-center"
              role="status"
              aria-live="polite"
            >
              Verifying your email...
            </p>
          </div>
        )}

        {state === 'success' && result?.ok && (
          <div className="space-y-6">
            <VerificationStatusCard
              status="success"
              title="Email verified"
              description="Your email has been verified. You can now access your account."
              primaryAction={
                result.needsOnboarding
                  ? {
                      label: 'Continue onboarding',
                      onClick: goToOnboarding,
                    }
                  : {
                      label: 'Go to Dashboard',
                      onClick: goToDashboard,
                    }
              }
              secondaryAction={
                result.needsOnboarding
                  ? { label: 'Go to Dashboard', onClick: goToDashboard }
                  : { label: 'Back to Sign In', onClick: goToLogin }
              }
            />
            {result.needsOnboarding && (
              <OnboardingRedirectPanel
                onContinue={goToOnboarding}
                onSkip={goToDashboard}
              />
            )}
          </div>
        )}

        {state === 'failure' && result && !result.ok && (
          <ErrorDetailPanel
            status={result.status as 'expired' | 'invalid' | 'already_verified'}
            errorMessage={result.error}
            onBackToSignIn={goToLogin}
            onGoToDashboard={
              result.status === 'already_verified' ? goToDashboard : undefined
            }
            email={result.user?.email}
          />
        )}

        {state === 'no_token' && (
          <ErrorDetailPanel
            status="invalid"
            errorMessage="No verification token found. Please use the link from your email or request a new one."
            onBackToSignIn={goToLogin}
            email={undefined}
          />
        )}
      </div>
    </div>
  )
}
