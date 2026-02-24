/**
 * MonthlyClosePanel - Checklist, reconciliations, action triggers.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { MonthlyClosure, ChecklistItem } from '@/types/finance'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Circle, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MonthlyClosePanelProps {
  monthlyClose: MonthlyClosure | null
  isLoading?: boolean
  onStart?: () => Promise<void>
}

export function MonthlyClosePanel({
  monthlyClose,
  isLoading,
  onStart,
}: MonthlyClosePanelProps) {
  const items: ChecklistItem[] = monthlyClose?.checklist_items ?? []
  const completed = items.filter((i) => i.status === 'complete').length
  const total = items.length
  const progress = total > 0 ? (completed / total) * 100 : 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Close</CardTitle>
          <CardDescription>
            Checklist, reconciliations, and action triggers
          </CardDescription>
        </div>
        {!monthlyClose && onStart && (
          <Button size="sm" onClick={() => onStart()} className="gap-1">
            <PlayCircle className="h-4 w-4" />
            Start Close
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!monthlyClose ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No active monthly close</p>
            {onStart && (
              <Button variant="outline" className="mt-4" onClick={() => onStart()}>
                Start monthly close
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{completed} / {total}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              {items.map((i) => (
                <div
                  key={i.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    i.status === 'complete'
                      ? 'border-success/30 bg-success/5'
                      : 'border-border bg-card/50'
                  )}
                >
                  {i.status === 'complete' ? (
                    <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{i.item}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(i.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      i.status === 'complete'
                        ? 'success'
                        : i.status === 'in_progress'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {i.status}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
