/**
 * StepCard - Reusable card for each wizard step.
 * Design: 12-16px radius, borders, hover elevation, dark card surface.
 */

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StepCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  /** Optional tip or contextual help */
  tip?: React.ReactNode
}

export function StepCard({ title, description, children, className, tip }: StepCardProps) {
  return (
    <Card
      className={cn(
        'rounded-xl border border-border bg-card shadow-card transition-all duration-300',
        'hover:shadow-card-hover hover:border-border/80',
        className
      )}
    >
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        {tip && (
          <div
            className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground"
            role="complementary"
            aria-label="Tip"
          >
            {tip}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
