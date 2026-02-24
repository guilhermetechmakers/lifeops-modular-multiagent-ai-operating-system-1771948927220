/**
 * ContentListLibrary - Browse, search, filter content by state, template, author.
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Library, Search } from 'lucide-react'
import type { ContentItem, ContentStatus } from '@/types/content-dashboard'

interface ContentListLibraryProps {
  items?: ContentItem[]
  onSelectItem?: (item: ContentItem) => void
  isLoading?: boolean
}

const STATUS_OPTIONS: ContentStatus[] = [
  'Idea',
  'Research',
  'Draft',
  'Edit',
  'Review',
  'Scheduled',
  'Published',
]

export function ContentListLibrary({
  items = [],
  onSelectItem,
  isLoading,
}: ContentListLibraryProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const list = items ?? []
  const filtered = list.filter((i) => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || (i.summary ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-8">
            <div className="h-11 bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="col-span-12 md:col-span-4">
            <div className="h-11 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Library</h1>
        <p className="text-muted-foreground mt-1">
          Browse, search, and filter content drafts, published items, and templates.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Library className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center max-w-sm">
                No content found. Create new content or adjust filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onSelectItem?.(item)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{item.title}</p>
                    {item.summary && (
                      <p className="text-sm text-muted-foreground truncate">{item.summary}</p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary">{item.status}</Badge>
                      {(item.tags ?? []).slice(0, 2).map((t) => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
