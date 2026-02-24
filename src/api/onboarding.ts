/**
 * Onboarding API - connectors, modules, import, cronjob, summary.
 * Uses fetch to API_BASE; wire to Supabase Edge Functions when deployed.
 * Falls back to mock data when API returns empty (dev/demo).
 */
import { apiGet, apiPost } from '@/lib/api'
import { MOCK_CONNECTORS, MOCK_MODULES, MOCK_CRONJOB_TEMPLATES } from '@/api/onboarding-mock'
import type {
  Connector,
  ModuleConfig,
  DataImport,
  CronjobTemplate,
  Cronjob,
} from '@/types/onboarding'

const BASE = '/onboarding'

export interface ConnectPayload {
  provider_id: string
  oauth_token?: string
  user_id?: string
}

export interface ModulesPayload {
  module_keys: string[]
}

export interface ImportPayload {
  source_id: string
  data_options?: Record<string, unknown>
}

export interface CronjobPayload {
  template_id: string
  inputs?: Record<string, unknown>
  timezone?: string
  permissions?: string[]
  safety_rails?: Record<string, unknown>
}

export interface OnboardingSummary {
  connectors: Connector[]
  modules: string[]
  dataImports: DataImport[]
  cronjob: Cronjob | null
  currentStep: number
  stepsCompleted: number
}


/** GET /api/onboarding/connectors */
export async function fetchConnectors(): Promise<Connector[]> {
  try {
    const res = await apiGet<{ connectors?: Connector[] }>(`${BASE}/connectors`)
    const list = Array.isArray(res?.connectors) ? res.connectors : []
    return list.length > 0 ? list : MOCK_CONNECTORS
  } catch {
    return MOCK_CONNECTORS
  }
}

/** POST /api/onboarding/connect */
export async function connectProvider(payload: ConnectPayload): Promise<{ ok: boolean; connector?: Connector; error?: string }> {
  try {
    const res = await apiPost<{ ok?: boolean; connector?: Connector; error?: string }>(
      `${BASE}/connect`,
      payload
    )
    return {
      ok: res?.ok ?? false,
      connector: res?.connector ?? undefined,
      error: res?.error ?? undefined,
    }
  } catch {
    // Demo mode: return mock connector when backend unavailable
    const names: Record<string, string> = {
      github: 'GitHub',
      cicd: 'CI/CD',
      plaid: 'Plaid',
      stripe: 'Stripe',
      healthkit: 'HealthKit',
    }
    const key = payload.provider_id ?? ''
    return {
      ok: true,
      connector: {
        id: key,
        provider_key: key,
        user_id: payload.user_id ?? '',
        status: 'connected',
        connected_at: new Date().toISOString(),
        last_used_at: null,
        display_name: names[key] ?? key,
        icon: key,
      },
    }
  }
}

/** GET /api/onboarding/modules */
export async function fetchModules(): Promise<ModuleConfig[]> {
  try {
    const res = await apiGet<{ modules?: ModuleConfig[] }>(`${BASE}/modules`)
    const list = Array.isArray(res?.modules) ? res.modules : []
    return list.length > 0 ? list : MOCK_MODULES
  } catch {
    return MOCK_MODULES
  }
}

/** POST /api/onboarding/modules */
export async function saveModuleSelections(payload: ModulesPayload): Promise<{ ok: boolean }> {
  try {
    const res = await apiPost<{ ok?: boolean }>(`${BASE}/modules`, payload)
    return { ok: res?.ok ?? false }
  } catch {
    return { ok: false }
  }
}

