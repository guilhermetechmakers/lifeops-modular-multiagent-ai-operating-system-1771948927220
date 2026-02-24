/**
 * Agent Console Page - List of agents with dashboard cards.
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Bot } from 'lucide-react'
import { useAgents } from '@/hooks/use-agent-console'
import { AgentConsoleCard, AgentTraceVisualizer } from '@/components/agent-console'

export function AgentConsolePage() {
  const { agents, isLoading, error, refetch } = useAgents()
  const [search, setSearch] = useState('')

  const list = Array.isArray(agents) ? agents : []
  const filtered = useMemo(() => {
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        (a.status ?? '').toLowerCase().includes(q)
    )
  }, [list, search])

  if (error) {
    return (
      <div className="space-y-8 animate-in-up">
        <div>
          <h1 className="text-3xl font-bold">Agent Console</h1>
          <p className="text-muted-foreground mt-1">
            Inspect and manage agents. View inter-agent messages.
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-destructive">{error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-3xl font-bold">Agent Console</h1>
        <p className="text-muted-foreground mt-1">
          Inspect and manage agents. View configuration, memory, and run simulations.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Agent list */}
      <div className="grid gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted/30" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-48 bg-muted/30 rounded" />
                      <div className="h-4 w-32 bg-muted/30 rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-40 bg-muted/30 rounded" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <Bot className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {list.length === 0
                    ? 'No agents configured yet'
                    : 'No agents match your search'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filtered.map((agent) => (
            <AgentConsoleCard key={agent.id} agent={agent} />
          ))
        )}
      </div>

      {/* Trace viewer placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Trace Viewer</CardTitle>
          <CardDescription>
            Select an agent and run a simulation to view the trace. Or open an agent detail page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentTraceVisualizer traces={[]} />
        </CardContent>
      </Card>
    </div>
  )
}
