/**
 * VersioningPanel - Version list, compare view (diff), revert action.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentVersionFull } from '@/types/content-dashboard'

export interface VersioningPanelProps {
  versions?: ContentVersionFull[]
  loading?: boolean
  onRevert?: (version: ContentVersionFull) => void
  disabled?: boolean
}

export function VersioningPanel({
  versions = [],
  loading,
  onRevert,
  disabled,
}: VersioningPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const list = (versions ?? []).slice(0, 20)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground py-4">Loading versions...</div>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No version history yet. Save your content to create versions.
          </p>
        ) : (
          <div className="space-y-2">
            {list.map((v) => {
              const isExpanded = expandedId === v.id
              return (
                <div
                  key={v.id}
                  className="rounded-lg border border-border p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">v{v.versionNumber}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(v.createdAt).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">by {v.authorId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(isExpanded ? null : v.id)}
                        disabled={disabled}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      {onRevert && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRevert(v)}
                          disabled={disabled}
                          className="gap-1"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Revert
                        </Button>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <pre
                      className={cn(
                        'text-xs p-3 rounded bg-muted/50 overflow-auto max-h-48',
                        'whitespace-pre-wrap break-words'
                      )}
                    >
                      {v.changes}
                    </pre>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
