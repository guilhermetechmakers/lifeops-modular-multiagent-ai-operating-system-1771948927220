/**
 * PermissionsPanel - RBAC controls and automation level selectors.
 */

import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Lock } from 'lucide-react'
import type { CronjobPermission } from '@/types/cronjobs'

const AUTOMATION_LEVELS: { value: CronjobPermission; label: string }[] = [
  { value: 'suggest', label: 'Suggest Only' },
  { value: 'approval_required', label: 'Approval Required' },
  { value: 'conditional_auto_execute', label: 'Conditional Auto-Execute' },
  { value: 'bounded_autopilot', label: 'Bounded Autopilot' },
]

interface PermissionsPanelProps {
  value: CronjobPermission | string
  automationLevel?: string
  agentLevelPermissions?: boolean
  onChange: (updates: {
    permissions?: CronjobPermission | string
    automationLevel?: string
    agentLevelPermissions?: boolean
  }) => void
}

export function PermissionsPanel({
  value,
  agentLevelPermissions = false,
  onChange,
}: PermissionsPanelProps) {
  const perm = value ?? 'approval_required'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Permissions & Automation Level
        </CardTitle>
        <CardDescription>
          Who can configure, approve, or auto-execute this cronjob.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="automation-level">Automation level</Label>
          <Select
            value={perm}
            onValueChange={(v) => onChange({ permissions: v as CronjobPermission })}
          >
            <SelectTrigger id="automation-level" className="mt-1">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {(AUTOMATION_LEVELS ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {perm === 'suggest' && 'Agent suggests actions; human must approve.'}
            {perm === 'approval_required' && 'Requires human approval before execution.'}
            {perm === 'conditional_auto_execute' && 'Auto-executes when conditions are met.'}
            {perm === 'bounded_autopilot' && 'Runs within defined bounds without approval.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="agent-level-permissions"
            checked={agentLevelPermissions}
            onCheckedChange={(checked) =>
              onChange({ agentLevelPermissions: checked === true })
            }
          />
          <Label htmlFor="agent-level-permissions" className="cursor-pointer">
            Enable agent-level permission toggles
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
