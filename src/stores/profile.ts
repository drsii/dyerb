/**
 * @file stores/profile.ts
 * @description Profile store for Battle.net account and hero list
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { battleNetService, APIError } from '@/services/battlenet'
import type { HeroSummary } from '@/types'

export const useProfileStore = defineStore('profile', () => {
  // State
  const heroes = ref<HeroSummary[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)

  // Actions
  async function fetchHeroes(): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      heroes.value = await battleNetService.getHeroes()
      lastFetched.value = new Date()
      return true
    } catch (e) {
      if (e instanceof APIError) {
        error.value = e.message
      } else {
        error.value = 'Failed to fetch heroes'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearHeroes() {
    heroes.value = []
    lastFetched.value = null
    error.value = null
  }

  function getHeroById(heroId: number): HeroSummary | undefined {
    return heroes.value.find(h => h.heroId === heroId)
  }

  return {
    // State
    heroes,
    isLoading,
    error,
    lastFetched,

    // Actions
    fetchHeroes,
    clearHeroes,
    getHeroById
  }
})
