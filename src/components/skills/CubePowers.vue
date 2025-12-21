<script setup lang="ts">
/**
 * @file CubePowers.vue
 * @description Kanai's Cube legendary power display
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type { CubePowers } from '@/types'

defineProps<{
  powers?: CubePowers
}>()
</script>

<template>
  <div class="cube-powers">
    <h4>Kanai's Cube</h4>

    <div class="powers-grid">
      <div class="power-slot" :class="{ empty: !powers?.weapon }">
        <div class="power-type">Weapon</div>
        <div class="power-name">{{ powers?.weapon || 'Empty' }}</div>
      </div>

      <div class="power-slot" :class="{ empty: !powers?.armor }">
        <div class="power-type">Armor</div>
        <div class="power-name">{{ powers?.armor || 'Empty' }}</div>
      </div>

      <div class="power-slot" :class="{ empty: !powers?.jewelry }">
        <div class="power-type">Jewelry</div>
        <div class="power-name">{{ powers?.jewelry || 'Empty' }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cube-powers h4 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.powers-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.power-slot {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.power-slot.empty {
  opacity: 0.5;
  border-style: dashed;
}

.power-type {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--accent-gold);
  min-width: 60px;
}

.power-name {
  font-size: 0.875rem;
  color: var(--text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.power-slot.empty .power-name {
  color: var(--text-muted);
  font-style: italic;
}
</style>
