/**
 * CreateContentShortcut - Prominent CTA to create new content.
 */

import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CreateContentShortcutProps {
  to?: string
  prefillFromTemplateId?: string
  prefillFromDraftId?: string
  className?: string
  variant?: 'default' | 'outline'
}

export function CreateContentShortcut({
  to = '/dashboard/content/create',
  prefillFromTemplateId,
  prefillFromDraftId,
  className,
  variant = 'default',
}: CreateContentShortcutProps) {
  const searchParams = new URLSearchParams()
  if (prefillFromTemplateId) searchParams.set('template', prefillFromTemplateId)
  if (prefillFromDraftId) searchParams.set('draft', prefillFromDraftId)
  const href = searchParams.toString() ? `${to}?${searchParams}` : to

  return (
    <Button
      asChild
      variant={variant}
      className={cn('gap-2', className)}
    >
      <Link to={href}>
        <Plus className="h-5 w-5" />
        Create Content
      </Link>
    </Button>
  )
}
