import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface FeaturePanelCardProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHandler?: () => void
  href?: string
  gradient?: string
  className?: string
  style?: React.CSSProperties
}

export function FeaturePanelCard({
  icon: Icon,
  title,
  description,
  actionLabel = 'Learn more',
  actionHandler,
  href,
  gradient = 'from-primary/20 to-primary/5',
  className,
  style,
}: FeaturePanelCardProps) {
  const content = (
    <>
      <div className={cn('h-1 bg-gradient-to-r', gradient)} />
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'rounded-lg p-2 bg-gradient-to-br',
              gradient
            )}
          >
            <Icon className="h-6 w-6 text-foreground" aria-hidden />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {actionLabel && (actionHandler || href) ? (
          href ? (
            <Link
              to={href}
              className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
              aria-label={`${actionLabel} for ${title}`}
            >
              {actionLabel}
            </Link>
          ) : (
            <Button
              variant="link"
              className="p-0 h-auto text-primary hover:text-primary/80"
              onClick={actionHandler}
              aria-label={`${actionLabel} for ${title}`}
            >
              {actionLabel}
            </Button>
          )
        ) : null}
      </CardContent>
    </>
  )

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-glow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        className
      )}
      style={style}
    >
      {content}
    </Card>
  )
}
