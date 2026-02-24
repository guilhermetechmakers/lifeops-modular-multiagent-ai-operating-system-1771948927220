import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Workflow, Play, Save } from 'lucide-react'

export function WorkflowEditorPage() {
  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Workflow Editor</h1>
          <p className="text-muted-foreground mt-1">
            Visual multi-agent workflow authoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Play className="h-4 w-4" />
            Simulate
          </Button>
          <Button>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="h-[500px] rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
            <Workflow className="h-16 w-16 mb-4 opacity-50" />
            <p className="font-medium">Canvas</p>
            <p className="text-sm">Drag nodes to build your workflow. Node types: agent, trigger, condition, action, retry.</p>
            <Button variant="outline" className="mt-4">
              Add First Node
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
