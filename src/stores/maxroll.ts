/**
 * @file stores/maxroll.ts
 * @description Pinia store for Maxroll.gg data caching and state management
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TierListEntry, MaxrollBuildGuide, MetaBuildReference } from '@/types/maxroll'
import type { Hero } from '@/types/hero'
import { maxrollDataService } from '@/services/maxrollData'

export const useMaxrollStore = defineStore('maxroll', () => {
  // ========================================
  // State
  // ========================================

  /** Cached tier list entries */
  const tierList = ref<TierListEntry[]>([])

  /** Cached build guides by URL */
  const buildGuides = ref<Map<string, MaxrollBuildGuide>>(new Map())

  /** Last tier list update timestamp */
  const lastTierListUpdate = ref<number | null>(null)

  /** Loading state */
  const isLoading = ref(false)

  /** Error message if any */
  const error = ref<string | null>(null)

  /** Current hero's matched meta build */
  const currentMetaBuild = ref<MetaBuildReference | null>(null)

  // ========================================
  // Getters
  // ========================================

  /** Check if tier list is stale (> 24 hours old) */
  const isTierListStale = computed(() => {
    if (!lastTierListUpdate.value) return true
    const hoursSinceUpdate = (Date.now() - lastTierListUpdate.value) / (1000 * 60 * 60)
    return hoursSinceUpdate > 24
  })

  /** Get builds for a specific class */
  const getBuildsForClass = computed(() => {
    return (heroClass: string): TierListEntry[] => {
      const normalizedClass = heroClass.toLowerCase().replace(' ', '-')
      return tierList.value.filter(entry =>
        entry.heroClass.toLowerCase() === normalizedClass
      )
    }
  })

  /** Get top tier builds (S and A tier) */
  const topTierBuilds = computed(() => {
    return tierList.value.filter(entry =>
      entry.tier === 'S' || entry.tier === 'A'
    )
  })

  /** Check if we have any cached data */
  const hasData = computed(() => tierList.value.length > 0)

  // ========================================
  // Actions
  // ========================================

  /**
   * Refresh the tier list from Maxroll
   */
  async function refreshTierList(): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const result = await maxrollDataService.getTierList()

      if (result.success && result.data) {
        tierList.value = result.data
        lastTierListUpdate.value = Date.now()
        return true
      } else {
        error.value = result.error || 'Failed to fetch tier list'
        return false
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a specific build guide
   */
  async function fetchBuildGuide(guideUrl: string): Promise<MaxrollBuildGuide | null> {
    // Check cache first
    if (buildGuides.value.has(guideUrl)) {
      return buildGuides.value.get(guideUrl) || null
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await maxrollDataService.getBuildGuide(guideUrl)

      if (result.success && result.data) {
        buildGuides.value.set(guideUrl, result.data)
        return result.data
      } else {
        error.value = result.error || 'Failed to fetch build guide'
        return null
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Find and cache the best matching meta build for a hero
   */
  async function findMetaBuildForHero(hero: Hero): Promise<MetaBuildReference | null> {
    isLoading.value = true
    error.value = null

    try {
      // Ensure we have tier list data
      if (tierList.value.length === 0) {
        await refreshTierList()
      }

      const metaBuild = await maxrollDataService.findMatchingMetaBuild(hero)
      currentMetaBuild.value = metaBuild
      return metaBuild
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Build context string for Claude prompt
   */
  function getMetaContext(): string {
    if (!currentMetaBuild.value) {
      return ''
    }
    return maxrollDataService.buildMetaContext(currentMetaBuild.value)
  }

  /**
   * Clear all cached data
   */
  function clearCache(): void {
    tierList.value = []
    buildGuides.value.clear()
    lastTierListUpdate.value = null
    currentMetaBuild.value = null
    error.value = null
    maxrollDataService.clearCache()
  }

  /**
   * Initialize store - load cached data if available
   */
  function initialize(): void {
    // The service handles localStorage caching internally
    // Just check if we should auto-refresh
    if (maxrollDataService.isTierListStale()) {
      // Don't auto-refresh on init, let the user trigger it
      console.log('Maxroll tier list cache is stale')
    }
  }

  return {
    // State
    tierList,
    buildGuides,
    lastTierListUpdate,
    isLoading,
    error,
    currentMetaBuild,

    // Getters
    isTierListStale,
    getBuildsForClass,
    topTierBuilds,
    hasData,

    // Actions
    refreshTierList,
    fetchBuildGuide,
    findMetaBuildForHero,
    getMetaContext,
    clearCache,
    initialize
  }
})
