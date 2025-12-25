/**
 * @file services/claudeAnalysis.ts
 * @description Claude AI service for build recommendations
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { useSettingsStore } from '@/stores/settings'
import type { Hero } from '@/types/hero'
import type {
  TieredUpgrades,
  ProgressionPath,
  UpgradeStep,
  ItemAcquisition,
  DifficultyTier
} from '@/types/progression'
import type { MetaBuildReference } from '@/types/maxroll'
import {
  isPassiveSkill,
  checkRingSlotConflicts,
  SET_BONUSES,
  getItemAcquisition,
  type ValidationWarning
} from '@/data/d3Reference'
import { FARMING_METHOD_INFO } from '@/types/progression'

export interface SkillRecommendation {
  skill: string
  rune: string
  reason: string
}

export interface PassiveRecommendation {
  skill: string
  reason: string
}

export interface SetBonusTier {
  pieces: number
  bonus: string
}

export interface SetRecommendation {
  name: string
  pieces: number
  bonuses?: SetBonusTier[]
  reason: string
}

export interface ItemRecommendation {
  slot: string
  item: string
  reason: string
}

export interface CubePower {
  name: string
  reason: string
}

export interface CubePowerRecommendation {
  weapon: CubePower
  armor: CubePower
  jewelry: CubePower
}

export interface GemRecommendation {
  name: string
  priority: number
  reason: string
}

export type StatRating = 'minor' | 'moderate' | 'major' | 'transformative'

export interface StatProjection {
  current: number | null
  projectedValue?: number
  estimatedMultiplier: string
  rating: StatRating
  justification?: string
  note?: string
}

export interface GRTierProjection {
  current: string
  projected: string
  note?: string
}

export interface ProjectedImprovements {
  damage: StatProjection
  toughness: StatProjection
  recovery: StatProjection
  life: StatProjection
  grTierPotential: GRTierProjection
}

export interface BuildRecommendation {
  skills: {
    active: SkillRecommendation[]
    passive: PassiveRecommendation[]
  }
  gear: {
    sets: SetRecommendation[]
    items: ItemRecommendation[]
    cubePowers: CubePowerRecommendation
  }
  gems: GemRecommendation[]
  playstyle: string
  farmingPriority: string[]
  summary: string
  projectedImprovements?: ProjectedImprovements
  validationWarnings?: ValidationWarning[]
}

/**
 * Enhanced build recommendation with tiered upgrades and progression path
 */
export interface EnhancedBuildRecommendation extends BuildRecommendation {
  tieredUpgrades: TieredUpgrades
  progressionPath: ProgressionPath
  metaBuildReference?: MetaBuildReference
}

/**
 * Options for enhanced analysis
 */
export interface AnalysisOptions {
  useMetaBuilds: boolean
  focusOnSurvivability: boolean
}

class ClaudeAnalysisService {
  private readonly API_URL = 'https://api.anthropic.com/v1/messages'

  /**
   * Generate build recommendations for a hero
   */
  async analyzeHero(hero: Hero): Promise<BuildRecommendation> {
    const settings = useSettingsStore()

    if (!settings.claudeApiKey) {
      throw new Error('Claude API key not configured. Add it in Settings.')
    }

    const prompt = this.buildPrompt(hero)

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      if (response.status === 401) {
        throw new Error('Invalid Claude API key. Please check your settings.')
      }
      if (response.status === 429) {
        throw new Error('Rate limited. Please try again in a moment.')
      }
      throw new Error(error.error?.message || `Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      throw new Error('No response from Claude')
    }

    const recommendation = this.parseResponse(content)

    // Validate the response and attach warnings
    recommendation.validationWarnings = this.validateResponse(recommendation, hero.heroClass)

    return recommendation
  }

  /**
   * Generate enhanced build recommendations with tiered upgrades and progression path
   */
  async analyzeHeroEnhanced(
    hero: Hero,
    options: AnalysisOptions,
    metaBuild?: MetaBuildReference
  ): Promise<EnhancedBuildRecommendation> {
    const settings = useSettingsStore()

    if (!settings.claudeApiKey) {
      throw new Error('Claude API key not configured. Add it in Settings.')
    }

    const prompt = this.buildEnhancedPrompt(hero, options, metaBuild)

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192, // Larger for tiered output
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      if (response.status === 401) {
        throw new Error('Invalid Claude API key. Please check your settings.')
      }
      if (response.status === 429) {
        throw new Error('Rate limited. Please try again in a moment.')
      }
      throw new Error(error.error?.message || `Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      throw new Error('No response from Claude')
    }

    const recommendation = this.parseEnhancedResponse(content)

    // Validate the response and attach warnings
    recommendation.validationWarnings = this.validateResponse(recommendation, hero.heroClass)

    // Attach meta build reference if provided
    if (metaBuild) {
      recommendation.metaBuildReference = metaBuild
    }

    return recommendation
  }

