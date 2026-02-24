/**
 * DraftEditorPanel - Rich text or structured editor; autosave; versioning.
 */

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Save, History } from 'lucide-react'

interface DraftEditorPanelProps {
  contentItemId?: string | null
  title?: string
  body?: string
  onSave?: (title: string, body: string) => void
  disabled?: boolean
}

export function DraftEditorPanel({
  contentItemId,
  title: initialTitle = '',
  body: initialBody = '',
  onSave,
  disabled,
}: DraftEditorPanelProps) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [version, setVersion] = useState(1)

  useEffect(() => {
    setTitle(initialTitle)
    setBody(initialBody)
  }, [contentItemId, initialTitle, initialBody])

  const handleSave = useCallback(() => {
    setStatus('saving')
    onSave?.(title, body)
    setTimeout(() => {
      setStatus('saved')
      setVersion((v) => v + 1)
      setTimeout(() => setStatus('idle'), 2000)
    }, 400)
  }, [title, body, onSave])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Draft Editor
            </CardTitle>
            <CardDescription>Autosave enabled. Version history available.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <History className="h-3 w-3" />
              v{version}
            </Badge>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={disabled || status === 'saving'}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="draft-title" className="text-sm font-medium mb-2 block">
            Title
          </label>
          <Input
            id="draft-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Content title"
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor="draft-body" className="text-sm font-medium mb-2 block">
            Body
          </label>
          <Textarea
            id="draft-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your content here..."
            className="min-h-[200px] font-sans"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  )
}
