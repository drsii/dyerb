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
import {
  isPassiveSkill,
  checkRingSlotConflicts,
  type ValidationWarning
} from '@/data/d3Reference'

export interface SkillRecommendation {
  skill: string
  rune: string
  reason: string
}

export interface PassiveRecommendation {
  skill: string
  reason: string
}

export interface SetRecommendation {
  name: string
  pieces: number
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
      {"name": "Set Name", "pieces": 6, "reason": "Why this set and what the 6pc bonus provides"}
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
          sets: parsed.gear?.sets || [],
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
