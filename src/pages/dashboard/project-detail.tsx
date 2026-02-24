/**
 * ProjectDetailPage - Deep-dive for a specific project.
 * Roadmap, backlog, agent jobs, run history, release artifacts.
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Map,
  LayoutGrid,
  Bot,
  History,
  Package,
  Zap,
  ChevronLeft,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  ProjectDetailHeaderCard,
  RoadmapPanel,
  BacklogPanel,
  AgentJobsPanel,
  RunHistoryPanel,
  ArtifactsPanel,
  AutomationPanel,
  SecurityAuditDrawer,
} from '@/components/project-detail'
import {
  getProjectDetail,
  getRoadmap,
  getBacklog,
  getAgentJobs,
  getRunHistory,
  getArtifacts,
  getTemplates,
  getAuditLogs,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  updateTicket,
  approveAgentJob,
  getSignedUrl,
} from '@/api/project-detail'
import type {
  ProjectDetail,
  RoadmapDetail,
  BacklogTicket,
  AgentJobDetail,
  RunHistoryDetail,
  ArtifactDetail,
  AutomationTemplateDetail,
  AuditLogEntry,
} from '@/types/project-detail'

export function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id ?? null

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapDetail | null>(null)
  const [tickets, setTickets] = useState<BacklogTicket[]>([])
  const [agentJobs, setAgentJobs] = useState<AgentJobDetail[]>([])
  const [runs, setRuns] = useState<RunHistoryDetail[]>([])
  const [artifacts, setArtifacts] = useState<ArtifactDetail[]>([])
  const [templates, setTemplates] = useState<AutomationTemplateDetail[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [auditOpen, setAuditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('roadmap')

  const refresh = useCallback(async () => {
    if (!projectId) return
    try {
      const [p, rm, t, j, r, a, tm, al] = await Promise.all([
        getProjectDetail(projectId),
        getRoadmap(projectId),
        getBacklog(projectId),
        getAgentJobs(projectId),
        getRunHistory(projectId),
        getArtifacts(projectId),
        getTemplates(projectId),
        getAuditLogs(projectId),
      ])
      setProject(p ?? null)
      setRoadmap(rm ?? null)
      setTickets(Array.isArray(t) ? t : [])
      setAgentJobs(Array.isArray(j) ? j : [])
      setRuns(Array.isArray(r) ? r : [])
      setArtifacts(Array.isArray(a) ? a : [])
      setTemplates(Array.isArray(tm) ? tm : [])
      setAuditLogs(Array.isArray(al) ? al : [])
    } catch (err) {
      toast.error('Failed to load project data')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    setIsLoading(true)
    refresh()
  }, [projectId, refresh])

  const handleCreateMilestone = async (payload: Parameters<typeof createMilestone>[1]) => {
    if (!projectId) return
    try {
      await createMilestone(projectId, payload)
      toast.success('Milestone added')
      refresh()
    } catch {
      toast.error('Failed to add milestone')
    }
  }

  const handleUpdateMilestone = async (
    milestoneId: string,
    payload: Parameters<typeof updateMilestone>[2]
  ) => {
    if (!projectId) return
    try {
      await updateMilestone(projectId, milestoneId, payload)
      toast.success('Milestone updated')
      refresh()
    } catch {
      toast.error('Failed to update milestone')
    }
  }

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!projectId) return
    try {
      await deleteMilestone(projectId, milestoneId)
      toast.success('Milestone deleted')
      refresh()
    } catch {
      toast.error('Failed to delete milestone')
    }
  }

  const handleUpdateTicket = async (
    ticketId: string,
    payload: Parameters<typeof updateTicket>[2]
  ) => {
    if (!projectId) return
    try {
      await updateTicket(projectId, ticketId, payload)
      toast.success('Ticket updated')
      refresh()
    } catch {
      toast.error('Failed to update ticket')
    }
  }

  const handleApproveJob = async (jobId: string) => {
    if (!projectId) return
    try {
      await approveAgentJob(projectId, jobId)
      toast.success('Job approved')
      refresh()
    } catch {
      toast.error('Failed to approve job')
    }
  }

  const handleGetSignedUrl = async (artifactId: string): Promise<string> => {
    try {
      return await getSignedUrl(artifactId)
    } catch {
      toast.error('Failed to get download link')
      return ''
    }
  }

  if (!projectId) {
    return (
      <div className="space-y-6">
        <Link to="/dashboard/projects">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in-up">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/dashboard/projects">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setAuditOpen(true)}
          aria-label="Open audit drawer"
        >
          <Shield className="h-4 w-4" />
          Audit Log
        </Button>
      </div>

      {project && (
        <ProjectDetailHeaderCard
          project={project}
          projectId={projectId}
          onEditRoadmap={() => setActiveTab('roadmap')}
          onTriggerRun={() => { setActiveTab('runs'); toast.info('Run triggered') }}
          onExportConfig={() => toast.info('Config exported')}
          onJumpToArtifacts={() => setActiveTab('artifacts')}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 bg-muted/50 p-1">
          <TabsTrigger value="roadmap" className="gap-2">
            <Map className="h-4 w-4" />
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="backlog" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Backlog
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            <Bot className="h-4 w-4" />
            Agent Jobs
          </TabsTrigger>
          <TabsTrigger value="runs" className="gap-2">
            <History className="h-4 w-4" />
            Run History
          </TabsTrigger>
          <TabsTrigger value="artifacts" className="gap-2">
            <Package className="h-4 w-4" />
            Artifacts
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap">
          <RoadmapPanel
            projectId={projectId}
            roadmap={roadmap}
            onRefresh={refresh}
            onCreateMilestone={handleCreateMilestone}
            onUpdateMilestone={handleUpdateMilestone}
            onDeleteMilestone={handleDeleteMilestone}
          />
        </TabsContent>

        <TabsContent value="backlog">
          <BacklogPanel
            projectId={projectId}
            tickets={tickets}
            onRefresh={refresh}
            onUpdateTicket={handleUpdateTicket}
          />
        </TabsContent>

        <TabsContent value="agents">
          <AgentJobsPanel
            projectId={projectId}
            jobs={agentJobs}
            onRefresh={refresh}
            onApprove={handleApproveJob}
          />
        </TabsContent>

        <TabsContent value="runs">
          <RunHistoryPanel projectId={projectId} runs={runs} onRefresh={refresh} />
        </TabsContent>

        <TabsContent value="artifacts">
          <ArtifactsPanel
            projectId={projectId}
            artifacts={artifacts}
            onRefresh={refresh}
            onGetSignedUrl={handleGetSignedUrl}
          />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationPanel
            projectId={projectId}
            templates={templates}
            onRefresh={refresh}
            onTriggerRun={() => toast.info('Run triggered')}
          />
        </TabsContent>
      </Tabs>

      <SecurityAuditDrawer
        open={auditOpen}
        onOpenChange={setAuditOpen}
        auditLogs={auditLogs}
        projectId={projectId}
      />
    </div>
  )
}
