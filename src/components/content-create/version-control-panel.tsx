/**
 * VersionControlPanel - Version timeline, diffs, compare view, restore.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History, RotateCcw, GitCompare, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentVersionFull } from '@/types/content-dashboard'

interface VersionControlPanelProps {
  versions: ContentVersionFull[]
  loading?: boolean
  onRestore?: (version: ContentVersionFull) => void
  disabled?: boolean
}

function DiffView({ changes }: { changes: string }) {
  const lines = (changes ?? '').split('\n')
  return (
    <div className="font-mono text-xs max-h-32 overflow-y-auto rounded-lg border border-border bg-muted/30 p-2">
      {(lines ?? []).map((line, i) => {
        const isAdd = line.startsWith('+')
        const isRemove = line.startsWith('-')
        return (
          <div
            key={i}
            className={cn(
              'py-0.5',
              isAdd && 'text-success bg-success/10',
              isRemove && 'text-destructive bg-destructive/10'
            )}
          >
            {line || ' '}
          </div>
        )
      })}
    </div>
  )
}

export function VersionControlPanel({
  versions,
  loading,
  onRestore,
  disabled,
}: VersionControlPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [compareFrom, setCompareFrom] = useState<string | null>(null)
  const [compareTo, setCompareTo] = useState<string | null>(null)

  const sortedVersions = [...(versions ?? [])].sort((a, b) => b.versionNumber - a.versionNumber)

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
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : sortedVersions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No versions yet. Save your content to create versions.
          </p>
        ) : (
          <div className="space-y-2">
            {sortedVersions.map((v) => (
              <div
                key={v.id}
                className="rounded-lg border border-border bg-card/50 overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">v{v.versionNumber}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(v.createdAt).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">by {v.authorId}</span>
                  </div>
                  {expandedId === v.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedId === v.id && (
                  <div className="p-3 pt-0 space-y-2 border-t border-border">
                    <DiffView changes={v.changes} />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => onRestore?.(v)}
                        disabled={disabled}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => {
                          setCompareFrom(compareFrom ?? v.id)
                          setCompareTo(compareTo ?? v.id)
                        }}
                        disabled={disabled}
                      >
                        <GitCompare className="h-3 w-3" />
                        Compare
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
