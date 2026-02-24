/**
 * Onboarding hooks - data fetching and mutations for the setup wizard.
 */
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useOnboardingStore } from '@/store/onboarding-store'
import {
  fetchConnectors,
  fetchSummary,
  completeOnboarding,
  connectProvider,
  saveModuleSelections,
  triggerImport,
  createCronjob,
  saveProgress,
} from '@/api/onboarding'
import { MOCK_VIDEOS } from '@/api/onboarding-mock'

export function useOnboardingData() {
  const { state, setConnectors } = useOnboardingStore()

  const loadConnectors = useCallback(async () => {
    const list = await fetchConnectors()
    setConnectors(list ?? [])
  }, [setConnectors])

  useEffect(() => {
    loadConnectors()
  }, [loadConnectors])

  return {
    connectors: state.connectors ?? [],
    selectedModules: state.selectedModules ?? [],
    dataImports: state.dataImports ?? [],
    cronjob: state.cronjob,
    videosWatched: Object.keys(state.videoProgress ?? {}),
    loadConnectors,
  }
}

export function useOnboardingProgress() {
  const { stepIndex } = useOnboardingStore()

  const saveProgressToServer = useCallback(
    async (statePayload: Record<string, unknown>) => {
      await saveProgress(statePayload)
    },
    []
  )

  return { stepIndex, saveProgressToServer }
}

export function useCompleteOnboarding() {
  const { state, setCompleting, reset } = useOnboardingStore()

  const complete = useCallback(async () => {
    setCompleting(true)
    try {
      const result = await completeOnboarding()
      if (result.ok) {
        toast.success('Welcome to LifeOps!')
        sessionStorage.setItem('lifeops_just_completed_onboarding', 'true')
        reset()
        return '/dashboard/overview'
      }
      toast.error(result.error ?? 'Could not complete onboarding. Please try again.')
      return null
    } finally {
      setCompleting(false)
    }
  }, [setCompleting, reset])

  return {
    complete,
    summary: {
      connectors: state.connectors ?? [],
      selectedModules: state.selectedModules ?? [],
      dataImports: state.dataImports ?? [],
      cronjob: state.cronjob,
    },
  }
}

export function useConnectProvider() {
  const setConnectors = useOnboardingStore((s) => s.setConnectors)

  const connect = useCallback(async (providerId: string) => {
    const result = await connectProvider({
      provider_id: providerId,
      oauth_token: `mock_${providerId}`,
    })
    if (result.ok && result.connector) {
      const list = (useOnboardingStore.getState().state.connectors ?? []).filter(
        (c) => c.provider_key !== result.connector!.provider_key
      )
      setConnectors([...list, result.connector])
      toast.success(`Connected ${result.connector.display_name ?? result.connector.provider_key}`)
      return true
    }
    toast.error(result.error ?? 'Connection failed')
    return false
  }, [setConnectors])

  const disconnect = useCallback((providerId: string) => {
    const list = (useOnboardingStore.getState().state.connectors ?? []).filter(
      (c) => c.provider_key !== providerId
    )
    setConnectors(list)
    toast.success('Disconnected')
    return true
  }, [setConnectors])

  return { connect, disconnect }
}

export function useSaveModules() {
  const { state } = useOnboardingStore()

  const save = useCallback(async () => {
    const ok = await saveModuleSelections({ module_keys: state.selectedModules ?? [] })
    if (ok) toast.success('Modules saved')
    return ok
  }, [state.selectedModules])

  return { save }
}

export function useTriggerImport() {
  const setDataImports = useOnboardingStore((s) => s.setDataImports)

  const run = useCallback(
    async (sourceId: string, options?: Record<string, unknown>) => {
      const result = await triggerImport({ source_id: sourceId, data_options: options })
      if (result.ok && result.import) {
        const imports = [...(useOnboardingStore.getState().state.dataImports ?? []), result.import]
        setDataImports(imports)
        toast.success('Import started')
        return result.import
      }
      toast.error(result.error ?? 'Import failed')
      return null
    },
    [setDataImports]
  )

  return { run }
}

export function useCreateCronjob() {
  const { setCronjob } = useOnboardingStore()

  const create = useCallback(
    async (payload: {
      template_id: string
      inputs?: Record<string, unknown>
      timezone?: string
      permissions?: string[]
      safety_rails?: Record<string, unknown>
    }) => {
      const result = await createCronjob(payload)
      if (result.ok && result.cronjob) {
        setCronjob(result.cronjob)
        toast.success('Cronjob created')
        return result.cronjob
      }
      toast.error(result.error ?? 'Could not create cronjob')
      return null
    },
    [setCronjob]
  )

  return { create }
}

export function useOnboardingSummary() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchSummary>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
      .then(setSummary)
      .finally(() => setLoading(false))
  }, [])

  return { summary, loading }
}

export function useTutorialVideos() {
  const [videos] = useState(() => MOCK_VIDEOS)
  return { videos: videos ?? [] }
}
