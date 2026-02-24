/**
 * EmptyState - Helpful empty state with illustration, copy, and CTA.
 */

import { Link } from 'react-router-dom'
import { Library, FilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  title?: string
  description?: string
  showCreateCta?: boolean
  className?: string
}

export function EmptyState({
  title = 'No content found',
  description = 'Create your first content item or adjust your filters to see existing content.',
  showCreateCta = true,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div
        className="rounded-2xl bg-muted/50 p-8 mb-6"
        aria-hidden
      >
        <Library className="h-16 w-16 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm">{description}</p>
      {showCreateCta && (
        <Button asChild className="mt-6 gap-2" size="lg">
          <Link to="/dashboard/content">
            <FilePlus className="h-5 w-5" />
            Create Content
          </Link>
        </Button>
      )}
    </div>
  )
}
