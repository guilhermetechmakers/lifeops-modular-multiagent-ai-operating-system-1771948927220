/**
 * Master Utilities - Save config, export artifacts, replay, re-run.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RotateCcw, FileCode } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MasterUtilitiesProps {
  onExportArtifacts?: () => void
  onReplay?: () => void
  onGenerateDiff?: () => void
  runId?: string
  className?: string
}

export function MasterUtilities({
  onExportArtifacts,
  onReplay,
  onGenerateDiff,
  runId,
  className,
}: MasterUtilitiesProps) {
  return (
    <Card className={cn('transition-all duration-300', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Master Utilities</CardTitle>
        <CardDescription>
          Export, replay, and artifact generation
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {onExportArtifacts && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onExportArtifacts}
          >
            <Download className="h-4 w-4" />
            Export Artifacts
          </Button>
        )}
        {onReplay && runId && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onReplay}
          >
            <RotateCcw className="h-4 w-4" />
            Replay Run
          </Button>
        )}
        {onGenerateDiff && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onGenerateDiff}
          >
            <FileCode className="h-4 w-4" />
            Generate Diff
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
