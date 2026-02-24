/**
 * ErrorDetailPanel - Shows structured error information with guidance and actions.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react'
import { ResendVerificationButton } from './resend-verification-button'
import { cn } from '@/lib/utils'

export type ErrorStatus = 'expired' | 'invalid' | 'already_verified'

export interface ErrorDetailPanelProps {
  status: ErrorStatus
  errorMessage?: string
  onBackToSignIn: () => void
  onGoToDashboard?: () => void
  onResendSuccess?: () => void
  /** Email for resend when known; otherwise show input */
  email?: string
  supportUrl?: string
  className?: string
}

const ERROR_GUIDANCE: Record<
  ErrorStatus,
  { title: string; description: string; causes: string[] }
> = {
  expired: {
    title: 'Verification link expired',
    description: 'Your verification link has expired. Request a new one to continue.',
    causes: [
      'Links expire after 24 hours for security',
      'You may have already used this link',
    ],
  },
  invalid: {
    title: 'Invalid verification link',
    description: 'This verification link is invalid or has already been used.',
    causes: [
      'The link may have been copied incorrectly',
      'The link may have already been used',
    ],
  },
  already_verified: {
    title: 'Email already verified',
    description: 'Your email is already verified. You can sign in to your account.',
    causes: [],
  },
}

export function ErrorDetailPanel({
  status,
  errorMessage,
  onBackToSignIn,
  onGoToDashboard,
  onResendSuccess,
  email,
  supportUrl = '/help',
  className,
}: ErrorDetailPanelProps) {
  const guidance = ERROR_GUIDANCE[status]
  const showResend = status === 'expired' || status === 'invalid'
  const isAlreadyVerified = status === 'already_verified'

  return (
    <Card
      role="alert"
      aria-live="assertive"
      className={cn(
        'rounded-2xl border-[#26282C] shadow-card transition-all duration-300',
        className
      )}
      style={{
        backgroundColor: '#232429',
        borderColor: 'rgba(38, 40, 44, 0.6)',
      }}
    >
      <CardHeader className="space-y-1.5">
        <div className="flex justify-center mb-4">
          <div className="rounded-full p-4 bg-[#EF6464]/10">
            <XCircle
              className={cn(
                'h-16 w-16',
                status === 'already_verified' ? 'text-[#FFD66C]' : 'text-[#EF6464]'
              )}
              aria-hidden
            />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white text-center">
          {guidance.title}
        </CardTitle>
        <CardDescription className="text-[#AEB2B8] text-center">
          {guidance.description}
        </CardDescription>
        {errorMessage && (
          <p className="text-sm text-[#AEB2B8] text-center mt-2">
            {errorMessage}
          </p>
        )}
        {guidance.causes.length > 0 && (
          <ul className="text-sm text-[#74777D] list-disc list-inside mt-2 space-y-1">
            {(guidance.causes ?? []).map((cause, i) => (
              <li key={i}>{cause}</li>
            ))}
          </ul>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showResend && (
          <ResendVerificationButton
            email={email}
            requireEmailInput={!email}
            onSuccess={onResendSuccess}
          />
        )}
        {isAlreadyVerified && onGoToDashboard ? (
          <Button
            className="w-full bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white"
            onClick={onGoToDashboard}
          >
            Go to Dashboard
          </Button>
        ) : null}
        {(!isAlreadyVerified || !onGoToDashboard) && (
          <Button
            className="w-full bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white"
            onClick={onBackToSignIn}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Sign In
          </Button>
        )}
        {isAlreadyVerified && onGoToDashboard && (
          <Button
            variant="outline"
            className="w-full border-[#26282C] text-[#AEB2B8] hover:bg-secondary/80"
            onClick={onBackToSignIn}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Sign In
          </Button>
        )}
        {supportUrl && (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => window.location.href = supportUrl}
          >
            <HelpCircle className="h-4 w-4" aria-hidden />
            Contact support
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
