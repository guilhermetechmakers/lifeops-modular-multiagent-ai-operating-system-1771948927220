import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, Play, Settings, Database } from 'lucide-react'

const MOCK_AGENTS = [
  { id: 1, name: 'Content Ideas Agent', status: 'active', runs: 47 },
  { id: 2, name: 'Finance Processor', status: 'active', runs: 12 },
  { id: 3, name: 'Anomaly Detector', status: 'idle', runs: 8 },
]

export function AgentConsolePage() {
  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-3xl font-bold">Agent Console</h1>
        <p className="text-muted-foreground mt-1">
          Inspect and manage agents. View inter-agent messages.
        </p>
      </div>

      <div className="grid gap-6">
        {MOCK_AGENTS.map((agent) => (
          <Card key={agent.id} className="transition-all duration-300 hover:shadow-card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2 bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{agent.name}</CardTitle>
                    <CardDescription>{agent.runs} runs • {agent.status}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                    Simulate
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                Memory snapshot available
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trace Viewer</CardTitle>
          <CardDescription>Interactive timeline of inter-agent messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
            Select a run to view trace
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
