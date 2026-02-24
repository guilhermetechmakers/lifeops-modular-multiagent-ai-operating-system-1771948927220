/**
 * TemplatesLibrary - Catalog of templates; insert into ideas/drafts; versioning.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileCode, Plus } from 'lucide-react'
import type { ContentTemplate } from '@/types/content-dashboard'
import { cn } from '@/lib/utils'

interface TemplatesLibraryProps {
  templates?: ContentTemplate[]
  onInsert?: (template: ContentTemplate) => void
  isLoading?: boolean
}

export function TemplatesLibrary({
  templates = [],
  onInsert,
  isLoading,
}: TemplatesLibraryProps) {
  const [selected, setSelected] = useState<ContentTemplate | null>(null)

  const list = templates ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-primary" />
          Templates
        </CardTitle>
        <CardDescription>
          Insert templates into ideas or drafts. Template versioning supported.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No templates. Add templates in settings.
          </p>
        ) : (
          list.map((t) => (
            <div
              key={t.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer',
                selected?.id === t.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card/50 hover:border-primary/30'
              )}
              onClick={() => setSelected(t)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{t.name}</p>
                {t.description && (
                  <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                )}
                {t.version != null && (
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    v{t.version}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onInsert?.(t)
                }}
                aria-label={`Insert ${t.name}`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
