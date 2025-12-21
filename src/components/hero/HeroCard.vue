<script setup lang="ts">
/**
 * @file HeroCard.vue
 * @description Hero selection card with class icon and level info
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type { HeroSummary } from '@/types'

defineProps<{
  hero: HeroSummary
}>()

defineEmits<{
  select: [heroId: number]
}>()

function formatDate(timestamp?: number): string {
  if (!timestamp) return 'Never'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString()
}
</script>

<template>
  <div
    class="hero-card"
    :class="{ dead: hero.dead }"
    @click="$emit('select', hero.heroId)"
    role="button"
    tabindex="0"
    @keydown.enter="$emit('select', hero.heroId)"
  >
    <div class="hero-portrait">
      <span class="class-icon">{{ getClassIcon(hero.heroClass) }}</span>
    </div>

    <div class="hero-info">
      <h3 class="hero-name">{{ hero.name }}</h3>
      <div class="hero-class">{{ hero.heroClass }}</div>
      <div class="hero-level">
        Level {{ hero.level }}
        <span v-if="hero.paragonLevel > 0" class="paragon">
          ({{ hero.paragonLevel }})
        </span>
      </div>
    </div>

    <div class="hero-badges">
      <span v-if="hero.seasonal" class="badge seasonal" title="Seasonal">S</span>
      <span v-if="hero.hardcore" class="badge hardcore" title="Hardcore">HC</span>
      <span v-if="hero.dead" class="badge dead" title="Dead">💀</span>
    </div>

    <div class="hero-meta">
      <span class="last-played">Last played: {{ formatDate(hero.lastUpdated) }}</span>
    </div>
  </div>
</template>

<script lang="ts">
function getClassIcon(heroClass: string): string {
  const icons: Record<string, string> = {
    Barbarian: '⚔️',
    Crusader: '🛡️',
    'Demon Hunter': '🏹',
    Monk: '☯️',
    Necromancer: '💀',
    'Witch Doctor': '🎭',
    Wizard: '✨'
  }
  return icons[heroClass] || '👤'
}
</script>

<style scoped>
.hero-card {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  grid-template-rows: auto auto;
  gap: 0.5rem 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hero-card:hover {
  border-color: var(--accent-gold);
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.hero-card:focus {
  outline: 2px solid var(--accent-gold);
  outline-offset: 2px;
}

.hero-card.dead {
  opacity: 0.6;
}

.hero-portrait {
  grid-row: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  font-size: 2rem;
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.hero-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.hero-class {
  font-size: 0.875rem;
  color: var(--accent-gold);
}

.hero-level {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.paragon {
  color: var(--accent-blue);
}

.hero-badges {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 0.375rem;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
}

.badge.seasonal {
  background: var(--accent-green);
  color: #000;
}

.badge.hardcore {
  background: var(--accent-red);
  color: #fff;
}

.badge.dead {
  background: var(--bg-tertiary);
  font-size: 0.875rem;
}

.hero-meta {
  grid-column: 2 / -1;
}

.last-played {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
