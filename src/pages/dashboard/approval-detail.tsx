/**
 * ApprovalDetailPage - Full context for a single approval.
 * Proposed action, agent trace, payload diffs, affected resources,
 * approve/deny/request-changes controls, comment thread, audit trail.
 */

import { useParams, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useApprovalDetail } from '@/hooks/use-approvals'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ActionHeaderCard,
  AgentTracePanel,
  PayloadDiffPanel,
  ResourcesImpactPanel,
  ApprovalsTimeline,
  CommentThread,
  DecisionControls,
  AuditLogPanel,
  ArtifactLinksPanel,
  SLAProgressBar,
  ErrorGuard,
} from '@/components/approvals'
import type { ApprovalCommentDetail } from '@/types/approvals'

const MODULE_LABELS: Record<string, string> = {
  content: 'Content',
  finance: 'Finance',
  projects: 'Projects',
  health: 'Health',
  cronjob: 'Cronjob',
  release: 'Release',
  'agent-change': 'Agent Change',
}

export function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const {
    approval,
    detail,
    comments,
    auditLogs,
    isLoading,
    error,
    refetch,
    submitAction,
    addComment,
  } = useApprovalDetail(id)

  // Prefer detail when available; fallback to approval
  const data = detail ?? approval
  const isPending =
    (data?.status === 'pending' || data?.status === 'pending-info') ?? false

  // Merge comments: detail.comments (ApprovalCommentDetail) or map ApprovalComment
  const commentList: ApprovalCommentDetail[] =
    Array.isArray(detail?.comments) && detail!.comments!.length > 0
      ? (detail!.comments ?? [])
      : (comments ?? []).map((c) => ({
          id: c.id,
          authorId: c.authorId,
          author: c.author,
          text: c.comment,
          createdAt: c.createdAt,
        }))

  // Map audit: detail.history or auditLogs
  const historyItems =
    Array.isArray(detail?.history) && (detail?.history?.length ?? 0) > 0
      ? (detail?.history ?? [])
      : (auditLogs ?? []).map((l) => ({
          id: l.id,
          action: l.actionType,
          actorId: l.actorId,
          actor: l.actor,
          timestamp: l.createdAt,
          comment: l.summary,
        }))

  const handleSubmitAction = async (payload: { action: 'approve' | 'deny' | 'changes_requested'; comments?: string }) => {
    try {
      await submitAction(payload)
      toast.success(
        payload.action === 'approve'
          ? 'Approved'
          : payload.action === 'deny'
            ? 'Denied'
            : 'Changes requested'
      )
    } catch {
      toast.error(`Failed to ${payload.action}`)
    }
  }

  const handleAddComment = async (text: string) => {
    const result = await addComment(text)
    if (result) toast.success('Comment added')
    return result
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

  if (error || !data) {
    return (
      <div className="space-y-8 animate-in-up">
        <Link to="/dashboard/approvals">
          <Button variant="ghost" size="icon" aria-label="Back to approvals">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <ErrorGuard
          hasData={false}
          error={error ?? undefined}
          onRetry={refetch}
          children={null}
          fallback={
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
          }
        />
      </div>
    )
  }

  const proposedAction =
    (detail?.proposedAction as string) ??
    ((approval?.details as Record<string, unknown>)?.proposedAction as string) ??
    approval?.summary ??
    'Approval'
  const targetEntities = detail?.targetEntities ?? []
  const status = (data?.status as string) ?? 'pending'
  const sla = detail?.sla ?? null
  const policy = detail?.policy
  const trace = detail?.trace ?? []
  const resources =
    detail?.resources ??
    (Array.isArray((approval?.details as Record<string, unknown>)?.affectedResources)
      ? ((approval?.details as Record<string, unknown>)?.affectedResources as string[]).map(
          (r, i) => ({
            id: `res-${i}`,
            type: 'resource',
            name: r,
            status: 'pending',
            impact: 'medium',
          })
        )
      : [])
  const diffs = detail?.diffs ?? []
  const artifacts = detail?.artifacts ?? []

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/approvals">
          <Button variant="ghost" size="icon" aria-label="Back to approvals">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold truncate">{proposedAction}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-muted-foreground">
              Approval #{data.id.slice(0, 8)}
            </span>
            {approval?.module && (
              <Badge variant="outline">
                {MODULE_LABELS[approval.module] ?? approval.module}
              </Badge>
            )}
            {policy?.multiApproverRequired && (
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3.5 w-3.5" />
                Multi-approver
              </Badge>
            )}
          </div>
        </div>
      </div>

      <ActionHeaderCard
        proposedAction={proposedAction}
        targetEntities={targetEntities}
        status={status}
        sla={sla ?? undefined}
      />

      {sla && (
        <Card className="rounded-xl">
          <CardContent className="py-4">
            <SLAProgressBar sla={sla} />
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AgentTracePanel trace={trace} />

          <PayloadDiffPanel diffs={diffs} artifacts={artifacts} />

          <ResourcesImpactPanel resources={resources} />

          {Object.keys(approval?.inputs ?? {}).length > 0 && (
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <h3 className="text-base font-semibold mb-2">Inputs</h3>
                <pre className="p-4 rounded-lg bg-muted/30 text-sm overflow-x-auto font-mono">
                  {JSON.stringify(approval?.inputs ?? {}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <ApprovalsTimeline history={historyItems} trace={trace} />
        </div>

        <div className="space-y-6">
          {isPending && (
            <DecisionControls
              disabled={!isPending}
              requiresCommentForDeny={false}
              requiresCommentForChanges={true}
              onAction={handleSubmitAction}
            />
          )}

          <CommentThread
            comments={commentList}
            onAddComment={handleAddComment}
            disabled={!isPending}
          />

          <AuditLogPanel history={historyItems} />

          <ArtifactLinksPanel artifacts={artifacts} />
        </div>
      </div>
    </div>
  )
}
