<script setup lang="ts">
/**
 * @file UpgradePanel.vue
 * @description Gear upgrade suggestions panel with priority grouping
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { computed } from 'vue'
import { useAnalysisStore } from '@/stores/analysis'
import type { Suggestion } from '@/services/analysisEngine'

const analysis = useAnalysisStore()

const groupedSuggestions = computed(() => {
  const groups: Record<string, Suggestion[]> = {
    upgrade: [],
    gem: [],
    set: [],
    cube: [],
    general: []
  }

  for (const suggestion of analysis.suggestions) {
    groups[suggestion.type].push(suggestion)
  }

  return Object.entries(groups).filter(([_, suggestions]) => suggestions.length > 0)
})

function getPriorityClass(priority: string): string {
  return `priority-${priority}`
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'upgrade': return '⬆️'
    case 'gem': return '💎'
    case 'set': return '🛡️'
    case 'cube': return '📦'
    default: return '💡'
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'upgrade': return 'Gear Upgrades'
    case 'gem': return 'Gem Suggestions'
    case 'set': return 'Set Bonuses'
    case 'cube': return "Kanai's Cube"
    default: return 'General Tips'
  }
}
</script>

<template>
  <div class="upgrade-panel">
    <!-- Suggestions -->
    <div class="suggestions-section">
      <h4>Suggestions</h4>

      <div v-if="analysis.suggestions.length === 0" class="no-suggestions">
        <p>Your gear is looking great!</p>
      </div>

      <div v-else class="suggestion-groups">
        <div
          v-for="[type, suggestions] in groupedSuggestions"
          :key="type"
          class="suggestion-group"
        >
          <div class="group-header">
            <span class="group-icon">{{ getTypeIcon(type) }}</span>
            <span class="group-label">{{ getTypeLabel(type) }}</span>
            <span class="group-count">{{ suggestions.length }}</span>
          </div>

          <ul class="suggestion-list">
            <li
              v-for="(suggestion, idx) in suggestions"
              :key="idx"
              class="suggestion-item"
              :class="getPriorityClass(suggestion.priority)"
            >
              <span class="priority-indicator"></span>
              <span class="suggestion-message">{{ suggestion.message }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- High Priority Count -->
    <div v-if="analysis.highPrioritySuggestions.length > 0" class="priority-summary">
      <span class="priority-count">{{ analysis.highPrioritySuggestions.length }}</span>
      high priority issue{{ analysis.highPrioritySuggestions.length === 1 ? '' : 's' }}
    </div>
  </div>
</template>

<style scoped>
.upgrade-panel {
  padding: 1rem;
}

.suggestions-section {
  margin-bottom: 1.5rem;
}

.suggestions-section h4 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.no-suggestions {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
}

.suggestion-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-group {
  background: var(--bg-tertiary);
  border-radius: 8px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-hover);
  font-size: 0.8125rem;
  font-weight: 500;
}

.group-icon {
  font-size: 1rem;
}

.group-label {
  flex: 1;
}

.group-count {
  background: var(--bg-primary);
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.6875rem;
  color: var(--text-secondary);
}

.suggestion-list {
  list-style: none;
  padding: 0.5rem;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.priority-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 0.375rem;
  flex-shrink: 0;
}

.suggestion-item.priority-high .priority-indicator {
  background: var(--accent-red);
}

.suggestion-item.priority-medium .priority-indicator {
  background: var(--accent-orange);
}

.suggestion-item.priority-low .priority-indicator {
  background: var(--text-muted);
}

.priority-summary {
  text-align: center;
  padding: 0.75rem;
  background: rgba(192, 57, 43, 0.1);
  border: 1px solid var(--accent-red);
  border-radius: 6px;
  font-size: 0.8125rem;
  color: var(--accent-red);
}

.priority-count {
  font-weight: 700;
  font-size: 1rem;
}
</style>
