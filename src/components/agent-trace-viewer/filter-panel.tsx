/**
 * FilterPanel - Multi-select filters for agent, topic, event type, severity, time range.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Filter, X } from 'lucide-react'
import type { EventType, TraceFilters } from '@/types/agent-trace'
import { cn } from '@/lib/utils'

const EVENT_TYPES: EventType[] = ['message', 'handoff', 'negotiation', 'alert', 'consensus']

export interface FilterPanelProps {
  filters: TraceFilters
  onFiltersChange: (f: TraceFilters) => void
  agentOptions?: string[]
  topicOptions?: string[]
  className?: string
}

export function FilterPanel({
  filters,
  onFiltersChange,
  agentOptions = [],
  topicOptions = [],
  className,
}: FilterPanelProps) {
  const agents = Array.isArray(agentOptions) ? agentOptions : []
  const topics = Array.isArray(topicOptions) ? topicOptions : []

  const setEventTypes = (types: EventType[]) => {
    onFiltersChange({ ...filters, eventTypes: types.length > 0 ? types : undefined })
  }

  const toggleEventType = (type: EventType) => {
    const current = filters.eventTypes ?? []
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type]
    setEventTypes(next)
  }

  const setAgent = (agentId: string) => {
    onFiltersChange({
      ...filters,
      agentIds: agentId ? [agentId] : undefined,
    })
  }

  const setTopic = (topic: string) => {
    onFiltersChange({
      ...filters,
      topics: topic ? [topic] : undefined,
    })
  }

  const setConsensusOnly = (checked: boolean) => {
    onFiltersChange({ ...filters, consensusOnly: checked || undefined })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasFilters =
    (filters.agentIds?.length ?? 0) > 0 ||
    (filters.topics?.length ?? 0) > 0 ||
    (filters.eventTypes?.length ?? 0) > 0 ||
    filters.consensusOnly

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} aria-label="Clear filters">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {agents.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Agent</Label>
            <Select
              value={filters.agentIds?.[0] ?? ''}
              onValueChange={setAgent}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All agents</SelectItem>
                {agents.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {topics.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Topic</Label>
            <Select
              value={filters.topics?.[0] ?? ''}
              onValueChange={setTopic}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All topics</SelectItem>
                {topics.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Event Types</Label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              >
                <Checkbox
                  checked={(filters.eventTypes ?? []).includes(type)}
                  onCheckedChange={() => toggleEventType(type)}
                  aria-label={`Filter by ${type}`}
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            <Checkbox
              checked={filters.consensusOnly ?? false}
              onCheckedChange={(c) => setConsensusOnly(c === true)}
              aria-label="Consensus only"
            />
            <span>Consensus only</span>
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
