/**
 * useProjectsDashboard - Data fetching for Projects Dashboard.
 */

import { useState, useEffect, useCallback } from 'react'
import type {
  Project,
  Roadmap,
  Ticket,
  PR,
  Release,
  CITrigger,
  AutomationTemplate,
  IntegrationConnector,
} from '@/types/projects'
import {
  fetchProjects,
  fetchProject,
  fetchRoadmap,
  fetchTickets,
  updateTicket,
  fetchPRs,
  fetchReleases,
  fetchCITriggers,
  fetchAutomationTemplates,
  fetchIntegrations,
  fetchAgentJobs,
  fetchRunHistory,
} from '@/api/projects'

export function useProjectsDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchProjects()
        if (!cancelled) setProjects(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Failed to load projects'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { projects, isLoading, error }
}

export function useProjectDetail(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [prs, setPRs] = useState<PR[]>([])
  const [releases, setReleases] = useState<Release[]>([])
  const [ciTriggers, setCITriggers] = useState<CITrigger[]>([])
  const [agentJobs, setAgentJobs] = useState<unknown[]>([])
  const [runHistory, setRunHistory] = useState<unknown[]>([])
  const [runArtifacts, setRunArtifacts] = useState<unknown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!projectId || projectId === '') {
      setProject(null)
      setRoadmap(null)
      setTickets([])
      setPRs([])
      setReleases([])
      setCITriggers([])
      setAgentJobs([])
      setRunHistory([])
      setRunArtifacts([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    async function load() {
      const pid = projectId as string
      setIsLoading(true)
      setError(null)
      try {
        const [proj, road, tix, prList, relList, ciList, jobs, history] = await Promise.all([
          fetchProject(pid),
          fetchRoadmap(pid),
          fetchTickets(pid),
          fetchPRs(pid),
          fetchReleases(pid),
          fetchCITriggers(pid),
          fetchAgentJobs(pid),
          fetchRunHistory(pid),
        ])
        if (!cancelled) {
          setProject(proj ?? null)
          setRoadmap(road ?? null)
          setTickets(Array.isArray(tix) ? tix : [])
          setPRs(Array.isArray(prList) ? prList : [])
          setReleases(Array.isArray(relList) ? relList : [])
          setCITriggers(Array.isArray(ciList) ? ciList : [])
          setAgentJobs(Array.isArray(jobs) ? jobs : [])
          setRunHistory(Array.isArray(history) ? history : [])
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Failed to load project'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  const handleTicketMove = useCallback(
    async (ticketId: string, newStatus: Ticket['status']) => {
      const updated = await updateTicket(ticketId, { status: newStatus })
      if (updated) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
        )
      }
    },
    []
  )

  return {
    project,
    roadmap,
    tickets,
    prs,
    releases,
    ciTriggers,
    agentJobs,
    runHistory,
    runArtifacts,
    isLoading,
    error,
    handleTicketMove,
  }
}

export function useProjectsIntegrations() {
  const [integrations, setIntegrations] = useState<IntegrationConnector[]>([])
  const [templates, setTemplates] = useState<AutomationTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      try {
        const [intList, tmplList] = await Promise.all([
          fetchIntegrations(),
          fetchAutomationTemplates(),
        ])
        if (!cancelled) {
          setIntegrations(Array.isArray(intList) ? intList : [])
          setTemplates(Array.isArray(tmplList) ? tmplList : [])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { integrations, templates, isLoading }
}
