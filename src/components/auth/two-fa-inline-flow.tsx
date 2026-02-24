/**
 * TwoFAInlineFlow - TOTP verification after credential validation when 2FA is required.
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const totpSchema = z.object({
  code: z.string().min(6, 'Enter your 6-digit code').max(8, 'Invalid code format'),
})

type TotpForm = z.infer<typeof totpSchema>

interface TwoFAInlineFlowProps {
  onVerify: (code: string) => Promise<void>
  onBack?: () => void
  isLoading?: boolean
  error?: string
  className?: string
}

export function TwoFAInlineFlow({
  onVerify,
  onBack,
  isLoading = false,
  error,
  className,
}: TwoFAInlineFlowProps) {
  const [resendCooldown, setResendCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TotpForm>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: '' },
  })

  const handleResend = () => {
    if (resendCooldown > 0) return
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div
      className={cn('space-y-4 animate-in', className)}
      role="region"
      aria-label="Two-factor authentication"
    >
      <div className="flex items-center gap-2 text-foreground">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
        <h3 className="text-lg font-semibold">Two-factor authentication</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code from your authenticator app to complete sign in.
      </p>
      <form onSubmit={handleSubmit((data) => onVerify(data.code))} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="totp-code">Verification code</Label>
          <Input
            id="totp-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={8}
            disabled={isLoading}
            aria-invalid={!!errors.code}
            aria-describedby={errors.code ? 'totp-error' : undefined}
            className={cn(
              'font-mono text-lg tracking-widest text-center',
              errors.code && 'border-destructive'
            )}
            {...register('code')}
          />
          {errors.code && (
            <p id="totp-error" className="text-sm text-destructive" role="alert">
              {errors.code.message}
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
              Back
            </Button>
          )}
        </div>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isLoading}
          className="text-xs text-muted-foreground hover:text-foreground underline disabled:opacity-50 disabled:no-underline"
        >
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
        </button>
      </form>
    </div>
  )
}
