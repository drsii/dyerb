/**
 * @file types/api.ts
 * @description Battle.net API response type definitions
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

export type Region = 'us' | 'eu' | 'kr' | 'tw'

export interface ApiError {
  code: string
  type: string
  detail: string
}

// OAuth token response
export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope?: string
}

// Profile API responses
export interface ProfileResponse {
  battleTag: string
  paragonLevel: number
  paragonLevelHardcore: number
  paragonLevelSeason: number
  paragonLevelSeasonHardcore: number
  guildName?: string
  heroes: HeroApiResponse[]
  lastHeroPlayed: number
  lastUpdated: number
  kills: {
    monsters: number
    elites: number
    hardcoreMonsters: number
  }
  highestHardcoreLevel: number
  timePlayed: Record<string, number>
  progression: {
    act1: boolean
    act2: boolean
    act3: boolean
    act4: boolean
    act5: boolean
  }
  seasonalProfiles: Record<string, unknown>
}

export interface HeroApiResponse {
  id: number
  name: string
  class: string
  classSlug?: string
  gender: number
  level: number
  paragonLevel: number
  kills: {
    elites: number
  }
  hardcore: boolean
  seasonal: boolean
  dead: boolean
  'last-updated': number
}

// Hero detail API response
export interface HeroDetailResponse {
  id: number
  name: string
  class: string
  gender: number
  level: number
  paragonLevel: number
  hardcore: boolean
  seasonal: boolean
  dead: boolean
  'last-updated': number
  alive?: boolean
  stats: {
    life: number
    damage: number
    toughness: number
    healing: number
    attackSpeed: number
    armor: number
    strength: number
    dexterity: number
    vitality: number
    intelligence: number
    physicalResist: number
    fireResist: number
    coldResist: number
    lightningResist: number
    poisonResist: number
    arcaneResist: number
    critDamage: number
    blockChance: number
    blockAmountMin: number
    blockAmountMax: number
    damageIncrease: number
    critChance: number
    damageReduction: number
    thorns: number
    lifeSteal: number
    lifePerKill: number
    goldFind: number
    magicFind: number
    lifeOnHit: number
    primaryResource: number
    secondaryResource: number
  }
  skills: {
    active: SkillSlotResponse[]
    passive: PassiveSkillResponse[]
  }
  items: Record<string, ItemApiResponse>
  followers: Record<string, FollowerResponse>
  legendaryPowers: LegendaryPowerResponse[]
  progression?: {
    act1: { completed: boolean }
    act2: { completed: boolean }
    act3: { completed: boolean }
    act4: { completed: boolean }
    act5: { completed: boolean }
  }
}

export interface SkillSlotResponse {
  skill?: {
    slug: string
    name: string
    icon: string
    level: number
    tooltipUrl: string
    description: string
    descriptionHtml?: string
    flavorText?: string
  }
  rune?: {
    slug: string
    type: string
    name: string
    level: number
    description: string
    descriptionHtml?: string
    simpleDescription?: string
    simpleDescriptionHtml?: string
    tooltipParams: string
    orderIndex: number
  }
}

export interface PassiveSkillResponse {
  skill?: {
    slug: string
    name: string
    icon: string
    level: number
    tooltipUrl: string
    description: string
    descriptionHtml?: string
    flavorText?: string
  }
}

export interface ItemApiResponse {
  id: string
  name: string
  icon: string
  displayColor: string // 'green' | 'orange' | 'yellow' | 'blue' | 'white'
  tooltipParams: string
  requiredLevel?: number
  itemLevel?: number
  stackSizeMax?: number
  accountBound?: boolean
  typeName?: string
  type?: {
    twoHanded: boolean
    id: string
  }
  armor?: {
    min: number
    max: number
  }
  dps?: {
    min: number
    max: number
  }
  attacksPerSecond?: {
    min: number
    max: number
  }
  minDamage?: {
    min: number
    max: number
  }
  maxDamage?: {
    min: number
    max: number
  }
  attributes?: {
    primary?: AttributeApiResponse[]
    secondary?: AttributeApiResponse[]
    passive?: AttributeApiResponse[]
  }
  attributesHtml?: {
    primary?: string[]
    secondary?: string[]
  }
  openSockets?: number
  gems?: GemApiResponse[]
  set?: {
    name: string
    slug: string
    description?: string
    descriptionHtml?: string
  }
  setItemsWithBonus?: {
    id: string
    name: string
    path: string
  }[]
  seasonRequiredToDrop?: number
  transmog?: {
    id: string
    name: string
    icon: string
    displayColor: string
    tooltipParams: string
  }
  craftedBy?: {
    id: string
    slug: string
    name: string
    cost: number
  }[]
}

export interface AttributeApiResponse {
  text: string
  textHtml?: string
  affixType?: string
  color?: string
}

export interface GemApiResponse {
  item: {
    id: string
    name: string
    icon: string
    displayColor: string
    tooltipParams: string
  }
  isGem: boolean
  isJewel: boolean
  jewelRank?: number
  jewelSecondaryUnlockRank?: number
  attributes?: AttributeApiResponse[]
  attributesHtml?: {
    primary?: string[]
  }
}

export interface FollowerResponse {
  slug: string
  name?: string
  realName?: string
  portrait?: string
  stats?: Record<string, number>
  skills?: {
    active?: SkillSlotResponse[]
    passive?: PassiveSkillResponse[]
  }
  items?: Record<string, ItemApiResponse>
}

export interface LegendaryPowerResponse {
  id?: string
  name?: string
  icon?: string
  displayColor?: string
  tooltipParams?: string
}

// Hero items endpoint response
export interface HeroItemsResponse {
  [slot: string]: ItemApiResponse
}

