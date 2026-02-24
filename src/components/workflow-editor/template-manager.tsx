/**
 * TemplateManager - Versioned template storage, diff, history.
 * Create/Clone/Rename templates; publish/unpublish actions.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { WorkflowTemplate, TemplateVersion } from '@/types/workflow-editor'
import {
  Plus,
  History,
  GitCompare,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import {
  fetchTemplates,
  fetchVersions,
  createTemplate,
  publishTemplate,
  rollbackTemplate,
} from '@/api/workflow-editor'
import { toast } from 'sonner'

interface TemplateManagerProps {
  templateId: string | null
  onTemplateSelect: (id: string) => void
  onTemplateCreate?: (t: WorkflowTemplate) => void
}

export function TemplateManager({
  templateId,
  onTemplateSelect,
  onTemplateCreate,
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [versions, setVersions] = useState<TemplateVersion[]>([])
  const [versionsLoading, setVersionsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchTemplates()
      .then((list) => {
        if (!cancelled) {
          const arr = Array.isArray(list) ? list : []
          setTemplates(arr)
        }
      })
      .catch(() => {
        if (!cancelled) setTemplates([])
      })
      .finally(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!templateId) {
      setVersions([])
      return
    }
    let cancelled = false
    setVersionsLoading(true)
    fetchVersions(templateId)
      .then((list) => {
        if (!cancelled) {
          const arr = Array.isArray(list) ? list : []
          setVersions(arr)
        }
      })
      .catch(() => {
        if (!cancelled) setVersions([])
      })
      .finally(() => {
        if (!cancelled) setVersionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [templateId])

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Template name is required')
      return
    }
    setIsSubmitting(true)
    try {
      const t = await createTemplate({
        name: newName.trim(),
        description: newDescription.trim(),
      })
      setTemplates((prev) => [...(prev ?? []), t])
      setNewName('')
      setNewDescription('')
      onTemplateSelect(t.id)
      onTemplateCreate?.(t)
      toast.success('Template created')
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Failed to create template')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async () => {
    if (!templateId) return
    try {
      const t = await publishTemplate(templateId)
      setTemplates((prev) =>
        (prev ?? []).map((x) => (x.id === t.id ? t : x))
      )
      toast.success('Template published')
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Failed to publish')
    }
  }

  const handleRollback = async (versionId: string) => {
    if (!templateId) return
    try {
      const t = await rollbackTemplate(templateId, versionId)
      setTemplates((prev) =>
        (prev ?? []).map((x) => (x.id === t.id ? t : x))
      )
      toast.success('Rolled back to version')
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Failed to rollback')
    }
  }

  const selectedTemplate = (templates ?? []).find((t) => t.id === templateId)

  return (
    <Card className="rounded-xl border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Template</Label>
          <Select
            value={templateId ?? ''}
            onValueChange={(v) => v && onTemplateSelect(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose template" />
            </SelectTrigger>
            <SelectContent>
              {(templates ?? []).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="flex items-center gap-2">
                    {t.name}
                    {t.isPublished && (
                      <Badge variant="secondary" className="text-xs">
                        Published
                      </Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isCreating ? (
          <div className="space-y-2 rounded-lg border border-border p-4">
            <Label>New Template</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Template name"
            />
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newName.trim() || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
                Create
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setNewName('')
                  setNewDescription('')
                }}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        )}

        {selectedTemplate && (
          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full"
              onClick={handlePublish}
              disabled={selectedTemplate.isPublished}
            >
              <Check className="h-4 w-4" />
              Publish
            </Button>
          </div>
        )}

        <Tabs defaultValue="versions">
          <TabsList className="w-full">
            <TabsTrigger value="versions" className="flex-1">
              <History className="h-4 w-4" />
              Versions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="versions" className="mt-3">
            {versionsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-pulse text-muted-foreground" />
              </div>
            ) : (versions ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No versions yet
              </p>
            ) : (
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {(versions ?? []).map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-lg border border-border p-2 text-sm"
                  >
                    <span>v{v.versionNumber}</span>
                    <span className="text-muted-foreground truncate max-w-[120px]">
                      {v.changesSummary}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRollback(v.id)}
                      aria-label={`Rollback to v${v.versionNumber}`}
                    >
                      <GitCompare className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
