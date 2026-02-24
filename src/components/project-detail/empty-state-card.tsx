/**
 * EmptyStateCard - Reusable empty state with icon, message, CTA.
 */

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

export interface EmptyStateCardProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="font-medium text-center">{title}</p>
        <p className="text-muted-foreground text-center text-sm max-w-sm mt-1">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button variant="outline" className="mt-4" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
