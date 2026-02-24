/**
 * AutomationTemplatesPanel - Create, edit, and apply automation templates.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileCode, Plus, Pencil } from 'lucide-react'
import { fetchAutomationTemplates, createAutomationTemplate, updateAutomationTemplate } from '@/api/projects'
import type { AutomationTemplate, AutomationTemplateType } from '@/types/projects'
import { toast } from 'sonner'

const TEMPLATE_TYPES: { id: AutomationTemplateType; label: string }[] = [
  { id: 'release', label: 'Release Pipeline' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'agent-prompt', label: 'Agent Prompt' },
  { id: 'runbook', label: 'Runbook' },
]

interface AutomationTemplatesPanelProps {
  projectId?: string | null
}

export function AutomationTemplatesPanel({ projectId: _projectId }: AutomationTemplatesPanelProps) {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AutomationTemplate | null>(null)
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<AutomationTemplateType>('release')
  const [formContent, setFormContent] = useState('')

  const loadTemplates = async () => {
    const list = await fetchAutomationTemplates()
    setTemplates(Array.isArray(list) ? list : [])
  }

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchAutomationTemplates().then((list) => {
      if (!cancelled) {
        setTemplates(Array.isArray(list) ? list : [])
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Name is required')
      return
    }
    try {
      if (editingTemplate) {
        await updateAutomationTemplate(editingTemplate.id, {
          name: formName,
          type: formType,
          content: formContent,
        })
        toast.success('Template updated')
      } else {
        await createAutomationTemplate({
          name: formName,
          type: formType,
          content: formContent,
        })
        toast.success('Template created')
      }
      setDialogOpen(false)
      setEditingTemplate(null)
      loadTemplates()
    } catch {
      toast.error('Failed to save')
    }
  }

  const openEdit = (t?: AutomationTemplate | null) => {
    setEditingTemplate(t ?? null)
    setFormName(t?.name ?? '')
    setFormType(t?.type ?? 'release')
    setFormContent(t?.content ?? '')
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileCode className="h-6 w-6 text-primary" />
            Automation Templates
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Reusable templates for release pipelines, changelogs, agent prompts
          </p>
        </div>
        <Button onClick={() => openEdit()} className="gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center max-w-sm">
                No templates yet. Create one for release pipelines, changelogs, or agent prompts.
              </p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => openEdit()}>
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          (templates ?? []).map((t) => (
            <Card key={t.id} className="transition-all duration-300 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{t.name}</CardTitle>
                  <CardDescription>
                    {TEMPLATE_TYPES.find((x) => x.id === t.type)?.label ?? t.type}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t.type}</Badge>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(t)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {t.content && (
                <CardContent className="pt-0">
                  <pre className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg overflow-x-auto max-h-24 overflow-y-auto">
                    {t.content}
                  </pre>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
            <DialogDescription>Define the template name, type, and content</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tpl-name">Name</Label>
              <Input
                id="tpl-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Release Pipeline v1"
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_TYPES.map((opt) => (
                  <Button
                    key={opt.id}
                    type="button"
                    variant={formType === opt.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormType(opt.id)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tpl-content">Content</Label>
              <Textarea
                id="tpl-content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Template content with {{variables}}"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
