/**
 * MemorySliceInspector - Scoped memory entries read/written by event.
 * TTL status and access controls.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Clock } from 'lucide-react'
import type { MemoryAccess } from '@/types/agent-trace'
import { cn } from '@/lib/utils'

export interface MemorySliceInspectorProps {
  memoryAccess: MemoryAccess[]
  className?: string
}

export function MemorySliceInspector({
  memoryAccess,
  className,
}: MemorySliceInspectorProps) {
  const items = Array.isArray(memoryAccess) ? memoryAccess : []
  if (items.length === 0) return null

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Database className="h-4 w-4" />
          Memory Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((ma) => (
          <div
            key={ma.memoryId}
            className="rounded-lg border border-border p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Badge variant={ma.accessType === 'write' ? 'default' : 'secondary'}>
                {ma.accessType}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">
                {ma.memoryId}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Agent: {ma.agentId} • Scope: {ma.scope}
            </p>
            {ma.ttlSeconds != null && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                TTL: {ma.ttlSeconds}s
              </p>
            )}
            {ma.valueSnapshot !== undefined && (
              <pre className="p-2 rounded bg-muted/30 text-xs overflow-x-auto max-h-24">
                {typeof ma.valueSnapshot === 'string'
                  ? ma.valueSnapshot
                  : JSON.stringify(ma.valueSnapshot, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
