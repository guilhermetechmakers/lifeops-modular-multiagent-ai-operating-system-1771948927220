/**
 * ContentDashboardPage - Pipeline view with drag-and-drop, global search, AI panels.
 * Layout: header, left nav (via ContentLayout), main content, right-side quick actions.
 */

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Lightbulb, BookOpen, FileText, Calendar, Send, Edit, PenLine } from 'lucide-react'
import { PipelineBoard } from '@/components/content-dashboard/pipeline-board'
import { IdeaGeneratorPanel } from '@/components/content-dashboard/idea-generator-panel'
import { ResearchPanel } from '@/components/content-dashboard/research-panel'
import { DraftEditorPanel } from '@/components/content-dashboard/draft-editor-panel'
import { EditingPanel } from '@/components/content-dashboard/editing-panel'
import { SchedulingPanel } from '@/components/content-dashboard/scheduling-panel'
import { PublishingPanel } from '@/components/content-dashboard/publishing-panel'
import { TemplatesLibrary } from '@/components/content-dashboard/templates-library'
import { GlobalSearchBar } from '@/components/content-dashboard/global-search-bar'
import { useContentItems, useContentTemplates } from '@/hooks/use-content-dashboard'
import { toast } from 'sonner'
import type { ContentItem, ContentStatus } from '@/types/content-dashboard'

