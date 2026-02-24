/**
 * EditorPane - Rich-text editor with sections (title, lead, body, metadata, tags).
 * Inline AI suggestions with accept/reject actions.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Save, Loader2, Check } from 'lucide-react'
import { AIFirstResponder } from './ai-first-responder'
import { cn } from '@/lib/utils'
import type { ContentItem, AiSuggestion } from '@/types/content-dashboard'

const AUTOSAVE_DEBOUNCE_MS = 1500

export interface EditorPaneProps {
  content: ContentItem | null
  contentId: string | null
  loading?: boolean
  aiSuggestions?: AiSuggestion[]
  aiSuggestionsLoading?: boolean
  aiGenerating?: boolean
  onSave?: (payload: Partial<ContentItem>) => Promise<ContentItem | null>
  onGenerateSuggestions?: () => Promise<AiSuggestion[]>
  onAcceptSuggestion?: (suggestionId: string) => Promise<unknown>
  onRejectSuggestion?: (suggestionId: string) => Promise<unknown>
}

export function EditorPane({
  content,
  contentId,
  loading,
  aiSuggestions = [],
  aiSuggestionsLoading,
  aiGenerating,
  onSave,
  onGenerateSuggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
}: EditorPaneProps) {
  const [title, setTitle] = useState(content?.title ?? '')
  const [lead, setLead] = useState(content?.summary ?? content?.excerpt ?? '')
  const [body, setBody] = useState(content?.body ?? content?.summary ?? '')
  const [tags, setTags] = useState<string[]>(content?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTitle(content?.title ?? '')
    setLead(content?.summary ?? content?.excerpt ?? '')
    setBody(content?.body ?? content?.summary ?? '')
    setTags(content?.tags ?? [])
  }, [content?.id, content?.title, content?.summary, content?.excerpt, content?.body, content?.tags])

  const performSave = useCallback(async () => {
    if (!onSave || !contentId) return
    setSaveStatus('saving')
    try {
      await onSave({ title, summary: lead, body, tags })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('idle')
    }
  }, [onSave, contentId, title, lead, body, tags])

  useEffect(() => {
    if (!onSave || !contentId) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(performSave, AUTOSAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [title, lead, body, tags, onSave, contentId, performSave])

  const handleManualSave = async () => {
    if (onSave && contentId) {
      setSaveStatus('saving')
      try {
        await onSave({ title, summary: lead, body, tags })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t])
      setTagInput('')
    }
  }

  const removeTag = (t: string) => {
    setTags((prev) => prev.filter((x) => x !== t))
  }

  const pendingSuggestions = (aiSuggestions ?? []).filter((s) => s.status === 'pending')

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {content?.title || 'Untitled'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  'gap-1 transition-colors',
                  saveStatus === 'saved' && 'bg-success/20 text-success',
                  saveStatus === 'saving' && 'animate-pulse'
                )}
              >
                {saveStatus === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
                {saveStatus === 'saved' && <Check className="h-3 w-3" />}
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Autosave'}
              </Badge>
              <Button size="sm" onClick={handleManualSave} disabled={saveStatus === 'saving'}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="editor-title" className="text-sm font-medium mb-2 block">
              Title
            </label>
            <Input
              id="editor-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Content title"
              className="text-lg font-semibold"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="editor-lead" className="text-sm font-medium mb-2 block">
              Summary / Lead
            </label>
            <Textarea
              id="editor-lead"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              placeholder="Brief summary or lead paragraph"
              className="min-h-[80px] resize-none"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="editor-body" className="text-sm font-medium mb-2 block">
              Content (Markdown supported)
            </label>
            <Textarea
              id="editor-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your content here... Use markdown for formatting."
              className="min-h-[320px] font-sans prose prose-invert max-w-none"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="editor-tags" className="text-sm font-medium mb-2 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {(tags ?? []).map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                    aria-label={`Remove tag ${t}`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              <div className="flex gap-1">
                <Input
                  id="editor-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag"
                  className="w-32"
                  disabled={loading}
                />
                <Button size="sm" variant="outline" onClick={addTag} disabled={loading}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AIFirstResponder
        suggestions={pendingSuggestions}
        loading={aiSuggestionsLoading}
        generating={aiGenerating}
        onGenerate={onGenerateSuggestions}
        onAccept={onAcceptSuggestion}
        onReject={onRejectSuggestion}
        disabled={loading}
      />
    </div>
  )
}