  /**
   * Build enhanced prompt with tiered upgrade requirements
   */
  private buildEnhancedPrompt(
    hero: Hero,
    options: AnalysisOptions,
    metaBuild?: MetaBuildReference
  ): string {
    // Build the base hero info section
    const basePrompt = this.buildPrompt(hero)

    // Add meta build context if available
    let metaContext = ''
    if (metaBuild) {
      metaContext = `
## Meta Build Reference (from Maxroll.gg)
**Build**: ${metaBuild.buildName} (${metaBuild.tier}-Tier)
**Guide**: ${metaBuild.guideUrl}
${metaBuild.coreItems.length > 0 ? `**Core Items**: ${metaBuild.coreItems.join(', ')}` : ''}
${metaBuild.keySynergies.length > 0 ? `**Key Synergies**: ${metaBuild.keySynergies.join(', ')}` : ''}

Use this meta build as reference for optimal recommendations.
`
    }

    // Build farming methods info
    const farmingInfo = Object.entries(FARMING_METHOD_INFO)
      .map(([_method, info]) => `- **${info.label}**: ${info.description}`)
      .join('\n')

    return `${basePrompt}

${metaContext}

## ADDITIONAL REQUIREMENTS: Tiered Upgrade Progression

You must also provide upgrade recommendations categorized by estimated farming time.
${options.focusOnSurvivability ? '**HARDCORE MODE**: Prioritize survivability in all recommendations.' : ''}

### Time-Based Tiers:
- **Quick** (< 1 hour): Craftable items, easy Kadala gambles, common legendary drops
- **Medium** (1-5 hours): Specific set pieces, targeted legendaries, gems to rank 25
- **Long** (5+ hours): Ancient/Primal versions, rare items, gems to rank 80+

### Farming Methods Reference:
${farmingInfo}

For each upgrade step, provide:
1. Item name and slot
2. Best farming method
3. Approximate cost (blood shards or Death's Breath if applicable)
4. Power increase rating (minor/moderate/major/transformative)
5. Dependencies (what needs to be obtained first)
6. What this upgrade unlocks or enables

### Response Format

Include these additional fields in your JSON response:

{
  // ... all previous fields ...

  "tieredUpgrades": {
    "quick": [
      {
        "id": "captain-crimson",
        "priority": 1,
        "item": {
          "itemName": "Captain Crimson's Trimmings (3pc)",
          "slot": "waist,legs",
          "methods": ["crafting"],
          "primaryMethod": "crafting",
          "estimatedTime": "quick",
          "bountyMaterialsRequired": true,
          "notes": "Craft at blacksmith after getting recipe from bounty cache"
        },
        "reason": "20% CDR and damage/toughness scaling with CDR/RCR",
        "powerIncrease": "major",
        "dependsOn": [],
        "unlocks": ["Can drop Focus/Restraint for more flexibility"]
      }
    ],
    "medium": [
      {
        "id": "core-weapon",
        "priority": 1,
        "item": {
          "itemName": "Scythe of the Cycle",
          "slot": "mainHand",
          "methods": ["cube_upgrade", "kadala"],
          "primaryMethod": "cube_upgrade",
          "estimatedTime": "medium",
          "deathsBreathCost": 25
        },
        "reason": "400% damage to secondary skills - build defining",
        "powerIncrease": "transformative",
        "dependsOn": [],
        "unlocks": ["Enables Bone Spear build"]
      }
    ],
    "long": [
      {
        "id": "ancient-weapon",
        "priority": 1,
        "item": {
          "itemName": "Ancient Scythe of the Cycle",
          "slot": "mainHand",
          "methods": ["cube_reforge"],
          "primaryMethod": "cube_reforge",
          "estimatedTime": "long",
          "forgottenSoulCost": 50,
          "bountyMaterialsRequired": true
        },
        "reason": "30% more stats than non-ancient",
        "powerIncrease": "moderate",
        "dependsOn": ["core-weapon"],
        "unlocks": ["Higher GR potential"]
      }
    ]
  },
  "progressionPath": {
    "currentPhase": "Early gearing - missing core set pieces",
    "steps": [
      {
        "id": "step-1",
        "priority": 1,
        "item": { /* same format as above */ },
        "reason": "First priority because...",
        "powerIncrease": "major"
      }
    ],
    "totalEstimatedTime": "~8-12 hours",
    "criticalPath": ["captain-crimson", "core-weapon", "ring-of-royal-grandeur"]
  }
}`
  }

