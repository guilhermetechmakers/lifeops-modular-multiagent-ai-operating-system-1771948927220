/**
 * HabitTrackerCard - Daily habits with check-offs, streaks, and trend indicators.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Flame, ListTodo } from 'lucide-react'
import type { Habit } from '@/types/health'

interface HabitTrackerCardProps {
  habits: Habit[]
  isLoading?: boolean
  onToggle?: (id: string) => Promise<void>
}

export function HabitTrackerCard({ habits = [], isLoading, onToggle }: HabitTrackerCardProps) {
  const items = habits ?? []
  const completed = items.filter((h) => h.isCompleted).length
  const total = items.length

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            Daily Habits
          </CardTitle>
          <CardDescription>
            {completed}/{total} completed today
          </CardDescription>
        </div>
        <div className="h-8 w-16 rounded-full bg-secondary overflow-hidden" role="progressbar" aria-valuenow={total ? (completed / total) * 100 : 0} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${total ? (completed / total) * 100 : 0}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No habits configured</p>
        ) : (
          <div className="space-y-3">
            {items.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Checkbox
                    id={h.id}
                    checked={h.isCompleted}
                    onCheckedChange={() => onToggle?.(h.id)}
                    aria-label={`Mark ${h.name} as ${h.isCompleted ? 'incomplete' : 'complete'}`}
                  />
                  <label htmlFor={h.id} className="text-sm font-medium truncate cursor-pointer">
                    {h.name}
                  </label>
                </div>
                <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" />
                  {h.streak}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
