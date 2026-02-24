/**
 * ResearchPane - Source retrieval, relevance scoring, notes for Create Content.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Link2, Search, Filter } from 'lucide-react'
import type { ResearchSource } from '@/types/content-dashboard'

const SAMPLE_SOURCES: ResearchSource[] = [
  { id: '1', title: 'Remote Work Statistics 2025', url: 'https://example.com/1', snippet: 'Key findings on productivity...', relevanceScore: 0.92, sourceType: 'article' },
  { id: '2', title: 'AI in Content Creation', url: 'https://example.com/2', snippet: 'Overview of tools and workflows...', relevanceScore: 0.88, sourceType: 'blog' },
  { id: '3', title: 'Content Strategy Best Practices', url: 'https://example.com/3', snippet: 'How to plan and execute...', relevanceScore: 0.85, sourceType: 'guide' },
]

interface ResearchPaneProps {
  onAddCitation?: (source: ResearchSource) => void
  disabled?: boolean
}

export function ResearchPane({ onAddCitation, disabled }: ResearchPaneProps) {
  const [sources] = useState<ResearchSource[]>(SAMPLE_SOURCES)
  const [notes, setNotes] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredSources = (sources ?? []).filter((s) => {
    const matchesSearch = !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || s.sourceType === filterType
    return matchesSearch && matchesType
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Research
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled={disabled}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            disabled={disabled}
          >
            <option value="all">All types</option>
            <option value="article">Article</option>
            <option value="blog">Blog</option>
            <option value="guide">Guide</option>
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Sources</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(filteredSources ?? []).map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-2 p-2 rounded-lg border border-border bg-card/30 hover:border-primary/30 transition-colors"
              >
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{s.snippet}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {s.relevanceScore != null && (
                      <Badge variant="secondary" className="text-xs">
                        {(s.relevanceScore * 100).toFixed(0)}% match
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => onAddCitation?.(s)}
                      disabled={disabled}
                    >
                      Add citation
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Research notes</label>
          <Textarea
            placeholder="Capture notes tied to this content..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  )
}
