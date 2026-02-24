/**
 * ArtifactsGallery - Release artifacts and run artifacts viewer with diffs and logs.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileCode, Package, Download } from 'lucide-react'
import { fetchRunHistory, fetchReleases } from '@/api/projects'
import type { RunHistory, Release, Artifact } from '@/types/projects'
import { cn } from '@/lib/utils'

interface ArtifactsGalleryProps {
  projectId: string
}

export function ArtifactsGallery({ projectId }: ArtifactsGalleryProps) {
  const [runHistory, setRunHistory] = useState<RunHistory[]>([])
  const [releases, setReleases] = useState<Release[]>([])
  const [activeTab, setActiveTab] = useState<'runs' | 'releases'>('runs')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    Promise.all([fetchRunHistory(projectId), fetchReleases(projectId)])
      .then(([runs, rels]) => {
        if (!cancelled) {
          setRunHistory(Array.isArray(runs) ? runs : [])
          setReleases(Array.isArray(rels) ? rels : [])
          setIsLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [projectId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const allArtifacts: Artifact[] = (releases ?? []).flatMap((r) => r.artifacts ?? [])

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('runs')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'runs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Run History ({runHistory.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('releases')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'releases'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Release Artifacts ({allArtifacts.length})
        </button>
      </div>

      {activeTab === 'runs' && (
        <div className="space-y-3">
          {runHistory.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileCode className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                <p className="text-muted-foreground">No run history yet</p>
              </CardContent>
            </Card>
          ) : (
            (runHistory ?? []).map((run) => (
              <Card key={run.id} className="transition-all duration-300 hover:shadow-card-hover">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCode className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{run.summary ?? `Run ${run.runId}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {run.duration != null ? `${(run.duration / 1000).toFixed(1)}s` : ''} • {run.status}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      run.status === 'success' ? 'success' : run.status === 'failure' ? 'destructive' : 'secondary'
                    }
                  >
                    {run.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'releases' && (
        <div className="space-y-4">
          {releases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                <p className="text-muted-foreground">No release artifacts</p>
              </CardContent>
            </Card>
          ) : (
            (releases ?? []).map((rel) => (
              <Card key={rel.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {rel.version}
                  </CardTitle>
                  <CardDescription>{rel.releaseNotes}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {(rel.artifacts ?? []).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileCode className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{a.name ?? a.type ?? a.id}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
