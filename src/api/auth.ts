/**
 * Auth API module.
 * Consumes /auth/* endpoints. Backend can be Supabase Edge Functions or custom API.
 */

import { apiPost } from '@/lib/api'

export type AuthProvider = 'google' | 'github' | 'microsoft'

export interface User {
  id: string
  email: string
  twoFAEnabled?: boolean
  twoFARequired?: boolean
  oauthProviders?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  ok: boolean
  sessionToken?: string
  requires2FA?: boolean
  user?: User
  error?: string
}

export interface Verify2FARequest {
  code: string
  email?: string
}

export interface Verify2FAResponse {
  ok: boolean
  sessionToken?: string
  user?: User
  error?: string
}

export interface OAuthResponse {
  ok?: boolean
  redirectUrl?: string
  sessionToken?: string
  user?: User
  error?: string
}

export interface PasswordResetRequestResponse {
  ok: boolean
  error?: string
}

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
    // localStorage may be unavailable
  }
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<LoginResponse> {
  const payload = await apiPost<LoginResponse>('/auth/login', {
    email,
    password,
    rememberMe,
  })
  const data = payload ?? {}
  return {
    ok: data.ok ?? false,
    sessionToken: data.sessionToken,
    requires2FA: data.requires2FA,
    user: data.user,
    error: data.error,
  }
}

export async function verify2FA(code: string, email?: string): Promise<Verify2FAResponse> {
  const payload = await apiPost<Verify2FAResponse>('/auth/verify-2fa', { code, email })
  const data = payload ?? {}
  return {
    ok: data.ok ?? false,
    sessionToken: data.sessionToken,
    user: data.user,
    error: data.error,
  }
}

export async function initiateOAuth(provider: AuthProvider): Promise<OAuthResponse> {
  const payload = await apiPost<OAuthResponse>('/auth/login/oauth', { provider })
  const data = payload ?? {}
  return {
    ok: data.ok,
    redirectUrl: data.redirectUrl,
    sessionToken: data.sessionToken,
    user: data.user,
    error: data.error,
  }
}

export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResponse> {
  const payload = await apiPost<PasswordResetRequestResponse>('/auth/password-reset/request', {
    email,
  })
  const data = payload ?? {}
  return {
    ok: data.ok ?? false,
    error: data.error,
  }
}
