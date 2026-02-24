/**
 * AIAssistantSidebar - Outline, Ideas, Rewrites for Create Content.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lightbulb, ListOrdered, RefreshCw, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIAssistantSidebarProps {
  onInsertOutline?: (text: string) => void
  onInsertIdea?: (text: string) => void
  onInsertRewrite?: (text: string) => void
  disabled?: boolean
}

const SAMPLE_OUTLINES = [
  '# Introduction\n## Key Points\n## Supporting Evidence\n## Conclusion',
  '# Problem Statement\n## Solution Overview\n## Implementation\n## Results',
  '# Hook\n## Value Proposition\n## Call to Action',
]

const SAMPLE_IDEAS = [
  '10 productivity tips for remote teams',
  'AI trends in content creation 2025',
  'How to build a content calendar',
]

export function AIAssistantSidebar({
  onInsertOutline,
  onInsertIdea,
  onInsertRewrite,
  disabled,
}: AIAssistantSidebarProps) {
  const [outline, setOutline] = useState('')
  const [ideas, setIdeas] = useState<string[]>([])
  const [rewrite, setRewrite] = useState('')
  const [generatingOutline, setGeneratingOutline] = useState(false)
  const [generatingIdeas, setGeneratingIdeas] = useState(false)
  const [generatingRewrite, setGeneratingRewrite] = useState(false)

  const handleGenerateOutline = () => {
    setGeneratingOutline(true)
    setTimeout(() => {
      const sample = SAMPLE_OUTLINES[Math.floor(Math.random() * SAMPLE_OUTLINES.length)]
      setOutline(sample)
      setGeneratingOutline(false)
    }, 800)
  }

  const handleGenerateIdeas = () => {
    setGeneratingIdeas(true)
    setTimeout(() => {
      setIdeas([...SAMPLE_IDEAS])
      setGeneratingIdeas(false)
    }, 600)
  }

  const handleGenerateRewrite = () => {
    setGeneratingRewrite(true)
    setTimeout(() => {
      setRewrite('Suggested rewrite: Consider emphasizing the key benefits and adding a stronger call to action.')
      setGeneratingRewrite(false)
    }, 700)
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="outline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="outline" className="text-xs">
              <ListOrdered className="h-3 w-3 mr-1" />
              Outline
            </TabsTrigger>
            <TabsTrigger value="ideas" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              Ideas
            </TabsTrigger>
            <TabsTrigger value="rewrite" className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Rewrite
            </TabsTrigger>
          </TabsList>
          <TabsContent value="outline" className="mt-3 space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateOutline}
              disabled={disabled || generatingOutline}
              className="w-full gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', generatingOutline && 'animate-pulse')} />
              {generatingOutline ? 'Generating...' : 'Generate Outline'}
            </Button>
            <Textarea
              placeholder="Outline will appear here..."
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              rows={6}
              className="resize-none font-mono text-sm"
              disabled={disabled}
            />
            {outline && (
              <Button
                size="sm"
                onClick={() => onInsertOutline?.(outline)}
                disabled={disabled}
                className="w-full gap-2"
              >
                Insert
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </TabsContent>
          <TabsContent value="ideas" className="mt-3 space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateIdeas}
              disabled={disabled || generatingIdeas}
              className="w-full gap-2"
            >
              <Lightbulb className={cn('h-4 w-4', generatingIdeas && 'animate-pulse')} />
              {generatingIdeas ? 'Generating...' : 'Generate Ideas'}
            </Button>
            <div className="space-y-1.5">
              {(ideas ?? []).map((idea, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border bg-muted/30 text-sm"
                >
                  <span className="truncate">{idea}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 h-7"
                    onClick={() => onInsertIdea?.(idea)}
                    disabled={disabled}
                  >
                    Insert
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="rewrite" className="mt-3 space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateRewrite}
              disabled={disabled || generatingRewrite}
              className="w-full gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', generatingRewrite && 'animate-pulse')} />
              {generatingRewrite ? 'Generating...' : 'Suggest Rewrite'}
            </Button>
            <Textarea
              placeholder="Rewrite suggestion will appear here..."
              value={rewrite}
              onChange={(e) => setRewrite(e.target.value)}
              rows={4}
              className="resize-none text-sm"
              disabled={disabled}
            />
            {rewrite && (
              <Button
                size="sm"
                onClick={() => onInsertRewrite?.(rewrite)}
                disabled={disabled}
                className="w-full gap-2"
              >
                Apply
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
