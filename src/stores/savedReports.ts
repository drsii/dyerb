/**
 * @file stores/savedReports.ts
 * @description Saved reports store for persisting build recommendations
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BuildRecommendation } from '@/services/claudeAnalysis'

export interface SavedReport {
  id: string
  heroId: number
  heroName: string
  heroClass: string
  paragonLevel: number
  recommendation: BuildRecommendation
  savedAt: number
}

const STORAGE_KEY = 'd3-saved-reports'

export const useSavedReportsStore = defineStore('savedReports', () => {
  // State
  const reports = ref<SavedReport[]>([])

  // Load from localStorage on init
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        reports.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load saved reports:', e)
      reports.value = []
    }
  }

  // Save to localStorage
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.value))
    } catch (e) {
      console.error('Failed to save reports:', e)
    }
  }

  // Initialize
  loadFromStorage()

  // Getters
  const reportCount = computed(() => reports.value.length)

  const sortedReports = computed(() =>
    [...reports.value].sort((a, b) => b.savedAt - a.savedAt)
  )

  function getReportsForHero(heroId: number): SavedReport[] {
    return reports.value
      .filter(r => r.heroId === heroId)
      .sort((a, b) => b.savedAt - a.savedAt)
  }

  // Actions
  function saveReport(
    heroId: number,
    heroName: string,
    heroClass: string,
    paragonLevel: number,
    recommendation: BuildRecommendation
  ): SavedReport {
    const report: SavedReport = {
      id: `${heroId}-${Date.now()}`,
      heroId,
      heroName,
      heroClass,
      paragonLevel,
      recommendation,
      savedAt: Date.now()
    }

    reports.value.push(report)
    saveToStorage()

    return report
  }

  function deleteReport(id: string): void {
    const index = reports.value.findIndex(r => r.id === id)
    if (index !== -1) {
      reports.value.splice(index, 1)
      saveToStorage()
    }
  }

  function getReport(id: string): SavedReport | undefined {
    return reports.value.find(r => r.id === id)
  }

  function clearAllReports(): void {
    reports.value = []
    saveToStorage()
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return {
    // State
    reports,

    // Getters
    reportCount,
    sortedReports,
    getReportsForHero,

    // Actions
    saveReport,
    deleteReport,
    getReport,
    clearAllReports,
    formatDate
  }
})
