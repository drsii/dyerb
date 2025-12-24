/**
 * @file services/auth.ts
 * @description Battle.net OAuth authentication service
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { useSettingsStore } from '@/stores/settings'
import type { TokenResponse } from '@/types'

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export interface AuthState {
  token: string | null
  tokenExpiry: number
  isAuthenticated: boolean
}

// Token refresh buffer (5 minutes before expiry)
const REFRESH_BUFFER = 300

class AuthService {
  private token: string | null = null
  private tokenExpiry = 0

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.token!
    }

    return this.requestToken()
  }

  /**
   * Check if the current token is still valid
   */
  isTokenValid(): boolean {
    if (!this.token) return false
    const now = Math.floor(Date.now() / 1000)
    return now < this.tokenExpiry - REFRESH_BUFFER
  }

  /**
   * Request a new access token from Battle.net via the proxy
   */
  async requestToken(): Promise<string> {
    const settings = useSettingsStore()

    if (!settings.clientId || !settings.clientSecret) {
      throw new AuthenticationError(
        'Missing credentials. Please configure your Battle.net Client ID and Secret in Settings.'
      )
    }

    if (!settings.proxyUrl) {
      throw new AuthenticationError(
        'Missing proxy URL. Please configure the Cloudflare Worker URL in Settings.'
      )
    }

    try {
      const baseUrl = settings.proxyUrl.replace(/\/+$/, '')
      const response = await fetch(`${baseUrl}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: settings.clientId,
          clientSecret: settings.clientSecret
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))

        if (response.status === 401) {
          throw new AuthenticationError(
            'Invalid credentials. Please check your Client ID and Secret.'
          )
        }

        throw new AuthenticationError(
          error.error || `Authentication failed with status ${response.status}`
        )
      }

      const data: TokenResponse = await response.json()

      this.token = data.access_token
      this.tokenExpiry = Math.floor(Date.now() / 1000) + data.expires_in

      return this.token
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AuthenticationError(
          'Failed to connect to the OAuth proxy. Please check the proxy URL and ensure it\'s deployed.'
        )
      }

      throw new AuthenticationError(
        `Authentication request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Invalidate the cached token
   */
  invalidateToken(): void {
    this.token = null
    this.tokenExpiry = 0
  }

  /**
   * Get the current auth state
   */
  getState(): AuthState {
    return {
      token: this.token,
      tokenExpiry: this.tokenExpiry,
      isAuthenticated: this.isTokenValid()
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
