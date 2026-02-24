/**
 * PasswordResetPage - Request form to initiate password reset via email.
 * User enters email to receive a time-bound reset link.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PasswordResetRequestForm } from '@/components/auth'
import { requestPasswordReset } from '@/api/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function PasswordResetPage() {
  const [error, setError] = useState<string>('')

  const handleSubmit = async (data: { email: string }) => {
    setError('')
    const { ok, error: err } = await requestPasswordReset(data.email)
    if (!ok) {
      setError(err ?? 'Failed to send reset email')
      toast.error(err ?? 'Failed to send reset email')
      throw new Error(err)
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
              Reset password
            </CardTitle>
            <CardDescription className="text-[#AEB2B8]">
              Enter your email and we&apos;ll send you a secure link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordResetRequestForm
              onSubmit={handleSubmit}
              error={error}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
