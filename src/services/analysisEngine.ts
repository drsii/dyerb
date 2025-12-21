/**
 * @file services/analysisEngine.ts
 * @description Gear analysis engine with upgrade suggestions
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type { Hero, Item } from '@/types/hero'
import { SLOT_ITEM_TYPES } from '@/types/item'

export interface GearAnalysis {
  heroId: number
  heroClass: string
  overallScore: number
  slotAnalysis: Record<string, SlotAnalysis>
  missingSlots: string[]
  setAnalysis: SetAnalysis[]
  suggestions: Suggestion[]
}

export interface SlotAnalysis {
  slot: string
  item: Item | null
  quality: string
  hasLegendaryPower: boolean
  gemCount: number
  hasLegendaryGem: boolean
  score: number
}

export interface SetAnalysis {
  setName: string
  piecesEquipped: number
  activeBonuses: string[]
  missingPieces: number
}

export interface Suggestion {
  type: 'upgrade' | 'gem' | 'set' | 'cube' | 'general'
  priority: 'high' | 'medium' | 'low'
  slot?: string
  message: string
}

class AnalysisEngine {
  /**
   * Analyze a hero's complete gear setup
   */
  analyzeHero(hero: Hero): GearAnalysis {
    const slotAnalysis = this.analyzeSlots(hero.items)
    const missingSlots = this.findMissingSlots(hero.items)
    const setAnalysis = this.analyzeSets(hero.items)
    const suggestions = this.generateSuggestions(hero, slotAnalysis, setAnalysis, missingSlots)

    const overallScore = this.calculateOverallScore(slotAnalysis)

    return {
      heroId: hero.heroId,
      heroClass: hero.heroClass,
      overallScore,
      slotAnalysis,
      missingSlots,
      setAnalysis,
      suggestions
    }
  }

  /**
   * Analyze each gear slot
   */
  private analyzeSlots(items: Record<string, Item>): Record<string, SlotAnalysis> {
    const analysis: Record<string, SlotAnalysis> = {}
    const allSlots = Object.keys(SLOT_ITEM_TYPES)

    for (const slot of allSlots) {
      const item = items[slot] || null

      if (!item) {
        analysis[slot] = {
          slot,
          item: null,
          quality: 'empty',
          hasLegendaryPower: false,
          gemCount: 0,
          hasLegendaryGem: false,
          score: 0
        }
        continue
      }

      const gemCount = item.gems?.length || 0
      const hasLegendaryGem = item.gems?.some(g => g.isLegendary) || false

      let score = 0
      if (item.quality === 'set') score = 100
      else if (item.quality === 'legendary') score = 80
      else if (item.quality === 'rare') score = 40
      else if (item.quality === 'magic') score = 20
      else score = 10

      // Bonus for legendary power
      if (item.legendaryPower) score += 10

      // Bonus for gems
      score += gemCount * 5
      if (hasLegendaryGem) score += 15

      analysis[slot] = {
        slot,
        item,
        quality: item.quality,
        hasLegendaryPower: !!item.legendaryPower,
        gemCount,
        hasLegendaryGem,
        score: Math.min(100, score)
      }
    }

    return analysis
  }

  /**
   * Find empty gear slots
   */
  private findMissingSlots(items: Record<string, Item>): string[] {
    const allSlots = Object.keys(SLOT_ITEM_TYPES)
    return allSlots.filter(slot => !items[slot])
  }

  /**
   * Analyze equipped sets
   */
  private analyzeSets(items: Record<string, Item>): SetAnalysis[] {
    const setCounts = new Map<string, { count: number; items: Item[] }>()

    for (const item of Object.values(items)) {
      if (item.setName) {
        const existing = setCounts.get(item.setName) || { count: 0, items: [] }
        existing.count++
        existing.items.push(item)
        setCounts.set(item.setName, existing)
      }
    }

    const analysis: SetAnalysis[] = []

    for (const [setName, data] of setCounts) {
      // Standard set bonuses are at 2, 4, 6 pieces
      const bonuses: string[] = []
      if (data.count >= 2) bonuses.push('2-piece bonus active')
      if (data.count >= 4) bonuses.push('4-piece bonus active')
      if (data.count >= 6) bonuses.push('6-piece bonus active')

      // Most sets have 6 pieces
      const maxPieces = 6
      const missingPieces = Math.max(0, maxPieces - data.count)

      analysis.push({
        setName,
        piecesEquipped: data.count,
        activeBonuses: bonuses,
        missingPieces
      })
    }

    return analysis.sort((a, b) => b.piecesEquipped - a.piecesEquipped)
  }

  /**
   * Generate upgrade suggestions
   */
  private generateSuggestions(
    hero: Hero,
    slotAnalysis: Record<string, SlotAnalysis>,
    setAnalysis: SetAnalysis[],
    missingSlots: string[]
  ): Suggestion[] {
    const suggestions: Suggestion[] = []

    // Check for empty slots
    for (const slot of missingSlots) {
      suggestions.push({
        type: 'upgrade',
        priority: 'high',
        slot,
        message: `Empty slot: ${slot}. Equip a legendary item here.`
      })
    }

    // Check for non-legendary items
    for (const [slot, analysis] of Object.entries(slotAnalysis)) {
      if (analysis.item && analysis.quality !== 'legendary' && analysis.quality !== 'set') {
        suggestions.push({
          type: 'upgrade',
          priority: 'high',
          slot,
          message: `${slot}: Replace ${analysis.quality} item with a legendary.`
        })
      }
    }

    // Check for missing legendary gems
    const jewelrySlots = ['neck', 'leftFinger', 'rightFinger']
    for (const slot of jewelrySlots) {
      const analysis = slotAnalysis[slot]
      if (analysis?.item && !analysis.hasLegendaryGem) {
        suggestions.push({
          type: 'gem',
          priority: 'medium',
          slot,
          message: `${analysis.item.slot}: Add a legendary gem to this jewelry piece.`
        })
      }
    }

    // Check for incomplete sets close to bonus threshold
    for (const set of setAnalysis) {
      if (set.piecesEquipped === 1 || set.piecesEquipped === 3 || set.piecesEquipped === 5) {
        const nextBonus = set.piecesEquipped + 1
        suggestions.push({
          type: 'set',
          priority: 'medium',
          message: `${set.setName}: Add 1 more piece for the ${nextBonus}-piece bonus.`
        })
      }
    }

    // Check Kanai's Cube
    if (!hero.cubePowers?.weapon) {
      suggestions.push({
        type: 'cube',
        priority: 'medium',
        message: "Kanai's Cube: Extract a weapon power."
      })
    }
    if (!hero.cubePowers?.armor) {
      suggestions.push({
        type: 'cube',
        priority: 'medium',
        message: "Kanai's Cube: Extract an armor power."
      })
    }
    if (!hero.cubePowers?.jewelry) {
      suggestions.push({
        type: 'cube',
        priority: 'medium',
        message: "Kanai's Cube: Extract a jewelry power."
      })
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }

  /**
   * Calculate overall gear score
   */
  private calculateOverallScore(slotAnalysis: Record<string, SlotAnalysis>): number {
    const slots = Object.values(slotAnalysis)
    if (slots.length === 0) return 0

    const totalScore = slots.reduce((sum, s) => sum + s.score, 0)
    return Math.round(totalScore / slots.length)
  }
}

export const analysisEngine = new AnalysisEngine()
