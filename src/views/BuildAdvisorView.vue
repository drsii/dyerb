<script setup lang="ts">
/**
 * @file BuildAdvisorView.vue
 * @description AI-powered build advisor with Claude recommendations
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHeroStore } from '@/stores/hero'
import { useSettingsStore } from '@/stores/settings'
import { useClaudeAnalysisStore } from '@/stores/claudeAnalysis'
import { useSavedReportsStore, type SavedReport } from '@/stores/savedReports'
import BuildRecommendations from '@/components/advisor/BuildRecommendations.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const heroStore = useHeroStore()
const settings = useSettingsStore()
const claudeStore = useClaudeAnalysisStore()
const savedReportsStore = useSavedReportsStore()

const hasHero = computed(() => heroStore.currentHero !== null)
const hasClaudeKey = computed(() => settings.isClaudeConfigured)
const showSavedReports = ref(false)
const saveMessage = ref('')

// Get saved reports for current hero
const heroSavedReports = computed(() => {
  if (!heroStore.currentHero) return []
  return savedReportsStore.getReportsForHero(heroStore.currentHero.heroId)
})

// Currently viewing a saved report (null = live recommendation)
const viewingReport = ref<SavedReport | null>(null)

// What to display - either saved report or live recommendation
const displayedRecommendation = computed(() => {
  if (viewingReport.value) {
    return viewingReport.value.recommendation
  }
  return claudeStore.recommendation
})

const isViewingSaved = computed(() => viewingReport.value !== null)

async function handleAnalyze() {
  if (!heroStore.currentHero) return
  // Clear any saved report being viewed
  viewingReport.value = null
  // Force refresh if we already have a recommendation (re-analyze)
  const forceRefresh = claudeStore.hasRecommendation
  await claudeStore.generateBuildSuggestion(heroStore.currentHero, forceRefresh)
}

function handleSaveReport() {
  if (!heroStore.currentHero || !claudeStore.recommendation) return

  savedReportsStore.saveReport(
    heroStore.currentHero.heroId,
    heroStore.currentHero.name,
    heroStore.currentHero.heroClass,
    heroStore.currentHero.paragonLevel,
    claudeStore.recommendation
  )

  saveMessage.value = 'Report saved!'
  setTimeout(() => {
    saveMessage.value = ''
  }, 2000)
}

function handleLoadReport(report: SavedReport) {
  viewingReport.value = report
  showSavedReports.value = false
}

function handleDeleteReport(id: string) {
  if (confirm('Delete this saved report?')) {
    savedReportsStore.deleteReport(id)
    if (viewingReport.value?.id === id) {
      viewingReport.value = null
    }
  }
}

function handleBackToLive() {
  viewingReport.value = null
}

function goToDashboard() {
  router.push('/heroes')
}

function goToSettings() {
  router.push('/settings')
}
</script>

<template>
  <div class="build-advisor-view">
    <div class="advisor-header">
      <div class="header-content">
        <h1>AI Build Advisor</h1>
        <p class="header-description">
          Get AI-powered build recommendations for your hero
        </p>
      </div>
    </div>

    <!-- No Claude API Key -->
    <div v-if="!hasClaudeKey" class="empty-state">
      <div class="empty-icon">🔑</div>
      <h2>Claude API Key Required</h2>
      <p>Add your Claude API key in Settings to enable AI build recommendations.</p>
      <button class="btn btn-primary" @click="goToSettings">
        Go to Settings
      </button>
    </div>

    <!-- No Hero Loaded -->
    <div v-else-if="!hasHero" class="empty-state">
      <div class="empty-icon">⚔️</div>
      <h2>No Hero Loaded</h2>
      <p>Load a hero from the Dashboard first to get build recommendations.</p>
      <button class="btn btn-primary" @click="goToDashboard">
        Select a Hero
      </button>
    </div>

    <!-- Hero Loaded -->
    <template v-else>
      <!-- Hero Info Bar -->
      <div class="hero-bar">
        <div class="hero-info">
          <span class="hero-name">{{ heroStore.currentHero!.name }}</span>
          <span class="hero-details">
            Level {{ heroStore.currentHero!.level }}
            {{ heroStore.currentHero!.heroClass }}
            <span v-if="heroStore.currentHero!.paragonLevel" class="paragon">
              (P{{ heroStore.currentHero!.paragonLevel }})
            </span>
          </span>
        </div>
        <div class="hero-bar-actions">
          <button
            v-if="heroSavedReports.length > 0"
            class="btn btn-secondary"
            @click="showSavedReports = !showSavedReports"
          >
            📁 Saved ({{ heroSavedReports.length }})
          </button>
          <button
            class="btn btn-primary"
            :disabled="claudeStore.isAnalyzing"
            @click="handleAnalyze"
          >
            <span v-if="claudeStore.isAnalyzing">Analyzing...</span>
            <span v-else-if="claudeStore.hasRecommendation">Re-analyze Build</span>
            <span v-else>Analyze My Build</span>
          </button>
        </div>
      </div>

      <!-- Saved Reports Panel -->
      <div v-if="showSavedReports" class="saved-reports-panel">
        <div class="saved-reports-header">
          <h3>Saved Reports</h3>
          <button class="btn-close" @click="showSavedReports = false">&times;</button>
        </div>
        <div class="saved-reports-list">
          <div
            v-for="report in heroSavedReports"
            :key="report.id"
            class="saved-report-item"
            :class="{ active: viewingReport?.id === report.id }"
          >
            <div class="report-info" @click="handleLoadReport(report)">
              <span class="report-date">{{ savedReportsStore.formatDate(report.savedAt) }}</span>
              <span class="report-summary">P{{ report.paragonLevel }} {{ report.heroClass }}</span>
            </div>
            <button class="btn-delete" @click="handleDeleteReport(report.id)" title="Delete">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Viewing Saved Report Banner -->
      <div v-if="isViewingSaved" class="viewing-saved-banner">
        <span>Viewing saved report from {{ savedReportsStore.formatDate(viewingReport!.savedAt) }}</span>
        <button class="btn btn-secondary btn-sm" @click="handleBackToLive">
          Back to Current
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="claudeStore.isAnalyzing" class="loading-state">
        <LoadingSpinner message="Claude is analyzing your build..." />
        <p class="loading-subtitle">This may take a few seconds</p>
      </div>

      <!-- Error State -->
      <div v-else-if="claudeStore.error && !isViewingSaved" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Analysis Failed</h2>
        <p>{{ claudeStore.error }}</p>
        <button class="btn btn-primary" @click="handleAnalyze">
          Try Again
        </button>
      </div>

      <!-- Recommendations (live or saved) -->
      <div v-else-if="displayedRecommendation" class="recommendations-container">
        <!-- Save Button (only for live recommendations) -->
        <div v-if="!isViewingSaved && claudeStore.hasRecommendation" class="save-bar">
          <button class="btn btn-save" @click="handleSaveReport">
            💾 Save This Report
          </button>
          <span v-if="saveMessage" class="save-message">{{ saveMessage }}</span>
        </div>
        <BuildRecommendations
          :recommendation="displayedRecommendation"
          :current-stats="{
            damage: heroStore.currentHero?.damage,
            toughness: heroStore.currentHero?.toughness,
            recovery: heroStore.currentHero?.recovery,
            life: heroStore.currentHero?.life
          }"
        />
      </div>

      <!-- Initial State -->
      <div v-else class="initial-state">
        <div class="initial-icon">🤖</div>
        <h2>Ready to Analyze</h2>
        <p>
          Click "Analyze My Build" to get AI-powered recommendations for skills,
          gear, sets, and legendary gems based on your current hero setup.
        </p>
        <p v-if="heroSavedReports.length > 0" class="saved-hint">
          Or view one of your {{ heroSavedReports.length }} saved report(s).
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.build-advisor-view {
  max-width: 1200px;
  margin: 0 auto;
}

.advisor-header {
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.header-description {
  color: var(--text-secondary);
}

/* Hero Bar */
.hero-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.hero-bar-actions {
  display: flex;
  gap: 0.5rem;
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hero-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.hero-details {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.paragon {
  color: var(--accent-blue);
}

/* States */
.empty-state,
.loading-state,
.error-state,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.empty-icon,
.error-icon,
.initial-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h2,
.error-state h2,
.initial-state h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state p,
.error-state p,
.initial-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.loading-state {
  padding: 6rem 2rem;
}

.loading-subtitle {
  margin-top: 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.error-state h2 {
  color: var(--accent-red);
}

/* Saved Reports Panel */
.saved-reports-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.saved-reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.saved-reports-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-close:hover {
  color: var(--text-primary);
}

.saved-reports-list {
  max-height: 200px;
  overflow-y: auto;
}

.saved-report-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.15s;
}

.saved-report-item:last-child {
  border-bottom: none;
}

.saved-report-item:hover {
  background: var(--bg-hover);
}

.saved-report-item.active {
  background: var(--bg-tertiary);
  border-left: 3px solid var(--accent-gold);
}

.report-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.report-date {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.report-summary {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.btn-delete {
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.btn-delete:hover {
  opacity: 1;
}

/* Viewing Saved Banner */
.viewing-saved-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--accent-gold);
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--accent-gold);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* Save Bar */
.save-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn-save {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-save:hover {
  background: var(--bg-hover);
  border-color: var(--accent-gold);
}

.save-message {
  font-size: 0.875rem;
  color: var(--accent-green);
}

.saved-hint {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

/* Recommendations */
.recommendations-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .hero-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    text-align: center;
  }

  .hero-bar-actions {
    flex-direction: column;
  }

  .hero-bar .btn {
    width: 100%;
  }

  .viewing-saved-banner {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  .save-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
