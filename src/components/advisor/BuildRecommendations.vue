<script setup lang="ts">
/**
 * @file BuildRecommendations.vue
 * @description Main build advisor display with skills, gear, and stats
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
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

defineProps<{
  recommendation: BuildRecommendation
  currentStats?: HeroStats
}>()
</script>

<template>
  <div class="build-recommendations">
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
