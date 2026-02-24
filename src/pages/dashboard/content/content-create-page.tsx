/**
 * ContentCreatePage - Create or edit content with full editor, AI assistant, versioning, scheduling.
 */

import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import { CreateContentEditor } from '@/components/content-create'
import {
  useContentCreate,
  useContentVersions,
  useContentMemory,
  useContentArtifacts,
  useContentAudit,
  useContentPublish,
} from '@/hooks/use-content-create'
import { createContent } from '@/api/content-create'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function ContentCreatePage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const contentId = id ?? null

  const { content, loading, error, update, refetch } = useContentCreate(contentId)
  const { versions, loading: versionsLoading, createVersion } = useContentVersions(contentId)
  const { entries: memoryEntries, loading: memoryLoading, write: writeMemory } = useContentMemory(contentId)
  const { artifacts, loading: artifactsLoading } = useContentArtifacts(contentId)
  const { logs: auditLogs, loading: auditLoading } = useContentAudit(contentId)
  const { publishing, publish } = useContentPublish(contentId)

  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!id && !content && !loading) {
      setIsCreating(true)
      createContent({
        title: 'Untitled',
        status: 'Draft',
        authorId: 'u1',
        platforms: [],
      })
        .then((created) => {
          if (created?.id) {
            navigate(`/dashboard/content/create/${created.id}`, { replace: true })
          } else {
            setIsCreating(false)
            toast.error('Failed to create content')
          }
        })
        .catch(() => {
          toast.error('Failed to create content')
          setIsCreating(false)
        })
    }
  }, [id, content, loading, navigate])

  const handleSave = useCallback(
    async (payload: Parameters<typeof update>[0]) => {
      const updated = await update(payload)
      return updated ?? null
    },
    [update]
  )

  const handleCreateVersion = useCallback(
    async (changes: string, authorId: string) => {
      const v = await createVersion(changes, authorId)
      if (v) toast.success('Version saved')
      return v
    },
    [createVersion]
  )

  const handlePublish = useCallback(async (platforms?: string[]) => {
    const records = await publish(platforms)
    if ((records ?? []).length > 0) {
      toast.success('Published successfully')
      refetch()
    } else {
      toast.error('Publish failed')
    }
    return records ?? []
  }, [publish, refetch])

  if (isCreating || (contentId && loading && !content)) {
    return (
      <div className="p-6 space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/content">
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
              {contentId ? 'Edit Content' : 'Create Content'}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              AI-assisted drafting, research, versioning, and scheduling
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to="/dashboard/content/library">Content Library</Link>
        </Button>
      </div>

      <CreateContentEditor
        content={content ?? null}
        contentId={contentId}
        loading={loading}
        onSave={handleSave}
        onPublish={handlePublish}
        versions={versions}
        versionsLoading={versionsLoading}
        onCreateVersion={handleCreateVersion}
        memoryEntries={memoryEntries}
        memoryLoading={memoryLoading}
        onWriteMemory={writeMemory}
        artifacts={artifacts}
        artifactsLoading={artifactsLoading}
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        publishing={publishing}
      />
    </div>
  )
}
