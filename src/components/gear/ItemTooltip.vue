<script setup lang="ts">
/**
 * @file ItemTooltip.vue
 * @description Item detail tooltip with stats and attributes
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type { Item } from '@/types'

defineProps<{
  item: Item
  visible: boolean
}>()

defineEmits<{
  close: []
}>()

function getQualityClass(quality: string): string {
  return `quality-${quality}`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="tooltip-overlay" @click.self="$emit('close')">
        <div class="tooltip-container">
          <button class="close-btn" @click="$emit('close')">&times;</button>

          <div class="tooltip-header">
            <h3 :class="getQualityClass(item.quality)">{{ item.name }}</h3>
            <div class="item-meta">
              <span class="item-type">{{ item.itemType }}</span>
              <span class="item-quality">{{ item.quality }}</span>
            </div>
            <div v-if="item.setName" class="item-set quality-set">
              {{ item.setName }}
            </div>
          </div>

          <div class="tooltip-body">
            <!-- Stats -->
            <div v-if="item.armor || item.dps" class="stat-block">
              <div v-if="item.armor" class="stat-line primary">
                <span class="stat-value">{{ item.armor.toLocaleString() }}</span>
                <span class="stat-label">Armor</span>
              </div>
              <div v-if="item.dps" class="stat-line primary">
                <span class="stat-value">{{ item.dps.toLocaleString() }}</span>
                <span class="stat-label">DPS</span>
              </div>
              <div v-if="item.attacksPerSecond" class="stat-line secondary">
                <span class="stat-value">{{ item.attacksPerSecond.toFixed(2) }}</span>
                <span class="stat-label">Attacks per Second</span>
              </div>
            </div>

            <!-- Primary Stats -->
            <div v-if="item.primaryStats.length" class="stat-block">
              <h4>Primary Stats</h4>
              <ul class="stat-list primary">
                <li v-for="(stat, index) in item.primaryStats" :key="index">
                  {{ stat }}
                </li>
              </ul>
            </div>

            <!-- Secondary Stats -->
            <div v-if="item.secondaryStats.length" class="stat-block">
              <h4>Secondary Stats</h4>
              <ul class="stat-list secondary">
                <li v-for="(stat, index) in item.secondaryStats" :key="index">
                  {{ stat }}
                </li>
              </ul>
            </div>

            <!-- Legendary Power -->
            <div v-if="item.legendaryPower" class="stat-block legendary-power">
              <h4>Legendary Power</h4>
              <p class="power-text">{{ item.legendaryPower }}</p>
            </div>

            <!-- Gems -->
            <div v-if="item.gems.length" class="stat-block">
              <h4>Socketed Gems</h4>
              <div class="gems-list">
                <div v-for="(gem, index) in item.gems" :key="index" class="gem-item">
                  <div class="gem-name" :class="{ legendary: gem.isLegendary }">
                    {{ gem.name }}
                    <span v-if="gem.rank !== undefined" class="gem-rank">
                      (Rank {{ gem.rank }})
                    </span>
                  </div>
                  <ul v-if="gem.attributes.length" class="gem-attrs">
                    <li v-for="(attr, attrIndex) in gem.attributes" :key="attrIndex">
                      {{ attr }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Transmog -->
            <div v-if="item.transmog" class="transmog-info">
              <em>Transmog: {{ item.transmog }}</em>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tooltip-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.tooltip-container {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tooltip-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.tooltip-header h3 {
  font-size: 1.125rem;
  margin: 0 0 0.5rem;
  padding-right: 2rem;
}

.item-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.item-set {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.tooltip-body {
  padding: 1rem 1.25rem;
}

.stat-block {
  margin-bottom: 1rem;
}

.stat-block:last-child {
  margin-bottom: 0;
}

.stat-block h4 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.stat-line {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-line.secondary .stat-value {
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.stat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stat-list li {
  font-size: 0.875rem;
  padding: 0.25rem 0;
  padding-left: 1rem;
  position: relative;
}

.stat-list li::before {
  content: '•';
  position: absolute;
  left: 0;
}

.stat-list.primary li {
  color: var(--accent-blue);
}

.stat-list.secondary li {
  color: var(--text-secondary);
}

.legendary-power {
  background: rgba(255, 128, 0, 0.1);
  border: 1px solid var(--quality-legendary);
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
}

.legendary-power h4 {
  color: var(--quality-legendary);
}

.power-text {
  color: var(--quality-legendary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.gems-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gem-item {
  background: var(--bg-tertiary);
  padding: 0.75rem;
  border-radius: 6px;
}

.gem-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.gem-name.legendary {
  color: #bf94ff;
}

.gem-rank {
  color: var(--text-secondary);
  font-weight: 400;
}

.gem-attrs {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}

.gem-attrs li {
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 0.125rem 0;
}

.transmog-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
