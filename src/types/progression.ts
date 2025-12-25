/**
 * @file types/progression.ts
 * @description Type definitions for time-based upgrade progression and farming recommendations
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

/**
 * Time-based difficulty tiers for item acquisition
 * - quick: < 1 hour of farming
 * - medium: 1-5 hours of farming
 * - long: 5+ hours of farming
 */
export type DifficultyTier = 'quick' | 'medium' | 'long'

/**
 * All farming methods available in Diablo III
 */
export type FarmingMethod =
  | 'rift'           // Standard Nephalem Rifts
  | 'greater_rift'   // Greater Rifts
  | 'bounty'         // Act bounties
  | 'kadala'         // Blood shard gambling
  | 'cube_upgrade'   // Rare -> Legendary upgrade (25 DB)
  | 'cube_reforge'   // Legendary reforge (50 souls + bounty mats)
  | 'crafting'       // Blacksmith/Jeweler recipes
  | 'world_drop'     // General world drop (any content)

/**
 * Item acquisition information with farming details
 */
export interface ItemAcquisition {
  /** Item name */
  itemName: string
  /** Equipment slot(s) - can be comma-separated for sets */
  slot: string
  /** All valid farming methods for this item */
  methods: FarmingMethod[]
  /** Most efficient farming method */
  primaryMethod: FarmingMethod
  /** Estimated time tier to acquire */
  estimatedTime: DifficultyTier
  /** Blood shard cost per Kadala attempt (if applicable) */
  bloodShardCost?: number
  /** Death's Breath cost for cube upgrade (if applicable) */
  deathsBreathCost?: number
  /** Forgotten Soul cost for cube reforge (if applicable) */
  forgottenSoulCost?: number
  /** Whether bounty materials are required */
  bountyMaterialsRequired?: boolean
  /** Where to get the crafting recipe (if craftable) */
  craftingRecipeSource?: string
  /** Specific drop locations or bosses (if any) */
  dropLocations?: string[]
  /** Additional notes for farming */
  notes?: string
}

/**
 * A single upgrade step with dependencies and impact
 */
export interface UpgradeStep {
  /** Unique identifier for this step */
  id: string
  /** Priority order (1 = highest) */
  priority: number
  /** Item acquisition details */
  item: ItemAcquisition
  /** Why this upgrade matters */
  reason: string
  /** How much this improves the build */
  powerIncrease: 'minor' | 'moderate' | 'major' | 'transformative'
  /** IDs of steps that must be completed first */
  dependsOn?: string[]
  /** What this upgrade enables or improves */
  unlocks?: string[]
  /** Alternative items that serve the same purpose */
  alternatives?: ItemAcquisition[]
}

/**
 * Upgrades grouped by estimated farming time
 */
export interface TieredUpgrades {
  /** Quick wins - achievable in < 1 hour */
  quick: UpgradeStep[]
  /** Medium goals - achievable in 1-5 hours */
  medium: UpgradeStep[]
  /** Long-term targets - 5+ hours of farming */
  long: UpgradeStep[]
}

/**
 * Ordered progression path with dependencies
 */
export interface ProgressionPath {
  /** Description of where the player is now */
  currentPhase: string
  /** Ordered list of upgrade steps */
  steps: UpgradeStep[]
  /** Human-readable total time estimate */
  totalEstimatedTime: string
  /** IDs of must-have items (critical path) */
  criticalPath: string[]
}

/**
 * Labels and descriptions for farming methods
 */
export const FARMING_METHOD_INFO: Record<FarmingMethod, { label: string; description: string }> = {
  rift: {
    label: 'Rifts',
    description: 'T16 Nephalem Rifts for Death\'s Breath and random legendary drops'
  },
  greater_rift: {
    label: 'Greater Rifts',
    description: 'Best for legendary gems, high drop rates, and blood shards'
  },
  bounty: {
    label: 'Bounties',
    description: 'Required for crafting materials, Ring of Royal Grandeur, and Avarice Band'
  },
  kadala: {
    label: 'Kadala',
    description: 'Gamble blood shards for targeted slot drops'
  },
  cube_upgrade: {
    label: 'Cube Upgrade',
    description: 'Upgrade rare to legendary (25 Death\'s Breath) - best for class-specific items'
  },
  cube_reforge: {
    label: 'Cube Reforge',
    description: 'Reroll legendary stats (50 Forgotten Souls + bounty mats) - for ancient hunting'
  },
  crafting: {
    label: 'Crafting',
    description: 'Blacksmith recipes - requires pattern drop + crafting materials'
  },
  world_drop: {
    label: 'World Drop',
    description: 'Random drop from any content - no targeted farming available'
  }
}

/**
 * Blood shard costs by equipment slot at Kadala
 */
export const KADALA_COSTS: Record<string, number> = {
  head: 25,
  shoulders: 25,
  torso: 25,
  hands: 25,
  waist: 25,
  wrists: 25,
  legs: 25,
  feet: 25,
  neck: 100,
  leftFinger: 50,
  rightFinger: 50,
  ring: 50,
  amulet: 100,
  mainHand: 75,
  offHand: 75,
  weapon: 75
}

/**
 * Tier display configuration
 */
export const TIER_DISPLAY: Record<DifficultyTier, { label: string; time: string; icon: string }> = {
  quick: { label: 'Quick Wins', time: '< 1 hour', icon: '⚡' },
  medium: { label: 'Medium Goals', time: '1-5 hours', icon: '🎯' },
  long: { label: 'Long-term Targets', time: '5+ hours', icon: '🏆' }
}