export function ContentDashboardPage() {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [rightPanel, setRightPanel] = useState<'idea' | 'research' | 'draft' | 'edit' | 'schedule' | 'publish' | 'templates' | null>(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const { items, isLoading, updateItem, createItem } = useContentItems()
  const { templates } = useContentTemplates()

  const itemIdFromUrl = searchParams.get('item')

  useEffect(() => {
    if (itemIdFromUrl && (items ?? []).length > 0) {
      const item = (items ?? []).find((i) => i.id === itemIdFromUrl)
      if (item) {
        setSelectedItem(item)
        if (item.status === 'Idea' || item.status === 'Research') setRightPanel('research')
        else if (item.status === 'Draft') setRightPanel('draft')
        else if (item.status === 'Edit' || item.status === 'Review') setRightPanel('edit')
        else if (item.status === 'Scheduled' || item.status === 'Published') setRightPanel('publish')
        setSearchParams({}, { replace: true })
      }
    }
  }, [itemIdFromUrl, items, setSearchParams])

  const handleMoveItem = useCallback(
    async (id: string, newStatus: ContentStatus) => {
      try {
        await updateItem(id, { status: newStatus })
        setSelectedItem((prev) => (prev?.id === id ? { ...prev, status: newStatus } : prev))
        toast.success(`Moved to ${newStatus}`)
      } catch {
        toast.error('Failed to move item')
      }
    },
    [updateItem]
  )

  const handleSelectItem = useCallback((item: ContentItem) => {
    setSelectedItem(item)
    if (item.status === 'Idea') setRightPanel('research')
    else if (item.status === 'Research') setRightPanel('research')
    else if (item.status === 'Draft') setRightPanel('draft')
    else if (item.status === 'Edit' || item.status === 'Review') setRightPanel('edit')
    else if (item.status === 'Scheduled' || item.status === 'Published') setRightPanel('publish')
    else setRightPanel(null)
  }, [])

  const handleCreateContent = useCallback(async () => {
    try {
      const created = await createItem({
        title: 'Untitled',
        status: 'Idea',
        authorId: 'u1',
        platforms: [],
      })
      setSelectedItem(created)
      setRightPanel('idea')
      toast.success('Content created')
    } catch {
      toast.error('Failed to create content')
    }
  }, [createItem])

  const handleAcceptIdea = useCallback(
    async (idea: { title: string; summary?: string }) => {
      try {
        const created = await createItem({
          title: idea.title,
          summary: idea.summary,
          status: 'Research',
          authorId: 'u1',
          platforms: [],
        })
        setSelectedItem(created)
        setRightPanel('research')
        toast.success('Idea moved to Research')
      } catch {
        toast.error('Failed to create content')
      }
    },
    [createItem]
  )

  const handleDraftSave = useCallback(
    async (title: string, body: string) => {
      if (!selectedItem?.id) return
      try {
        await updateItem(selectedItem.id, { title, summary: body })
        setSelectedItem((prev) => (prev ? { ...prev, title, summary: body } : null))
        toast.success('Draft saved')
      } catch {
        toast.error('Failed to save draft')
      }
    },
    [selectedItem?.id, updateItem]
  )

  const handleEditApprove = useCallback(async () => {
    if (!selectedItem?.id) return
    try {
      await updateItem(selectedItem.id, { status: 'Scheduled' })
      setSelectedItem((prev) => (prev ? { ...prev, status: 'Scheduled' } : null))
      setRightPanel('schedule')
      toast.success('Approved')
    } catch {
      toast.error('Failed to approve')
    }
  }, [selectedItem?.id, updateItem])

  const handleEditReject = useCallback(async () => {
    if (!selectedItem?.id) return
    try {
      await updateItem(selectedItem.id, { status: 'Edit' })
      toast.success('Changes requested')
    } catch {
      toast.error('Failed to request changes')
    }
  }, [selectedItem?.id, updateItem])

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with global search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Idea → Research → Draft → Edit → Review → Scheduled → Published
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <GlobalSearchBar
            placeholder="Search content, runs, cronjobs..."
            className="flex-1 sm:flex-initial"
          />
          <Button onClick={handleCreateContent} className="gap-2">
            <Plus className="h-4 w-4" />
            New Content
          </Button>
        </div>
      </div>

      {/* Main layout: Pipeline + Right panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-4">
          <PipelineBoard
            items={items ?? []}
            onMoveItem={handleMoveItem}
            onSelectItem={handleSelectItem}
            isLoading={isLoading}
          />
        </div>

        <div className="xl:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>AI-assisted panels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={rightPanel === 'idea' ? 'default' : 'outline'}
                className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setRightPanel(rightPanel === 'idea' ? null : 'idea')}
              >
                <Lightbulb className="h-4 w-4" />
                Idea Generator
              </Button>
              <Button
                variant={rightPanel === 'research' ? 'default' : 'outline'}
                className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setRightPanel(rightPanel === 'research' ? null : 'research')}
              >
                <BookOpen className="h-4 w-4" />
                Research Panel
              </Button>
              <Button
                variant={rightPanel === 'draft' ? 'default' : 'outline'}
                className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setRightPanel(rightPanel === 'draft' ? null : 'draft')}
              >
                <PenLine className="h-4 w-4" />
                Draft Editor
              </Button>
              <Button
                variant={rightPanel === 'edit' ? 'default' : 'outline'}
                className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setRightPanel(rightPanel === 'edit' ? null : 'edit')}
              >
                <Edit className="h-4 w-4" />
                Editing
              </Button>
              <Button
                variant={rightPanel === 'schedule' ? 'default' : 'outline'}
                className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setRightPanel(rightPanel === 'schedule' ? null : 'schedule')}
              >
                <Calendar className="h-4 w-4" />
                Scheduling
              </Button>
              <Button
                variant={rightPanel === 'publish' ? 'default' : 'outline'}
                className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setRightPanel(rightPanel === 'publish' ? null : 'publish')}
              >
                <Send className="h-4 w-4" />
                Publishing
              </Button>
              <Button
                variant={rightPanel === 'templates' ? 'default' : 'outline'}
                className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setRightPanel(rightPanel === 'templates' ? null : 'templates')}
              >
                <FileText className="h-4 w-4" />
                Templates
              </Button>
            </CardContent>
          </Card>

          {rightPanel === 'idea' && (
            <IdeaGeneratorPanel
              onAccept={handleAcceptIdea}
              onClose={() => setRightPanel(null)}
            />
          )}
          {rightPanel === 'research' && selectedItem && (
            <ResearchPanel
              contentItem={selectedItem}
              onClose={() => setRightPanel(null)}
            />
          )}
          {rightPanel === 'draft' && selectedItem && (
            <DraftEditorPanel
              contentItemId={selectedItem.id}
              title={selectedItem.title}
              body={selectedItem.summary ?? ''}
              onSave={handleDraftSave}
            />
          )}
          {rightPanel === 'edit' && selectedItem && (
            <EditingPanel
              contentItemId={selectedItem.id}
              title={selectedItem.title}
              onApprove={handleEditApprove}
              onReject={handleEditReject}
            />
          )}
          {rightPanel === 'schedule' && selectedItem && (
            <SchedulingPanel
              contentItem={selectedItem}
              onClose={() => setRightPanel(null)}
              onUpdate={updateItem}
            />
          )}
          {rightPanel === 'publish' && selectedItem && (
            <PublishingPanel
              contentItem={selectedItem}
              onClose={() => setRightPanel(null)}
            />
          )}
          {rightPanel === 'templates' && (
            <TemplatesLibrary
              templates={templates ?? []}
              onInsert={(t) => {
                if (selectedItem) {
                  updateItem(selectedItem.id, { templatesId: t.id })
                  toast.success('Template applied')
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
