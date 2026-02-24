/**
 * TrainingMealPlanCard - Training plan progress, meal plan progress, agent-suggested optimizations.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dumbbell, UtensilsCrossed, Sparkles } from 'lucide-react'
import type { Plan } from '@/types/health'
import { cn } from '@/lib/utils'

interface TrainingMealPlanCardProps {
  plans: Plan[]
  isLoading?: boolean
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className="h-2 rounded-full bg-secondary overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn('h-full bg-primary transition-all duration-300', className)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function TrainingMealPlanCard({ plans = [], isLoading }: TrainingMealPlanCardProps) {
  const items = plans ?? []
  const training = items.filter((p) => p.type === 'training')
  const meal = items.filter((p) => p.type === 'meal')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          Training & Meal Plans
        </CardTitle>
        <CardDescription>Progress and agent-suggested optimizations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Training */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Training
          </h4>
          {training.length === 0 ? (
            <p className="text-sm text-muted-foreground">No training plan</p>
          ) : (
            <div className="space-y-3">
              {training.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-border">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{p.title}</span>
                    <span className="text-muted-foreground">{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} />
                  {p.agentSuggestion && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      {p.agentSuggestion.summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meal */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Meal Plan
          </h4>
          {meal.length === 0 ? (
            <p className="text-sm text-muted-foreground">No meal plan</p>
          ) : (
            <div className="space-y-3">
              {meal.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-border">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{p.title}</span>
                    <span className="text-muted-foreground">{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} className="bg-success" />
                  {p.agentSuggestion && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      {p.agentSuggestion.summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
