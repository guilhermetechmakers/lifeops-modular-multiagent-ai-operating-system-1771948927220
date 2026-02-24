/**
 * PolicyEngineInsights - Conflicts, precedence, human-readable justifications.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Scale } from 'lucide-react'
import type { PolicyResult } from '@/types/agent-trace'
import { cn } from '@/lib/utils'

export interface PolicyEngineInsightsProps {
  policyResult: PolicyResult
  className?: string
}

export function PolicyEngineInsights({
  policyResult,
  className,
}: PolicyEngineInsightsProps) {
  const rules = policyResult?.appliedRules ?? []
  const items = Array.isArray(rules) ? rules : []
  if (items.length === 0) return null

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Scale className="h-4 w-4" />
          Policy Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((r) => (
          <div
            key={r.ruleId}
            className="rounded-lg border border-border p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  r.result === 'allow'
                    ? 'success'
                    : r.result === 'deny'
                      ? 'destructive'
                      : 'warning'
                }
              >
                {r.result}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">
                {r.ruleId}
              </span>
              <span className="text-xs text-muted-foreground">
                (rank {r.precedenceRank})
              </span>
            </div>
            {r.justification && (
              <p className="text-sm text-foreground">{r.justification}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
