<script setup lang="ts">
/**
 * @file LoadingSpinner.vue
 * @description Reusable loading indicator with size variants
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

defineProps<{
  size?: 'sm' | 'md' | 'lg'
  message?: string
}>()
</script>

<template>
  <div class="loading-container" :class="size || 'md'">
    <div class="spinner"></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-container.sm .spinner {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.loading-container.md .spinner {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.loading-container.lg .spinner {
  width: 64px;
  height: 64px;
  border-width: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  color: var(--text-secondary);
  font-size: 0.875rem;
}
</style>
