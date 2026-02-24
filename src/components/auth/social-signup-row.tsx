/**
 * SocialSignupRow - Google and GitHub signup buttons with loading and error handling.
 */

import { Button } from '@/components/ui/button'
import { GoogleIcon, GitHubIcon } from './oauth-icons'
import { cn } from '@/lib/utils'

export type SignupOAuthProvider = 'google' | 'github'

interface SocialSignupRowProps {
  onProviderClick: (provider: SignupOAuthProvider) => void
  isLoading?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

const providers: {
  id: SignupOAuthProvider
  label: string
  Icon: React.ComponentType<{ className?: string; size?: number }>
}[] = [
  { id: 'google', label: 'Google', Icon: GoogleIcon },
  { id: 'github', label: 'GitHub', Icon: GitHubIcon },
]

export function SocialSignupRow({
  onProviderClick,
  isLoading = false,
  disabled = false,
  error,
  className,
}: SocialSignupRowProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(providers ?? []).map(({ id, label, Icon }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isLoading}
            onClick={() => onProviderClick(id)}
            className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
            aria-label={`Sign up with ${label}`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="ml-2">{label}</span>
          </Button>
        ))}
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  )
}