  /**
   * Build the analysis prompt for Claude
   */
  private buildPrompt(hero: Hero): string {
    const activeSkills = hero.activeSkills
      .map(s => `${s.name}${s.rune ? ` (${s.rune})` : ''}`)
      .join(', ') || 'None equipped'

    const passiveSkills = hero.passiveSkills
      .map(s => s.name)
      .join(', ') || 'None equipped'

    const equippedSets = new Map<string, number>()
    for (const item of Object.values(hero.items)) {
      if (item.setName) {
        equippedSets.set(item.setName, (equippedSets.get(item.setName) || 0) + 1)
      }
    }
    const setsInfo = equippedSets.size > 0
      ? Array.from(equippedSets.entries())
          .map(([name, count]) => `${name} (${count} pieces)`)
          .join(', ')
      : 'No set items equipped'

    const cubePowers = hero.cubePowers
      ? `Weapon: ${hero.cubePowers.weapon || 'Empty'}, Armor: ${hero.cubePowers.armor || 'Empty'}, Jewelry: ${hero.cubePowers.jewelry || 'Empty'}`
      : 'Not using Kanai\'s Cube'

    const legendaryGems = hero.legendaryGems.length > 0
      ? hero.legendaryGems.map(g => `${g.name} (Rank ${g.rank || 0})`).join(', ')
      : 'No legendary gems equipped'

    return `You are a Diablo III expert build advisor. Analyze this hero and provide optimal build recommendations.

## Hero Information
- **Class**: ${hero.heroClass}
- **Level**: ${hero.level}
- **Paragon Level**: ${hero.paragonLevel || 0}
- **Seasonal**: ${hero.seasonal ? 'Yes' : 'No'}
- **Hardcore**: ${hero.hardcore ? 'Yes' : 'No'}

## Current Build
- **Active Skills (6 slots)**: ${activeSkills}
- **Passive Skills (4 slots, no runes)**: ${passiveSkills}
- **Equipped Sets**: ${setsInfo}
- **Kanai's Cube**: ${cubePowers}
- **Legendary Gems**: ${legendaryGems}

## Current Stats (actual values)
- **Damage**: ${hero.damage?.toLocaleString() || 'Unknown'} (${hero.damage || 0} raw)
- **Toughness**: ${hero.toughness?.toLocaleString() || 'Unknown'} (${hero.toughness || 0} raw)
- **Recovery**: ${hero.recovery?.toLocaleString() || 'Unknown'} (${hero.recovery || 0} raw)
- **Life**: ${hero.life?.toLocaleString() || 'Unknown'} (${hero.life || 0} raw)

## CRITICAL ACCURACY RULES - READ CAREFULLY

1. **SKILL TYPES**:
   - Active skills have rune options (6 slots). Examples: Bone Spear, Corpse Lance, Death Nova
   - Passive skills do NOT have runes (4 slots). Examples: Bone Prison, Final Service, Swift Harvesting
   - NEVER recommend a passive skill in the "active" skills array
   - NEVER give a passive skill a rune

2. **EQUIPMENT SLOT CONSTRAINTS**:
   - The hero has exactly 2 ring slots and 1 amulet slot
   - Focus + Restraint uses BOTH ring slots - you CANNOT also use Compass Rose
   - The Traveler's Pledge + The Compass Rose (Endless Walk set) uses amulet + 1 ring slot
   - Check that your ring/amulet recommendations don't exceed available slots

3. **ITEM EFFECTS - BE ACCURATE**:
   - Only describe the ACTUAL legendary power, not invented effects
   - Scythe of the Cycle: "+400% secondary skill damage while Bone Armor active, reduces Bone Armor duration by 4 sec per cast"
   - Lost Time: "Cold skills reduce enemy movement speed by 30%, gain 8% movement speed per enemy hit"
   - Krysbin's Sentence: "75-100% increased damage vs slowed, 300-400% vs stunned/frozen/charmed"
   - If you're unsure of an item's exact effect, say so rather than inventing one

4. **PROJECTION CALCULATIONS**:
   - You MUST calculate actual projected stat values based on the current values provided
   - Show your math: cite specific set bonuses, legendary powers, and multipliers
   - The multiplier must be consistent with (projectedValue / currentValue)
   - Example: Current damage 1,000,000 with ~8x multiplier means projectedValue should be ~8,000,000

5. **SET BONUSES - INCLUDE ALL TIERS**:
   - For each set you recommend, list ALL bonus tiers the player will receive
   - If recommending 6 pieces: include 2pc, 4pc, AND 6pc bonuses
   - If recommending 4 pieces: include 2pc AND 4pc bonuses
   - Some sets have 2pc and 3pc bonuses (Captain Crimson's, Sage's Journey, Aughild's)
   - You can recommend multiple sets (e.g., 6pc Inarius + 3pc Captain Crimson using Ring of Royal Grandeur)
   - Ring of Royal Grandeur reduces set requirements by 1 (5pc counts as 6pc bonus)

Based on this ${hero.heroClass}'s current setup and paragon level, provide build recommendations optimized for ${hero.hardcore ? 'hardcore survivability and' : ''} efficient Greater Rift pushing and farming.

Respond with a JSON object in this exact format (no markdown, just raw JSON):
{
  "skills": {
    "active": [
      {"skill": "Active Skill Name", "rune": "Rune Name", "reason": "Why this skill and what it does"}
    ],
    "passive": [
      {"skill": "Passive Skill Name", "reason": "Why this passive (NO rune field - passives don't have runes)"}
    ]
  },
  "gear": {
    "sets": [
      {
        "name": "Grace of Inarius",
        "pieces": 6,
        "bonuses": [
          {"pieces": 2, "bonus": "Bone Armor damage is increased by 1000%"},
          {"pieces": 4, "bonus": "Bone Armor grants 3% damage reduction per enemy hit"},
          {"pieces": 6, "bonus": "Bone Armor tornado deals 1000% damage, enemies take 10,000% more damage from you"}
        ],
        "reason": "Core damage set for bone skill builds"
      }
    ],
    "items": [
      {"slot": "mainHand", "item": "Item Name", "reason": "The ACTUAL legendary power this item provides"}
    ],
    "cubePowers": {
      "weapon": {"name": "Weapon Power Name", "reason": "The ACTUAL effect: e.g., '+400% secondary damage while Bone Armor active'"},
      "armor": {"name": "Armor Power Name", "reason": "The ACTUAL effect: e.g., '50% damage reduction above 90% resource'"},
      "jewelry": {"name": "Jewelry Power Name", "reason": "The ACTUAL effect with specific percentages"}
    }
  },
  "gems": [
    {"name": "Gem Name", "priority": 1, "reason": "Why this gem and its effect at rank 25+"}
  ],
  "playstyle": "Brief description of how to play this build including skill rotation",
  "farmingPriority": ["Most important item to farm first", "Second priority"],
  "summary": "One paragraph summary of the recommended build and why it works for this character",
  "projectedImprovements": {
    "damage": {
      "projectedValue": 8000000,
      "estimatedMultiplier": "~8x",
      "rating": "major",
      "justification": "Inarius 6pc (10,000% bone skill damage) + Focus/Restraint (2.25x) provides massive multiplicative scaling"
    },
    "toughness": {
      "projectedValue": 50000000,
      "estimatedMultiplier": "~2.5x",
      "rating": "moderate",
      "justification": "Aquila Cuirass (50% DR) and proper armor rolls increase survivability"
    },
    "recovery": {
      "projectedValue": 1200000,
      "estimatedMultiplier": "~1.6x",
      "rating": "moderate",
      "justification": "Life per hit on gear and Esoteric Alteration gem"
    },
    "life": {
      "projectedValue": 800000,
      "estimatedMultiplier": "~1.2x",
      "rating": "minor",
      "justification": "Vitality rolls on gear"
    },
    "grTierPotential": {
      "current": "GR 70-75",
      "projected": "GR 100-110",
      "note": "With complete set, level 80+ gems, and optimized gear"
    }
  }
}`
  }

