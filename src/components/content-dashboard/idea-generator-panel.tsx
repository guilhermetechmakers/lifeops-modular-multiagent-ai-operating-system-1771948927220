/**
 * IdeaGeneratorPanel - Prompt builder, idea suggestions, accept/branch to Research.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Lightbulb, Sparkles, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IdeaSuggestion {
  id: string
  title: string
  summary: string
}

const SAMPLE_IDEAS: IdeaSuggestion[] = [
  { id: '1', title: '5 Productivity Hacks for Remote Teams', summary: 'Actionable tips for distributed teams' },
  { id: '2', title: 'AI Tools Every Content Creator Needs', summary: 'Curated list of AI writing assistants' },
  { id: '3', title: 'Building a Content Calendar That Works', summary: 'Structured approach to planning' },
]

interface IdeaGeneratorPanelProps {
  onAccept: (idea: { title: string; summary?: string }) => void
  onClose: () => void
}

export function IdeaGeneratorPanel({ onAccept, onClose }: IdeaGeneratorPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions] = useState<IdeaSuggestion[]>(SAMPLE_IDEAS)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 1500)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Idea Generator
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Prompt</label>
          <Textarea
            placeholder="e.g. Blog ideas about productivity for remote workers..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>
        <Button
          className="w-full gap-2"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          <Sparkles className={cn('h-4 w-4', isGenerating && 'animate-pulse')} />
          {isGenerating ? 'Generating...' : 'Generate Ideas'}
        </Button>

        <div>
          <p className="text-sm font-medium mb-2">Sample Ideas</p>
          <div className="space-y-2">
            {(suggestions ?? []).map((idea) => (
              <div
                key={idea.id}
                className="flex items-start gap-2 p-3 rounded-lg border border-border bg-card/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{idea.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{idea.summary}</p>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => onAccept({ title: idea.title, summary: idea.summary })}
                  aria-label="Accept idea"
                >
                  <Check className="h-4 w-4 text-success" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
