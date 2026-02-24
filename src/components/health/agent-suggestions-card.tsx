/**
 * AgentSuggestionsCard - Agent-driven automation prompts with approve/modify/reject.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, Check, X } from 'lucide-react'
import type { AgentSuggestion } from '@/types/health'

interface AgentSuggestionsCardProps {
  suggestions: AgentSuggestion[]
  isLoading?: boolean
  onApprove?: (id: string) => Promise<void>
  onReject?: (id: string) => Promise<void>
}

export function AgentSuggestionsCard({
  suggestions = [],
  isLoading,
  onApprove,
  onReject,
}: AgentSuggestionsCardProps) {
  const items = suggestions ?? []
  const pending = items.filter((s) => s.status === 'pending')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Agent Suggestions
        </CardTitle>
        <CardDescription>
          Automation prompts with run provenance. Approve, modify, or reject.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No pending suggestions. All caught up.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm">{s.title}</h4>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Run: {s.runId.slice(0, 6)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{s.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary">Impact: {(s.impact * 100).toFixed(0)}%</span>
                  <div className="flex gap-1">
                    {onApprove && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Approve"
                        onClick={() => onApprove(s.id)}
                        className="text-success hover:bg-success/20"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {onReject && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Reject"
                        onClick={() => onReject(s.id)}
                        className="text-destructive hover:bg-destructive/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
