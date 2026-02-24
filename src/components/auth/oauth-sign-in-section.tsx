/**
 * OAuthSignInSection - Google, GitHub, Microsoft sign-in buttons.
 */

import { Button } from '@/components/ui/button'
import { GoogleIcon, GitHubIcon, MicrosoftIcon } from './oauth-icons'
import type { OAuthProvider } from '@/types/auth'
import { cn } from '@/lib/utils'

interface OAuthSignInSectionProps {
  onProviderClick: (provider: OAuthProvider) => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

const providers: { id: OAuthProvider; label: string; Icon: React.ComponentType<{ className?: string; size?: number }> }[] = [
  { id: 'google', label: 'Google', Icon: GoogleIcon },
  { id: 'github', label: 'GitHub', Icon: GitHubIcon },
  { id: 'microsoft', label: 'Microsoft', Icon: MicrosoftIcon },
]

export function OAuthSignInSection({
  onProviderClick,
  isLoading = false,
  disabled = false,
  className,
}: OAuthSignInSectionProps) {
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {(providers ?? []).map(({ id, label, Icon }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isLoading}
            onClick={() => onProviderClick(id)}
            className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
            aria-label={`Sign in with ${label}`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="ml-2">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
