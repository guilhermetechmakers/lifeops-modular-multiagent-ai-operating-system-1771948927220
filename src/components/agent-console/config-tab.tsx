/**
 * Config Tab - Role, prompts, tools, cost controls, rate limits.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Wrench, DollarSign, Gauge } from 'lucide-react'
import type { AgentConfig } from '@/types/agent-console'

export interface ConfigTabProps {
  config?: AgentConfig | null
  onSave?: (config: Partial<AgentConfig>) => void | Promise<unknown>
  isSaving?: boolean
}

export function ConfigTab({ config, onSave, isSaving }: ConfigTabProps) {
  const [role, setRole] = useState(config?.role ?? '')
  const [allowedTools, setAllowedTools] = useState(
    (config?.allowedTools ?? []).join(', ')
  )
  const [spendLimit, setSpendLimit] = useState(
    String(config?.costControls?.limits?.daily ?? config?.costControls?.limits?.monthly ?? '')
  )
  const [rateLimit, setRateLimit] = useState(
    String(config?.rateLimits?.requestsPerMinute ?? '')
  )

  const handleSave = () => {
    const tools = allowedTools
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSave?.({
      role: role || undefined,
      allowedTools: tools.length > 0 ? tools : undefined,
      costControls: spendLimit
        ? { limits: { daily: parseInt(spendLimit, 10) } }
        : undefined,
      rateLimits: rateLimit
        ? { requestsPerMinute: parseInt(rateLimit, 10) }
        : undefined,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Role & Tools
          </CardTitle>
          <CardDescription>
            Agent role and allowed tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Generate content ideas from prompts"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tools">Allowed Tools (comma-separated)</Label>
            <Input
              id="tools"
              value={allowedTools}
              onChange={(e) => setAllowedTools(e.target.value)}
              placeholder="web_search, memory_read, memory_write"
              className="mt-1 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Controls
          </CardTitle>
          <CardDescription>
            Spend limits and currency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="spend">Daily/Monthly Limit ($)</Label>
            <Input
              id="spend"
              type="number"
              value={spendLimit}
              onChange={(e) => setSpendLimit(e.target.value)}
              placeholder="100"
              className="mt-1 w-32"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Rate Limits
          </CardTitle>
          <CardDescription>
            Requests per minute
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="rate">Requests per minute</Label>
            <Input
              id="rate"
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              placeholder="20"
              className="mt-1 w-32"
            />
          </div>
        </CardContent>
      </Card>

      {onSave && (
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Config'}
        </Button>
      )}
    </div>
  )
}
