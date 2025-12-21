/**
 * @file router/index.ts
 * @description Vue Router configuration with navigation guards
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: () => {
        const settings = useSettingsStore()
        return settings.isConfigured ? '/heroes' : '/settings'
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    },
    {
      path: '/heroes',
      name: 'heroes',
      component: () => import('@/views/HeroSelectView.vue'),
      meta: { requiresConfig: true }
    },
    {
      path: '/dashboard/:heroId',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresConfig: true }
    },
    {
      path: '/build-advisor',
      name: 'build-advisor',
      component: () => import('@/views/BuildAdvisorView.vue'),
      meta: { requiresConfig: true }
    }
  ]
})

// Navigation guard to check configuration
router.beforeEach((to, _from, next) => {
  const settings = useSettingsStore()

  if (to.meta.requiresConfig && !settings.isConfigured) {
    next({ name: 'settings' })
  } else {
    next()
  }
})

export default router
