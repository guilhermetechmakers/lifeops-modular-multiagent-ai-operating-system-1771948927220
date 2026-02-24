/**
 * ArtifactsGallery - Release artifacts and run artifacts viewer with diffs and logs.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, FileText, Download, ExternalLink } from 'lucide-react'
import type { Artifact, RunArtifact } from '@/types/projects'

interface ArtifactsGalleryProps {
  releaseArtifacts?: Artifact[]
  runArtifacts?: RunArtifact[]
  isLoading?: boolean
}

export function ArtifactsGallery({
  releaseArtifacts = [],
  runArtifacts = [],
  isLoading,
}: ArtifactsGalleryProps) {
  const [selectedType, setSelectedType] = useState<'release' | 'run'>('release')

  const releaseList = Array.isArray(releaseArtifacts) ? releaseArtifacts : []
  const runList = Array.isArray(runArtifacts) ? runArtifacts : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Artifacts</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Artifacts Gallery
          </CardTitle>
          <CardDescription>
            Release artifacts and run outputs
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedType === 'release' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('release')}
          >
            Release
          </Button>
          <Button
            variant={selectedType === 'run' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('run')}
          >
            Run
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {selectedType === 'release' ? (
          releaseList.length === 0 ? (
            <div className="py-16 text-center rounded-lg border border-dashed border-border">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No release artifacts yet</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {releaseList.map((a) => (
                <div
                  key={a.id}
                  className="group flex flex-col p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-card-hover transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-primary/80" />
                    <Badge variant="outline" className="text-xs">
                      {a.type}
                    </Badge>
                  </div>
                  <p className="font-medium mt-2 truncate">{a.name ?? a.id}</p>
                  <div className="mt-auto pt-4 flex gap-2">
                    {a.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={a.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          runList.length === 0 ? (
            <div className="py-16 text-center rounded-lg border border-dashed border-border">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No run artifacts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {runList.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{a.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <Badge variant="outline">{a.type}</Badge>
                </div>
              ))}
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
