/**
 * @file services/battlenet.ts
 * @description Battle.net Diablo III API client
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import type {
  Hero,
  HeroSummary,
  Item,
  Gem,
  ItemQuality
} from '@/types/hero'
import type {
  ProfileResponse,
  HeroApiResponse,
  HeroDetailResponse,
  HeroItemsResponse
} from '@/types/api'

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ProfilePrivateError extends APIError {
  constructor() {
    super(
      'This profile is private. To make it public:\n' +
        '1. Go to Battle.net Account Settings\n' +
        '2. Navigate to Privacy settings\n' +
        '3. Enable "Diablo III Profile" visibility'
    )
    this.name = 'ProfilePrivateError'
  }
}

export class HeroNotFoundError extends APIError {
  constructor() {
    super('Hero not found. Please check the hero ID.')
    this.name = 'HeroNotFoundError'
  }
}

// Class name mappings
const classNames: Record<string, string> = {
  barbarian: 'Barbarian',
  crusader: 'Crusader',
  'demon-hunter': 'Demon Hunter',
  monk: 'Monk',
  necromancer: 'Necromancer',
  'witch-doctor': 'Witch Doctor',
  wizard: 'Wizard'
}

// Slot display names
const slotNames: Record<string, string> = {
  head: 'Head',
  shoulders: 'Shoulders',
  neck: 'Amulet',
  torso: 'Chest',
  hands: 'Gloves',
  waist: 'Belt',
  wrists: 'Bracers',
  legs: 'Pants',
  feet: 'Boots',
  leftFinger: 'Left Ring',
  rightFinger: 'Right Ring',
  mainHand: 'Main Hand',
  offHand: 'Off Hand'
}

// Map API slot names to internal slot keys
// The Blizzard API uses 'bracers' but we use 'wrists' internally
const slotKeyMap: Record<string, string> = {
  bracers: 'wrists'
}

class BattleNetService {
  /**
   * Make an authenticated API request via the proxy
   */
  private async request<T>(endpoint: string): Promise<T> {
    const settings = useSettingsStore()
    const auth = useAuthStore()

    const token = await auth.getValidToken()
    const baseUrl = settings.proxyUrl.replace(/\/+$/, '')

    const response = await fetch(`${baseUrl}/api/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        region: settings.region,
        endpoint
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))

      if (response.status === 401) {
        auth.logout()
        throw new APIError('Authentication expired. Please re-authenticate.')
      }

      if (response.status === 403) {
        throw new ProfilePrivateError()
      }

      if (response.status === 404) {
        const code = error?.details?.code || ''
        if (code.toString().toUpperCase().includes('NOTFOUND')) {
          throw new HeroNotFoundError()
        }
        throw new APIError(`Resource not found: ${endpoint}`, 404)
      }

      if (response.status === 429) {
        throw new APIError('Rate limited. Please try again in a few minutes.', 429)
      }

      throw new APIError(error.error || `API request failed with status ${response.status}`, response.status)
    }

    return response.json()
  }

  /**
   * Format BattleTag for API URLs (Player#1234 -> Player-1234)
   */
  private formatBattletag(battletag: string): string {
    return battletag.replace('#', '-')
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtml(text: string): string {
    if (!text) return ''
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Get account profile with hero list
   */
  async getProfile(): Promise<ProfileResponse> {
    const settings = useSettingsStore()
    const account = this.formatBattletag(settings.battletag)
    return this.request<ProfileResponse>(`/d3/profile/${account}/`)
  }

  /**
   * Get list of heroes for the current account
   */
  async getHeroes(): Promise<HeroSummary[]> {
    const profile = await this.getProfile()

    return profile.heroes.map((hero: HeroApiResponse) => ({
      heroId: hero.id,
      name: hero.name,
      heroClass: classNames[hero.class] || hero.class,
      level: hero.level,
      paragonLevel: hero.paragonLevel,
      seasonal: hero.seasonal,
      hardcore: hero.hardcore,
      dead: hero.dead,
      lastUpdated: hero['last-updated'],
      gender: hero.gender
    }))
  }

  /**
   * Get detailed hero information
   */
  async getHeroDetails(heroId: number): Promise<Hero> {
    const settings = useSettingsStore()
    const account = this.formatBattletag(settings.battletag)
    const data = await this.request<HeroDetailResponse>(`/d3/profile/${account}/hero/${heroId}`)

    const hero: Hero = {
      heroId: data.id,
      name: data.name,
      heroClass: classNames[data.class] || data.class,
      level: data.level,
      paragonLevel: data.paragonLevel,
      seasonal: data.seasonal,
      hardcore: data.hardcore,
      dead: data.dead,
      lastUpdated: data['last-updated'],
      gender: data.gender,
      life: data.stats?.life,
      damage: data.stats?.damage,
      toughness: data.stats?.toughness,
      recovery: data.stats?.healing,
      activeSkills: [],
      passiveSkills: [],
      items: {},
      legendaryGems: []
    }

    // Active skills
    for (const skillSlot of data.skills?.active || []) {
      if (skillSlot.skill) {
        hero.activeSkills.push({
          name: skillSlot.skill.name,
          slug: skillSlot.skill.slug,
          description: this.stripHtml(skillSlot.skill.description || ''),
          rune: skillSlot.rune?.name,
          runeDescription: this.stripHtml(skillSlot.rune?.description || '')
        })
      }
    }

    // Passive skills
    for (const passiveSlot of data.skills?.passive || []) {
      if (passiveSlot.skill) {
        hero.passiveSkills.push({
          name: passiveSlot.skill.name,
          slug: passiveSlot.skill.slug,
          description: this.stripHtml(passiveSlot.skill.description || '')
        })
      }
    }

    // Kanai's Cube powers
    const legendPowers = data.legendaryPowers || []
    if (legendPowers.length > 0) {
      hero.cubePowers = {
        weapon: legendPowers[0]?.name,
        armor: legendPowers[1]?.name,
        jewelry: legendPowers[2]?.name
      }
    }

    return hero
  }

  /**
   * Get equipped items for a hero
   */
  async getHeroItems(heroId: number): Promise<{ items: Record<string, Item>; legendaryGems: Gem[] }> {
    const settings = useSettingsStore()
    const account = this.formatBattletag(settings.battletag)
    const data = await this.request<HeroItemsResponse>(`/d3/profile/${account}/hero/${heroId}/items`)

    const items: Record<string, Item> = {}
    const legendaryGems: Gem[] = []

    for (const [apiSlot, itemData] of Object.entries(data)) {
      if (!itemData || typeof itemData !== 'object' || !itemData.name) {
        continue
      }

      // Map API slot name to internal slot key (e.g., 'bracers' -> 'wrists')
      const slot = slotKeyMap[apiSlot] || apiSlot

      // Determine quality
      let quality: ItemQuality = 'common'
      switch (itemData.displayColor) {
        case 'green':
          quality = 'set'
          break
        case 'orange':
          quality = 'legendary'
          break
        case 'yellow':
          quality = 'rare'
          break
        case 'blue':
          quality = 'magic'
          break
      }

      const item: Item = {
        slot: slotNames[slot] || slot,
        name: itemData.name,
        itemType: itemData.typeName || '',
        quality,
        setName: itemData.set?.name,
        armor: itemData.armor?.max,
        dps: itemData.dps?.max,
        attacksPerSecond: itemData.attacksPerSecond?.max,
        primaryStats: [],
        secondaryStats: [],
        gems: [],
        icon: itemData.icon
      }

      // Primary stats
      for (const attr of itemData.attributes?.primary || []) {
        const text = this.stripHtml(attr.textHtml || attr.text || '')
        if (text) item.primaryStats.push(text)
      }

      // Secondary stats
      for (const attr of itemData.attributes?.secondary || []) {
        const text = this.stripHtml(attr.textHtml || attr.text || '')
        if (text) item.secondaryStats.push(text)
      }

      // Legendary power
      for (const attr of itemData.attributes?.passive || []) {
        const text = this.stripHtml(attr.textHtml || attr.text || '')
        if (text) {
          item.legendaryPower = text
          break
        }
      }

      // Gems
      for (const gemData of itemData.gems || []) {
        const isLegendary = gemData.isGem && gemData.jewelRank !== undefined
        const gem: Gem = {
          name: gemData.item?.name || 'Unknown Gem',
          rank: gemData.jewelRank,
          isLegendary,
          attributes: (gemData.attributes || []).map(a => this.stripHtml(a.textHtml || a.text || ''))
        }
        item.gems.push(gem)

        if (isLegendary) {
          legendaryGems.push(gem)
        }
      }

      // Transmog
      if (itemData.transmog) {
        item.transmog = itemData.transmog.name
      }

      items[slot] = item
    }

    return { items, legendaryGems }
  }

  /**
   * Get complete hero information including gear
   */
  async getFullHero(heroId: number): Promise<Hero> {
    const hero = await this.getHeroDetails(heroId)
    const { items, legendaryGems } = await this.getHeroItems(heroId)
    hero.items = items
    hero.legendaryGems = legendaryGems
    return hero
  }
}

// Export singleton instance
export const battleNetService = new BattleNetService()
