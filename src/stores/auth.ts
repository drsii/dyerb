/**
 * @file stores/auth.ts
 * @description Authentication store for OAuth token management
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, AuthenticationError } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(null)
  const tokenExpiry = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastAuthenticated = ref<Date | null>(null)

  // Computed
  const isAuthenticated = computed(() => {
    if (!token.value) return false
    const now = Math.floor(Date.now() / 1000)
    return now < tokenExpiry.value - 300 // 5 min buffer
  })

  const tokenExpiresIn = computed(() => {
    if (!tokenExpiry.value) return 0
    const now = Math.floor(Date.now() / 1000)
    return Math.max(0, tokenExpiry.value - now)
  })

  // Actions
  async function authenticate(): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const newToken = await authService.getToken()
      const state = authService.getState()

      token.value = newToken
      tokenExpiry.value = state.tokenExpiry
      lastAuthenticated.value = new Date()

      return true
    } catch (e) {
      if (e instanceof AuthenticationError) {
        error.value = e.message
      } else {
        error.value = 'An unexpected error occurred during authentication'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function refreshToken(): Promise<boolean> {
    if (isAuthenticated.value) {
      return true
    }

    return authenticate()
  }

  async function getValidToken(): Promise<string> {
    if (!isAuthenticated.value) {
      const success = await authenticate()
      if (!success) {
        throw new AuthenticationError(error.value || 'Authentication failed')
      }
    }
    return token.value!
  }

  function logout() {
    authService.invalidateToken()
    token.value = null
    tokenExpiry.value = 0
    lastAuthenticated.value = null
    error.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    token,
    tokenExpiry,
    isLoading,
    error,
    lastAuthenticated,

    // Computed
    isAuthenticated,
    tokenExpiresIn,

    // Actions
    authenticate,
    refreshToken,
    getValidToken,
    logout,
    clearError
  }
})
