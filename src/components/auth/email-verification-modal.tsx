/**
 * EmailVerificationModal - Handles sending/resending verification tokens; shows status.
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Mail, Loader2 } from 'lucide-react'
import { resendVerificationEmail } from '@/api/auth'

interface EmailVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

export function EmailVerificationModal({
  open,
  onOpenChange,
  email,
}: EmailVerificationModalProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string>('')

  const handleResend = async () => {
    if (!email) return
    setIsResending(true)
    setResendError('')
    setResendSuccess(false)
    try {
      const result = await resendVerificationEmail(email)
      if (result.ok) {
        setResendSuccess(true)
      } else {
        setResendError(result.error ?? 'Failed to resend')
      }
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Failed to resend')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="verification-description"
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" aria-hidden />
            </div>
          </div>
          <DialogTitle className="text-center">Verify your email</DialogTitle>
          <DialogDescription id="verification-description" className="text-center">
            We&apos;ve sent a verification link to <strong>{email}</strong>. Please check your
            inbox and click the link to activate your account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {resendSuccess && (
            <p className="text-sm text-success" role="status" aria-live="polite">
              Verification email sent again. Check your inbox.
            </p>
          )}
          {resendError && (
            <p className="text-sm text-destructive" role="alert" aria-live="assertive">
              {resendError}
            </p>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Sending...
              </>
            ) : (
              'Resend verification email'
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Didn&apos;t receive the email? Check your spam folder or try resending.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
