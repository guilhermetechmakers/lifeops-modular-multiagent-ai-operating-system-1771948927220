/**
 * Agent Console Dashboard Card - Status badge, last activity, quick actions.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Play, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent } from '@/types/agent-console'

export interface AgentConsoleCardProps {
  agent: Agent
  className?: string
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function statusVariant(
  status: Agent['status']
): 'success' | 'secondary' | 'warning' | 'destructive' {
  switch (status) {
    case 'online':
      return 'success'
    case 'paused':
      return 'warning'
    case 'error':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function AgentConsoleCard({ agent, className }: AgentConsoleCardProps) {
  const statusLabel = agent.status.charAt(0).toUpperCase() + agent.status.slice(1)

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-card-hover hover:scale-[1.01]',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="rounded-xl p-2.5 bg-primary/10 shrink-0">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{agent.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                <Badge variant={statusVariant(agent.status)}>{statusLabel}</Badge>
                <span>{formatRelativeTime(agent.last_activity)}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to={`/dashboard/agents/${agent.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Play className="h-4 w-4" />
                Simulate
              </Button>
            </Link>
            <Link to={`/dashboard/agents/${agent.id}`}>
              <Button variant="ghost" size="icon-sm" aria-label="Open agent settings">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">
          {agent.automation_level.replace(/-/g, ' ')} •{' '}
          {agent.cost_control?.spent != null
            ? `$${agent.cost_control.spent} spent`
            : 'No cost data'}
        </p>
      </CardContent>
    </Card>
  )
}
