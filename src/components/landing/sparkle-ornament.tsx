import { cn } from '@/lib/utils'

export interface SparkleOrnamentProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  ariaHidden?: boolean
}

/**
 * Purely decorative sparkle/brand reinforcement.
 * Does not convey meaningful content - use aria-hidden when appropriate.
 */
export function SparkleOrnament({
  className,
  size = 'md',
  ariaHidden = true,
}: SparkleOrnamentProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <svg
      className={cn('text-primary/60', sizeClasses[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M12 15l1.5 4.5L18 21l-4.5-1.5L12 15l-1.5 4.5L6 21l4.5-1.5L12 15z" opacity="0.6" />
    </svg>
  )
}
