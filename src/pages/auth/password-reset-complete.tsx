/**
 * PasswordResetCompletePage - Set new password after clicking reset link.
 * Supabase redirects here with hash params; session is recovered automatically.
 * User sets new password, then is signed out and redirected to login.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { updatePassword } from '@/api/auth'
import { PasswordResetConfirmForm } from '@/components/auth/password-reset-confirm-form'
import type { PasswordResetConfirmFormData } from '@/components/auth/password-reset-confirm-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type PageState = 'loading' | 'ready' | 'invalid' | 'success'

export function PasswordResetCompletePage() {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setPageState('invalid')
      setError('Authentication is not configured.')
      return
    }

    const hash = window.location.hash ?? ''
    const hasRecoveryParams = hash.includes('type=recovery') || hash.includes('access_token=')

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setPageState('ready')
        return
      }

      if (hasRecoveryParams) {
        await new Promise((r) => setTimeout(r, 500))
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        if (retrySession) {
          setPageState('ready')
          return
        }
      }

      if (!hasRecoveryParams) {
        setPageState('invalid')
        setError('This link is invalid or has expired. Please request a new password reset.')
      } else {
        setPageState('invalid')
        setError('This link has expired. Please request a new password reset.')
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (data: PasswordResetConfirmFormData) => {
    setError('')
    setIsSubmitting(true)

    try {
      const result = await updatePassword(data.newPassword)
      const { ok, error: err } = result ?? {}

      if (ok) {
        await supabase?.auth.signOut()
        setIsSuccess(true)
        toast.success('Password updated successfully. You can now sign in.')
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 2000)
      } else {
        setError(err ?? 'Failed to update password. Please try again.')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
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
              {pageState === 'loading'
                ? 'Loading...'
                : pageState === 'invalid'
                  ? 'Invalid or expired link'
                  : 'Set new password'}
            </CardTitle>
            <CardDescription className="text-[#AEB2B8]">
              {pageState === 'loading'
                ? 'Verifying your reset link...'
                : pageState === 'invalid'
                  ? 'Request a new password reset from the login page.'
                  : 'Enter your new password below.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pageState === 'loading' && (
              <div className="py-8 flex justify-center">
                <div
                  className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
                  aria-hidden
                />
              </div>
            )}

            {pageState === 'invalid' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Link to="/password-reset">
                  <button
                    type="button"
                    className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Request new reset link
                  </button>
                </Link>
                <p className="text-center text-sm text-muted-foreground">
                  <Link
                    to="/login"
                    className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    Back to login
                  </Link>
                </p>
              </div>
            )}

            {(pageState === 'ready' || isSuccess) && (
              <PasswordResetConfirmForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isSuccess={isSuccess}
                error={error}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
