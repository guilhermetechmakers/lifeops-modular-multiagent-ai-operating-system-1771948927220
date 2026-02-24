/**
 * DiffViewer - Renders structured diffs for payload.
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PayloadDiff } from '@/types/approvals'

export interface DiffViewerProps {
  diff: PayloadDiff
  maxHeight?: number
  defaultCollapsed?: boolean
  className?: string
}

function formatJson(obj: unknown): string {
  try {
    return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

export function DiffViewer({
  diff,
  maxHeight = 300,
  defaultCollapsed = false,
  className,
}: DiffViewerProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const beforeStr = formatJson(diff.before)
  const afterStr = formatJson(diff.after)

  return (
    <div className={cn('rounded-xl border border-border overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border text-left"
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {diff.type === 'json' ? 'JSON Diff' : 'Text Diff'}
      </button>
      {!isCollapsed && (
        <div className="grid grid-cols-2 gap-0 border-t border-border">
          <div className="border-r border-border">
            <div className="px-3 py-2 bg-destructive/10 text-destructive/80 text-xs font-medium">
              Before
            </div>
            <pre
              className="p-4 text-xs font-mono overflow-x-auto overflow-y-auto bg-card"
              style={{ maxHeight }}
            >
              {beforeStr}
            </pre>
          </div>
          <div>
            <div className="px-3 py-2 bg-success/10 text-success/80 text-xs font-medium">
              After
            </div>
            <pre
              className="p-4 text-xs font-mono overflow-x-auto overflow-y-auto bg-card"
              style={{ maxHeight }}
            >
              {afterStr}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
