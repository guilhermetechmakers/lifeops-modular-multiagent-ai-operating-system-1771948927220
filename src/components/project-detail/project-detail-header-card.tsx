/**
 * ProjectDetailHeaderCard - Project name, status, health, integrations, quick actions.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FolderKanban,
  Map,
  Play,
  Download,
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import type { ProjectDetail } from '@/types/project-detail'
import { cn } from '@/lib/utils'

export interface ProjectDetailHeaderCardProps {
  project: ProjectDetail
  projectId: string
  onEditRoadmap?: () => void
  onTriggerRun?: () => void
  onExportConfig?: () => void
  onJumpToArtifacts?: () => void
}

export function ProjectDetailHeaderCard({
  project,
  projectId,
  onEditRoadmap,
  onTriggerRun,
  onExportConfig,
  onJumpToArtifacts,
}: ProjectDetailHeaderCardProps) {
  const [metricsExpanded, setMetricsExpanded] = useState(true)
  const healthScore = project.healthScore ?? 0
  const integrations = project.integrationsStatus ?? {}
  const integrationEntries = Object.entries(integrations)

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 50) return 'text-warning'
    return 'text-destructive'
  }

  const getIntegrationIcon = (status: string) => {
    if (status === 'connected') return <CheckCircle2 className="h-4 w-4 text-success" />
    if (status === 'error') return <AlertCircle className="h-4 w-4 text-warning" />
    return <XCircle className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/80 transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl p-3 bg-primary/10 ring-1 ring-primary/20">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {project.status && (
                  <Badge variant="secondary" className="font-medium">
                    {project.status}
                  </Badge>
                )}
                {project.lastUpdated && (
                  <span className="text-sm text-muted-foreground">
                    Updated {new Date(project.lastUpdated).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={onEditRoadmap}
              aria-label="Edit roadmap"
            >
              <Map className="h-4 w-4" />
              Edit Roadmap
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onTriggerRun}
              aria-label="Trigger run"
            >
              <Play className="h-4 w-4" />
              Trigger Run
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onExportConfig}
              aria-label="Export config"
            >
              <Download className="h-4 w-4" />
              Export Config
            </Button>
            {onJumpToArtifacts ? (
              <Button variant="outline" size="sm" className="gap-2" onClick={onJumpToArtifacts}>
                <Package className="h-4 w-4" />
                Jump to Artifacts
              </Button>
            ) : (
              <Link to={`/dashboard/projects/${projectId}/artifacts`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Package className="h-4 w-4" />
                  Jump to Artifacts
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <button
          type="button"
          onClick={() => setMetricsExpanded(!metricsExpanded)}
          className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-expanded={metricsExpanded}
        >
          <span className="text-sm font-medium">Health & Integrations</span>
          {metricsExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {metricsExpanded && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Health Score</p>
              <p className={cn('mt-1 text-2xl font-bold', getHealthColor(healthScore))}>
                {healthScore}%
              </p>
            </div>
            {integrationEntries.length > 0 && (
              <div className="rounded-lg border border-border bg-card/50 p-4 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Integrations
                </p>
                <div className="flex flex-wrap gap-3">
                  {integrationEntries.map(([key, status]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 rounded-md bg-background/50 px-3 py-1.5"
                    >
                      {getIntegrationIcon(status)}
                      <span className="text-sm font-medium capitalize">{key}</span>
                      <Badge variant="secondary" className="text-xs">
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
