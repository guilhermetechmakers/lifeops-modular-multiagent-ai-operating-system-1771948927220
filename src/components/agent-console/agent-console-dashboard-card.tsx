/**
 * AgentConsoleDashboardCard - Compact row with status, last activity, quick actions.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Play, Settings, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent } from '@/types/agent-console'

export interface AgentConsoleDashboardCardProps {
  agent: Agent
  className?: string
}

function formatLastActivity(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString()
}

function statusVariant(
  status: Agent['status']
): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'online':
      return 'success'
    case 'offline':
      return 'secondary'
    case 'paused':
      return 'warning'
    case 'error':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function AgentConsoleDashboardCard({ agent, className }: AgentConsoleDashboardCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-card-hover hover:border-primary/20',
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
              <Link
                to={`/dashboard/agents/${agent.id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
              >
                {agent.name}
              </Link>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <Badge variant={statusVariant(agent.status)} className="text-xs">
                  {agent.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatLastActivity(agent.last_activity)}
                </span>
                {agent.automation_level && (
                  <span className="text-xs text-muted-foreground">
                    • {agent.automation_level.replace(/-/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to={`/dashboard/agents/${agent.id}?tab=simulation`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Play className="h-4 w-4" />
                Simulate
              </Button>
            </Link>
            <Link to={`/dashboard/agents/${agent.id}`}>
              <Button variant="ghost" size="icon" aria-label="Configure agent">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="h-4 w-4 shrink-0" />
          <span>Memory snapshot available</span>
        </div>
      </CardContent>
    </Card>
  )
}
