/**
 * @file types/maxroll.ts
 * @description Type definitions for Maxroll.gg data integration
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

/**
 * Tier list entry from Maxroll solo tier list
 */
export interface TierListEntry {
  /** Build name (e.g., "Bone Spear Necromancer") */
  buildName: string
  /** Hero class */
  heroClass: string
  /** Tier ranking */
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  /** URL to the full guide */
  guideUrl: string
  /** Primary set used (if any) */
  setName?: string
  /** Whether this is the seasonal Haedrig's Gift set */
  isHaedrigsGift?: boolean
  /** Maximum GR clear potential */
  grClearPotential?: string
}

/**
 * Skill configuration from Maxroll build guide
 */
export interface MaxrollSkillSet {
  active: Array<{ skill: string; rune: string }>
  passive: string[]
}

/**
 * Kanai's Cube power configuration
 */
export interface MaxrollCubePowers {
  weapon: string
  armor: string
  jewelry: string
}

/**
 * Legendary gem with target rank
 */
export interface MaxrollGem {
  name: string
  targetRank: number
  priority: number
}

/**
 * Gear slot configuration from build guide
 */
export interface MaxrollGearSlot {
  slot: string
  primaryItem: string
  alternatives?: string[]
  statPriorities: string[]
}

/**
 * Paragon point priorities
 */
export interface MaxrollParagonPriorities {
  core: string[]
  offense: string[]
  defense: string[]
  utility: string[]
}

/**
 * Stat priorities for gear
 */
export interface MaxrollStatPriorities {
  general: string[]
  bySlot?: Record<string, string[]>
}

/**
 * Full build guide data from Maxroll
 */
export interface MaxrollBuildGuide {
  /** Build name */
  buildName: string
  /** Hero class */
  heroClass: string
  /** Tier ranking */
  tier: string
  /** Last update date */
  lastUpdated?: string
  /** Guide URL */
  guideUrl: string

  /** Gear configuration */
  gear: MaxrollGearSlot[]
  /** Skill configuration */
  skills: MaxrollSkillSet
  /** Kanai's Cube powers */
  kanaisCube: MaxrollCubePowers
  /** Legendary gems */
  legendaryGems: MaxrollGem[]
  /** Paragon priorities */
  paragonPriorities?: MaxrollParagonPriorities
  /** Stat priorities */
  statPriorities?: MaxrollStatPriorities

  /** Gameplay notes */
  playstyle?: string
  /** Pros of the build */
  pros?: string[]
  /** Cons of the build */
  cons?: string[]
}

/**
 * Simplified meta build reference for Claude context
 */
export interface MetaBuildReference {
  /** Build name */
  buildName: string
  /** Tier ranking */
  tier: string
  /** Guide URL for user reference */
  guideUrl: string
  /** Core items required for the build */
  coreItems: string[]
  /** Key synergies and mechanics */
  keySynergies: string[]
  /** Skills configuration */
  skills?: MaxrollSkillSet
  /** Cube powers */
  cubePowers?: MaxrollCubePowers
}

/**
 * Cache entry for Maxroll data
 */
export interface MaxrollCacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

/**
 * Maxroll API response status
 */
export interface MaxrollFetchResult<T> {
  success: boolean
  data?: T
  error?: string
  fromCache: boolean
}
