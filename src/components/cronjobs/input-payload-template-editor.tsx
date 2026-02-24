/**
 * InputPayloadTemplateEditor - Prompt template and variable bindings.
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import type { CronjobInputTemplate } from '@/types/cronjobs'

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

export function InputPayloadTemplateEditor({ value, onChange }: InputPayloadTemplateEditorProps) {
  const t = normalizeValue(value)

  const handlePromptChange = (v: string) => {
    onChange({ ...t, promptTemplate: v })
  }

  const handleScopeChange = (v: string) => {
    onChange({ ...t, scope: v })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Input payload
        </CardTitle>
        <CardDescription>
          Prompt template and variable bindings.
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
          <Label htmlFor="scope">Scope</Label>
          <Input
            id="scope"
            value={t.scope}
            onChange={(e) => handleScopeChange(e.target.value)}
            placeholder="content"
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  )
}
