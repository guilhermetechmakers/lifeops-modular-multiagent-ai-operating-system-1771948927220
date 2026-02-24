/**
 * MemoryViewport - Read/write scoped memory entries, TTL controls, access permissions.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Database, Plus } from 'lucide-react'
import { useMemoryScope } from '@/hooks/use-content-dashboard'

interface MemoryViewportProps {
  scope: string
}

export function MemoryViewport({ scope }: MemoryViewportProps) {
  const { entries, isLoading, createEntry } = useMemoryScope(scope)
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [ttl, setTtl] = useState('86400')
  const [isAdding, setIsAdding] = useState(false)

  const list = Array.isArray(entries) ? entries : []

  const handleAdd = async () => {
    if (!key.trim()) return
    setIsAdding(true)
    try {
      await createEntry({
        scope,
        agentId: 'default',
        key: key.trim(),
        value: value || undefined,
        ttl: ttl ? parseInt(ttl, 10) : undefined,
      })
      setKey('')
      setValue('')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Scoped Memory
        </CardTitle>
        <CardDescription>
          Read/write memory entries for agents. TTL in seconds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="mem-key">Key</Label>
            <Input
              id="mem-key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. last_topic"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="mem-value">Value</Label>
            <Input
              id="mem-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. AI"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="mem-ttl">TTL (seconds)</Label>
            <Input
              id="mem-ttl"
              type="number"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              placeholder="86400"
              className="mt-1.5"
            />
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={isAdding || !key.trim()}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Entry
        </Button>

        <div>
          <p className="text-sm font-medium mb-2">Entries</p>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No memory entries.</p>
          ) : (
            <div className="space-y-2">
              {list.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/30"
                >
                  <div>
                    <p className="font-medium text-sm">{e.key}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeof e.value === 'string' ? e.value : JSON.stringify(e.value)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    TTL: {e.ttl ?? '—'}s
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
