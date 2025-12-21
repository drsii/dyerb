<script setup lang="ts">
/**
 * @file AppHeader.vue
 * @description Top navigation header with branding and route info
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { useSettingsStore } from '@/stores/settings'
import { useRouter, useRoute } from 'vue-router'

const settings = useSettingsStore()
const router = useRouter()
const route = useRoute()
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button
        v-if="settings.isConfigured"
        class="menu-btn"
        @click="settings.toggleSidebar"
        aria-label="Toggle sidebar"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div class="logo-group" @click="router.push('/')">
        <h1 class="logo">
          <span class="logo-icon">⚔️</span>
          <span class="logo-text">DYERB</span>
        </h1>
      </div>
    </div>

    <nav class="header-nav">
      <router-link
        v-if="settings.isConfigured"
        to="/heroes"
        class="nav-link"
        :class="{ active: route.path === '/heroes' }"
      >
        Heroes
      </router-link>
      <router-link
        to="/settings"
        class="nav-link"
        :class="{ active: route.path === '/settings' }"
      >
        Settings
      </router-link>
    </nav>

    <div class="header-right">
      <span v-if="settings.battletag" class="battletag">
        {{ settings.battletag }}
      </span>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  transition: all 0.2s;
}

.menu-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.logo-group {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.logo-group:hover .logo {
  color: var(--accent-gold);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-style: italic;
  margin-left: 2rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.header-nav {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  text-decoration: none;
}

.nav-link.active {
  background: var(--bg-tertiary);
  color: var(--accent-gold);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.battletag {
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.375rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .logo-text,
  .logo-subtitle {
    display: none;
  }

  .header-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    padding: 0.5rem;
    justify-content: center;
  }
}
</style>
