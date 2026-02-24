/**
 * Projects section pages - Wrappers that pass projectId from useParams.
 */

import { useParams } from 'react-router-dom'
import {
  RoadmapsSection,
  TicketsSection,
  PRReleasePanel,
  CITriggerManager,
  AutomationTemplatesPanel,
  IntegrationsPanel,
  ArtifactsGallery,
} from '@/components/projects'

export function ProjectsRoadmapsPage() {
  const params = useParams<{ id?: string }>()
  return <RoadmapsSection projectId={params.id ?? null} />
}

export function ProjectsTicketsPage() {
  const params = useParams<{ id?: string }>()
  return <TicketsSection projectId={params.id ?? null} />
}

export function ProjectsPRsReleasesPage() {
  const params = useParams<{ id?: string }>()
  return <PRReleasePanel projectId={params.id ?? null} />
}

export function ProjectsCITriggersPage() {
  const params = useParams<{ id?: string }>()
  return <CITriggerManager projectId={params.id ?? null} />
}

export function ProjectsTemplatesPage() {
  return <AutomationTemplatesPanel projectId={null} />
}

export function ProjectsIntegrationsPage() {
  return <IntegrationsPanel projectId={null} />
}

export function ProjectsArtifactsPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id ?? ''
  if (!projectId) return null
  return <ArtifactsGallery projectId={projectId} />
}
