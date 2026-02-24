/**
 * Auth API layer - uses Supabase Auth when configured.
 * Falls back to mock for development when Supabase is not configured.
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { OAuthProvider } from '@/types/auth'

export type AuthProvider = OAuthProvider

const REMEMBER_ME_KEY = 'lifeops_remember_me'

export function getRememberMe(): boolean {
  try {
    const stored = localStorage.getItem(REMEMBER_ME_KEY)
    return stored === 'true'
  } catch {
    return false
  }
}

export function setRememberMe(value: boolean): void {
  try {
    localStorage.setItem(REMEMBER_ME_KEY, String(value))
  } catch {
    // Ignore storage errors
  }
}

export interface LoginResult {
  ok: boolean
  requires2FA?: boolean
  error?: string
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<LoginResult> {
  setRememberMe(rememberMe)

  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Authentication is not configured. Please set up Supabase.' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const userMessage =
      error.message === 'Invalid login credentials'
        ? 'Invalid email or password.'
        : error.message ?? 'Sign in failed. Please try again.'
    return { ok: false, error: userMessage }
  }

  if (!data?.session) {
    return { ok: false, error: 'Sign in failed. Please try again.' }
  }

  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const currentLevel = aalData?.currentLevel ?? 'aal1'
  const nextLevel = aalData?.nextLevel ?? 'aal1'

  if (nextLevel === 'aal2' && currentLevel !== nextLevel) {
    return { ok: true, requires2FA: true }
  }

  return { ok: true }
}

export async function signInWithOAuth(
  provider: OAuthProvider
): Promise<{ ok: boolean; redirectUrl?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Authentication is not configured. Please set up Supabase.' }
  }

  const providerMap = {
    google: 'google' as const,
    github: 'github' as const,
    microsoft: 'azure' as const,
  }

  const supabaseProvider = providerMap[provider] ?? provider

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: supabaseProvider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      skipBrowserRedirect: true,
    },
  })

  if (error) {
    return { ok: false, error: error.message ?? 'OAuth sign-in failed.' }
  }

  const url = data?.url
  return { ok: true, redirectUrl: url }
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<LoginResult> {
  return loginWithEmailPassword(email, password, rememberMe)
}

export async function initiateOAuth(
  provider: OAuthProvider
): Promise<{ ok: boolean; redirectUrl?: string; error?: string }> {
  return signInWithOAuth(provider)
}

export interface Verify2FAResult {
  ok: boolean
  error?: string
}

export async function verify2FA(code: string, _pendingEmail?: string): Promise<Verify2FAResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }

  const { data: factorsData } = await supabase.auth.mfa.listFactors()
  const factors = factorsData?.totp ?? []
  const totpFactor = Array.isArray(factors) ? factors[0] : null

  if (!totpFactor?.id) {
    return { ok: false, error: 'No 2FA factor found. Please sign in again.' }
  }

  const { data: challengeData } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
  const challengeId = challengeData?.id

  if (!challengeId) {
    return { ok: false, error: 'Could not start 2FA verification. Please try again.' }
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId,
    code,
  })

  if (error) {
    return {
      ok: false,
      error: error.message === 'Invalid OTP' ? 'Invalid verification code.' : error.message ?? 'Verification failed.',
    }
  }

  return { ok: true }
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/password-reset/complete`,
  })

  if (error) {
    return { ok: false, error: error.message ?? 'Failed to send reset email.' }
  }

  return { ok: true }
}

export interface UpdatePasswordResult {
  ok: boolean
  error?: string
}

export async function updatePassword(newPassword: string): Promise<UpdatePasswordResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return { ok: false, error: error.message ?? 'Failed to update password.' }
  }

  return { ok: true }
}

/** Signup result - session created or email verification required */
export interface SignupResult {
  ok: boolean
  needsEmailVerification?: boolean
  error?: string
}

export async function signup(
  email: string,
  password: string,
  options: {
    name: string
    company?: string
    modules?: string[]
    onboardingPreferred?: boolean
  }
): Promise<SignupResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Authentication is not configured. Please set up Supabase.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: options.name,
        company: options.company ?? null,
        preferred_modules: Array.isArray(options.modules) ? options.modules : [],
        onboarding_preferred: options.onboardingPreferred ?? false,
      },
      emailRedirectTo: options.onboardingPreferred
        ? `${window.location.origin}/onboarding`
        : `${window.location.origin}/dashboard`,
    },
  })

  if (error) {
    const userMessage =
      error.message === 'User already registered'
        ? 'An account with this email already exists. Please sign in or reset your password.'
        : error.message ?? 'Sign up failed. Please try again.'
    return { ok: false, error: userMessage }
  }

  const needsEmailVerification =
    data?.user?.identities?.length === 0 ||
    (data?.user && !data?.session && data?.user?.email_confirmed_at == null)

  return { ok: true, needsEmailVerification: !!needsEmailVerification }
}

export async function signupWithOAuth(
  provider: OAuthProvider,
  options?: { onboardingPreferred?: boolean }
): Promise<{ ok: boolean; redirectUrl?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Authentication is not configured. Please set up Supabase.' }
  }

  const redirectTo = options?.onboardingPreferred
    ? `${window.location.origin}/onboarding`
    : `${window.location.origin}/dashboard`

  const providerMap = {
    google: 'google' as const,
    github: 'github' as const,
    microsoft: 'azure' as const,
  }

  const supabaseProvider = providerMap[provider] ?? provider

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: supabaseProvider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  })

  if (error) {
    return { ok: false, error: error.message ?? 'OAuth sign-up failed.' }
  }

  const url = data?.url
  return { ok: true, redirectUrl: url }
}

export async function verifyEmailToken(
  token: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'email',
  })

  if (error) {
    return { ok: false, error: error.message ?? 'Verification failed. Please try again.' }
  }

  return { ok: true }
}

export async function resendVerificationEmail(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    return { ok: false, error: error.message ?? 'Failed to resend verification email.' }
  }

  return { ok: true }
}
