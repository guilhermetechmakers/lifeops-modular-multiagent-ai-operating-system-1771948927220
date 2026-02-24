/**
 * CITriggerManager - List and editor for CI/CD triggers and templates.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Zap, Plus, Pencil, Trash2 } from 'lucide-react'
import type { CITrigger } from '@/types/projects'

interface CITriggerManagerProps {
  triggers?: CITrigger[]
  onSave?: (trigger: Partial<CITrigger>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  isLoading?: boolean
}

export function CITriggerManager({
  triggers = [],
  onSave,
  onDelete,
  isLoading,
}: CITriggerManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formEnabled, setFormEnabled] = useState(true)

  const list = Array.isArray(triggers) ? triggers : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CI/CD Triggers</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleCreate = async () => {
    if (formName.trim() && onSave) {
      await onSave({ name: formName.trim(), enabled: formEnabled, config: {} })
      setIsCreateOpen(false)
      setFormName('')
      setFormEnabled(true)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            CI/CD Triggers
          </CardTitle>
          <CardDescription>
            Pipelines, triggers, and templates for release automation
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Trigger
        </Button>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-12 text-center rounded-lg border border-dashed border-border">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No CI triggers configured</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Trigger
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
                  <p className="text-xs text-muted-foreground">
                    {t.templateId ? `Template: ${t.templateId}` : 'No template'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.enabled ? 'success' : 'secondary'} className="text-xs">
                    {t.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(t.id)}
                      aria-label="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New CI Trigger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="trigger-name">Name</Label>
              <Input
                id="trigger-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Deploy on merge"
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="trigger-enabled"
                checked={formEnabled}
                onChange={(e) => setFormEnabled(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="trigger-enabled">Enabled</Label>
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
