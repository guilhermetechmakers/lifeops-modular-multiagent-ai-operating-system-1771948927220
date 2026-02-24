/**
 * Permissions Tab - Subjects, resource scopes, approval requirements.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Save, Lock, Users } from 'lucide-react'
import type { AgentPermissions } from '@/types/agent-console'

export interface PermissionsTabProps {
  permissions?: AgentPermissions | null
  onSave?: (permissions: Partial<AgentPermissions>) => void | Promise<unknown>
  isSaving?: boolean
}

export function PermissionsTab({ permissions, onSave, isSaving }: PermissionsTabProps) {
  const [subjects, setSubjects] = useState(
    (permissions?.subjects ?? []).join(', ')
  )
  const [scopes, setScopes] = useState(
    (permissions?.resourceScopes ?? []).join(', ')
  )
  const [approvalRequired, setApprovalRequired] = useState(
    permissions?.approvalRequired ?? false
  )

  const handleSave = () => {
    const subj = subjects.split(',').map((s) => s.trim()).filter(Boolean)
    const scop = scopes.split(',').map((s) => s.trim()).filter(Boolean)
    onSave?.({
      subjects: subj.length > 0 ? subj : undefined,
      resourceScopes: scop.length > 0 ? scop : undefined,
      approvalRequired,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invocation Subjects
          </CardTitle>
          <CardDescription>
            Who or what can invoke this agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="subjects">Subjects (comma-separated)</Label>
            <Input
              id="subjects"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="content-team, finance-team"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Resource Scopes
          </CardTitle>
          <CardDescription>
            Resource scopes this agent can access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="scopes">Scopes (comma-separated)</Label>
            <Input
              id="scopes"
              value={scopes}
              onChange={(e) => setScopes(e.target.value)}
              placeholder="content, memory, api"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Approval Requirements</CardTitle>
          <CardDescription>
            Require human approval before certain actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Checkbox
              id="approval"
              checked={approvalRequired}
              onCheckedChange={(v) => setApprovalRequired(Boolean(v))}
            />
            <Label htmlFor="approval">Approval required for automation</Label>
          </div>
        </CardContent>
      </Card>

      {onSave && (
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Permissions'}
        </Button>
      )}
    </div>
  )
}
