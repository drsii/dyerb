<script setup lang="ts">
/**
 * @file AppSidebar.vue
 * @description Collapsible navigation sidebar with route links
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { useSettingsStore } from '@/stores/settings'
import { useRoute, useRouter } from 'vue-router'

const settings = useSettingsStore()
const route = useRoute()
const router = useRouter()
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: !settings.sidebarOpen }">
    <div class="sidebar-content">
      <!-- Logo Section -->
      <div class="logo-section" @click="router.push('/')">
        <img src="/dyerb.svg" alt="D3 Gear Analyzer" class="logo-image" />
      </div>

      <!-- Account Section -->
      <div class="sidebar-section" v-if="settings.isConfigured">
        <h3 class="section-title">Account</h3>
        <div class="account-info">
          <div class="info-row">
            <span class="label">BattleTag:</span>
            <span class="value">{{ settings.battletag }}</span>
          </div>
          <div class="info-row">
            <span class="label">Region:</span>
            <span class="value">{{ settings.region.toUpperCase() }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <h3 class="section-title">Navigation</h3>
        <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Dashboard</span>
        </router-link>
        <router-link v-if="settings.isConfigured" to="/heroes" class="nav-item" :class="{ active: route.path === '/heroes' }">
          <span class="nav-icon">👤</span>
          <span class="nav-text">My Heroes</span>
        </router-link>
        <router-link v-if="settings.isConfigured" to="/build-advisor" class="nav-item" :class="{ active: route.path === '/build-advisor' }">
          <span class="nav-icon">🤖</span>
          <span class="nav-text">Build Advisor</span>
        </router-link>
        <router-link to="/settings" class="nav-item" :class="{ active: route.path === '/settings' }">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">Settings</span>
        </router-link>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="status-indicator" :class="{ connected: settings.isConfigured }">
          <span class="status-dot"></span>
          <span class="status-text">
            {{ settings.isConfigured ? 'Connected' : 'Not Configured' }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, transform 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 0;
  border-right: none;
}

.sidebar-content {
  width: var(--sidebar-width);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

/* Logo Section */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.logo-section:hover .logo-image {
  transform: scale(1.02);
}

.logo-image {
  width: 100%;
  max-width: 180px;
  height: auto;
  transition: transform 0.2s ease;
}

.logo-tagline {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.5rem;
  text-align: center;
}

.sidebar-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.account-info {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.info-row + .info-row {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.info-row .label {
  color: var(--text-secondary);
}

.info-row .value {
  color: var(--text-primary);
  font-weight: 500;
}

.sidebar-nav {
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
  margin-bottom: 0.25rem;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  text-decoration: none;
}

.nav-item.active {
  background: var(--bg-tertiary);
  color: var(--accent-gold);
}

.nav-icon {
  font-size: 1.125rem;
}

.nav-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.sidebar-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-red);
}

.status-indicator.connected .status-dot {
  background: var(--accent-green);
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 99;
    transform: translateX(-100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>
