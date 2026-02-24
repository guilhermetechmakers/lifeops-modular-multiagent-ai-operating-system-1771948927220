/**
 * ArtifactsPanel - Artifact listing with type, size, retention, signed URLs.
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Package, Download, FileCode, FileText, File } from 'lucide-react'
import type { ArtifactDetail } from '@/types/project-detail'

export interface ArtifactsPanelProps {
  projectId: string
  artifacts: ArtifactDetail[]
  onRefresh: () => void
  onGetSignedUrl: (artifactId: string) => Promise<string>
}

export function ArtifactsPanel({
  projectId: _projectId,
  artifacts,
  onRefresh: _onRefresh,
  onGetSignedUrl,
}: ArtifactsPanelProps) {
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactDetail | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)

  const openArtifact = async (a: ArtifactDetail) => {
    setSelectedArtifact(a)
    setSignedUrl(a.signedUrl ?? null)
    if (!a.signedUrl) {
      setIsLoadingUrl(true)
      try {
        const url = await onGetSignedUrl(a.id)
        setSignedUrl(url)
      } finally {
        setIsLoadingUrl(false)
      }
    }
  }

  const formatSize = (bytes?: number) => {
    if (bytes == null) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getTypeIcon = (type: ArtifactDetail['type']) => {
    switch (type) {
      case 'log':
        return <FileText className="h-5 w-5 text-muted-foreground" />
      case 'diff':
        return <FileCode className="h-5 w-5 text-primary" />
      default:
        return <File className="h-5 w-5 text-muted-foreground" />
    }
  }

  const allArtifacts = artifacts ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Release Artifacts
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Artifacts, diffs, logs, generated content with retention policy
        </p>
      </div>

      {allArtifacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center max-w-sm">
              No artifacts yet. Build and release artifacts will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allArtifacts.map((a) => (
            <Card
              key={a.id}
              className="transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 cursor-pointer"
              onClick={() => openArtifact(a)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg p-2 bg-muted">
                    {getTypeIcon(a.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatSize(a.sizeBytes)} • {a.type}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.retentionPolicy && (
                        <Badge variant="secondary" className="text-xs">
                          {a.retentionPolicy}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" aria-label="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selectedArtifact} onOpenChange={(o) => !o && setSelectedArtifact(null)}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
          {selectedArtifact && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedArtifact.name}</SheetTitle>
                <SheetDescription>
                  {selectedArtifact.type} • {formatSize(selectedArtifact.sizeBytes)}
                  {selectedArtifact.retentionPolicy && ` • Retention: ${selectedArtifact.retentionPolicy}`}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                {isLoadingUrl ? (
                  <div className="animate-pulse h-24 rounded-lg bg-muted" />
                ) : signedUrl ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Preview / Download</p>
                    <a
                      href={signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm text-primary hover:underline"
                    >
                      {signedUrl}
                    </a>
                    <Button asChild className="w-full gap-2">
                      <a href={signedUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unable to load signed URL</p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
