/**
 * GlobalSearchPanel - Modal/drawer for global search across modules.
 * Fields: query, category filters, advanced facets; results grouped by module.
 */

import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, Clock, FolderKanban, DollarSign, History } from 'lucide-react'
import { globalSearch } from '@/api/master-dashboard'
import type { GlobalSearchResult } from '@/types/master-dashboard'
import { cn } from '@/lib/utils'

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Content: FileText,
  Runs: History,
  Cronjobs: Clock,
  Projects: FolderKanban,
  Transactions: DollarSign,
}

interface GlobalSearchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearchPanel({ open, onOpenChange }: GlobalSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const navigate = useNavigate()

  const doSearch = useCallback(async () => {
    setIsSearching(true)
    try {
      const res = await globalSearch(query, categoryFilter ? { category: categoryFilter } : undefined)
      setResults(res.results ?? [])
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query, categoryFilter])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(doSearch, 300)
    return () => clearTimeout(t)
  }, [open, query, categoryFilter, doSearch])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  const grouped = (results ?? []).reduce<Record<string, GlobalSearchResult[]>>((acc, r) => {
    const key = r.module ?? 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const handleSelect = (r: GlobalSearchResult) => {
    navigate(r.href)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        showCloseButton
        onPointerDownOutside={() => onOpenChange(false)}
      >
        <DialogHeader>
          <DialogTitle>Global Search</DialogTitle>
          <DialogDescription>
            Search across Content, Runs, Cronjobs, Projects, and Transactions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              aria-label="Search query"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-xs text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Content', 'Runs', 'Cronjobs', 'Projects', 'Transactions'].map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 rounded-lg border border-border">
            {isSearching ? (
              <div className="p-8 text-center text-muted-foreground">Searching...</div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {query ? 'No results found' : 'Type to search across modules'}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {Object.entries(grouped).map(([module, items]) => {
                  const Icon = MODULE_ICONS[module] ?? FileText
                  return (
                    <div key={module} className="p-2">
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        <Icon className="h-4 w-4" />
                        {module}
                      </div>
                      {(items ?? []).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                            'hover:bg-secondary focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring'
                          )}
                          onClick={() => handleSelect(r)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{r.title}</p>
                            {r.snippet && (
                              <p className="text-xs text-muted-foreground truncate">{r.snippet}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {r.type}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
