/**
 * ArtifactsPanel - List and preview artifacts with download links.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileJson, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RunArtifact } from '@/types/runs'

export interface ArtifactsPanelProps {
  artifacts?: RunArtifact[] | null
  isLoading?: boolean
}

function getIcon(type: string) {
  if (type?.toLowerCase().includes('json')) return FileJson
  return FileText
}

export function ArtifactsPanel({ artifacts, isLoading }: ArtifactsPanelProps) {
  const items = Array.isArray(artifacts) ? artifacts : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Artifacts</CardTitle>
          <CardDescription>Run outputs and artifacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Artifacts</CardTitle>
          <CardDescription>Run outputs and artifacts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No artifacts for this run.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artifacts</CardTitle>
        <CardDescription>Run outputs and artifacts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(items ?? []).map((art) => {
            const Icon = getIcon(art.type ?? '')
            return (
              <div
                key={art.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border border-border',
                  'hover:bg-muted/20 transition-colors'
                )}
              >
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{art.name}</p>
                  <p className="text-xs text-muted-foreground">{art.type}</p>
                </div>
                {art.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={art.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
