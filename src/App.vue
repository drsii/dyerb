<script setup lang="ts">
/**
 * @file App.vue
 * @description Root component with responsive sidebar layout
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { RouterView } from 'vue-router'
import AppSidebar from '@/components/common/AppSidebar.vue'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
</script>

<template>
  <div class="app-container" :class="{ 'sidebar-open': settings.sidebarOpen }">
    <!-- Mobile menu toggle -->
    <button
      class="mobile-menu-btn"
      @click="settings.toggleSidebar"
      aria-label="Toggle sidebar"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>

    <!-- Overlay for mobile -->
    <div
      v-if="settings.sidebarOpen"
      class="sidebar-overlay"
      @click="settings.toggleSidebar"
    ></div>

    <div class="app-content">
      <AppSidebar />
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  background: var(--bg-primary);
  color: var(--text-primary);
  position: relative;
}

.app-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Mobile menu button */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 101;
  width: 44px;
  height: 44px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.mobile-menu-btn:hover {
  background: var(--bg-tertiary);
}

/* Sidebar overlay for mobile */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 98;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .main-content {
    padding-top: 4rem;
  }
}
</style>
