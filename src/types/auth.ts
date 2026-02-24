/**
 * Auth types for LifeOps authentication flows.
 */

export interface User {
  id: string
  email: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginResponse {
  ok: boolean
  sessionToken?: string
  requires2FA?: boolean
  user?: User
  error?: string
}

export interface Verify2FAResponse {
  ok: boolean
  sessionToken?: string
  user?: User
  error?: string
}

export type OAuthProvider = 'google' | 'github' | 'microsoft'
