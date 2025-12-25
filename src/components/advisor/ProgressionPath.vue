<script setup lang="ts">
/**
 * @file components/advisor/ProgressionPath.vue
 * @description Visual progression path showing upgrade steps with dependencies
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { computed } from 'vue'
import type { ProgressionPath, UpgradeStep, FarmingMethod } from '@/types/progression'
import { FARMING_METHOD_INFO, TIER_DISPLAY } from '@/types/progression'

const props = defineProps<{
  path: ProgressionPath
}>()

/**
 * Check if a step is on the critical path
 */
function isOnCriticalPath(stepId: string): boolean {
  return props.path.criticalPath.includes(stepId)
}

/**
 * Get display info for a farming method
 */
function getFarmingMethodLabel(method: FarmingMethod | string): string {
  const info = FARMING_METHOD_INFO[method as FarmingMethod]
  return info?.label || method
}

/**
 * Get CSS class for power increase
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
 * Get tier display info
 */
function getTierInfo(tier: string) {
  return TIER_DISPLAY[tier as keyof typeof TIER_DISPLAY] || TIER_DISPLAY.medium
}

/**
 * Check if path has any steps
 */
const hasSteps = computed(() => props.path.steps.length > 0)
</script>

<template>
  <div class="progression-path">
    <div class="path-header">
      <h4>Upgrade Progression</h4>
      <div class="path-meta">
        <span class="current-phase">{{ path.currentPhase }}</span>
        <span class="total-time">Est. {{ path.totalEstimatedTime }}</span>
      </div>
    </div>

    <div v-if="!hasSteps" class="no-steps">
      <p>No progression path available. Run the enhanced analysis to get step-by-step recommendations.</p>
    </div>

    <div v-else class="path-timeline">
      <div
        v-for="(step, index) in path.steps"
        :key="step.id"
        class="timeline-step"
        :class="{
          'critical': isOnCriticalPath(step.id),
          'has-deps': step.dependsOn?.length
        }"
      >
        <div class="step-connector" v-if="index > 0"></div>

        <div class="step-marker">
          <span class="step-number">{{ index + 1 }}</span>
          <span v-if="isOnCriticalPath(step.id)" class="critical-badge" title="Critical Path">!</span>
        </div>

        <div class="step-content">
          <div class="step-header">
            <span class="step-name">{{ step.item.itemName }}</span>
            <span class="step-tier" :title="getTierInfo(step.item.estimatedTime).time">
              {{ getTierInfo(step.item.estimatedTime).icon }}
            </span>
          </div>

          <div class="step-slot">{{ step.item.slot }}</div>

          <div class="step-method">
            via {{ getFarmingMethodLabel(step.item.primaryMethod) }}
          </div>

          <div class="step-power" :class="getPowerClass(step.powerIncrease)">
            {{ step.powerIncrease }} impact
          </div>

          <p class="step-reason">{{ step.reason }}</p>

          <div v-if="step.dependsOn?.length" class="step-deps">
            <span class="deps-label">After:</span>
            {{ step.dependsOn.join(', ') }}
          </div>

          <div v-if="step.unlocks?.length" class="step-unlocks">
            <span class="unlocks-label">Enables:</span>
            {{ step.unlocks.join(', ') }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="path.criticalPath.length > 0" class="critical-path-summary">
      <h5>Critical Path Items</h5>
      <div class="critical-items">
        <span
          v-for="(itemId, index) in path.criticalPath"
          :key="itemId"
          class="critical-item"
        >
          {{ itemId }}
          <span v-if="index < path.criticalPath.length - 1" class="arrow">→</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progression-path {
  background: var(--color-surface);
  border-radius: 8px;
  overflow: hidden;
}

.path-header {
  padding: 1rem;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
}

.path-header h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.path-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.current-phase {
  color: var(--color-text-secondary);
}

.total-time {
  color: var(--color-primary);
  font-weight: 500;
}

.no-steps {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.path-timeline {
  padding: 1rem;
}

.timeline-step {
  position: relative;
  display: flex;
  gap: 1rem;
  padding-bottom: 1.5rem;
}

.timeline-step:last-child {
  padding-bottom: 0;
}

.step-connector {
  position: absolute;
  left: 1rem;
  top: -1rem;
  width: 2px;
  height: 1rem;
  background: var(--color-border);
}

.timeline-step.critical .step-connector {
  background: var(--color-warning);
}

.step-marker {
  position: relative;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-elevated);
  border: 2px solid var(--color-border);
  border-radius: 50%;
}

.timeline-step.critical .step-marker {
  border-color: var(--color-warning);
  background: var(--color-warning);
}

.step-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.timeline-step.critical .step-number {
  color: black;
}

.critical-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  background: var(--color-error);
  color: white;
  font-size: 0.625rem;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.step-name {
  font-weight: 600;
  color: var(--color-legendary);
}

.step-tier {
  font-size: 0.875rem;
}

.step-slot {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.step-method {
  font-size: 0.8rem;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.step-power {
  display: inline-block;
  font-size: 0.7rem;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
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

.step-reason {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.step-deps,
.step-unlocks {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.deps-label {
  color: var(--color-warning);
}

.unlocks-label {
  color: var(--color-success);
}

.critical-path-summary {
  padding: 1rem;
  background: var(--color-surface-elevated);
  border-top: 1px solid var(--color-border);
}

.critical-path-summary h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.critical-items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
}

.critical-item {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: var(--color-warning);
  color: black;
  border-radius: 4px;
}

.arrow {
  margin-left: 0.25rem;
  color: var(--color-text-secondary);
}
</style>
