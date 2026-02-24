/**
 * RBACPanel - Workspace-level roles and permissions for approvals.
 * Configure who can view/approve/configure automation.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Role {
  id: string
  name: string
  permissions: string[]
  memberCount?: number
}

export interface RBACPanelProps {
  roles?: Role[]
  onAddRole?: () => void
  onEditRole?: (id: string) => void
  isLoading?: boolean
}

const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    permissions: ['approvals:view', 'approvals:approve', 'approvals:deny', 'approvals:configure', 'cronjobs:manage'],
    memberCount: 2,
  },
  {
    id: 'approver',
    name: 'Approver',
    permissions: ['approvals:view', 'approvals:approve', 'approvals:deny'],
    memberCount: 5,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    permissions: ['approvals:view'],
    memberCount: 10,
  },
]

export function RBACPanel({
  roles = [],
  onAddRole,
  onEditRole,
  isLoading,
}: RBACPanelProps) {
  const items = Array.isArray(roles) && roles.length > 0 ? roles : DEFAULT_ROLES

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Roles & Permissions
          </CardTitle>
          <CardDescription>
            Configure who can view, approve, or configure automation
          </CardDescription>
        </div>
        {onAddRole && (
          <Button size="sm" onClick={onAddRole} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((role) => (
              <div
                key={role.id}
                className={cn(
                  'rounded-lg border border-border p-4',
                  onEditRole && 'cursor-pointer hover:border-primary/50 transition-colors'
                )}
                onClick={() => onEditRole?.(role.id)}
                role={onEditRole ? 'button' : undefined}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2 bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{role.name}</p>
                      {role.memberCount != null && (
                        <p className="text-xs text-muted-foreground">
                          {role.memberCount} member(s)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(role.permissions ?? []).slice(0, 3).map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs">
                        {p}
                      </Badge>
                    ))}
                    {(role.permissions ?? []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(role.permissions ?? []).length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
