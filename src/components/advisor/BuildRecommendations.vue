<script setup lang="ts">
/**
 * @file BuildRecommendations.vue
 * @description Main build advisor display with skills, gear, and stats
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { ref, computed, watch } from 'vue'
import type { BuildRecommendation, EnhancedBuildRecommendation } from '@/services/claudeAnalysis'
import type { CurrentSetInfo } from './GearRecommendations.vue'
import { useSettingsStore } from '@/stores/settings'
import SkillRecommendations from './SkillRecommendations.vue'
import GearRecommendations from './GearRecommendations.vue'
import StatProjections from './StatProjections.vue'
import TieredUpgrades from './TieredUpgrades.vue'
import ProgressionPath from './ProgressionPath.vue'

interface HeroStats {
  damage?: number
  toughness?: number
  recovery?: number
  life?: number
}

interface HeroItems {
  [slot: string]: { name?: string; setName?: string }
}

interface HeroCubePowers {
  weapon?: string
  armor?: string
  jewelry?: string
}

const props = defineProps<{
  recommendation: BuildRecommendation | EnhancedBuildRecommendation
  currentStats?: HeroStats
  heroItems?: HeroItems
  heroCubePowers?: HeroCubePowers
}>()

const settings = useSettingsStore()

/** View mode for upgrade display */
const viewMode = ref<'categorized' | 'progression'>(settings.defaultViewMode)

/** Check if this is an enhanced recommendation with tiered upgrades */
const isEnhanced = computed(() => {
  return 'tieredUpgrades' in props.recommendation
})

/** Get enhanced recommendation (if available) */
const enhancedRec = computed(() => {
  if (isEnhanced.value) {
    return props.recommendation as EnhancedBuildRecommendation
  }
  return null
})

/** Check if tiered upgrades are available */
const hasTieredUpgrades = computed(() => {
  if (!enhancedRec.value) return false
  const upgrades = enhancedRec.value.tieredUpgrades
  return (upgrades.quick?.length || 0) +
    (upgrades.medium?.length || 0) +
    (upgrades.long?.length || 0) > 0
})

/** Check if progression path is available */
const hasProgressionPath = computed(() => {
  if (!enhancedRec.value) return false
  return enhancedRec.value.progressionPath.steps.length > 0
})

/** Save view mode preference when changed */
watch(viewMode, (newMode) => {
  settings.updateSettings({ defaultViewMode: newMode })
})

/**
 * Extract current equipped sets from hero items
 */
function getCurrentSets(): CurrentSetInfo[] {
  if (!props.heroItems) return []

  const setCounts = new Map<string, number>()

  for (const item of Object.values(props.heroItems)) {
    if (item.setName) {
      setCounts.set(item.setName, (setCounts.get(item.setName) || 0) + 1)
    }
  }

  return Array.from(setCounts.entries())
    .filter(([, count]) => count >= 2) // Only show sets with at least 2 pieces
    .map(([name, pieces]) => ({ name, pieces }))
    .sort((a, b) => b.pieces - a.pieces) // Sort by piece count descending
}

const hasWarnings = () => {
  return props.recommendation.validationWarnings &&
         props.recommendation.validationWarnings.length > 0
}
</script>

