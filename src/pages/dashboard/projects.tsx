/**
 * ProjectsDashboardPage - Main landing page aggregating all modules for developers.
 * Subsections: Roadmaps, Tickets Kanban, PRs/Releases, CI Triggers, Automation Templates, Integrations.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FolderKanban,
  Plus,
  GitBranch,
  Zap,
  FileCode,
  Plug,
  LayoutGrid,
} from 'lucide-react'
import {
  KanbanBoard,
  PRReleasePanel,
  CITriggerManager,
  AutomationTemplatesPanel,
  IntegrationsPanel,
} from '@/components/projects-dashboard'
import { useProjectsDashboard, useProjectsIntegrations } from '@/hooks/use-projects-dashboard'
import {
  fetchTickets,
  fetchPRs,
  fetchReleases,
  fetchCITriggers,
} from '@/api/projects'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ProjectsDashboard() {
  const { projects, isLoading: projectsLoading, error } = useProjectsDashboard()
  const { integrations, templates, isLoading: integrationsLoading } = useProjectsIntegrations()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [tickets, setTickets] = useState<import('@/types/projects').Ticket[]>([])
  const [prs, setPRs] = useState<import('@/types/projects').PR[]>([])
  const [releases, setReleases] = useState<import('@/types/projects').Release[]>([])
  const [ciTriggers, setCITriggers] = useState<import('@/types/projects').CITrigger[]>([])
  const [sectionLoading, setSectionLoading] = useState(false)

  const projectList = Array.isArray(projects) ? projects : []
  const currentProject = selectedProjectId
    ? projectList.find((p) => p.id === selectedProjectId)
    : null

  useEffect(() => {
    if (!selectedProjectId) {
      setTickets([])
      setPRs([])
      setReleases([])
      setCITriggers([])
      return
    }
    let cancelled = false
    setSectionLoading(true)
    Promise.all([
      fetchTickets(selectedProjectId),
      fetchPRs(selectedProjectId),
      fetchReleases(selectedProjectId),
      fetchCITriggers(selectedProjectId),
    ])
      .then(([t, p, r, c]) => {
        if (!cancelled) {
          setTickets(Array.isArray(t) ? t : [])
          setPRs(Array.isArray(p) ? p : [])
          setReleases(Array.isArray(r) ? r : [])
          setCITriggers(Array.isArray(c) ? c : [])
        }
      })
      .finally(() => {
        if (!cancelled) setSectionLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedProjectId])

  const handleTicketMove = async (
    ticketId: string,
    newStatus: import('@/types/projects').Ticket['status']
  ) => {
    const { updateTicket } = await import('@/api/projects')
    const updated = await updateTicket(ticketId, { status: newStatus })
    if (updated) {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      )
      toast.success('Ticket updated')
    }
  }

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Roadmaps, tickets, PRs, CI triggers, automation templates
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/cronjobs">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="py-4">
            <p className="text-destructive">{error.message}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left nav rail - project selector */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Projects</CardTitle>
              <CardDescription>Select a project to view details</CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : projectList.length === 0 ? (
                <div className="py-8 text-center">
                  <FolderKanban className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {projectList.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProjectId(p.id)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                        selectedProjectId === p.id
                          ? 'bg-primary/15 text-primary border-l-2 border-l-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <FolderKanban className="h-5 w-5 shrink-0" />
                      <span className="truncate">{p.name}</span>
                      {(p.ticketsCount ?? 0) > 0 && (
                        <span className="ml-auto text-xs">
                          {p.ticketsCount} tickets
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integrations</CardTitle>
              <CardDescription>Connector status</CardDescription>
            </CardHeader>
            <CardContent>
              {integrationsLoading ? (
                <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(integrations ?? []).map((conn) => (
                    <span
                      key={conn.id}
                      className={cn(
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
                        conn.status === 'connected'
                          ? 'bg-success/20 text-success'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {conn.provider}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main content - tabs */}
        <div className="lg:col-span-9">
          {selectedProjectId ? (
            <Tabs defaultValue="kanban" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
                <TabsTrigger value="kanban" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="prs" className="gap-2">
                  <GitBranch className="h-4 w-4" />
                  PRs
                </TabsTrigger>
                <TabsTrigger value="ci" className="gap-2">
                  <Zap className="h-4 w-4" />
                  CI
                </TabsTrigger>
                <TabsTrigger value="templates" className="gap-2">
                  <FileCode className="h-4 w-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <Plug className="h-4 w-4" />
                  Integrations
                </TabsTrigger>
              </TabsList>
              <TabsContent value="kanban">
                <KanbanBoard
                  tickets={tickets}
                  onTicketMove={handleTicketMove}
                  isLoading={sectionLoading}
                />
              </TabsContent>
              <TabsContent value="prs">
                <PRReleasePanel
                  prs={prs}
                  releases={releases}
                  isLoading={sectionLoading}
                />
              </TabsContent>
              <TabsContent value="ci">
                <CITriggerManager
                  triggers={ciTriggers}
                  isLoading={sectionLoading}
                />
              </TabsContent>
              <TabsContent value="templates">
                <AutomationTemplatesPanel
                  templates={templates}
                  isLoading={integrationsLoading}
                />
              </TabsContent>
              <TabsContent value="integrations">
                <IntegrationsPanel
                  connectors={integrations}
                  isLoading={integrationsLoading}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-24">
                <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Select a project</p>
                <p className="text-muted-foreground text-center max-w-sm mt-1">
                  Choose a project from the left to view roadmaps, tickets, PRs, and more.
                </p>
                {projectList.length > 0 && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSelectedProjectId(projectList[0].id)}
                  >
                    Open {projectList[0].name}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick links to project detail */}
      {currentProject && (
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link to={`/dashboard/projects/${currentProject.id}`}>
              View full project details
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
