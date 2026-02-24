/**
 * LinkedNavigationWidgets - Quick links to Agent Console, Run Detail, artifacts.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Bot, History, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LinkedNavigationWidgetsProps {
  runId: string
  fromAgentId: string | null
  toAgentId: string | null
  artifactIds?: string[]
  artifacts?: { artifactId: string; name: string; url: string; type: string }[]
  className?: string
}

export function LinkedNavigationWidgets({
  runId,
  fromAgentId,
  toAgentId,
  artifactIds = [],
  artifacts = [],
  className,
}: LinkedNavigationWidgetsProps) {
  const ids = Array.isArray(artifactIds) ? artifactIds : []
  const arts = Array.isArray(artifacts) ? artifacts : []
  const agentIds = [fromAgentId, toAgentId].filter(Boolean) as string[]

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link to={`/dashboard/runs/${runId}`}>
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <span>
              <History className="h-4 w-4" />
              Run Detail
            </span>
          </Button>
        </Link>

        {agentIds.map((agentId) => (
          <Link key={agentId} to={`/dashboard/agents/${agentId}`}>
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <span>
                <Bot className="h-4 w-4" />
                Agent: {agentId}
              </span>
            </Button>
          </Link>
        ))}

        {arts.length > 0 ? (
          arts.map((a) => (
            <a
              key={a.artifactId}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <span>
                  <FileText className="h-4 w-4" />
                  {a.name}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </span>
              </Button>
            </a>
          ))
        ) : ids.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {ids.length} artifact(s) linked (IDs: {ids.join(', ')})
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