<template>
  <div class="build-recommendations">
    <!-- Validation Warnings -->
    <div v-if="hasWarnings()" class="validation-warnings">
      <div class="warning-header">
        <span class="warning-icon">⚠️</span>
        <span>AI Recommendation Issues Detected</span>
      </div>
      <ul class="warning-list">
        <li
          v-for="(warning, index) in recommendation.validationWarnings"
          :key="index"
          :class="['warning-item', `severity-${warning.severity}`]"
        >
          {{ warning.message }}
        </li>
      </ul>
    </div>

    <!-- Projected Improvements -->
    <StatProjections
      v-if="recommendation.projectedImprovements && currentStats"
      :projections="recommendation.projectedImprovements"
      :current-stats="currentStats"
    />

    <!-- Summary -->
    <div class="summary-section">
      <h3>Build Summary</h3>
      <p class="summary-text">{{ recommendation.summary }}</p>
    </div>

    <!-- Playstyle -->
    <div v-if="recommendation.playstyle" class="playstyle-section">
      <h3>How to Play</h3>
      <p class="playstyle-text">{{ recommendation.playstyle }}</p>
    </div>

    <!-- Two Column Layout -->
    <div class="recommendations-grid">
      <!-- Skills Column -->
      <div class="column">
        <h3>Recommended Skills</h3>
        <SkillRecommendations
          :active-skills="recommendation.skills.active"
          :passive-skills="recommendation.skills.passive"
        />
      </div>

      <!-- Gear Column -->
      <div class="column">
        <h3>Recommended Gear</h3>
        <GearRecommendations
          :sets="recommendation.gear.sets"
          :items="recommendation.gear.items"
          :cube-powers="recommendation.gear.cubePowers"
          :gems="recommendation.gems"
          :farming-priority="recommendation.farmingPriority"
          :current-sets="getCurrentSets()"
          :hero-items="heroItems"
          :hero-cube-powers="heroCubePowers"
        />
      </div>
    </div>

    <!-- Tiered Upgrades Section (Enhanced Only) -->
    <div v-if="isEnhanced && (hasTieredUpgrades || hasProgressionPath)" class="tiered-section">
      <div class="tiered-header">
        <h3>Upgrade Progression</h3>

        <!-- View Mode Toggle -->
        <div class="view-toggle">
          <button
            :class="{ active: viewMode === 'categorized' }"
            @click="viewMode = 'categorized'"
            :disabled="!hasTieredUpgrades"
          >
            By Time
          </button>
          <button
            :class="{ active: viewMode === 'progression' }"
            @click="viewMode = 'progression'"
            :disabled="!hasProgressionPath"
          >
            Step by Step
          </button>
        </div>
      </div>

      <!-- Meta Build Reference -->
      <div v-if="enhancedRec?.metaBuildReference" class="meta-reference">
        <span class="meta-label">Based on:</span>
        <a
          :href="enhancedRec.metaBuildReference.guideUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="meta-link"
        >
          {{ enhancedRec.metaBuildReference.buildName }}
          ({{ enhancedRec.metaBuildReference.tier }}-Tier)
        </a>
      </div>

      <!-- Tiered Upgrades View -->
      <TieredUpgrades
        v-if="viewMode === 'categorized' && enhancedRec"
        :upgrades="enhancedRec.tieredUpgrades"
      />

      <!-- Progression Path View -->
      <ProgressionPath
        v-else-if="viewMode === 'progression' && enhancedRec"
        :path="enhancedRec.progressionPath"
      />
    </div>
  </div>
</template>

<style scoped>
.build-recommendations {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Validation Warnings */
.validation-warnings {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem 1.25rem;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 0.75rem;
}

.warning-icon {
  font-size: 1.125rem;
}

.warning-list {
  margin: 0;
  padding-left: 1.25rem;
}

.warning-item {
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.warning-item:last-child {
  margin-bottom: 0;
}

.warning-item.severity-error {
  color: #ef4444;
}

.warning-item.severity-warning {
  color: #f59e0b;
}

.summary-section,
.playstyle-section {
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.summary-section h3,
.playstyle-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent-gold);
  margin-bottom: 0.75rem;
}

.summary-text,
.playstyle-text {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.column {
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.column h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--accent-gold);
}

@media (max-width: 900px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
}

/* Tiered Upgrades Section */
.tiered-section {
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.tiered-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--accent-gold);
}

.tiered-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-surface);
  padding: 0.25rem;
  border-radius: 6px;
}

.view-toggle button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.view-toggle button:hover:not(:disabled) {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.view-toggle button.active {
  background: var(--accent-gold);
  color: black;
}

.view-toggle button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.meta-reference {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(var(--accent-gold-rgb, 212, 175, 55), 0.1);
  border-radius: 6px;
}

.meta-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.meta-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--accent-gold);
  text-decoration: none;
}

.meta-link:hover {
  text-decoration: underline;
}
</style>
