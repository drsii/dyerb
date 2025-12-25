<script setup lang="ts">
/**
 * @file components/advisor/TieredUpgrades.vue
 * @description Display upgrade recommendations grouped by farming time investment
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { computed } from 'vue'
import type { TieredUpgrades, UpgradeStep, DifficultyTier, FarmingMethod } from '@/types/progression'
import { TIER_DISPLAY, FARMING_METHOD_INFO } from '@/types/progression'

const props = defineProps<{
  upgrades: TieredUpgrades
}>()

/**
 * Get display info for a farming method
 */
function getFarmingMethodLabel(method: FarmingMethod | string): string {
  const info = FARMING_METHOD_INFO[method as FarmingMethod]
  return info?.label || method
}

/**
 * Get CSS class for power increase badge
 */
function getPowerClass(power: UpgradeStep['powerIncrease']): string {
  const classes: Record<string, string> = {
    minor: 'power-minor',
    moderate: 'power-moderate',
    major: 'power-major',
    transformative: 'power-transformative'
  }
  return classes[power] || 'power-moderate'
}

/**
 * Format cost string for display
 */
function formatCost(step: UpgradeStep): string {
  const costs: string[] = []

  if (step.item.bloodShardCost) {
    costs.push(`${step.item.bloodShardCost} shards`)
  }
  if (step.item.deathsBreathCost) {
    costs.push(`${step.item.deathsBreathCost} DB`)
  }
  if (step.item.forgottenSoulCost) {
    costs.push(`${step.item.forgottenSoulCost} souls`)
  }
  if (step.item.bountyMaterialsRequired) {
    costs.push('bounty mats')
  }

  return costs.length > 0 ? costs.join(' + ') : ''
}

/**
 * Check if a tier has any upgrades
 */
function hasTier(tier: DifficultyTier): boolean {
  return props.upgrades[tier]?.length > 0
}

/**
 * Get total count of all upgrades
 */
const totalUpgrades = computed(() => {
  return (props.upgrades.quick?.length || 0) +
    (props.upgrades.medium?.length || 0) +
    (props.upgrades.long?.length || 0)
})
</script>

<template>
  <div class="tiered-upgrades">
    <div v-if="totalUpgrades === 0" class="no-upgrades">
      <p>No tiered upgrades available. Run the enhanced analysis to get time-based recommendations.</p>
    </div>

    <template v-else>
      <div
        v-for="(tier, key) in TIER_DISPLAY"
        :key="key"
        class="tier-section"
        :class="{ 'tier-empty': !hasTier(key as DifficultyTier) }"
      >
        <div class="tier-header">
          <span class="tier-icon">{{ tier.icon }}</span>
          <h4>{{ tier.label }}</h4>
          <span class="tier-time">{{ tier.time }}</span>
          <span v-if="hasTier(key as DifficultyTier)" class="tier-count">
            {{ upgrades[key as DifficultyTier].length }} items
          </span>
        </div>

        <div v-if="hasTier(key as DifficultyTier)" class="upgrade-list">
          <div
            v-for="step in upgrades[key as DifficultyTier]"
            :key="step.id"
            class="upgrade-item"
          >
            <div class="upgrade-header">
              <span class="upgrade-name">{{ step.item.itemName }}</span>
              <span class="power-badge" :class="getPowerClass(step.powerIncrease)">
                {{ step.powerIncrease }}
              </span>
            </div>

            <div class="upgrade-slot">{{ step.item.slot }}</div>

            <div class="upgrade-method">
              <span class="method-label">Best method:</span>
              <span class="method-primary">
                {{ getFarmingMethodLabel(step.item.primaryMethod) }}
              </span>
              <span v-if="formatCost(step)" class="cost">
                ({{ formatCost(step) }})
              </span>
            </div>

            <p class="upgrade-reason">{{ step.reason }}</p>

            <div v-if="step.item.notes" class="upgrade-notes">
              {{ step.item.notes }}
            </div>

            <div v-if="step.dependsOn?.length" class="dependencies">
              <span class="dep-label">Requires:</span>
              <span class="dep-list">{{ step.dependsOn.join(', ') }}</span>
            </div>

            <div v-if="step.unlocks?.length" class="unlocks">
              <span class="unlock-label">Unlocks:</span>
              <span class="unlock-list">{{ step.unlocks.join(', ') }}</span>
            </div>
          </div>
        </div>

        <div v-else class="tier-empty-message">
          No upgrades in this tier
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tiered-upgrades {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.no-upgrades {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border-radius: 8px;
}

.tier-section {
  background: var(--color-surface);
  border-radius: 8px;
  overflow: hidden;
}

.tier-section.tier-empty {
  opacity: 0.6;
}

.tier-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
}

.tier-icon {
  font-size: 1.25rem;
}

.tier-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.tier-time {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.tier-count {
  margin-left: auto;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--color-primary);
  color: white;
  border-radius: 4px;
}

.upgrade-list {
  padding: 0.5rem;
}

.upgrade-item {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.upgrade-item:last-child {
  border-bottom: none;
}

.upgrade-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.upgrade-name {
  font-weight: 600;
  color: var(--color-legendary);
}

.power-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 500;
}

.power-minor {
  background: var(--color-text-secondary);
  color: white;
}

.power-moderate {
  background: var(--color-info);
  color: white;
}

.power-major {
  background: var(--color-warning);
  color: black;
}

.power-transformative {
  background: var(--color-legendary);
  color: white;
}

.upgrade-slot {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.upgrade-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.method-label {
  color: var(--color-text-secondary);
}

.method-primary {
  font-weight: 500;
  color: var(--color-primary);
}

.cost {
  color: var(--color-text-secondary);
}

.upgrade-reason {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  margin: 0.5rem 0;
  line-height: 1.4;
}

.upgrade-notes {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-style: italic;
  margin-bottom: 0.5rem;
}

.dependencies,
.unlocks {
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.dep-label,
.unlock-label {
  color: var(--color-text-secondary);
  margin-right: 0.25rem;
}

.dep-list {
  color: var(--color-warning);
}

.unlock-list {
  color: var(--color-success);
}

.tier-empty-message {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
