/**
 * CronjobsDashboardLink - Entry to Cronjobs Dashboard from Workflow Editor.
 * Shows next run times and recent run outcomes for related workflows.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, ExternalLink, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchCronjobsForTemplate } from '@/api/workflow-editor'
import type { WorkflowRun } from '@/types/workflow-editor'

interface CronjobsDashboardLinkProps {
  templateId: string | null
}

export function CronjobsDashboardLink({ templateId }: CronjobsDashboardLinkProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!templateId) {
      setRuns([])
      return
    }
    let cancelled = false
    setLoading(true)
    fetchCronjobsForTemplate(templateId)
      .then((list) => {
        if (!cancelled) {
          const arr = Array.isArray(list) ? list : []
          setRuns(arr)
        }
      })
      .catch(() => {
        if (!cancelled) setRuns([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [templateId])

  const recentRuns = (runs ?? []).slice(0, 3)

  return (
    <Card className="rounded-xl border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Cronjobs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        ) : recentRuns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No runs for this template
          </p>
        ) : (
          <ul className="space-y-2">
            {(recentRuns ?? []).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-border p-2 text-sm"
              >
                <Badge
                  variant={
                    r.status === 'succeeded'
                      ? 'default'
                      : r.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {r.status}
                </Badge>
                <span className="text-muted-foreground text-xs truncate max-w-[100px]">
                  {r.startedAt
                    ? new Date(r.startedAt).toLocaleString()
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/dashboard/cronjobs">
            <ExternalLink className="h-4 w-4" />
            Open Cronjobs
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
