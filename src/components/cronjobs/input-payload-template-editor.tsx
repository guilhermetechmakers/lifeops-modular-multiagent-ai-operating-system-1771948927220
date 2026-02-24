/**
 * InputPayloadTemplateEditor - Prompt template with variables palette and live preview.
 */

import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import type { CronjobInputTemplate } from '@/types/cronjobs'

const DEFAULT_VARIABLES = ['topic', 'scope', 'date', 'author', 'platform']

interface InputPayloadTemplateEditorProps {
  value: CronjobInputTemplate | string
  onChange: (value: CronjobInputTemplate | string) => void
}

function normalizeValue(v: CronjobInputTemplate | string): CronjobInputTemplate {
  if (typeof v === 'string') {
    return { promptTemplate: v, variables: {}, scope: '' }
  }
  return {
    promptTemplate: v?.promptTemplate ?? '',
    variables: v?.variables ?? {},
    scope: v?.scope ?? '',
  }
}

function renderPreview(template: string, variables: Record<string, string | number | boolean>): string {
  if (!template) return ''
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = variables[key]
    return val !== undefined && val !== null ? String(val) : `{{${key}}}`
  })
}

export function InputPayloadTemplateEditor({ value, onChange }: InputPayloadTemplateEditorProps) {
  const t = normalizeValue(value)
  const variables = t.variables ?? {}
  const varKeys = Object.keys(variables)
  const allVars = [...new Set([...DEFAULT_VARIABLES, ...varKeys])]

  const livePreview = useMemo(
    () => renderPreview(t.promptTemplate ?? '', variables),
    [t.promptTemplate, variables]
  )

  const handlePromptChange = (v: string) => {
    onChange({ ...t, promptTemplate: v })
  }

  const handleScopeChange = (v: string) => {
    onChange({ ...t, scope: v })
  }

  const handleVariableChange = (key: string, val: string | number | boolean) => {
    const next = { ...variables, [key]: val }
    onChange({ ...t, variables: next })
  }

  const insertVariable = (key: string) => {
    const cursor = `{{${key}}}`
    handlePromptChange(t.promptTemplate + cursor)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Input Payload Template
        </CardTitle>
        <CardDescription>
          Prompt template with variable insertion and live preview.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="prompt-template">Prompt template</Label>
          <Textarea
            id="prompt-template"
            value={t.promptTemplate}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Generate weekly content ideas for {{topic}}"
            className="mt-1 min-h-[100px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use {'{{variable}}'} for variable substitution.
          </p>
        </div>

        <div>
          <Label>Variables palette</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(allVars ?? []).map((key) => (
              <div key={key} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertVariable(key)}
                  className="px-2 py-1 text-xs rounded border border-border hover:border-primary/50 hover:bg-primary/10 transition-colors"
                >
                  {`{{${key}}}`}
                </button>
                <Input
                  value={String(variables[key] ?? '')}
                  onChange={(e) => handleVariableChange(key, e.target.value)}
                  placeholder={key}
                  className="w-20 h-7 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="scope">Scope</Label>
          <Input
            id="scope"
            value={t.scope}
            onChange={(e) => handleScopeChange(e.target.value)}
            placeholder="content"
            className="mt-1"
          />
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <Label className="text-muted-foreground">Live preview</Label>
          <pre className="mt-2 text-sm font-mono text-foreground whitespace-pre-wrap break-words">
            {livePreview || '(empty)'}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
