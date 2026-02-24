/**
 * AIFirstResponder - Inline AI drafting suggestions with accept/reject actions.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiSuggestion } from '@/types/content-dashboard'

export interface AIFirstResponderProps {
  suggestions?: AiSuggestion[]
  loading?: boolean
  generating?: boolean
  onGenerate?: () => Promise<AiSuggestion[]>
  onAccept?: (suggestion: AiSuggestion) => Promise<unknown>
  onReject?: (suggestionId: string) => Promise<unknown>
  disabled?: boolean
}

export function AIFirstResponder({
  suggestions = [],
  loading,
  generating,
  onGenerate,
  onAccept,
  onReject,
  disabled,
}: AIFirstResponderProps) {
  const pendingList = (suggestions ?? []).filter((s) => s.status === 'pending')

  if (pendingList.length === 0 && !onGenerate) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Suggestions
          </CardTitle>
          {onGenerate && (
            <Button
              size="sm"
              variant="outline"
              onClick={onGenerate}
              disabled={disabled || generating}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generating ? 'Generating...' : 'Generate Suggestions'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading suggestions...
          </div>
        ) : pendingList.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No pending suggestions. Click &quot;Generate Suggestions&quot; to get AI drafting help.
          </p>
        ) : (
          <div className="space-y-3">
            {(pendingList ?? []).map((s) => (
              <div
                key={s.id}
                className={cn(
                  'rounded-lg border border-border p-3 space-y-2',
                  'bg-primary/5 border-primary/20'
                )}
              >
                <p className="text-sm font-medium">{s.snippet}</p>
                {s.rationale && (
                  <p className="text-xs text-muted-foreground">{s.rationale}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1"
                    onClick={() => onAccept?.(s)}
                    disabled={disabled}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => onReject?.(s.id)}
                    disabled={disabled}
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
