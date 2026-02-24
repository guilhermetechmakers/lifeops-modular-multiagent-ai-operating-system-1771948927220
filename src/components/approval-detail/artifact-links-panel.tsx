/**
 * ArtifactLinksPanel - Links to run logs, outputs, inter-agent traces.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, FileOutput } from 'lucide-react'
import type { ArtifactReference } from '@/types/approvals'

export interface ArtifactLinksPanelProps {
  artifacts?: ArtifactReference[]
  className?: string
}

export function ArtifactLinksPanel({ artifacts = [], className }: ArtifactLinksPanelProps) {
  const items = Array.isArray(artifacts) ? artifacts : []

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileOutput className="h-4 w-4 text-primary" />
            Artifacts & Links
          </CardTitle>
          <CardDescription>No artifacts available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileOutput className="h-4 w-4 text-primary" />
          Artifacts & Links
        </CardTitle>
        <CardDescription>Run logs, outputs, and inter-agent traces</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((a) => (
            <a
              key={a.id}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/30 hover:border-primary/30 transition-colors text-primary"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span className="font-medium">{a.label}</span>
              <span className="text-xs text-muted-foreground">({a.type})</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
