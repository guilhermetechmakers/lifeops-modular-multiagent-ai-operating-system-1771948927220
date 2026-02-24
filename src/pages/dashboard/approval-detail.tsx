/**
 * ApprovalDetailPage - Full context for a single approval.
 * Proposed action, agent explanations, inputs, artifacts, approve/deny, comment thread.
 */

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Check,
  X,
  MessageSquarePlus,
  Clock,
  Users,
  FileText,
  History,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useApprovalDetail } from '@/hooks/use-approvals'
import { ApprovalCommentThread } from '@/components/approvals/approval-comment-thread'
import { Skeleton } from '@/components/ui/skeleton'
import type { ApprovalPriority } from '@/types/approvals'

const MODULE_LABELS: Record<string, string> = {
  content: 'Content',
  finance: 'Finance',
  projects: 'Projects',
  health: 'Health',
  cronjob: 'Cronjob',
  release: 'Release',
  'agent-change': 'Agent Change',
}

const PRIORITY_STYLES: Record<ApprovalPriority, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
  critical: 'bg-destructive text-white',
}

export function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [actionModal, setActionModal] = useState<'approve' | 'deny' | 'request-info' | null>(null)
  const [actionComment, setActionComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    approval,
    comments,
    auditLogs,
    isLoading,
    error,
    approve,
    deny,
    requestInfo,
    addComment,
  } = useApprovalDetail(id)

  const details = approval?.details as Record<string, unknown> | undefined
  const title = (details?.title as string) ?? approval?.summary ?? 'Approval'
  const agentExplanations = Array.isArray(details?.agentExplanations) ? details.agentExplanations : []
  const affectedResources = Array.isArray(details?.affectedResources) ? details.affectedResources : []
  const runArtifacts = Array.isArray(details?.runArtifacts) ? details.runArtifacts : []
  const inputs = approval?.inputs ?? {}

  const handleActionConfirm = async () => {
    if (!approval || !actionModal) return
    setIsSubmitting(true)
    try {
      if (actionModal === 'approve') {
        await approve(actionComment)
        toast.success('Approved')
      } else if (actionModal === 'deny') {
        await deny(actionComment)
        toast.success('Denied')
      } else {
        await requestInfo({ comment: actionComment })
        toast.success('Info requested')
      }
      setActionModal(null)
      setActionComment('')
    } catch {
      toast.error(`Failed to ${actionModal}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in-up">
        <Skeleton className="h-10 w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error || !approval) {
    return (
      <div className="space-y-8 animate-in-up">
        <Link to="/dashboard/approvals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{error?.message ?? 'Approval not found'}</p>
            <Link to="/dashboard/approvals">
              <Button variant="outline" className="mt-4">
                Back to Approvals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPending = approval.status === 'pending' || approval.status === 'pending-info'

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/approvals">
          <Button variant="ghost" size="icon" aria-label="Back to approvals">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold truncate">{title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-muted-foreground">Approval #{approval.id.slice(0, 8)}</span>
            <Badge variant="outline">{MODULE_LABELS[approval.module] ?? approval.module}</Badge>
            <Badge className={cn('text-xs', PRIORITY_STYLES[approval.priority])}>
              {approval.priority}
            </Badge>
            {approval.slaEnd && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                SLA: {new Date(approval.slaEnd).toLocaleString()}
              </span>
            )}
            {approval.multiApproverPolicy && (
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3.5 w-3.5" />
                Multi-approver
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {details?.proposedAction != null ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Proposed Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{String(details?.proposedAction ?? '')}</p>
              </CardContent>
            </Card>
          ) : null}

          {agentExplanations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Agent Explanations
                </CardTitle>
                <CardDescription>Inter-agent messages and reasoning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentExplanations.map((ex: { agentId?: string; agentName?: string; message?: string; timestamp?: string }, i: number) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-muted-foreground text-xs mb-1">
                        {ex.agentName ?? ex.agentId ?? 'Agent'}
                      </p>
                      <p className="text-sm">{ex.message ?? ''}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(inputs).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inputs</CardTitle>
                <CardDescription>Payload and context</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-lg bg-muted/30 text-sm overflow-x-auto font-mono">
                  {JSON.stringify(inputs, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {runArtifacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Run Artifacts</CardTitle>
                <CardDescription>Prompts, diffs, inter-agent messages</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="0">
                  <TabsList>
                    {(runArtifacts as { id?: string; type?: string }[]).map((a, i) => (
                      <TabsTrigger key={a.id ?? i} value={String(i)}>
                        {a.type ?? 'Artifact'}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {(runArtifacts as { content?: string }[]).map((a, i) => (
                    <TabsContent key={i} value={String(i)}>
                      <pre className="p-4 rounded-lg bg-muted/30 text-sm overflow-x-auto font-mono mt-2">
                        {a.content ?? ''}
                      </pre>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {affectedResources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Affected Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {affectedResources.map((r: string, i: number) => (
                    <Badge key={i} variant="outline">
                      {r}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {isPending && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
                <CardDescription>Approve, deny, or request more information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full gap-2"
                  variant="success"
                  onClick={() => setActionModal('approve')}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => setActionModal('deny')}
                >
                  <X className="h-4 w-4" />
                  Deny
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setActionModal('request-info')}
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  Request More Info
                </Button>
              </CardContent>
            </Card>
          )}

          <ApprovalCommentThread
            comments={comments}
            onAddComment={addComment}
            disabled={!isPending}
          />

          {auditLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Audit Trail
                </CardTitle>
                <CardDescription>Immutable log of actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="text-sm p-3 rounded-lg border border-border bg-card"
                    >
                      <p className="font-medium">{log.summary}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {log.actor ?? log.actorId} • {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ActionDialog
        open={actionModal !== null}
        action={actionModal}
        comment={actionComment}
        onCommentChange={setActionComment}
        onConfirm={handleActionConfirm}
        onCancel={() => {
          setActionModal(null)
          setActionComment('')
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

interface ActionDialogProps {
  open: boolean
  action: 'approve' | 'deny' | 'request-info' | null
  comment: string
  onCommentChange: (v: string) => void
  onConfirm: () => void
  onCancel: () => void
  isSubmitting: boolean
}

function ActionDialog({
  open,
  action,
  comment,
  onCommentChange,
  onConfirm,
  onCancel,
  isSubmitting,
}: ActionDialogProps) {
  const labels = {
    approve: 'Approve',
    deny: 'Deny',
    'request-info': 'Request More Info',
  }
  const descriptions = {
    approve: 'Add an optional comment for the audit trail.',
    deny: 'Add a reason for denial (recommended for audit).',
    'request-info': 'Add your questions or clarification request.',
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action ? labels[action] : ''}</DialogTitle>
          <DialogDescription>
            {action ? descriptions[action] : ''}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder={action === 'request-info' ? 'What information do you need?' : 'Comment (optional)'}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
