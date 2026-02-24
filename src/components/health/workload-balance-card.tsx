/**
 * WorkloadBalanceCard - Suggested schedule adjustments, workload heatmap or timeline.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Scale, ChevronRight } from 'lucide-react'
import type { WorkloadSuggestion } from '@/types/health'

interface WorkloadBalanceCardProps {
  suggestions: WorkloadSuggestion[]
  isLoading?: boolean
  onApply?: (id: string) => void
}

export function WorkloadBalanceCard({ suggestions = [], isLoading, onApply }: WorkloadBalanceCardProps) {
  const items = suggestions ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Workload Balance
        </CardTitle>
        <CardDescription>Suggested schedule adjustments from agent analysis</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No workload suggestions. Your schedule looks balanced.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <h4 className="font-semibold text-sm mb-1">{s.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{s.summary}</p>
                {Array.isArray(s.suggestedAdjustments) && s.suggestedAdjustments.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                    {(s.suggestedAdjustments ?? []).map((adj, i) => (
                      <li key={i}>• {adj}</li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary">Impact: {(s.impact * 100).toFixed(0)}%</span>
                  {onApply && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApply(s.id)}
                      className="gap-1"
                    >
                      Apply
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