/** POST /api/onboarding/import */
export async function triggerImport(payload: ImportPayload): Promise<{ ok: boolean; import?: DataImport; error?: string }> {
  try {
    const res = await apiPost<{ ok?: boolean; import?: DataImport; error?: string }>(
      `${BASE}/import`,
      payload
    )
    return {
      ok: res?.ok ?? false,
      import: res?.import ?? undefined,
      error: res?.error ?? undefined,
    }
  } catch {
    // Demo mode: return mock import when backend unavailable
    return {
      ok: true,
      import: {
        id: `import-${Date.now()}`,
        user_id: '',
        source_id: payload.source_id,
        status: 'completed',
        result_summary: { rows: 10, status: 'success' },
        created_at: new Date().toISOString(),
      },
    }
  }
}

/** GET /api/onboarding/templates */
export async function fetchCronjobTemplates(): Promise<CronjobTemplate[]> {
  try {
    const res = await apiGet<{ templates?: CronjobTemplate[] }>(`${BASE}/templates`)
    const list = Array.isArray(res?.templates) ? res.templates : []
    return list.length > 0 ? list : MOCK_CRONJOB_TEMPLATES
  } catch {
    return MOCK_CRONJOB_TEMPLATES
  }
}

/** POST /api/onboarding/cronjob */
export async function createCronjob(payload: CronjobPayload): Promise<{ ok: boolean; cronjob?: Cronjob; error?: string }> {
  try {
    const res = await apiPost<{ ok?: boolean; cronjob?: Cronjob; error?: string }>(
      `${BASE}/cronjob`,
      payload
    )
    return {
      ok: res?.ok ?? false,
      cronjob: res?.cronjob ?? undefined,
      error: res?.error ?? undefined,
    }
  } catch {
    // Demo mode: return mock cronjob when backend unavailable
    const template = MOCK_CRONJOB_TEMPLATES.find((t) => t.id === payload.template_id) ?? MOCK_CRONJOB_TEMPLATES[0]
    return {
      ok: true,
      cronjob: {
        id: `cron-${Date.now()}`,
        user_id: '',
        name: template?.name ?? 'Weekly Content Ideas',
        template_id: payload.template_id,
        enabled: true,
        schedule: template?.schedule ?? '0 9 * * 1',
        timezone: payload.timezone ?? 'UTC',
        target_type: template?.target_type ?? 'agent',
        target_id: template?.target_id ?? 'content-ideas',
        input_payload: payload.inputs ?? template?.default_inputs ?? {},
        permissions: payload.permissions ?? template?.permissions ?? [],
        safety_rails: payload.safety_rails ?? template?.safety_rails ?? {},
        retry_policy: template?.retry_policy ?? {},
        status: 'active',
        next_run: new Date(Date.now() + 86400000).toISOString(),
        last_run_outcome: null,
      },
    }
  }
}

/** GET /api/onboarding/summary */
export async function fetchSummary(): Promise<OnboardingSummary> {
  try {
    const res = await apiGet<OnboardingSummary>(`${BASE}/summary`)
    const connectors = Array.isArray(res?.connectors) ? res.connectors : []
    const modules = Array.isArray(res?.modules) ? res.modules : []
    const dataImports = Array.isArray(res?.dataImports) ? res.dataImports : []
    return {
      connectors,
      modules,
      dataImports,
      cronjob: res?.cronjob ?? null,
      currentStep: res?.currentStep ?? 1,
      stepsCompleted: res?.stepsCompleted ?? 0,
    }
  } catch {
    return {
      connectors: [],
      modules: [],
      dataImports: [],
      cronjob: null,
      currentStep: 1,
      stepsCompleted: 0,
    }
  }
}

/** POST /api/onboarding/complete */
export async function completeOnboarding(): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiPost<{ ok?: boolean; error?: string }>(`${BASE}/complete`, {})
    return { ok: res?.ok ?? false, error: res?.error }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Completion failed'
    return { ok: false, error: msg }
  }
}

/** POST /api/onboarding/save-progress */
export async function saveProgress(state: Record<string, unknown>): Promise<{ ok: boolean }> {
  try {
    const res = await apiPost<{ ok?: boolean }>(`${BASE}/save-progress`, { state })
    return { ok: res?.ok ?? false }
  } catch {
    return { ok: false }
  }
}
