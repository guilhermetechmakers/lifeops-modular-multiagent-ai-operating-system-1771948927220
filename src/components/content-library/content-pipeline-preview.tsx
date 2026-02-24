/**
 * ContentPipelinePreview - Lightweight pipeline stage visualization.
 */

import { cn } from '@/lib/utils'
import type { ContentStatus } from '@/types/content-dashboard'

const PIPELINE_STAGES: ContentStatus[] = [
  'Idea',
  'Research',
  'Draft',
  'Edit',
  'Review',
  'Scheduled',
  'Published',
]

export interface ContentPipelinePreviewProps {
  currentStage: ContentStatus
  className?: string
  variant?: 'chips' | 'progress'
}

export function ContentPipelinePreview({
  currentStage,
  className,
  variant = 'chips',
}: ContentPipelinePreviewProps) {
  const currentIndex = PIPELINE_STAGES.indexOf(currentStage)
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / PIPELINE_STAGES.length) * 100 : 0

  if (variant === 'progress') {
    return (
      <div className={cn('space-y-1', className)}>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{currentStage}</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {(PIPELINE_STAGES ?? []).slice(0, 5).map((stage) => {
        const isActive = stage === currentStage
        const isPast = PIPELINE_STAGES.indexOf(stage) < currentIndex
        return (
          <span
            key={stage}
            className={cn(
              'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors',
              isActive && 'bg-primary/20 text-primary',
              isPast && 'bg-muted text-muted-foreground',
              !isActive && !isPast && 'bg-muted/50 text-muted-foreground/70'
            )}
          >
            {stage}
          </span>
        )
      })}
    </div>
  )
}
