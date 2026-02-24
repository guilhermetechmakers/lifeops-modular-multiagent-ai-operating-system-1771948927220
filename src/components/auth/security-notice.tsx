/**
 * SecurityNotice - Small, non-intrusive text about security best practices and 2FA importance.
 */

import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SecurityNoticeProps {
  className?: string
}

export function SecurityNotice({ className }: SecurityNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-xs text-muted-foreground',
        className
      )}
    >
      <Shield className="h-4 w-4 shrink-0 text-muted-foreground/80 mt-0.5" aria-hidden />
      <p>
        For your security, we recommend enabling two-factor authentication. Never share your
        credentials with anyone.
      </p>
    </div>
  )
}
