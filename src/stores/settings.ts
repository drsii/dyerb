/**
 * @file stores/settings.ts
 * @description Settings store for API credentials and app configuration
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Region } from '@/types'
import type { FarmingMethod } from '@/types/progression'

const STORAGE_KEY = 'dyerb-settings'

/** View mode for upgrade recommendations */
export type RecommendationViewMode = 'categorized' | 'progression'

interface StoredSettings {
  clientId: string
  clientSecret: string
  region: Region
  battletag: string
  proxyUrl: string
  claudeApiKey: string
  // External data preferences
  useMaxrollData: boolean
  maxrollCacheEnabled: boolean
  // Farming preferences
  preferredFarmingMethods: FarmingMethod[]
  // UI preferences
  defaultViewMode: RecommendationViewMode
}

/** Default farming methods */
const DEFAULT_FARMING_METHODS: FarmingMethod[] = [
  'rift', 'greater_rift', 'kadala', 'cube_upgrade', 'bounty', 'crafting'
]

export const useSettingsStore = defineStore('settings', () => {
  // State
  const clientId = ref('')
  const clientSecret = ref('')
  const region = ref<Region>('us')
  const battletag = ref('')
  const proxyUrl = ref('https://d3-proxy.YOUR-SUBDOMAIN.workers.dev') // Will be updated
  const claudeApiKey = ref('')
  const sidebarOpen = ref(true)

  // External data preferences
  const useMaxrollData = ref(true)
  const maxrollCacheEnabled = ref(true)

  // Farming preferences
  const preferredFarmingMethods = ref<FarmingMethod[]>([...DEFAULT_FARMING_METHODS])

  // UI preferences
  const defaultViewMode = ref<RecommendationViewMode>('categorized')

  // Computed
  const isConfigured = computed(() => {
    return !!(clientId.value && clientSecret.value && battletag.value)
  })

  const formattedBattletag = computed(() => {
    // Convert Player#1234 to Player-1234 for API URLs
    return battletag.value.replace('#', '-')
  })

  const apiBaseUrl = computed(() => {
    const regionUrls: Record<Region, string> = {
      us: 'https://us.api.blizzard.com',
      eu: 'https://eu.api.blizzard.com',
      kr: 'https://kr.api.blizzard.com',
      tw: 'https://tw.api.blizzard.com'
    }
    return regionUrls[region.value]
  })

  // Actions
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: Partial<StoredSettings> = JSON.parse(stored)
        clientId.value = data.clientId || ''
        clientSecret.value = data.clientSecret || ''
        region.value = data.region || 'us'
        battletag.value = data.battletag || ''
        proxyUrl.value = data.proxyUrl || proxyUrl.value
        claudeApiKey.value = data.claudeApiKey || ''
        // External data preferences
        useMaxrollData.value = data.useMaxrollData ?? true
        maxrollCacheEnabled.value = data.maxrollCacheEnabled ?? true
        // Farming preferences
        preferredFarmingMethods.value = data.preferredFarmingMethods ?? [...DEFAULT_FARMING_METHODS]
        // UI preferences
        defaultViewMode.value = data.defaultViewMode ?? 'categorized'
      }
    } catch (e) {
      console.error('Failed to load settings from storage:', e)
    }
  }

  function saveToStorage() {
    try {
      const data: StoredSettings = {
        clientId: clientId.value,
        clientSecret: clientSecret.value,
        region: region.value,
        battletag: battletag.value,
        proxyUrl: proxyUrl.value,
        claudeApiKey: claudeApiKey.value,
        useMaxrollData: useMaxrollData.value,
        maxrollCacheEnabled: maxrollCacheEnabled.value,
        preferredFarmingMethods: preferredFarmingMethods.value,
        defaultViewMode: defaultViewMode.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save settings to storage:', e)
    }
  }

  function updateSettings(settings: Partial<StoredSettings>) {
    if (settings.clientId !== undefined) clientId.value = settings.clientId
    if (settings.clientSecret !== undefined) clientSecret.value = settings.clientSecret
    if (settings.region !== undefined) region.value = settings.region
    if (settings.battletag !== undefined) battletag.value = settings.battletag
    if (settings.proxyUrl !== undefined) proxyUrl.value = settings.proxyUrl
    if (settings.claudeApiKey !== undefined) claudeApiKey.value = settings.claudeApiKey
    if (settings.useMaxrollData !== undefined) useMaxrollData.value = settings.useMaxrollData
    if (settings.maxrollCacheEnabled !== undefined) maxrollCacheEnabled.value = settings.maxrollCacheEnabled
    if (settings.preferredFarmingMethods !== undefined) preferredFarmingMethods.value = settings.preferredFarmingMethods
    if (settings.defaultViewMode !== undefined) defaultViewMode.value = settings.defaultViewMode
    saveToStorage()
  }

  function clearSettings() {
    clientId.value = ''
    clientSecret.value = ''
    region.value = 'us'
    battletag.value = ''
    claudeApiKey.value = ''
    useMaxrollData.value = true
    maxrollCacheEnabled.value = true
    preferredFarmingMethods.value = [...DEFAULT_FARMING_METHODS]
    defaultViewMode.value = 'categorized'
    localStorage.removeItem(STORAGE_KEY)
  }

  function destroyAllData() {
    // Clear all localStorage
    localStorage.clear()

    // Clear all sessionStorage
    sessionStorage.clear()

    // Clear IndexedDB databases
    if ('indexedDB' in window) {
      indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
          }
        })
      })
    }

    // Clear service worker caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name)
        })
      })
    }

    // Reset store state
    clientId.value = ''
    clientSecret.value = ''
    region.value = 'us'
    battletag.value = ''
    proxyUrl.value = 'https://dyerb-proxy.YOUR-SUBDOMAIN.workers.dev'
    claudeApiKey.value = ''
  }

  // Computed for Claude
  const isClaudeConfigured = computed(() => {
    return !!claudeApiKey.value
  })

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  // Initialize from storage on creation
  loadFromStorage()

  return {
    // State
    clientId,
    clientSecret,
    region,
    battletag,
    proxyUrl,
    claudeApiKey,
    sidebarOpen,
    // External data preferences
    useMaxrollData,
    maxrollCacheEnabled,
    // Farming preferences
    preferredFarmingMethods,
    // UI preferences
    defaultViewMode,

    // Computed
    isConfigured,
    isClaudeConfigured,
    formattedBattletag,
    apiBaseUrl,

    // Actions
    loadFromStorage,
    saveToStorage,
    updateSettings,
    clearSettings,
    destroyAllData,
    toggleSidebar
  }
})
