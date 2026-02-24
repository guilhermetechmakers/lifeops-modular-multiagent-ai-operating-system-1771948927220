/**
 * EditContentPage - Edit existing content with AI suggestions, comments, workflow, versioning, activity, scheduling.
 */

import { useParams, Link } from 'react-router-dom'
import { useCallback } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  EditorPane,
  CommentThreadPanel,
  WorkflowControls,
  VersioningPanel,
  ActivityLogPanel,
  EditSchedulingPanel,
} from '@/components/edit-content'
import {
  useEditContent,
  useEditAiSuggestions,
  useEditComments,
  useEditWorkflow,
  useEditVersions,
  useEditActivity,
  useEditSchedule,
} from '@/hooks/use-edit-content'
import type { ContentItem, ContentVersionFull } from '@/types/content-dashboard'

export function ContentEditPage() {
  const { id } = useParams<{ id: string }>()
  const contentId = id ?? null

  const { contentItem, loading, error, refetch, update } = useEditContent(contentId)
  const {
    suggestions: aiSuggestions,
    loading: aiLoading,
    generating: aiGenerating,
    generate: generateSuggestions,
    acceptSuggestion,
    rejectSuggestion,
  } = useEditAiSuggestions(contentId)
  const { comments, loading: commentsLoading, addComment, resolveComment } = useEditComments(contentId)
  const { transitioning, transition } = useEditWorkflow(contentId, (item) => {
    if (item) refetch()
  })
  const { versions, loading: versionsLoading, refetch: refetchVersions, createVersion } = useEditVersions(contentId)
  const { activity, loading: activityLoading } = useEditActivity(contentId)
  const { schedule, loading: scheduleLoading, saveSchedule } = useEditSchedule(contentId)

  const handleSave = useCallback(
    async (payload: Partial<ContentItem>) => {
      const updated = await update(payload)
      return updated ?? null
    },
    [update]
  )

  const handleTransition = useCallback(
    async (toStatus: string) => {
      const updated = await transition(toStatus)
      if (updated) {
        toast.success(`Moved to ${toStatus}`)
      } else {
        toast.error('Transition failed')
      }
      return updated
    },
    [transition]
  )

  const handleRevert = useCallback(
    async (version: ContentVersionFull) => {
      try {
        const snapshot = version.changes ?? ''
        if (!contentItem?.authorId || !contentId) return
        try {
          const data = JSON.parse(snapshot) as { title?: string; summary?: string; body?: string; tags?: string[] }
          if (data && typeof data === 'object') {
            await update({
              title: data.title,
              summary: data.summary,
              body: data.body,
              tags: data.tags,
            })
          }
        } catch {
          // If not JSON, treat as body-only snapshot
          await update({ body: snapshot })
        }
        await createVersion(snapshot, contentItem.authorId)
        refetch()
        refetchVersions()
        toast.success('Reverted to version')
      } catch {
        toast.error('Revert failed')
      }
    },
    [contentItem?.authorId, contentId, createVersion, update, refetch, refetchVersions]
  )

  const handleSaveSchedule = useCallback(
    async (payload: { publishAt: string; platforms: string[]; timezone: string }) => {
      const s = await saveSchedule(payload)
      if (s) toast.success('Schedule saved')
      return s
    },
    [saveSchedule]
  )

  if (!contentId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No content ID provided.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/dashboard/content">Back to Pipeline</Link>
        </Button>
      </div>
    )
  }

  if (loading && !contentItem) {
    return (
      <div className="p-6 space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/content" aria-label="Back to pipeline">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/dashboard/content">Back to Pipeline</Link>
        </Button>
      </div>
    )
  }

  if (!contentItem) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Content not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/dashboard/content">Back to Pipeline</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/content" aria-label="Back to pipeline">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" />
              Edit Content
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              AI-assisted editing, review comments, workflow, versioning, and scheduling
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to="/dashboard/content/library">Content Library</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main editor + AI */}
        <div className="xl:col-span-8 space-y-4">
          <EditorPane
            content={contentItem}
            contentId={contentId}
            loading={loading}
            aiSuggestions={aiSuggestions}
            aiSuggestionsLoading={aiLoading}
            aiGenerating={aiGenerating}
            onSave={handleSave}
            onGenerateSuggestions={generateSuggestions}
            onAcceptSuggestion={async (s) => acceptSuggestion(s.id)}
            onRejectSuggestion={rejectSuggestion}
          />
        </div>

        {/* Right sidebar */}
        <div className="xl:col-span-4 space-y-4">
          <WorkflowControls
            currentStatus={contentItem.status}
            onTransition={handleTransition}
            transitioning={transitioning}
            disabled={loading}
          />
          <CommentThreadPanel
            comments={comments}
            loading={commentsLoading}
            onAddComment={addComment}
            onResolveComment={resolveComment}
            disabled={loading}
          />
        </div>
      </div>

      {/* Bottom panels - Tabs */}
      <div className="xl:col-span-12">
        <Tabs defaultValue="versions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="versions">Version History</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="versions" className="mt-4">
            <VersioningPanel
              versions={versions}
              loading={versionsLoading}
              onRevert={handleRevert}
              disabled={loading}
            />
          </TabsContent>
          <TabsContent value="activity" className="mt-4">
            <ActivityLogPanel
              activity={activity}
              loading={activityLoading}
              disabled={loading}
            />
          </TabsContent>
          <TabsContent value="schedule" className="mt-4">
            <EditSchedulingPanel
              contentId={contentId}
              schedule={
                schedule ?? {
                  id: '',
                  contentId,
                  publishAt: contentItem.publishAt ?? '',
                  platforms: contentItem.platforms ?? [],
                  timezone: 'UTC',
                  status: 'draft',
                }
              }
              loading={scheduleLoading}
              onSave={handleSaveSchedule}
              disabled={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
