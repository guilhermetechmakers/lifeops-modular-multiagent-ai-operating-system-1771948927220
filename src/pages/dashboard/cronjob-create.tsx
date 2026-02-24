/**
 * Create Cronjob Page - Guided builder for new cronjobs.
 */

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useCreateCronjob, useCronjobTemplates } from '@/hooks/use-cronjobs'
import { CreateCronjobForm } from '@/components/cronjobs'

export function CronjobCreatePage() {
  const { create } = useCreateCronjob()
  const { templates } = useCronjobTemplates()

  const templateOptions = (templates ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
  }))

  const handleSubmit = async (input: Parameters<typeof create>[0]) => {
    const created = await create(input)
    if (created) {
      return { id: created.id }
    }
    throw new Error('Failed to create')
  }

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/cronjobs">
          <Button variant="ghost" size="icon" aria-label="Back to cronjobs">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Cronjob</h1>
          <p className="text-muted-foreground">
            Configure a new scheduled job or workflow
          </p>
        </div>
      </div>

      <CreateCronjobForm
        onSubmit={handleSubmit}
        templates={templateOptions}
      />
    </div>
  )
}
