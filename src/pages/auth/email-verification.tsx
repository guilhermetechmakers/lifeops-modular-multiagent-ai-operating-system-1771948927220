import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const success = !!token

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md animate-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-foreground">
            LifeOps
          </Link>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              {success ? (
                <CheckCircle className="h-16 w-16 text-success" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive" />
              )}
            </div>
            <CardTitle className="text-2xl text-center">
              {success ? 'Email verified' : 'Verification failed'}
            </CardTitle>
            <CardDescription className="text-center">
              {success
                ? 'Your email has been verified. You can now log in to your account.'
                : 'The verification link is invalid or has expired. Please request a new one.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/login" className="block">
              <Button className="w-full">{success ? 'Log in' : 'Back to login'}</Button>
            </Link>
            {!success && (
              <Button variant="outline" className="w-full">
                Resend verification email
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
