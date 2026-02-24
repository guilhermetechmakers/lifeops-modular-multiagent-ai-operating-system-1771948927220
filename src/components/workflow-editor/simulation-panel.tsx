/**
 * SimulationPanel - Run transcript for workflow simulation.
 * Toggle to run; display trace: prompts, handoffs, decisions, outputs.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SimulationResult, SimulationTraceEntry } from '@/types/workflow-editor'
import { Play, ChevronDown, ChevronUp, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { simulateWorkflow } from '@/api/workflow-editor'
import { toast } from 'sonner'

interface SimulationPanelProps {
  templateId: string | null
  isOpen: boolean
  onToggle: () => void
  result: SimulationResult | null
  onResult: (r: SimulationResult | null) => void
}

const TRACE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  prompt: Play,
  handoff: Play,
  decision: Play,
  output: CheckCircle,
  error: XCircle,
}

function TraceEntryRow({ entry }: { entry: SimulationTraceEntry }) {
  const Icon = TRACE_ICONS[entry.type] ?? Play
  return (
    <div className="flex gap-3 rounded-lg border border-border p-3 text-sm">
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 mt-0.5',
          entry.type === 'error' ? 'text-destructive' : 'text-primary'
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {entry.agentName && (
            <Badge variant="secondary" className="text-xs">
              {entry.agentName}
            </Badge>
          )}
          <span className="text-muted-foreground text-xs">
            {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ''}
          </span>
        </div>
        <p className="mt-1 text-foreground">{entry.message ?? entry.type}</p>
      </div>
    </div>
  )
}

export function SimulationPanel({
  templateId,
  isOpen,
  onToggle,
  result,
  onResult,
}: SimulationPanelProps) {
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = async () => {
    if (!templateId) {
      toast.error('Select a template first')
      return
    }
    setIsRunning(true)
    onResult(null)
    try {
      const r = await simulateWorkflow(templateId)
      onResult(r)
      toast.success(r?.success ? 'Simulation completed' : 'Simulation finished with issues')
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Simulation failed')
      onResult(null)
    } finally {
      setIsRunning(false)
    }
  }

  const trace = (result?.trace ?? []) as SimulationTraceEntry[]

  return (
    <Card className="rounded-xl border-border">
      <CardHeader
        className="cursor-pointer select-none pb-3"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            Simulation
            {result && (
              <Badge
                variant={result.success ? 'default' : 'destructive'}
                className="text-xs"
              >
                {result.success ? 'Passed' : 'Issues'}
              </Badge>
            )}
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={handleRun}
            disabled={!templateId || isRunning}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run Simulation
          </Button>

          {result && (
            <>
              {result.verdict && (
                <p className="text-sm text-muted-foreground">{result.verdict}</p>
              )}
              {result.confidence != null && (
                <p className="text-sm">
                  Confidence: <strong>{Math.round((result.confidence ?? 0) * 100)}%</strong>
                </p>
              )}
              {(result.discrepancies ?? []).length > 0 && (
                <div className="rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
                  <p className="font-semibold text-warning">Discrepancies</p>
                  <ul className="list-disc list-inside mt-1">
                    {(result.discrepancies ?? []).map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Trace</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {trace.map((entry, i) => (
                    <TraceEntryRow key={i} entry={entry} />
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
