/**
 * @file stores/hero.ts
 * @description Hero store for current character and equipment data
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { battleNetService, APIError } from '@/services/battlenet'
import type { Hero, Item } from '@/types'
import { GEAR_SLOTS } from '@/types/hero'

export const useHeroStore = defineStore('hero', () => {
  // State
  const currentHero = ref<Hero | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)

  // Computed
  const equippedItems = computed(() => {
    if (!currentHero.value) return {}
    return currentHero.value.items
  })

  const legendaryGems = computed(() => {
    if (!currentHero.value) return []
    return currentHero.value.legendaryGems
  })

  const activeSetBonuses = computed(() => {
    if (!currentHero.value) return new Map<string, number>()

    const setCounts = new Map<string, number>()
    for (const item of Object.values(currentHero.value.items)) {
      if (item.setName) {
        setCounts.set(item.setName, (setCounts.get(item.setName) || 0) + 1)
      }
    }
    return setCounts
  })

  const emptySlots = computed(() => {
    if (!currentHero.value) return GEAR_SLOTS as unknown as string[]
    return GEAR_SLOTS.filter(slot => !currentHero.value!.items[slot])
  })

  // Actions
  async function loadHero(heroId: number): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      currentHero.value = await battleNetService.getFullHero(heroId)
      lastFetched.value = new Date()
      return true
    } catch (e) {
      if (e instanceof APIError) {
        error.value = e.message
      } else {
        error.value = 'Failed to load hero'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearHero() {
    currentHero.value = null
    lastFetched.value = null
    error.value = null
  }

  function getItemBySlot(slot: string): Item | undefined {
    return currentHero.value?.items[slot]
  }

  return {
    // State
    currentHero,
    isLoading,
    error,
    lastFetched,

    // Computed
    equippedItems,
    legendaryGems,
    activeSetBonuses,
    emptySlots,

    // Actions
    loadHero,
    clearHero,
    getItemBySlot
  }
})
