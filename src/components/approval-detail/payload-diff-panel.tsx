/**
 * PayloadDiffPanel - Before/after payload diffs with artifact links.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileCode, ExternalLink } from 'lucide-react'
import { DiffViewer } from './diff-viewer'
import { DiffsLinkModal } from './diffs-link-modal'
import type { PayloadDiff, ArtifactReference } from '@/types/approvals'

export interface PayloadDiffPanelProps {
  diffs?: PayloadDiff[]
  artifacts?: ArtifactReference[]
  className?: string
}

export function PayloadDiffPanel({ diffs, artifacts, className }: PayloadDiffPanelProps) {
  const diffList = Array.isArray(diffs) ? diffs : []
  const artifactList = Array.isArray(artifacts) ? artifacts : []
  const [modalOpen, setModalOpen] = useState(false)
  const hasContent = diffList.length > 0 || artifactList.length > 0

  if (!hasContent) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Payload & Diffs
          </CardTitle>
          <CardDescription>Before/after diffs and artifact links</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4">No diffs or artifacts</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Payload & Diffs
          </CardTitle>
          <CardDescription>Before/after diffs and artifact links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {diffList.length > 0 && (
            <div>
              {diffList.length === 1 ? (
                <DiffViewer diff={diffList[0]} defaultCollapsed={false} maxHeight={200} />
              ) : (
                <div className="space-y-2">
                  <DiffViewer diff={diffList[0]} defaultCollapsed={true} maxHeight={200} />
                  <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
                    View full diff ({diffList.length} items)
                  </Button>
                </div>
              )}
            </div>
          )}
          {artifactList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {artifactList.map((a) => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/30 text-sm"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {a.label}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <DiffsLinkModal open={modalOpen} onOpenChange={setModalOpen} diffs={diffList} />
    </>
  )
}
