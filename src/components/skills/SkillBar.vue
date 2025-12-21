<script setup lang="ts">
/**
 * @file SkillBar.vue
 * @description Active and passive skill display bar
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type { Skill } from '@/types'

defineProps<{
  activeSkills: Skill[]
  passiveSkills: Skill[]
}>()
</script>

<template>
  <div class="skill-bar">
    <div class="skill-section">
      <h4>Active Skills</h4>
      <div class="skills-grid">
        <div
          v-for="(skill, index) in activeSkills"
          :key="index"
          class="skill-item"
          :title="skill.description"
        >
          <div class="skill-name">{{ skill.name }}</div>
          <div v-if="skill.rune" class="skill-rune">{{ skill.rune }}</div>
        </div>
        <div
          v-for="n in Math.max(0, 6 - activeSkills.length)"
          :key="'empty-' + n"
          class="skill-item empty"
        >
          <div class="skill-name">—</div>
        </div>
      </div>
    </div>

    <div class="skill-section">
      <h4>Passive Skills</h4>
      <div class="skills-grid passives">
        <div
          v-for="(skill, index) in passiveSkills"
          :key="index"
          class="skill-item passive"
          :title="skill.description"
        >
          <div class="skill-name">{{ skill.name }}</div>
        </div>
        <div
          v-for="n in Math.max(0, 4 - passiveSkills.length)"
          :key="'empty-passive-' + n"
          class="skill-item empty passive"
        >
          <div class="skill-name">—</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-bar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skill-section h4 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.skills-grid.passives {
  grid-template-columns: repeat(2, 1fr);
}

.skill-item {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.625rem;
  cursor: help;
  transition: all 0.2s;
}

.skill-item:hover:not(.empty) {
  border-color: var(--accent-gold);
  background: var(--bg-hover);
}

.skill-item.empty {
  opacity: 0.4;
  border-style: dashed;
  cursor: default;
}

.skill-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-rune {
  font-size: 0.625rem;
  color: var(--accent-gold);
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 480px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