  /**
   * Normalize projected improvements with defaults for missing data
   */
  private normalizeProjections(projections: unknown): ProjectedImprovements | undefined {
    if (!projections || typeof projections !== 'object') {
      return undefined
    }

    const p = projections as Record<string, unknown>

    const normalizeStatProjection = (stat: unknown): StatProjection => {
      const defaultStat: StatProjection = {
        current: null,
        estimatedMultiplier: 'N/A',
        rating: 'minor'
      }

      if (!stat || typeof stat !== 'object') {
        return defaultStat
      }

      const s = stat as Record<string, unknown>
      return {
        current: typeof s.current === 'number' ? s.current : null,
        projectedValue: typeof s.projectedValue === 'number' ? s.projectedValue : undefined,
        estimatedMultiplier: String(s.estimatedMultiplier || 'N/A'),
        rating: this.validateRating(s.rating),
        justification: s.justification ? String(s.justification) : undefined,
        note: s.note ? String(s.note) : undefined
      }
    }

    const normalizeGRProjection = (gr: unknown): GRTierProjection => {
      const defaultGR: GRTierProjection = {
        current: 'Unknown',
        projected: 'Unknown'
      }

      if (!gr || typeof gr !== 'object') {
        return defaultGR
      }

      const g = gr as Record<string, unknown>
      return {
        current: String(g.current || 'Unknown'),
        projected: String(g.projected || 'Unknown'),
        note: g.note ? String(g.note) : undefined
      }
    }

    return {
      damage: normalizeStatProjection(p.damage),
      toughness: normalizeStatProjection(p.toughness),
      recovery: normalizeStatProjection(p.recovery),
      life: normalizeStatProjection(p.life),
      grTierPotential: normalizeGRProjection(p.grTierPotential)
    }
  }

