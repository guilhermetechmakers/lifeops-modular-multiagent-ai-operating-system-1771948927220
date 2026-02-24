/**
 * Avatar - User/owner initials display.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

function getInitials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')
  }
  return (name ?? '').slice(0, 2).toUpperCase() || '?'
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, src, size = 'md', ...props }, ref) => {
    const initials = getInitials(name ?? '')
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold overflow-hidden',
          sizeClasses[size],
          className
        )}
        role="img"
        aria-label={name ? `Avatar for ${name}` : undefined}
        {...props}
      >
        {src ? (
          <img src={src} alt={name ?? ''} className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
}

function AvatarGroup({ className, children, max = 4, ...props }: AvatarGroupProps) {
  const items = React.Children.toArray(children)
  const visible = items.slice(0, max)
  const overflow = items.length - max
  return (
    <div className={cn('flex -space-x-2', className)} {...props}>
      {visible.map((child, i) => (
        <div key={i} className="ring-2 ring-card rounded-full">
          {child}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium ring-2 ring-card"
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}

export { Avatar, AvatarGroup }
