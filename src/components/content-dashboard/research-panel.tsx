/**
 * ResearchPanel - Source aggregation, outline generation, notes, links to content.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, X, FileText, Link2 } from 'lucide-react'
import type { ContentItem } from '@/types/content-dashboard'

interface ResearchPanelProps {
  contentItem: ContentItem
  onClose: () => void
}

const SAMPLE_SOURCES = [
  { id: '1', title: 'Remote Work Statistics 2025', url: 'https://example.com/1', snippet: 'Key findings on productivity...' },
  { id: '2', title: 'AI in Content Creation', url: 'https://example.com/2', snippet: 'Overview of tools and workflows...' },
]

export function ResearchPanel({ contentItem, onClose }: ResearchPanelProps) {
  const [notes, setNotes] = useState('')
  const [outline, setOutline] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateOutline = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setOutline('# Introduction\n## Key Points\n## Supporting Evidence\n## Conclusion')
      setIsGenerating(false)
    }, 1200)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Research
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{contentItem?.title ?? 'Untitled'}</p>
          {contentItem?.summary && (
            <p className="text-xs text-muted-foreground">{contentItem.summary}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Sources</p>
          <div className="space-y-2">
            {(SAMPLE_SOURCES ?? []).map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-2 p-2 rounded-lg border border-border bg-card/30"
              >
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{s.snippet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Notes</label>
          <Textarea
            placeholder="Research notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Outline</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateOutline}
              disabled={isGenerating}
            >
              <FileText className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
          <Textarea
            placeholder="Outline will appear here..."
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            rows={5}
            className="resize-none font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  )
}
