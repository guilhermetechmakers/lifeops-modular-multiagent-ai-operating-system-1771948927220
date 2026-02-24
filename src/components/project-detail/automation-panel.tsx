/**
 * ProjectsModuleAutomationPanel - Automation templates & CI/CD.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Play, Settings } from 'lucide-react'
import type { AutomationTemplateDetail } from '@/types/project-detail'

export interface AutomationPanelProps {
  projectId: string
  templates: AutomationTemplateDetail[]
  onRefresh: () => void
  onTriggerRun?: (templateId: string) => void
}

export function AutomationPanel({
  projectId: _projectId,
  templates,
  onRefresh: _onRefresh,
  onTriggerRun,
}: AutomationPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const allTemplates = templates ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Automation & CI/CD
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Roadmaps, PR triage, release automation, CI/CD triggers
        </p>
      </div>

      {allTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center max-w-sm">
              No automation templates yet. Create templates for roadmaps, PR triage, or CI/CD.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allTemplates.map((t) => (
            <Card
              key={t.id}
              className="transition-all duration-300 hover:shadow-card-hover"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {t.name ?? t.type}
                    <Badge variant="secondary" className="text-xs">
                      {t.type}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Permissions: {(t.permissions ?? []).join(', ') || 'None'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                    aria-label="Configure"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  {onTriggerRun && (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => onTriggerRun(t.id)}
                      aria-label="Trigger run"
                    >
                      <Play className="h-4 w-4" />
                      Run
                    </Button>
                  )}
                </div>
              </CardHeader>
              {expandedId === t.id && (
                <CardContent className="pt-0">
                  <pre className="rounded-lg bg-muted/50 p-4 text-xs overflow-x-auto">
                    {JSON.stringify({ config: t.config, constraints: t.constraints }, null, 2)}
                  </pre>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
