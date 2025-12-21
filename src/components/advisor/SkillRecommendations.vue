<script setup lang="ts">
/**
 * @file SkillRecommendations.vue
 * @description Active and passive skill recommendations display
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type { SkillRecommendation, PassiveRecommendation } from '@/services/claudeAnalysis'

defineProps<{
  activeSkills: SkillRecommendation[]
  passiveSkills: PassiveRecommendation[]
}>()
</script>

<template>
  <div class="skill-recommendations">
    <!-- Active Skills -->
    <div v-if="activeSkills.length > 0" class="skill-section">
      <h4>Active Skills</h4>
      <div class="skill-list">
        <div v-for="(skill, index) in activeSkills" :key="index" class="skill-item">
          <div class="skill-header">
            <span class="skill-name">{{ skill.skill }}</span>
            <span v-if="skill.rune" class="skill-rune">{{ skill.rune }}</span>
          </div>
          <p class="skill-reason">{{ skill.reason }}</p>
        </div>
      </div>
    </div>

    <!-- Passive Skills -->
    <div v-if="passiveSkills.length > 0" class="skill-section">
      <h4>Passive Skills</h4>
      <div class="skill-list passive">
        <div v-for="(skill, index) in passiveSkills" :key="index" class="skill-item">
          <div class="skill-header">
            <span class="skill-name">{{ skill.skill }}</span>
          </div>
          <p class="skill-reason">{{ skill.reason }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-recommendations {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skill-section h4 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-gold);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skill-item {
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border-left: 3px solid var(--accent-blue);
}

.skill-list.passive .skill-item {
  border-left-color: var(--accent-purple);
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.skill-name {
  font-weight: 600;
  color: var(--text-primary);
}

.skill-rune {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: var(--bg-hover);
  border-radius: 4px;
  color: var(--accent-blue);
}

.skill-reason {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}
</style>
