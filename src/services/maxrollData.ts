/**
 * @file services/maxrollData.ts
 * @description Service for fetching and caching Maxroll.gg build data
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { useSettingsStore } from '@/stores/settings'
import type {
  TierListEntry,
  MaxrollBuildGuide,
  MetaBuildReference,
  MaxrollCacheEntry,
  MaxrollFetchResult
} from '@/types/maxroll'
import type { Hero } from '@/types/hero'
import {
  parseTierListPage,
  parseBuildGuidePage,
  extractCoreItems,
  extractKeySynergies
} from './maxrollParser'

// Cache TTLs
const TIER_LIST_TTL = 24 * 60 * 60 * 1000 // 24 hours
const BUILD_GUIDE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

// LocalStorage keys
const CACHE_KEY_TIER_LIST = 'maxroll-tierlist'
const CACHE_KEY_BUILD_PREFIX = 'maxroll-build-'

class MaxrollDataService {
  /**
   * Fetch the D3 solo tier list from Maxroll
   */
  async getTierList(): Promise<MaxrollFetchResult<TierListEntry[]>> {
    // Check cache first
    const cached = this.getCached<TierListEntry[]>(CACHE_KEY_TIER_LIST, TIER_LIST_TTL)
    if (cached) {
      return { success: true, data: cached, fromCache: true }
    }

    try {
      const html = await this.fetchMaxrollPage('/d3/tierlists/solo-tierlist')
      if (!html) {
        return { success: false, error: 'Failed to fetch tier list', fromCache: false }
      }

      const entries = parseTierListPage(html)
      if (entries.length === 0) {
        return { success: false, error: 'No builds found in tier list', fromCache: false }
      }

      // Cache the results
      this.setCache(CACHE_KEY_TIER_LIST, entries, TIER_LIST_TTL)

      return { success: true, data: entries, fromCache: false }
    } catch (error) {
      console.error('Failed to fetch tier list:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        fromCache: false
      }
    }
  }

  /**
   * Get builds filtered by hero class
   */
  async getBuildsForClass(heroClass: string): Promise<TierListEntry[]> {
    const result = await this.getTierList()
    if (!result.success || !result.data) {
      return []
    }

    const normalizedClass = heroClass.toLowerCase().replace(' ', '-')
    return result.data.filter(entry =>
      entry.heroClass.toLowerCase() === normalizedClass
    )
  }

  /**
   * Fetch a specific build guide
   */
  async getBuildGuide(guideUrl: string): Promise<MaxrollFetchResult<MaxrollBuildGuide>> {
    // Create a cache key from the URL
    const urlPath = new URL(guideUrl).pathname
    const cacheKey = CACHE_KEY_BUILD_PREFIX + urlPath.replace(/\//g, '-')

    // Check cache first
    const cached = this.getCached<MaxrollBuildGuide>(cacheKey, BUILD_GUIDE_TTL)
    if (cached) {
      return { success: true, data: cached, fromCache: true }
    }

    try {
      const endpoint = urlPath
      const html = await this.fetchMaxrollPage(endpoint)
      if (!html) {
        return { success: false, error: 'Failed to fetch build guide', fromCache: false }
      }

      const guide = parseBuildGuidePage(html)
      if (!guide) {
        return { success: false, error: 'Failed to parse build guide', fromCache: false }
      }

      guide.guideUrl = guideUrl

      // Cache the results
      this.setCache(cacheKey, guide, BUILD_GUIDE_TTL)

      return { success: true, data: guide, fromCache: false }
    } catch (error) {
      console.error('Failed to fetch build guide:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        fromCache: false
      }
    }
  }

  /**
   * Find the best matching meta build for a hero's current setup
   */
  async findMatchingMetaBuild(hero: Hero): Promise<MetaBuildReference | null> {
    const builds = await this.getBuildsForClass(hero.heroClass)
    if (builds.length === 0) {
      return null
    }

    // Find hero's equipped sets
    const heroSets = new Map<string, number>()
    for (const item of Object.values(hero.items)) {
      if (item.setName) {
        heroSets.set(item.setName, (heroSets.get(item.setName) || 0) + 1)
      }
    }

    // Try to find a build that matches the hero's primary set
    let bestMatch: TierListEntry | null = null
    let bestMatchScore = 0

    for (const build of builds) {
      let score = 0

      // Higher tier = higher base score
      const tierScores: Record<string, number> = { S: 100, A: 80, B: 60, C: 40, D: 20, F: 10 }
      score += tierScores[build.tier] || 0

      // Bonus if set name matches
      if (build.setName) {
        for (const [setName, pieces] of heroSets) {
          if (setName.toLowerCase().includes(build.setName.toLowerCase()) ||
            build.setName.toLowerCase().includes(setName.toLowerCase())) {
            score += pieces * 20 // Bonus per matching set piece
          }
        }
      }

      if (score > bestMatchScore) {
        bestMatchScore = score
        bestMatch = build
      }
    }

    // If we found a match, try to get more details
    if (bestMatch) {
      // Try to fetch the full guide for more context
      const guideResult = await this.getBuildGuide(bestMatch.guideUrl)

      if (guideResult.success && guideResult.data) {
        const guide = guideResult.data
        return {
          buildName: bestMatch.buildName,
          tier: bestMatch.tier,
          guideUrl: bestMatch.guideUrl,
          coreItems: extractCoreItems(guide),
          keySynergies: extractKeySynergies(guide),
          skills: guide.skills,
          cubePowers: guide.kanaisCube
        }
      }

      // Return basic info if we couldn't get the full guide
      return {
        buildName: bestMatch.buildName,
        tier: bestMatch.tier,
        guideUrl: bestMatch.guideUrl,
        coreItems: [],
        keySynergies: []
      }
    }

    // Fallback: return the highest-tier build for this class
    const topBuild = builds[0]
    if (topBuild) {
      return {
        buildName: topBuild.buildName,
        tier: topBuild.tier,
        guideUrl: topBuild.guideUrl,
        coreItems: [],
        keySynergies: []
      }
    }

    return null
  }

  /**
   * Build context string for Claude prompt from meta build reference
   */
  buildMetaContext(build: MetaBuildReference): string {
    const lines: string[] = [
      `## Meta Build Reference: ${build.buildName} (${build.tier}-Tier)`,
      `Guide: ${build.guideUrl}`,
      ''
    ]

    if (build.coreItems.length > 0) {
      lines.push('### Core Items')
      build.coreItems.forEach(item => lines.push(`- ${item}`))
      lines.push('')
    }

    if (build.keySynergies.length > 0) {
      lines.push('### Key Synergies')
      build.keySynergies.forEach(syn => lines.push(`- ${syn}`))
      lines.push('')
    }

    if (build.skills) {
      lines.push('### Skills')
      if (build.skills.active.length > 0) {
        lines.push('Active:')
        build.skills.active.forEach(s => lines.push(`- ${s.skill} (${s.rune})`))
      }
      if (build.skills.passive.length > 0) {
        lines.push('Passive:')
        build.skills.passive.forEach(p => lines.push(`- ${p}`))
      }
      lines.push('')
    }

    if (build.cubePowers) {
      lines.push('### Kanai\'s Cube')
      if (build.cubePowers.weapon) lines.push(`- Weapon: ${build.cubePowers.weapon}`)
      if (build.cubePowers.armor) lines.push(`- Armor: ${build.cubePowers.armor}`)
      if (build.cubePowers.jewelry) lines.push(`- Jewelry: ${build.cubePowers.jewelry}`)
    }

    return lines.join('\n')
  }

  /**
   * Clear all cached Maxroll data
   */
  clearCache(): void {
    // Remove tier list
    localStorage.removeItem(CACHE_KEY_TIER_LIST)

    // Remove all build caches
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_KEY_BUILD_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  /**
   * Check if tier list cache is stale
   */
  isTierListStale(): boolean {
    const cached = localStorage.getItem(CACHE_KEY_TIER_LIST)
    if (!cached) return true

    try {
      const entry: MaxrollCacheEntry<unknown> = JSON.parse(cached)
      return Date.now() > entry.expiresAt
    } catch {
      return true
    }
  }

  // ========================================
  // Private methods
  // ========================================

  /**
   * Fetch a Maxroll page via the worker proxy
   */
  private async fetchMaxrollPage(endpoint: string): Promise<string | null> {
    const settings = useSettingsStore()
    const proxyUrl = settings.proxyUrl

    if (!proxyUrl) {
      console.error('Proxy URL not configured')
      return null
    }

    try {
      const response = await fetch(`${proxyUrl}/api/maxroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint })
      })

      if (!response.ok) {
        console.error('Maxroll proxy request failed:', response.status)
        return null
      }

      const data = await response.json()
      if (!data.success || !data.html) {
        console.error('Maxroll proxy returned error:', data.error)
        return null
      }

      return data.html
    } catch (error) {
      console.error('Failed to fetch from Maxroll proxy:', error)
      return null
    }
  }

  /**
   * Get cached data if valid
   */
  private getCached<T>(key: string, _ttl: number): T | null {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const entry: MaxrollCacheEntry<T> = JSON.parse(cached)

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        localStorage.removeItem(key)
        return null
      }

      return entry.data
    } catch {
      return null
    }
  }

  /**
   * Set cache with TTL
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    const entry: MaxrollCacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    }

    try {
      localStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
      // LocalStorage might be full, clear old caches
      console.warn('Failed to cache Maxroll data:', error)
      this.clearCache()
    }
  }
}

// Export singleton instance
export const maxrollDataService = new MaxrollDataService()
