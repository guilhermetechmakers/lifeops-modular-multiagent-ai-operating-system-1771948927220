/**
 * ResendVerificationButton - Triggers resend API; shows loading and feedback.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import { resendVerificationEmail } from '@/api/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface ResendVerificationButtonProps {
  email?: string
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  /** When true, show email input for resend (when email is unknown) */
  requireEmailInput?: boolean
}

export function ResendVerificationButton({
  email: initialEmail,
  onSuccess,
  onError,
  className,
  requireEmailInput = false,
}: ResendVerificationButtonProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string>('')
  const [emailInput, setEmailInput] = useState<string>(initialEmail ?? '')

  const email = initialEmail ?? emailInput
  const canResend = requireEmailInput ? email.trim().length > 0 : Boolean(email)

  const handleResend = async () => {
    const targetEmail = email?.trim()
    if (!targetEmail) return

    setIsResending(true)
    setResendError('')
    setResendSuccess(false)
    try {
      const result = await resendVerificationEmail(targetEmail)
      if (result.ok) {
        setResendSuccess(true)
        toast.success('Verification email sent. Check your inbox.')
        onSuccess?.()
      } else {
        const err = result.error ?? 'Failed to resend verification email.'
        setResendError(err)
        onError?.(err)
        toast.error(err)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to resend verification email.'
      setResendError(message)
      onError?.(message)
      toast.error(message)
    } finally {
      setIsResending(false)
    }
  }

  if (resendSuccess) {
    return (
      <div
        className={cn('flex items-center gap-2 text-sm text-[#5ED36D]', className)}
        role="status"
        aria-live="polite"
      >
        <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
        <span>Verification email sent. Check your inbox.</span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {requireEmailInput && !initialEmail && (
        <div className="space-y-2">
          <Label htmlFor="resend-email">Email address</Label>
          <Input
            id="resend-email"
            type="email"
            placeholder="you@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            disabled={isResending}
            className="bg-[#1F2124] border-[#26282C] text-white placeholder:text-[#74777D]"
            aria-invalid={!!resendError}
          />
        </div>
      )}
      {resendError && (
        <p className="text-sm text-[#EF6464]" role="alert" aria-live="assertive">
          {resendError}
        </p>
      )}
      <Button
        variant="outline"
        className="w-full border-[#26282C] text-[#AEB2B8] hover:bg-secondary/80"
        onClick={handleResend}
        disabled={!canResend || isResending}
      >
        {isResending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" aria-hidden />
            Resend verification email
          </>
        )}
      </Button>
    </div>
  )
}
