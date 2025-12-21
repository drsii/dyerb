/**
 * @file services/claudeAnalysis.ts
 * @description Claude AI service for build recommendations
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { useSettingsStore } from '@/stores/settings'
import type { Hero } from '@/types/hero'

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
  estimatedMultiplier: string
  rating: StatRating
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

    return this.parseResponse(content)
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
- **Active Skills**: ${activeSkills}
- **Passive Skills**: ${passiveSkills}
- **Equipped Sets**: ${setsInfo}
- **Kanai's Cube**: ${cubePowers}
- **Legendary Gems**: ${legendaryGems}

## Stats
- **Damage**: ${hero.damage?.toLocaleString() || 'Unknown'}
- **Toughness**: ${hero.toughness?.toLocaleString() || 'Unknown'}
- **Recovery**: ${hero.recovery?.toLocaleString() || 'Unknown'}
- **Life**: ${hero.life?.toLocaleString() || 'Unknown'}

Based on this ${hero.heroClass}'s current setup and paragon level, provide build recommendations optimized for efficient Greater Rift pushing and farming.

Respond with a JSON object in this exact format (no markdown, just raw JSON):
{
  "skills": {
    "active": [
      {"skill": "Skill Name", "rune": "Rune Name", "reason": "Why this skill"}
    ],
    "passive": [
      {"skill": "Passive Name", "reason": "Why this passive"}
    ]
  },
  "gear": {
    "sets": [
      {"name": "Set Name", "pieces": 6, "reason": "Why this set"}
    ],
    "items": [
      {"slot": "mainHand", "item": "Item Name", "reason": "Why this item"}
    ],
    "cubePowers": {
      "weapon": {"name": "Weapon Power Name", "reason": "Why this power and what stat/effect it provides"},
      "armor": {"name": "Armor Power Name", "reason": "Why this power and what stat/effect it provides"},
      "jewelry": {"name": "Jewelry Power Name", "reason": "Why this power and what stat/effect it provides"}
    }
  },
  "gems": [
    {"name": "Gem Name", "priority": 1, "reason": "Why this gem"}
  ],
  "playstyle": "Brief description of how to play this build",
  "farmingPriority": ["First item to farm", "Second item to farm"],
  "summary": "One paragraph summary of the recommended build and why",
  "projectedImprovements": {
    "damage": {"estimatedMultiplier": "2-3x", "rating": "major", "note": "Optional context"},
    "toughness": {"estimatedMultiplier": "1.5x", "rating": "moderate"},
    "recovery": {"estimatedMultiplier": "2x", "rating": "moderate"},
    "life": {"estimatedMultiplier": "1.2x", "rating": "minor"},
    "grTierPotential": {"current": "GR 70-80", "projected": "GR 100-110", "note": "With full set and optimized gems"}
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
        estimatedMultiplier: String(s.estimatedMultiplier || 'N/A'),
        rating: this.validateRating(s.rating),
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
}

export const claudeAnalysisService = new ClaudeAnalysisService()