  /**
   * Validate stat rating value
   */
  private validateRating(rating: unknown): StatRating {
    const validRatings: StatRating[] = ['minor', 'moderate', 'major', 'transformative']
    if (typeof rating === 'string' && validRatings.includes(rating as StatRating)) {
      return rating as StatRating
    }
    return 'minor'
  }

  /**
   * Normalize cube powers to handle both old string format and new object format
   */
  private normalizeCubePowers(powers: unknown): CubePowerRecommendation {
    const empty: CubePower = { name: '', reason: '' }

    if (!powers) {
      return { weapon: empty, armor: empty, jewelry: empty }
    }

    const normalize = (value: unknown): CubePower => {
      if (typeof value === 'string') {
        return { name: value, reason: '' }
      }
      if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>
        return {
          name: String(obj.name || ''),
          reason: String(obj.reason || '')
        }
      }
      return empty
    }

    const p = powers as Record<string, unknown>
    return {
      weapon: normalize(p.weapon),
      armor: normalize(p.armor),
      jewelry: normalize(p.jewelry)
    }
  }

  /**
   * Normalize set recommendations and add bonus tiers from reference data if missing
   */
  private normalizeSets(sets: unknown[]): SetRecommendation[] {
    if (!Array.isArray(sets)) return []

    return sets.map(set => {
      if (!set || typeof set !== 'object') {
        return { name: '', pieces: 0, reason: '' }
      }

      const s = set as Record<string, unknown>
      const name = String(s.name || '')
      const pieces = typeof s.pieces === 'number' ? s.pieces : 0
      const reason = String(s.reason || '')

      // If bonuses are provided, use them
      if (Array.isArray(s.bonuses) && s.bonuses.length > 0) {
        return {
          name,
          pieces,
          bonuses: s.bonuses.map((b: unknown) => {
            const bonus = b as Record<string, unknown>
            return {
              pieces: typeof bonus.pieces === 'number' ? bonus.pieces : 0,
              bonus: String(bonus.bonus || '')
            }
          }),
          reason
        }
      }

      // Fall back to reference data if available
      const refBonuses = SET_BONUSES[name]
      if (refBonuses) {
        const bonuses = Object.entries(refBonuses)
          .filter(([tierPieces]) => Number(tierPieces) <= pieces)
          .map(([tierPieces, bonus]) => ({
            pieces: Number(tierPieces),
            bonus: String(bonus)
          }))
          .sort((a, b) => a.pieces - b.pieces)

        return { name, pieces, bonuses, reason }
      }

      // No bonuses available
      return { name, pieces, reason }
    })
  }

  /**
   * Parse Claude's response into structured recommendations
   */
  private parseResponse(content: string): BuildRecommendation {
    // Try to extract JSON from the response
    let jsonStr = content.trim()

    // If response contains markdown code blocks, extract the JSON
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    try {
      const parsed = JSON.parse(jsonStr)

      // Validate and return with defaults
      return {
        skills: {
          active: parsed.skills?.active || [],
          passive: parsed.skills?.passive || []
        },
        gear: {
          sets: this.normalizeSets(parsed.gear?.sets || []),
          items: parsed.gear?.items || [],
          cubePowers: this.normalizeCubePowers(parsed.gear?.cubePowers)
        },
        gems: parsed.gems || [],
        playstyle: parsed.playstyle || '',
        farmingPriority: parsed.farmingPriority || [],
        summary: parsed.summary || '',
        projectedImprovements: this.normalizeProjections(parsed.projectedImprovements)
      }
    } catch (e) {
      console.error('Failed to parse Claude response:', e)
      console.log('Raw response:', content)
      throw new Error('Failed to parse build recommendations. Please try again.')
    }
  }

  /**
   * Parse enhanced Claude response with tiered upgrades
   */
  private parseEnhancedResponse(content: string): EnhancedBuildRecommendation {
    // Parse base recommendation first
    const baseRec = this.parseResponse(content)

    // Extract JSON for enhanced fields
    let jsonStr = content.trim()
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    try {
      const parsed = JSON.parse(jsonStr)

      // Normalize tiered upgrades
      const tieredUpgrades = this.normalizeTieredUpgrades(parsed.tieredUpgrades)

      // Normalize progression path
      const progressionPath = this.normalizeProgressionPath(parsed.progressionPath)

      return {
        ...baseRec,
        tieredUpgrades,
        progressionPath
      }
    } catch (e) {
      console.error('Failed to parse enhanced response, using defaults:', e)

      // Return base recommendation with empty tiered upgrades
      return {
        ...baseRec,
        tieredUpgrades: { quick: [], medium: [], long: [] },
        progressionPath: {
          currentPhase: 'Analysis in progress',
          steps: [],
          totalEstimatedTime: 'Unknown',
          criticalPath: []
        }
      }
    }
  }

  /**
   * Normalize tiered upgrades from Claude response
   */
  private normalizeTieredUpgrades(upgrades: unknown): TieredUpgrades {
    const empty: TieredUpgrades = { quick: [], medium: [], long: [] }

    if (!upgrades || typeof upgrades !== 'object') {
      return empty
    }

    const u = upgrades as Record<string, unknown>

    return {
      quick: this.normalizeUpgradeSteps(u.quick, 'quick'),
      medium: this.normalizeUpgradeSteps(u.medium, 'medium'),
      long: this.normalizeUpgradeSteps(u.long, 'long')
    }
  }

  /**
   * Normalize an array of upgrade steps
   */
  private normalizeUpgradeSteps(steps: unknown, tier: DifficultyTier): UpgradeStep[] {
    if (!Array.isArray(steps)) return []

    return steps.map((step, index) => {
      if (!step || typeof step !== 'object') {
        return this.createDefaultUpgradeStep(index, tier)
      }

      const s = step as Record<string, unknown>
      const item = this.normalizeItemAcquisition(s.item, tier)

      return {
        id: String(s.id || `${tier}-${index}`),
        priority: typeof s.priority === 'number' ? s.priority : index + 1,
        item,
        reason: String(s.reason || ''),
        powerIncrease: this.validatePowerIncrease(s.powerIncrease),
        dependsOn: Array.isArray(s.dependsOn) ? s.dependsOn.map(String) : undefined,
        unlocks: Array.isArray(s.unlocks) ? s.unlocks.map(String) : undefined
      }
    })
  }

  /**
   * Normalize item acquisition data
   */
  private normalizeItemAcquisition(item: unknown, defaultTier: DifficultyTier): ItemAcquisition {
    if (!item || typeof item !== 'object') {
      return {
        itemName: 'Unknown Item',
        slot: 'unknown',
        methods: ['world_drop'],
        primaryMethod: 'world_drop',
        estimatedTime: defaultTier
      }
    }

    const i = item as Record<string, unknown>
    const itemName = String(i.itemName || '')

    // Try to get additional info from our reference data
    const refData = getItemAcquisition(itemName)

    return {
      itemName,
      slot: String(i.slot || refData.slot || 'unknown'),
      methods: Array.isArray(i.methods) ? i.methods : (refData.methods || ['world_drop']),
      primaryMethod: String(i.primaryMethod || refData.primaryMethod || 'world_drop') as ItemAcquisition['primaryMethod'],
      estimatedTime: this.validateDifficultyTier(i.estimatedTime) || refData.estimatedTime || defaultTier,
      bloodShardCost: typeof i.bloodShardCost === 'number' ? i.bloodShardCost : refData.bloodShardCost,
      deathsBreathCost: typeof i.deathsBreathCost === 'number' ? i.deathsBreathCost : refData.deathsBreathCost,
      forgottenSoulCost: typeof i.forgottenSoulCost === 'number' ? i.forgottenSoulCost : refData.forgottenSoulCost,
      bountyMaterialsRequired: Boolean(i.bountyMaterialsRequired || refData.bountyMaterialsRequired),
      craftingRecipeSource: i.craftingRecipeSource ? String(i.craftingRecipeSource) : refData.craftingRecipeSource,
      dropLocations: Array.isArray(i.dropLocations) ? i.dropLocations.map(String) : refData.dropLocations,
      notes: i.notes ? String(i.notes) : refData.notes
    }
  }

  /**
   * Create a default upgrade step
   */
  private createDefaultUpgradeStep(index: number, tier: DifficultyTier): UpgradeStep {
    return {
      id: `${tier}-${index}`,
      priority: index + 1,
      item: {
        itemName: 'Unknown Item',
        slot: 'unknown',
        methods: ['world_drop'],
        primaryMethod: 'world_drop',
        estimatedTime: tier
      },
      reason: 'Upgrade recommended',
      powerIncrease: 'moderate'
    }
  }

  /**
   * Normalize progression path from Claude response
   */
  private normalizeProgressionPath(path: unknown): ProgressionPath {
    const empty: ProgressionPath = {
      currentPhase: 'Starting out',
      steps: [],
      totalEstimatedTime: 'Unknown',
      criticalPath: []
    }

    if (!path || typeof path !== 'object') {
      return empty
    }

    const p = path as Record<string, unknown>

    return {
      currentPhase: String(p.currentPhase || 'Starting out'),
      steps: this.normalizeUpgradeSteps(p.steps, 'medium'),
      totalEstimatedTime: String(p.totalEstimatedTime || 'Unknown'),
      criticalPath: Array.isArray(p.criticalPath) ? p.criticalPath.map(String) : []
    }
  }

  /**
   * Validate difficulty tier value
   */
  private validateDifficultyTier(tier: unknown): DifficultyTier | null {
    const validTiers: DifficultyTier[] = ['quick', 'medium', 'long']
    if (typeof tier === 'string' && validTiers.includes(tier as DifficultyTier)) {
      return tier as DifficultyTier
    }
    return null
  }

  /**
   * Validate power increase rating
   */
  private validatePowerIncrease(power: unknown): UpgradeStep['powerIncrease'] {
    const valid = ['minor', 'moderate', 'major', 'transformative']
    if (typeof power === 'string' && valid.includes(power)) {
      return power as UpgradeStep['powerIncrease']
    }
    return 'moderate'
  }

  /**
   * Validate the AI response for common errors
   * Returns an array of warnings that can be displayed to the user
   */
  private validateResponse(
    recommendation: BuildRecommendation,
    heroClass: string
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = []

    // Check for passive skills incorrectly placed in active slots
    for (const activeSkill of recommendation.skills.active) {
      if (isPassiveSkill(heroClass, activeSkill.skill)) {
        warnings.push({
          type: 'skill_type_error',
          message: `"${activeSkill.skill}" is a passive skill, not an active skill. It should not have a rune.`,
          severity: 'error'
        })
      }
    }

    // Check for ring slot conflicts
    const recommendedSets = recommendation.gear.sets.map(s => s.name)
    const ringItems = recommendation.gear.items
      .filter(i => i.slot === 'leftFinger' || i.slot === 'rightFinger' || i.slot === 'ring1' || i.slot === 'ring2')
      .map(i => i.item)

    // Add ring items to the set check
    const allRingRelated = [...recommendedSets, ...ringItems]
    const conflicts = checkRingSlotConflicts(allRingRelated)

    if (conflicts) {
      warnings.push({
        type: 'slot_conflict',
        message: `Ring slot conflict: Cannot equip both ${conflicts.join(' and ')} - only 2 ring slots available.`,
        severity: 'error'
      })
    }

    // Check for Endless Walk + Focus/Restraint conflict
    const hasEndlessWalk = allRingRelated.some(name =>
      name.toLowerCase().includes('traveler') ||
      name.toLowerCase().includes('compass rose') ||
      name.toLowerCase().includes('endless walk')
    )
    const hasFocusRestraint = allRingRelated.some(name =>
      name.toLowerCase().includes('focus') ||
      name.toLowerCase().includes('restraint')
    )

    if (hasEndlessWalk && hasFocusRestraint) {
      warnings.push({
        type: 'slot_conflict',
        message: 'Cannot use Endless Walk set (Traveler\'s Pledge + Compass Rose) with Focus and Restraint - both require ring slots.',
        severity: 'error'
      })
    }

    return warnings
  }
}

export const claudeAnalysisService = new ClaudeAnalysisService()
