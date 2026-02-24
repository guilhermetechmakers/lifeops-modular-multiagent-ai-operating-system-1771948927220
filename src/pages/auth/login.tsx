/**
 * LoginPage - Entry point for user authentication.
 * Supports email/password, OAuth (Google, GitHub, Microsoft), 2FA, and account recovery.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  EmailPasswordLoginCard,
  OAuthSignInSection,
  TwoFAInlineFlow,
  SecurityNotice,
} from '@/components/auth'
import type { LoginFormData } from '@/components/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  login,
  verify2FA,
  initiateOAuth,
} from '@/api/auth'
import type { OAuthProvider } from '@/types/auth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type AuthState = 'credentials' | 'two-fa'

export function LoginPage() {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState<AuthState>('credentials')
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string>('')
  const [twoFAError, setTwoFAError] = useState<string>('')

  const handleEmailPasswordSubmit = async (data: LoginFormData) => {
    setLoginError('')
    setIsLoading(true)
    try {
      const response = await login(data.email, data.password, data.remember ?? false)
      const { ok, requires2FA, error } = response ?? {}

      if (ok && requires2FA) {
        setAuthState('two-fa')
        setTwoFAError('')
      } else if (ok) {
        toast.success('Signed in successfully')
        navigate('/dashboard', { replace: true })
      } else {
        setLoginError(error ?? 'Invalid email or password')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setLoginError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FAVerify = async (code: string) => {
    setTwoFAError('')
    setIsLoading(true)
    try {
      const response = await verify2FA(code)
      const { ok, error } = response ?? {}

      if (ok) {
        toast.success('Signed in successfully')
        navigate('/dashboard', { replace: true })
      } else {
        setTwoFAError(error ?? 'Invalid verification code')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please try again.'
      setTwoFAError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FABack = async () => {
    setAuthState('credentials')
    setTwoFAError('')
    await supabase?.auth.signOut()
  }

  const handleOAuthClick = async (provider: OAuthProvider) => {
    setLoginError('')
    setIsLoading(true)
    try {
      const response = await initiateOAuth(provider)
      const { redirectUrl, ok, error } = response ?? {}

      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }
      if (ok) {
        toast.success('Signed in successfully')
        navigate('/dashboard', { replace: true })
      } else {
        setLoginError(error ?? `Sign in with ${provider} failed`)
        toast.error(error ?? `Sign in with ${provider} failed`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth sign-in failed. Please try again.'
      setLoginError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const isTwoFAFlow = authState === 'two-fa'

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
              {isTwoFAFlow ? 'Verify your identity' : 'Sign in'}
            </CardTitle>
            <CardDescription className="text-[#AEB2B8]">
              {isTwoFAFlow
                ? 'Enter your verification code to complete sign in'
                : 'Enter your credentials to access your account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isTwoFAFlow ? (
              <TwoFAInlineFlow
                onVerify={handle2FAVerify}
                onBack={handle2FABack}
                isLoading={isLoading}
                error={twoFAError}
              />
            ) : (
              <>
                <EmailPasswordLoginCard
                  onSubmit={handleEmailPasswordSubmit}
                  isLoading={isLoading}
                  error={loginError}
                  disabled={isLoading}
                />
                <OAuthSignInSection
                  onProviderClick={handleOAuthClick}
                  isLoading={isLoading}
                  disabled={isLoading}
                />
                <SecurityNotice />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
