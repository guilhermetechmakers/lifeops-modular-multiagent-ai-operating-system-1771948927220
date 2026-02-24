/**
 * AutomationTemplatesPanel - Create, edit, and apply automation templates.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { FileCode, Plus, Pencil } from 'lucide-react'
import type { AutomationTemplate } from '@/types/projects'

const TEMPLATE_TYPES = [
  { value: 'release', label: 'Release Pipeline' },
  { value: 'changelog', label: 'Changelog' },
  { value: 'agent-prompt', label: 'Agent Prompt' },
  { value: 'runbook', label: 'Runbook' },
] as const

interface AutomationTemplatesPanelProps {
  templates?: AutomationTemplate[]
  onSave?: (template: Partial<AutomationTemplate>) => Promise<void>
  isLoading?: boolean
}

export function AutomationTemplatesPanel({
  templates = [],
  onSave,
  isLoading,
}: AutomationTemplatesPanelProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<AutomationTemplate['type']>('release')
  const [formContent, setFormContent] = useState('')

  const list = Array.isArray(templates) ? templates : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Automation Templates</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleCreate = async () => {
    if (formName.trim() && onSave) {
      await onSave({
        name: formName.trim(),
        type: formType,
        content: formContent || '{{version}}',
        updatedAt: new Date().toISOString(),
      })
      setIsCreateOpen(false)
      setFormName('')
      setFormType('release')
      setFormContent('')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Automation Templates
          </CardTitle>
          <CardDescription>
            Reusable templates for release pipelines, changelogs, agent prompts
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-12 text-center rounded-lg border border-dashed border-border">
            <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No templates yet</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{t.name}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {t.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Automation Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Release pipeline"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="template-type">Type</Label>
              <Select
                value={formType}
                onValueChange={(v) => setFormType(v as AutomationTemplate['type'])}
              >
                <SelectTrigger id="template-type" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template-content">Content (variables: {'{{version}}'})</Label>
              <Textarea
                id="template-content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="{{version}}"
                rows={4}
                className="mt-2 font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
