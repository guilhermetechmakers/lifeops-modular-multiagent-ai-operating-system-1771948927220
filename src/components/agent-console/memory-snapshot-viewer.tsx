/**
 * Memory Snapshot Viewer - Filterable list of memory entries with scope, TTL, actions.
 */

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Database, Search, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MemoryEntry } from '@/types/agent-console'

export interface MemoryWritePayload {
  key: string
  value: unknown
  scope: string
  ttl?: number
}

export interface MemorySnapshotViewerProps {
  entries: MemoryEntry[]
  isLoading?: boolean
  onWrite?: (payload: MemoryWritePayload) => void | Promise<unknown>
  onDelete?: (id: string) => void
  canWrite?: boolean
  canDelete?: boolean
  className?: string
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

export function MemorySnapshotViewer({
  entries,
  isLoading,
  onWrite,
  onDelete,
  canWrite = true,
  canDelete = false,
  className,
}: MemorySnapshotViewerProps) {
  const [search, setSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState<string>('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showWriteForm, setShowWriteForm] = useState(false)

  const scopes = Array.from(new Set((entries ?? []).map((e) => e.scope)))
  const filtered = (entries ?? []).filter((e) => {
    const matchSearch = !search || e.key.toLowerCase().includes(search.toLowerCase())
    const matchScope = !scopeFilter || e.scope === scopeFilter
    return matchSearch && matchScope
  })

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-6 w-48 bg-muted/30 rounded" />
          <div className="h-4 w-64 bg-muted/30 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-muted/30 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('transition-all duration-300', className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Memory Snapshot</CardTitle>
          </div>
          {canWrite && onWrite && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowWriteForm(!showWriteForm)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          )}
        </div>
        <CardDescription>
          Scoped memory entries with TTL and access controls
        </CardDescription>

        <div className="flex flex-wrap gap-2 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search memory keys"
            />
          </div>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="h-11 rounded-lg border border-input bg-background px-4 text-sm"
            aria-label="Filter by scope"
          >
            <option value="">All scopes</option>
            {(scopes ?? []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showWriteForm && onWrite && (
          <MemoryWriteForm
            scopes={scopes}
            onSubmit={(payload) => {
              void onWrite(payload)
              setShowWriteForm(false)
            }}
            onCancel={() => setShowWriteForm(false)}
          />
        )}

        {(filtered ?? []).length === 0 ? (
          <div className="py-12 text-center text-muted-foreground rounded-lg border border-dashed border-border">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No memory entries</p>
            {canWrite && onWrite && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowWriteForm(true)}
              >
                Add first entry
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {(filtered ?? []).map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-border bg-card overflow-hidden transition-colors hover:border-primary/30"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(entry.id)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                  aria-expanded={expandedIds.has(entry.id)}
                >
                  {expandedIds.has(entry.id) ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-mono text-sm">{entry.key}</span>
                  <Badge variant="secondary" className="text-xs">
                    {entry.scope}
                  </Badge>
                  {entry.ttl != null && (
                    <span className="text-xs text-muted-foreground">
                      TTL: {entry.ttl}s
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(entry.updated_at).toLocaleString()}
                  </span>
                </button>
                {expandedIds.has(entry.id) && (
                  <div className="px-4 pb-4 pt-0 border-t border-border">
                    <pre className="mt-2 p-3 rounded bg-muted/30 text-xs overflow-x-auto whitespace-pre-wrap">
                      {formatValue(entry.value)}
                    </pre>
                    {canDelete && onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-destructive hover:text-destructive"
                        onClick={() => onDelete(entry.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MemoryWriteForm({
  scopes,
  onSubmit,
  onCancel,
}: {
  scopes: string[]
  onSubmit: (payload: MemoryWritePayload) => void
  onCancel: () => void
}) {
  const [key, setKey] = useState('')
  const [valueStr, setValueStr] = useState('{}')
  const [scope, setScope] = useState(scopes[0] ?? 'default')
  const [ttl, setTtl] = useState<string>('')

  const handleSubmit = () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(valueStr)
    } catch {
      parsed = valueStr
    }
    onSubmit({ key, value: parsed, scope, ttl: ttl ? parseInt(ttl, 10) : undefined })
  }

  return (
    <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
      <Input
        placeholder="Key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        aria-label="Memory key"
      />
      <textarea
        placeholder='Value (JSON or string)'
        value={valueStr}
        onChange={(e) => setValueStr(e.target.value)}
        className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
        aria-label="Memory value"
      />
      <div className="flex gap-2 flex-wrap">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm"
        >
          <option value="default">default</option>
          {(scopes ?? []).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Input
          type="number"
          placeholder="TTL (seconds)"
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
          className="w-32"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!key.trim()}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
