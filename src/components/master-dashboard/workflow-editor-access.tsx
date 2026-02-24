/**
 * WorkflowEditorAccess - Quick access to versioned templates and simulation mode.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Workflow, GitBranch, Play } from 'lucide-react'

export function WorkflowEditorAccess() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          Workflow Editor
        </CardTitle>
        <CardDescription>
          Versioned templates and simulation mode
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/workflows">
            <Button size="sm" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link to="/dashboard/workflows">
            <Button variant="outline" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Simulate
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
