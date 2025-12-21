<script setup lang="ts">
/**
 * @file GearRecommendations.vue
 * @description Gear, set, cube power, and gem recommendations display
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type {
  SetRecommendation,
  ItemRecommendation,
  CubePowerRecommendation,
  GemRecommendation
} from '@/services/claudeAnalysis'

defineProps<{
  sets: SetRecommendation[]
  items: ItemRecommendation[]
  cubePowers: CubePowerRecommendation
  gems: GemRecommendation[]
  farmingPriority: string[]
}>()

function formatSlot(slot: string): string {
  const slotNames: Record<string, string> = {
    mainHand: 'Main Hand',
    offHand: 'Off-Hand',
    head: 'Head',
    shoulders: 'Shoulders',
    neck: 'Neck',
    torso: 'Chest',
    hands: 'Hands',
    waist: 'Waist',
    wrists: 'Bracers',
    legs: 'Legs',
    feet: 'Feet',
    leftFinger: 'Ring',
    rightFinger: 'Ring'
  }
  return slotNames[slot] || slot
}
</script>

<template>
  <div class="gear-recommendations">
    <!-- Set Recommendations -->
    <div v-if="sets.length > 0" class="gear-section">
      <h4>Recommended Sets</h4>
      <div class="set-list">
        <div v-for="(set, index) in sets" :key="index" class="set-item">
          <div class="set-header">
            <span class="set-name quality-set">{{ set.name }}</span>
            <span class="set-pieces">{{ set.pieces }} pieces</span>
          </div>
          <p class="set-reason">{{ set.reason }}</p>
        </div>
      </div>
    </div>

    <!-- Item Recommendations -->
    <div v-if="items.length > 0" class="gear-section">
      <h4>Key Items</h4>
      <div class="item-list">
        <div v-for="(item, index) in items" :key="index" class="item-rec">
          <div class="item-header">
            <span class="item-slot">{{ formatSlot(item.slot) }}</span>
            <span class="item-name quality-legendary">{{ item.item }}</span>
          </div>
          <p class="item-reason">{{ item.reason }}</p>
        </div>
      </div>
    </div>

    <!-- Kanai's Cube -->
    <div v-if="cubePowers.weapon?.name || cubePowers.armor?.name || cubePowers.jewelry?.name" class="gear-section">
      <h4>Kanai's Cube Powers</h4>
      <div class="cube-powers">
        <div v-if="cubePowers.weapon?.name" class="cube-power-item">
          <div class="cube-header">
            <span class="cube-label">Weapon</span>
            <span class="cube-item quality-legendary">{{ cubePowers.weapon.name }}</span>
          </div>
          <p v-if="cubePowers.weapon.reason" class="cube-reason">{{ cubePowers.weapon.reason }}</p>
        </div>
        <div v-if="cubePowers.armor?.name" class="cube-power-item">
          <div class="cube-header">
            <span class="cube-label">Armor</span>
            <span class="cube-item quality-legendary">{{ cubePowers.armor.name }}</span>
          </div>
          <p v-if="cubePowers.armor.reason" class="cube-reason">{{ cubePowers.armor.reason }}</p>
        </div>
        <div v-if="cubePowers.jewelry?.name" class="cube-power-item">
          <div class="cube-header">
            <span class="cube-label">Jewelry</span>
            <span class="cube-item quality-legendary">{{ cubePowers.jewelry.name }}</span>
          </div>
          <p v-if="cubePowers.jewelry.reason" class="cube-reason">{{ cubePowers.jewelry.reason }}</p>
        </div>
      </div>
    </div>

    <!-- Legendary Gems -->
    <div v-if="gems.length > 0" class="gear-section">
      <h4>Legendary Gems</h4>
      <div class="gem-list">
        <div v-for="(gem, index) in gems" :key="index" class="gem-rec">
          <div class="gem-header">
            <span class="gem-priority">#{{ gem.priority }}</span>
            <span class="gem-name">{{ gem.name }}</span>
          </div>
          <p class="gem-reason">{{ gem.reason }}</p>
        </div>
      </div>
    </div>

    <!-- Farming Priority -->
    <div v-if="farmingPriority.length > 0" class="gear-section">
      <h4>Farming Priority</h4>
      <ol class="farming-list">
        <li v-for="(item, index) in farmingPriority" :key="index">
          {{ item }}
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.gear-recommendations {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.gear-section h4 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-gold);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

/* Sets */
.set-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.set-item {
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border-left: 3px solid var(--quality-set);
}

.set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.set-name {
  font-weight: 600;
}

.set-pieces {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.set-reason,
.item-reason,
.gem-reason {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Items */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-rec {
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.item-slot {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  min-width: 70px;
}

.item-name {
  font-weight: 600;
}

/* Cube */
.cube-powers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cube-power-item {
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border-left: 3px solid var(--accent-gold);
}

.cube-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.cube-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  min-width: 60px;
}

.cube-item {
  font-weight: 600;
}

.cube-reason {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Gems */
.gem-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gem-rec {
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border-left: 3px solid #bf94ff;
}

.gem-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.gem-priority {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--accent-gold);
}

.gem-name {
  font-weight: 600;
  color: #bf94ff;
}

/* Farming */
.farming-list {
  margin: 0;
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.farming-list li {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.farming-list li::marker {
  color: var(--accent-gold);
}
</style>
