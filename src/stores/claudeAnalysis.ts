/**
 * @file stores/claudeAnalysis.ts
 * @description Claude AI analysis store for build recommendations
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  claudeAnalysisService,
  type BuildRecommendation,
  type EnhancedBuildRecommendation,
  type AnalysisOptions
} from '@/services/claudeAnalysis'
import { useSettingsStore } from '@/stores/settings'
import { maxrollDataService } from '@/services/maxrollData'
import type { Hero } from '@/types/hero'

/** Combined recommendation type that can be either basic or enhanced */
export type AnyBuildRecommendation = BuildRecommendation | EnhancedBuildRecommendation

export const useClaudeAnalysisStore = defineStore('claudeAnalysis', () => {
  // State
  const recommendation = ref<AnyBuildRecommendation | null>(null)
  const isAnalyzing = ref(false)
  const error = ref<string | null>(null)
  const analyzedHeroId = ref<number | null>(null)
  const isEnhancedAnalysis = ref(false)

  // Cache recommendations by hero ID
  const cache = ref<Map<number, AnyBuildRecommendation>>(new Map())

  // Getters
  const hasRecommendation = computed(() => recommendation.value !== null)

  const hasActiveSkills = computed(() =>
    (recommendation.value?.skills.active.length ?? 0) > 0
  )

  const hasPassiveSkills = computed(() =>
    (recommendation.value?.skills.passive.length ?? 0) > 0
  )

  const hasGearRecommendations = computed(() =>
    (recommendation.value?.gear.sets.length ?? 0) > 0 ||
    (recommendation.value?.gear.items.length ?? 0) > 0
  )

  const hasGemRecommendations = computed(() =>
    (recommendation.value?.gems.length ?? 0) > 0
  )

  // Computed to check if recommendation is enhanced
  const hasEnhancedRecommendation = computed(() => {
    return recommendation.value !== null && 'tieredUpgrades' in recommendation.value
  })

  // Actions
  async function generateBuildSuggestion(hero: Hero, forceRefresh = false): Promise<void> {
    const settings = useSettingsStore()

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && cache.value.has(hero.heroId)) {
      recommendation.value = cache.value.get(hero.heroId)!
      analyzedHeroId.value = hero.heroId
      isEnhancedAnalysis.value = 'tieredUpgrades' in recommendation.value
      error.value = null
      return
    }

    isAnalyzing.value = true
    error.value = null

    try {
      // Try enhanced analysis with Maxroll data if enabled
      if (settings.useMaxrollData) {
        // Fetch meta build for context
        const metaBuild = await maxrollDataService.findMatchingMetaBuild(hero)

        const options: AnalysisOptions = {
          useMetaBuilds: true,
          focusOnSurvivability: false // Could be a setting in the future
        }

        const result = await claudeAnalysisService.analyzeHeroEnhanced(
          hero,
          options,
          metaBuild || undefined
        )

        recommendation.value = result
        isEnhancedAnalysis.value = true
      } else {
        // Fall back to basic analysis
        const result = await claudeAnalysisService.analyzeHero(hero)
        recommendation.value = result
        isEnhancedAnalysis.value = false
      }

      analyzedHeroId.value = hero.heroId

      // Cache the result
      cache.value.set(hero.heroId, recommendation.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Analysis failed'
      recommendation.value = null
      isEnhancedAnalysis.value = false
    } finally {
      isAnalyzing.value = false
    }
  }

  function clearRecommendation(): void {
    recommendation.value = null
    analyzedHeroId.value = null
    error.value = null
  }

  function clearCache(): void {
    cache.value.clear()
    clearRecommendation()
  }

  function invalidateHeroCache(id: number): void {
    cache.value.delete(id)
    if (analyzedHeroId.value === id) {
      clearRecommendation()
    }
  }

  return {
    // State
    recommendation,
    isAnalyzing,
    error,
    analyzedHeroId,
    isEnhancedAnalysis,

    // Getters
    hasRecommendation,
    hasEnhancedRecommendation,
    hasActiveSkills,
    hasPassiveSkills,
    hasGearRecommendations,
    hasGemRecommendations,

    // Actions
    generateBuildSuggestion,
    clearRecommendation,
    clearCache,
    invalidateHeroCache
  }
})
