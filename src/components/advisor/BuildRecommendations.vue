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

import type { BuildRecommendation } from '@/services/claudeAnalysis'
import SkillRecommendations from './SkillRecommendations.vue'
import GearRecommendations from './GearRecommendations.vue'
import StatProjections from './StatProjections.vue'

interface HeroStats {
  damage?: number
  toughness?: number
  recovery?: number
  life?: number
}

const props = defineProps<{
  recommendation: BuildRecommendation
  currentStats?: HeroStats
}>()

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
        />
      </div>
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
</style>
