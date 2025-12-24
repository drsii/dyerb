<script setup lang="ts">
/**
 * @file StatProjections.vue
 * @description Stat improvement projections and ratings display
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type { ProjectedImprovements, StatRating, StatProjection } from '@/services/claudeAnalysis'

interface HeroStats {
  damage?: number
  toughness?: number
  recovery?: number
  life?: number
}

const props = defineProps<{
  projections: ProjectedImprovements
  currentStats: HeroStats
}>()

function formatNumber(num?: number | null): string {
  if (num === null || num === undefined) return '—'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K'
  return num.toLocaleString()
}

function getRatingClass(rating: StatRating): string {
  return `rating-${rating}`
}

function getRatingLabel(rating: StatRating): string {
  const labels: Record<StatRating, string> = {
    minor: 'Minor',
    moderate: 'Moderate',
    major: 'Major',
    transformative: 'Transformative'
  }
  return labels[rating]
}

function getGRRating(): StatRating {
  const current = props.projections.grTierPotential.current
  const projected = props.projections.grTierPotential.projected

  // Extract numbers from GR strings (e.g., "GR 70-80" -> 75)
  const extractAvg = (str: string): number => {
    const matches = str.match(/\d+/g)
    if (!matches) return 0
    const nums = matches.map(Number)
    return nums.reduce((a, b) => a + b, 0) / nums.length
  }

  const currentAvg = extractAvg(current)
  const projectedAvg = extractAvg(projected)
  const diff = projectedAvg - currentAvg

  if (diff >= 30) return 'transformative'
  if (diff >= 20) return 'major'
  if (diff >= 10) return 'moderate'
  return 'minor'
}

/**
 * Check if projected value seems reasonable given the multiplier
 */
function hasProjectedValue(projection: StatProjection): boolean {
  return projection.projectedValue !== undefined && projection.projectedValue > 0
}
</script>

<template>
  <div class="stat-projections">
    <h3 class="projections-title">Projected Improvements</h3>

    <div class="stats-grid">
      <!-- Damage -->
      <div class="stat-card">
        <div class="stat-label">Damage</div>
        <div class="stat-values">
          <span class="stat-current">{{ formatNumber(currentStats.damage) }}</span>
          <span class="stat-arrow">→</span>
          <span class="stat-projected" v-if="hasProjectedValue(projections.damage)">
            {{ formatNumber(projections.damage.projectedValue) }}
          </span>
          <span class="stat-multiplier">({{ projections.damage.estimatedMultiplier }})</span>
        </div>
        <div class="stat-rating" :class="getRatingClass(projections.damage.rating)">
          {{ getRatingLabel(projections.damage.rating) }}
        </div>
        <div v-if="projections.damage.justification" class="stat-justification">
          {{ projections.damage.justification }}
        </div>
        <div v-if="projections.damage.note" class="stat-note">{{ projections.damage.note }}</div>
      </div>

      <!-- Toughness -->
      <div class="stat-card">
        <div class="stat-label">Toughness</div>
        <div class="stat-values">
          <span class="stat-current">{{ formatNumber(currentStats.toughness) }}</span>
          <span class="stat-arrow">→</span>
          <span class="stat-projected" v-if="hasProjectedValue(projections.toughness)">
            {{ formatNumber(projections.toughness.projectedValue) }}
          </span>
          <span class="stat-multiplier">({{ projections.toughness.estimatedMultiplier }})</span>
        </div>
        <div class="stat-rating" :class="getRatingClass(projections.toughness.rating)">
          {{ getRatingLabel(projections.toughness.rating) }}
        </div>
        <div v-if="projections.toughness.justification" class="stat-justification">
          {{ projections.toughness.justification }}
        </div>
        <div v-if="projections.toughness.note" class="stat-note">{{ projections.toughness.note }}</div>
      </div>

      <!-- Recovery -->
      <div class="stat-card">
        <div class="stat-label">Recovery</div>
        <div class="stat-values">
          <span class="stat-current">{{ formatNumber(currentStats.recovery) }}</span>
          <span class="stat-arrow">→</span>
          <span class="stat-projected" v-if="hasProjectedValue(projections.recovery)">
            {{ formatNumber(projections.recovery.projectedValue) }}
          </span>
          <span class="stat-multiplier">({{ projections.recovery.estimatedMultiplier }})</span>
        </div>
        <div class="stat-rating" :class="getRatingClass(projections.recovery.rating)">
          {{ getRatingLabel(projections.recovery.rating) }}
        </div>
        <div v-if="projections.recovery.justification" class="stat-justification">
          {{ projections.recovery.justification }}
        </div>
        <div v-if="projections.recovery.note" class="stat-note">{{ projections.recovery.note }}</div>
      </div>

      <!-- Life -->
      <div class="stat-card">
        <div class="stat-label">Life</div>
        <div class="stat-values">
          <span class="stat-current">{{ formatNumber(currentStats.life) }}</span>
          <span class="stat-arrow">→</span>
          <span class="stat-projected" v-if="hasProjectedValue(projections.life)">
            {{ formatNumber(projections.life.projectedValue) }}
          </span>
          <span class="stat-multiplier">({{ projections.life.estimatedMultiplier }})</span>
        </div>
        <div class="stat-rating" :class="getRatingClass(projections.life.rating)">
          {{ getRatingLabel(projections.life.rating) }}
        </div>
        <div v-if="projections.life.justification" class="stat-justification">
          {{ projections.life.justification }}
        </div>
        <div v-if="projections.life.note" class="stat-note">{{ projections.life.note }}</div>
      </div>
    </div>

    <!-- GR Tier Potential -->
    <div class="gr-projection">
      <div class="gr-header">
        <span class="gr-label">Greater Rift Potential</span>
        <span class="gr-rating" :class="getRatingClass(getGRRating())">
          {{ getRatingLabel(getGRRating()) }} Upgrade
        </span>
      </div>
      <div class="gr-tiers">
        <span class="gr-current">{{ projections.grTierPotential.current }}</span>
        <span class="gr-arrow">→</span>
        <span class="gr-projected">{{ projections.grTierPotential.projected }}</span>
      </div>
      <div v-if="projections.grTierPotential.note" class="gr-note">
        {{ projections.grTierPotential.note }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-projections {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.projections-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent-gold);
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--bg-tertiary);
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.stat-values {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.stat-current {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.stat-arrow {
  font-size: 0.875rem;
  color: var(--accent-gold);
  line-height: 1;
}

.stat-projected {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--accent-green);
}

.stat-multiplier {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
}

.stat-justification {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-top: 0.25rem;
  text-align: center;
  max-width: 100%;
}

.stat-rating {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
}

.rating-minor {
  background: rgba(128, 128, 128, 0.2);
  color: var(--text-muted);
}

.rating-moderate {
  background: rgba(59, 130, 246, 0.2);
  color: var(--accent-blue);
}

.rating-major {
  background: rgba(212, 175, 55, 0.2);
  color: var(--accent-gold);
}

.rating-transformative {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.stat-note {
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.25rem;
}

/* GR Projection */
.gr-projection {
  background: var(--bg-tertiary);
  border-radius: 6px;
  padding: 1rem 1.25rem;
  border-left: 3px solid var(--accent-gold);
}

.gr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.gr-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.gr-rating {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.gr-tiers {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.gr-current {
  color: var(--text-secondary);
}

.gr-arrow {
  color: var(--accent-gold);
}

.gr-projected {
  color: var(--accent-gold);
}

.gr-note {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .gr-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
