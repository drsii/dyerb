/**
 * @file stores/analysis.ts
 * @description Analysis store for gear evaluation and upgrade suggestions
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { analysisEngine, type GearAnalysis, type Suggestion } from '@/services/analysisEngine'
import type { Hero } from '@/types/hero'

export const useAnalysisStore = defineStore('analysis', () => {
  // State
  const currentAnalysis = ref<GearAnalysis | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const overallScore = computed(() => currentAnalysis.value?.overallScore ?? 0)

  const suggestions = computed(() => currentAnalysis.value?.suggestions ?? [])

  const highPrioritySuggestions = computed(() =>
    suggestions.value.filter(s => s.priority === 'high')
  )

  const activeSets = computed(() => currentAnalysis.value?.setAnalysis ?? [])

  // Actions
  function analyzeHero(hero: Hero): void {
    isLoading.value = true
    error.value = null

    try {
      currentAnalysis.value = analysisEngine.analyzeHero(hero)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Analysis failed'
      console.error('Analysis failed:', e)
    } finally {
      isLoading.value = false
    }
  }

  function clearAnalysis(): void {
    currentAnalysis.value = null
    error.value = null
  }

  function getSuggestionsByType(type: Suggestion['type']): Suggestion[] {
    return suggestions.value.filter(s => s.type === type)
  }

  function getSlotAnalysis(slotKey: string) {
    return currentAnalysis.value?.slotAnalysis[slotKey] ?? null
  }

  return {
    // State
    currentAnalysis,
    isLoading,
    error,

    // Getters
    overallScore,
    suggestions,
    highPrioritySuggestions,
    activeSets,

    // Actions
    analyzeHero,
    clearAnalysis,
    getSuggestionsByType,
    getSlotAnalysis
  }
})
