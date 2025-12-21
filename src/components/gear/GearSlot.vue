<script setup lang="ts">
/**
 * @file GearSlot.vue
 * @description Individual gear slot with item icon and quality border
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type { Item } from '@/types'

const props = defineProps<{
  slotName: string
  slotKey: string
  item?: Item
}>()

defineEmits<{
  click: [slotKey: string]
}>()

function getQualityClass(quality?: string): string {
  if (!quality) return ''
  return `quality-${quality}`
}
</script>

<template>
  <div
    class="gear-slot"
    :class="{ empty: !item, [getQualityClass(item?.quality)]: !!item }"
    @click="$emit('click', slotKey)"
    role="button"
    tabindex="0"
  >
    <div class="slot-header">
      <span class="slot-name">{{ slotName }}</span>
    </div>

    <div v-if="item" class="item-content">
      <div class="item-name" :class="getQualityClass(item.quality)">
        {{ item.name }}
      </div>
      <div class="item-type">{{ item.itemType }}</div>

      <div v-if="item.setName" class="item-set">
        {{ item.setName }}
      </div>

      <div class="item-stats">
        <span v-if="item.armor" class="stat">
          {{ item.armor.toLocaleString() }} Armor
        </span>
        <span v-if="item.dps" class="stat">
          {{ item.dps.toLocaleString() }} DPS
        </span>
      </div>

      <div v-if="item.gems.length > 0" class="item-gems">
        <span
          v-for="(gem, index) in item.gems"
          :key="index"
          class="gem-badge"
          :class="{ legendary: gem.isLegendary }"
          :title="gem.name"
        >
          <template v-if="gem.isLegendary">
            💎 {{ gem.rank }}
          </template>
          <template v-else>
            💠
          </template>
        </span>
      </div>
    </div>

    <div v-else class="empty-content">
      <span class="empty-icon">—</span>
      <span class="empty-text">Empty</span>
    </div>
  </div>
</template>

<style scoped>
.gear-slot {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 100px;
}

.gear-slot:hover {
  border-color: var(--accent-gold);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.gear-slot:focus {
  outline: 2px solid var(--accent-gold);
  outline-offset: 2px;
}

.gear-slot.empty {
  border-style: dashed;
  opacity: 0.6;
}

.gear-slot.empty:hover {
  opacity: 1;
}

/* Quality border highlights */
.gear-slot.quality-legendary {
  border-color: var(--quality-legendary);
  border-left-width: 3px;
}

.gear-slot.quality-set {
  border-color: var(--quality-set);
  border-left-width: 3px;
}

.slot-header {
  margin-bottom: 0.5rem;
}

.slot-name {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
}

.item-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.item-set {
  font-size: 0.75rem;
  color: var(--quality-set);
  font-style: italic;
}

.item-stats {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.stat {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.item-gems {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.375rem;
}

.gem-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.gem-badge.legendary {
  background: rgba(128, 0, 255, 0.2);
  color: #bf94ff;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 1rem 0;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 1.25rem;
}

.empty-text {
  font-size: 0.75rem;
}
</style>
