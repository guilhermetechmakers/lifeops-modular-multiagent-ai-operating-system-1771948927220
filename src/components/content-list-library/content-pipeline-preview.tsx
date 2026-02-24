/**
 * ContentPipelinePreview - Lightweight pipeline stage visualization.
 * Stage chips or progress indicator for content pipeline status.
 */

import { cn } from '@/lib/utils'

const PIPELINE_STAGES = [
  'Idea',
  'Research',
  'Draft',
  'Edit',
  'Review',
  'Scheduled',
  'Published',
] as const

export interface ContentPipelinePreviewProps {
  pipelineStage?: string
  className?: string
}

export function ContentPipelinePreview({
  pipelineStage,
  className,
}: ContentPipelinePreviewProps) {
  if (!pipelineStage) return null

  const stage = String(pipelineStage)
  const idx = PIPELINE_STAGES.indexOf(stage as (typeof PIPELINE_STAGES)[number])
  const progress = idx >= 0 ? ((idx + 1) / PIPELINE_STAGES.length) * 100 : 0

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-1 flex-wrap">
        {(PIPELINE_STAGES ?? []).map((s, i) => (
          <span
            key={s}
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded',
              s === stage
                ? 'bg-primary/20 text-primary font-medium'
                : i < idx
                  ? 'bg-muted text-muted-foreground'
                  : 'text-muted-foreground/50'
            )}
          >
            {s}
          </span>
        ))}
      </div>
      <div
        className="h-1 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Pipeline progress: ${stage}`}
      >
        <div
          className="h-full bg-primary/60 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
