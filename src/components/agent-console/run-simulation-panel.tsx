/**
 * Run Simulation Panel - Prompt builder, payload input, run controls, live trace.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Trace, SimulationPayload, SimulationResult } from '@/types/agent-console'
import { AgentTraceVisualizer } from './agent-trace-visualizer'

export interface RunSimulationPanelProps {
  agentId?: string
  onRun: (payload: SimulationPayload) => Promise<SimulationResult | null>
  onStop?: () => void
  isRunning?: boolean
  result?: SimulationResult | null
  className?: string
}

const DEFAULT_PROMPT = 'Generate 3 content ideas for a tech blog post about AI productivity tools.'

export function RunSimulationPanel({
  onRun,
  onStop,
  isRunning = false,
  result = null,
  className,
}: RunSimulationPanelProps) {
  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_PROMPT)
  const [payloadStr, setPayloadStr] = useState('{\n  "topic": "AI productivity"\n}')

  const handleRun = async () => {
    let inputPayload: Record<string, unknown> = {}
    try {
      inputPayload = JSON.parse(payloadStr) as Record<string, unknown>
    } catch {
      inputPayload = {}
    }
    await onRun({ promptTemplate, inputPayload })
  }

  const traces: Trace[] = Array.isArray(result?.trace) ? result.trace : []

  return (
    <div className={cn('space-y-6', className)}>
      <Card className="transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">Run Simulation</CardTitle>
          <CardDescription>
            Compose a prompt and payload, then run a simulated interaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Prompt Template</label>
            <textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Enter prompt..."
              disabled={isRunning}
              aria-label="Prompt template"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Input Payload (JSON)</label>
            <textarea
              value={payloadStr}
              onChange={(e) => setPayloadStr(e.target.value)}
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder='{"key": "value"}'
              disabled={isRunning}
              aria-label="Input payload"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRun}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-pulse" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Simulation
                </>
              )}
            </Button>
            {onStop && result && (
              <Button variant="outline" onClick={onStop} disabled={isRunning}>
                Reset
              </Button>
            )}
            {result && (
              <span className="text-sm text-muted-foreground self-center">
                Run: {result.runId}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <AgentTraceVisualizer traces={traces} runId={result?.runId} isLoading={isRunning} />
    </div>
  )
}
