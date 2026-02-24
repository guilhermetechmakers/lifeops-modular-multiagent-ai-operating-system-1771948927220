/**
 * MemoryInspector - View and modify scoped memory with TTL and access controls.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Database, Plus } from 'lucide-react'
import type { MemoryScope } from '@/types/content-dashboard'

interface MemoryInspectorProps {
  contentId: string | null
  entries: MemoryScope[]
  loading?: boolean
  onWrite?: (payload: Partial<MemoryScope>) => Promise<MemoryScope | null>
  disabled?: boolean
}

export function MemoryInspector({
  contentId,
  entries,
  loading,
  onWrite,
  disabled,
}: MemoryInspectorProps) {
  const [scopeName, setScopeName] = useState('default')
  const [ttlSeconds, setTtlSeconds] = useState(86400)
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [isWriting, setIsWriting] = useState(false)

  const handleAdd = async () => {
    if (!contentId || !onWrite || !key.trim()) return
    setIsWriting(true)
    try {
      await onWrite({
        scopeName,
        ttlSeconds,
        dataBlob: { [key]: value },
        accessControls: {},
      })
      setKey('')
      setValue('')
    } finally {
      setIsWriting(false)
    }
  }

  const displayEntries = Array.isArray(entries) ? entries : []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Scoped Memory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-muted animate-pulse" />
            <div className="h-20 rounded-lg bg-muted animate-pulse" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Scope</Label>
              <Input
                value={scopeName}
                onChange={(e) => setScopeName(e.target.value)}
                placeholder="scope name"
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>TTL (seconds)</Label>
              <Input
                type="number"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(Number(e.target.value) || 86400)}
                min={1}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="memory key"
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="memory value"
                disabled={disabled}
              />
            </div>
            {onWrite && (
              <Button
                size="sm"
                className="w-full gap-2"
                onClick={handleAdd}
                disabled={disabled || isWriting || !key.trim()}
              >
                <Plus className="h-4 w-4" />
                {isWriting ? 'Writing...' : 'Write to Memory'}
              </Button>
            )}
            {displayEntries.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium mb-2">Recent entries</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {displayEntries.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-2 p-2 rounded border border-border bg-muted/30 text-xs"
                    >
                      <span className="truncate">{e.scopeName} / {String(e.dataBlob)}</span>
                      <span className="text-muted-foreground shrink-0">
                        TTL: {e.ttlSeconds}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
