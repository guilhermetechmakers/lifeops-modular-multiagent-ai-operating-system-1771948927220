/**
 * AgentSDKPanel - Browse/create agent capabilities, tools, memory, cost controls.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, Wrench, Database, DollarSign } from 'lucide-react'
import type { AgentCapability } from '@/types/workflow-editor'
import { fetchAgents } from '@/api/workflow-editor'

export function AgentSDKPanel() {
  const [agents, setAgents] = useState<AgentCapability[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchAgents()
        if (!cancelled) setAgents(data ?? [])
      } catch {
        if (!cancelled) setAgents([])
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Agent SDK
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Agent capabilities, tools, memory scope, and cost controls.
        </p>
        <div className="space-y-2">
          {(agents ?? []).map((agent) => (
            <div
              key={agent.id}
              className="p-3 rounded-lg border border-border bg-card/50 space-y-2"
            >
              <p className="font-semibold text-sm">{agent.name}</p>
              <div className="flex flex-wrap gap-1">
                {(agent.tools ?? []).map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">
                    <Wrench className="h-3 w-3 mr-0.5" />
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {agent.memoryScope && (
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    {agent.memoryScope}
                  </span>
                )}
                {agent.costLimit != null && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {agent.costLimit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
