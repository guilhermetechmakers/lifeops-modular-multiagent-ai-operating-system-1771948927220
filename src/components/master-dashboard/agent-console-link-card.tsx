/**
 * AgentConsoleLinkCard - Quick route to inspect agent config, memory, run simulations.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, Settings, Brain, Play } from 'lucide-react'

export function AgentConsoleLinkCard() {
  return (
    <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-glow">
      <div className="h-1 rounded-t-xl bg-gradient-to-r from-primary/20 to-primary/5" />
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>Agent Console</CardTitle>
        </div>
        <CardDescription>
          Inspect agent config, memory snapshots, and run simulations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/agents">
            <Button size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
          </Link>
          <Link to="/dashboard/agents">
            <Button variant="outline" size="sm" className="gap-2">
              <Brain className="h-4 w-4" />
              Memory
            </Button>
          </Link>
          <Link to="/dashboard/agents">
            <Button variant="outline" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Simulate
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
