/**
 * GlobalSearchBar - Search across content, runs, cronjobs, projects, transactions.
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { globalContentSearch, type GlobalSearchResult } from '@/api/content-dashboard'

interface GlobalSearchBarProps {
  placeholder?: string
  className?: string
}

export function GlobalSearchBar({ placeholder = 'Search content, runs, cronjobs...', className }: GlobalSearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setIsLoading(true)
    try {
      const r = await globalContentSearch(q)
      setResults(r ?? [])
      setIsOpen(true)
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  const handleSelect = (r: GlobalSearchResult) => {
    navigate(r.href)
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className="pl-10 w-64 md:w-80"
          aria-label="Global search"
        />
      </div>
      {isOpen && (results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg z-50 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Searching...</div>
          ) : (
            (results ?? []).map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors flex flex-col gap-0.5"
                onClick={() => handleSelect(r)}
              >
                <span className="font-medium text-sm">{r.title}</span>
                <span className="text-xs text-muted-foreground">{r.module}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
