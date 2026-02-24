/**
 * Orchestration & Tools Inspector - Neighboring agents, tool usage, handoff rules.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tool } from '@/types/agent-console'

export interface OrchestrationToolsInspectorProps {
  tools: Tool[]
  isLoading?: boolean
  handoffCount?: number
  negotiationCount?: number
  className?: string
}

export function OrchestrationToolsInspector({
  tools,
  isLoading,
  handoffCount = 0,
  negotiationCount = 0,
  className,
}: OrchestrationToolsInspectorProps) {
  const items = Array.isArray(tools) ? tools : []

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-6 w-36 bg-muted/30 rounded" />
          <div className="h-4 w-48 bg-muted/30 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted/30 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('transition-all duration-300', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Tools & Orchestration
          </CardTitle>
          {(handoffCount > 0 || negotiationCount > 0) && (
            <div className="flex gap-2">
              {handoffCount > 0 && (
                <Badge variant="default" className="gap-1">
                  <GitBranch className="h-3 w-3" />
                  {handoffCount} handoffs
                </Badge>
              )}
              {negotiationCount > 0 && (
                <Badge variant="warning" className="gap-1">
                  {negotiationCount} negotiations
                </Badge>
              )}
            </div>
          )}
        </div>
        <CardDescription>
          Configured tools and handoff rules
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No tools configured</p>
        ) : (
          <div className="space-y-2">
            {items.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-2"
              >
                <span className="font-mono text-sm">{tool.name}</span>
                <Badge variant="secondary" className="text-xs">
                  v{tool.version}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
