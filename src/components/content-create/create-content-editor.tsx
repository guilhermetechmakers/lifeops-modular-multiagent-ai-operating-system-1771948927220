/**
 * CreateContentEditor - Main canvas with rich text, AI assistant, versioning, scheduling.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Save,
  History,
  Send,
  Loader2,
  Check,
} from 'lucide-react'
import { AIAssistantSidebar } from './ai-assistant-sidebar'
import { ResearchPane } from './research-pane'
import { VersionControlPanel } from './version-control-panel'
import { SchedulingPanel } from './scheduling-panel'
import { MemoryInspector } from './memory-inspector'
import { ArtifactsStoragePanel } from './artifacts-storage-panel'
import { AuditTrailPanel } from './audit-trail-panel'
import { cn } from '@/lib/utils'
import type {
  ContentItem,
  MemoryScope,
  ContentVersionFull,
  RunArtifact,
  AuditLog,
} from '@/types/content-dashboard'

const AUTOSAVE_DEBOUNCE_MS = 1500

interface CreateContentEditorProps {
  content: ContentItem | null
  contentId: string | null
  loading?: boolean
  onSave?: (payload: Partial<ContentItem>) => Promise<ContentItem | null>
  onPublish?: (platforms?: string[]) => Promise<unknown[]>
  versions?: ContentVersionFull[]
  versionsLoading?: boolean
  onCreateVersion?: (changes: string, authorId: string) => Promise<unknown>
  memoryEntries?: MemoryScope[]
  memoryLoading?: boolean
  onWriteMemory?: (payload: Partial<MemoryScope>) => Promise<MemoryScope | null>
  artifacts?: RunArtifact[]
  artifactsLoading?: boolean
  auditLogs?: AuditLog[]
  auditLoading?: boolean
  publishing?: boolean
}

export function CreateContentEditor({
  content,
  contentId,
  loading,
  onSave,
  onPublish,
  versions = [],
  versionsLoading,
  onCreateVersion,
  memoryEntries = [],
  memoryLoading,
  onWriteMemory,
  artifacts = [],
  artifactsLoading,
  auditLogs = [],
  auditLoading,
  publishing,
}: CreateContentEditorProps) {
  const [title, setTitle] = useState(content?.title ?? '')
  const [body, setBody] = useState(content?.body ?? content?.summary ?? '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTitle(content?.title ?? '')
    setBody(content?.body ?? content?.summary ?? '')
  }, [content?.id, content?.title, content?.body, content?.summary])

  const performSave = useCallback(async () => {
    if (!onSave || !contentId) return
    setSaveStatus('saving')
    try {
      await onSave({ title, body, summary: body })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('idle')
    }
  }, [onSave, contentId, title, body])

  useEffect(() => {
    if (!onSave || !contentId) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(performSave, AUTOSAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [title, body, onSave, contentId, performSave])

  const handleManualSave = async () => {
    if (onSave && contentId) {
      setSaveStatus('saving')
      try {
        await onSave({ title, body, summary: body })
        if (onCreateVersion) {
          await onCreateVersion(
            JSON.stringify({ title, body }),
            content?.authorId ?? 'u1'
          )
        }
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }
  }

  const handleInsertOutline = (text: string) => {
    setBody((prev) => prev + '\n\n' + text)
  }

  const handleInsertIdea = (idea: string) => {
    setBody((prev) => prev + '\n\n- ' + idea)
  }

  const memoryScopes: MemoryScope[] = (memoryEntries ?? []).map((e) => ({
    ...e,
    contentItemId: contentId ?? '',
    ttlSeconds: e.ttlSeconds ?? 86400,
    accessControls: e.accessControls ?? {},
  }))

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Main editor */}
      <div className="xl:col-span-8 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
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
          </CardContent>
        </Card>
      </div>

      {/* Right sidebar */}
      <div className="xl:col-span-4 space-y-4">
        <AIAssistantSidebar
          onInsertOutline={handleInsertOutline}
          onInsertIdea={handleInsertIdea}
          onInsertRewrite={(t) => setBody((prev) => prev + '\n\n' + t)}
          disabled={loading}
        />
        <ResearchPane disabled={loading} />
      </div>

      {/* Bottom panels - Tabs */}
      <div className="xl:col-span-12">
        <Tabs defaultValue="versions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="versions" className="gap-1">
              <History className="h-4 w-4" />
              Versions
            </TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          </TabsList>
          <TabsContent value="versions" className="mt-4">
            <VersionControlPanel
              versions={versions}
              loading={versionsLoading}
              onRestore={(v) => {
                try {
                  const data = JSON.parse(v.changes)
                  if (data.title) setTitle(data.title)
                  if (data.body) setBody(data.body)
                } catch {
                  // ignore
                }
              }}
              disabled={loading}
            />
          </TabsContent>
          <TabsContent value="schedule" className="mt-4">
            <SchedulingPanel
              contentId={contentId}
              publishAt={content?.publishAt}
              timezone="UTC"
              enabledPlatforms={content?.platforms ?? []}
              onSave={async (payload) => {
                if (onSave && contentId) {
                  await onSave({
                    publishAt: payload.publishAt,
                    platforms: payload.platforms,
                  })
                }
              }}
              disabled={loading}
            />
          </TabsContent>
          <TabsContent value="memory" className="mt-4">
            <MemoryInspector
              contentId={contentId}
              entries={memoryScopes}
              loading={memoryLoading}
              onWrite={onWriteMemory}
              disabled={loading}
            />
          </TabsContent>
          <TabsContent value="artifacts" className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ArtifactsStoragePanel
              artifacts={artifacts}
              loading={artifactsLoading}
              disabled={loading}
            />
            <AuditTrailPanel
              logs={auditLogs}
              loading={auditLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Publish bar */}
      {contentId && onPublish && (
        <div className="xl:col-span-12 flex justify-end">
          <Button
            onClick={() => onPublish()}
            disabled={loading || publishing}
            className="gap-2"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {publishing ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      )}
    </div>
  )
}
