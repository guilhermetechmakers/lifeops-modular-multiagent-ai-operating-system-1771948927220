/**
 * ArtifactsStoragePanel - Run artifacts, diffs, logs with signed URLs.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, FolderOpen } from 'lucide-react'
import type { RunArtifact } from '@/types/content-dashboard'

const TYPE_LABELS: Record<string, string> = {
  diff: 'Diff',
  generatedContent: 'Generated',
  log: 'Log',
  artifact: 'Artifact',
}

interface ArtifactsStoragePanelProps {
  artifacts: RunArtifact[]
  loading?: boolean
  onDownload?: (artifact: RunArtifact) => void
  disabled?: boolean
}

export function ArtifactsStoragePanel({
  artifacts,
  loading,
  onDownload,
  disabled,
}: ArtifactsStoragePanelProps) {
  const displayArtifacts = Array.isArray(artifacts) ? artifacts : []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-primary" />
          Artifacts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : displayArtifacts.length === 0 ? (
          <div className="py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No artifacts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Run artifacts will appear here after publishing or pipeline runs
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayArtifacts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border bg-card/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{a.path || a.type}</span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {TYPE_LABELS[a.type] ?? a.type}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0"
                  onClick={() => onDownload?.(a)}
                  disabled={disabled}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
