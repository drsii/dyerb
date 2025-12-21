/**
 * @file types/hero.ts
 * @description Hero, item, and skill type definitions
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

export type ItemQuality = 'legendary' | 'set' | 'rare' | 'magic' | 'common'

export interface Skill {
  name: string
  slug: string
  rune?: string
  runeDescription?: string
  description?: string
}

export interface Gem {
  name: string
  rank?: number
  isLegendary: boolean
  attributes: string[]
}

export interface CubePowers {
  weapon?: string
  armor?: string
  jewelry?: string
}

export interface Item {
  slot: string
  name: string
  itemType: string
  quality: ItemQuality
  setName?: string
  armor?: number
  dps?: number
  attacksPerSecond?: number
  primaryStats: string[]
  secondaryStats: string[]
  legendaryPower?: string
  gems: Gem[]
  transmog?: string
  icon?: string
}

export interface Hero {
  heroId: number
  name: string
  heroClass: string
  level: number
  paragonLevel: number
  seasonal: boolean
  hardcore: boolean
  dead: boolean
  lastUpdated?: number
  gender: number

  // Detailed info (populated by getHeroDetails)
  life?: number
  damage?: number
  toughness?: number
  recovery?: number
  activeSkills: Skill[]
  passiveSkills: Skill[]
  items: Record<string, Item>
  cubePowers?: CubePowers
  legendaryGems: Gem[]
}

export interface HeroSummary {
  heroId: number
  name: string
  heroClass: string
  level: number
  paragonLevel: number
  seasonal: boolean
  hardcore: boolean
  dead: boolean
  lastUpdated?: number
  gender: number
}

// Class name mappings
export const CLASS_NAMES: Record<string, string> = {
  barbarian: 'Barbarian',
  crusader: 'Crusader',
  'demon-hunter': 'Demon Hunter',
  monk: 'Monk',
  necromancer: 'Necromancer',
  'witch-doctor': 'Witch Doctor',
  wizard: 'Wizard'
}

// Slot display names
export const SLOT_NAMES: Record<string, string> = {
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

// All gear slots in display order
export const GEAR_SLOTS = [
  'head',
  'shoulders',
  'neck',
  'torso',
  'hands',
  'waist',
  'wrists',
  'legs',
  'feet',
  'leftFinger',
  'rightFinger',
  'mainHand',
  'offHand'
] as const

export type GearSlot = (typeof GEAR_SLOTS)[number]
