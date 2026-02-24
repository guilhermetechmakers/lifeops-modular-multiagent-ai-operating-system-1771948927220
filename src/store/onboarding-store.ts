/**
 * Centralized onboarding state store.
 * Persists progress, integrations, modules, data import, and cronjob config.
 */

import { create } from 'zustand'
import type {
  Connector,
  OnboardingState,
  DataImport,
  Cronjob,
  CronjobTemplate,
} from '@/types/onboarding'

export type OnboardingStepKey =
  | 'welcome'
  | 'integrations'
  | 'modules'
  | 'import'
  | 'cronjob'
  | 'videos'
  | 'summary'

const STEPS: OnboardingStepKey[] = [
  'welcome',
  'integrations',
  'modules',
  'import',
  'cronjob',
  'videos',
  'summary',
]

interface OnboardingStore {
  currentStepKey: OnboardingStepKey
  stepIndex: number
  state: OnboardingState
  isCompleting: boolean

  setStep: (key: OnboardingStepKey) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
  setConnectors: (connectors: Connector[]) => void
  addConnector: (connector: Connector) => void
  removeConnector: (providerKey: string) => void
  updateConnectorStatus: (providerKey: string, status: Connector['status']) => void
  setSelectedModules: (modules: string[]) => void
  toggleModule: (moduleKey: string) => void
  setDataImports: (imports: DataImport[]) => void
  addDataImport: (imp: DataImport) => void
  setCronjob: (cronjob: Cronjob | null) => void
  setCronjobTemplateId: (id: string | null) => void
  setCronjobTemplate: (template: CronjobTemplate | null) => void
  cronjobTemplate: CronjobTemplate | null
  setVideoProgress: (videoId: string, progress: number) => void
  addVideoWatched: (videoId: string) => void
  setState: (partial: Partial<OnboardingState>) => void
  setCompleting: (v: boolean) => void
  reset: () => void
  getStepProgress: () => number
  getVideoProgress: (videoId: string) => number
}

const initialState: OnboardingState = {
  connectors: [],
  selectedModules: [],
  dataImports: [],
  cronjob: null,
  cronjobTemplateId: null,
  videoProgress: {},
  completedAt: null,
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  currentStepKey: 'welcome',
  stepIndex: 0,
  state: initialState,
  isCompleting: false,
  cronjobTemplate: null,

  setStep: (key) => {
    const idx = STEPS.indexOf(key)
    if (idx >= 0) set({ currentStepKey: key, stepIndex: idx })
  },

  nextStep: () => {
    const { stepIndex } = get()
    if (stepIndex < STEPS.length - 1) {
      const next = STEPS[stepIndex + 1]
      set({ currentStepKey: next, stepIndex: stepIndex + 1 })
    }
  },

  prevStep: () => {
    const { stepIndex } = get()
    if (stepIndex > 0) {
      const prev = STEPS[stepIndex - 1]
      set({ currentStepKey: prev, stepIndex: stepIndex - 1 })
    }
  },

  goToStep: (index) => {
    if (index >= 0 && index < STEPS.length) {
      set({ currentStepKey: STEPS[index], stepIndex: index })
    }
  },

  setConnectors: (connectors) =>
    set((s) => ({
      state: { ...s.state, connectors: connectors ?? [] },
    })),

  addConnector: (connector) =>
    set((s) => ({
      state: {
        ...s.state,
        connectors: [
          ...(s.state.connectors ?? []).filter((c) => c.provider_key !== connector.provider_key),
          connector,
        ],
      },
    })),

  removeConnector: (providerKey) =>
    set((s) => ({
      state: {
        ...s.state,
        connectors: (s.state.connectors ?? []).filter((c) => c.provider_key !== providerKey),
      },
    })),

  updateConnectorStatus: (providerKey, status) =>
    set((s) => ({
      state: {
        ...s.state,
        connectors: (s.state.connectors ?? []).map((c) =>
          c.provider_key === providerKey ? { ...c, status } : c
        ),
      },
    })),

  setSelectedModules: (modules) =>
    set((s) => ({
      state: { ...s.state, selectedModules: modules ?? [] },
    })),

  toggleModule: (moduleKey) =>
    set((s) => {
      const list = s.state.selectedModules ?? []
      const has = list.includes(moduleKey)
      return {
        state: {
          ...s.state,
          selectedModules: has ? list.filter((m) => m !== moduleKey) : [...list, moduleKey],
        },
      }
    }),

  setDataImports: (imports) =>
    set((s) => ({
      state: { ...s.state, dataImports: imports ?? [] },
    })),

  addDataImport: (imp: DataImport) =>
    set((s) => ({
      state: {
        ...s.state,
        dataImports: [
          ...(s.state.dataImports ?? []).filter((i) => i.source_id !== imp.source_id),
          imp,
        ],
      },
    })),

  setCronjob: (cronjob) =>
    set((s) => ({
      state: { ...s.state, cronjob },
    })),

  setCronjobTemplateId: (cronjobTemplateId) =>
    set((s) => ({
      state: { ...s.state, cronjobTemplateId },
    })),

  setCronjobTemplate: (template) => set({ cronjobTemplate: template }),

  setVideoProgress: (videoId, progress) =>
    set((s) => ({
      state: {
        ...s.state,
        videoProgress: { ...(s.state.videoProgress ?? {}), [videoId]: progress },
      },
    })),

  addVideoWatched: (videoId) =>
    set((s) => ({
      state: {
        ...s.state,
        videoProgress: { ...(s.state.videoProgress ?? {}), [videoId]: 100 },
      },
    })),

  setState: (partial) =>
    set((s) => ({
      state: { ...s.state, ...partial },
    })),

  setCompleting: (v) => set({ isCompleting: v }),

  reset: () =>
    set({
      currentStepKey: 'welcome',
      stepIndex: 0,
      state: initialState,
      isCompleting: false,
      cronjobTemplate: null,
    }),

  getStepProgress: () => {
    const { stepIndex } = get()
    return Math.round((stepIndex / Math.max(1, STEPS.length - 1)) * 100)
  },

  getVideoProgress: (videoId) => {
    const { state } = get()
    return state.videoProgress?.[videoId] ?? 0
  },
}))

export { STEPS }
