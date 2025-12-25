/**
 * @file services/maxrollParser.ts
 * @description HTML parser for Maxroll.gg tier lists and build guides
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type {
  TierListEntry,
  MaxrollBuildGuide,
  MaxrollGearSlot,
  MaxrollSkillSet,
  MaxrollCubePowers,
  MaxrollGem
} from '@/types/maxroll'

/**
 * Normalize hero class name from Maxroll format
 */
function normalizeHeroClass(className: string): string {
  const normalized = className.toLowerCase().trim()

  // Handle common variations
  const classMap: Record<string, string> = {
    'demon hunter': 'demon-hunter',
    'demonhunter': 'demon-hunter',
    'witch doctor': 'witch-doctor',
    'witchdoctor': 'witch-doctor',
    wd: 'witch-doctor',
    dh: 'demon-hunter',
    necro: 'necromancer',
    wiz: 'wizard',
    barb: 'barbarian',
    sader: 'crusader',
    crus: 'crusader'
  }

  return classMap[normalized] || normalized
}

/**
 * Extract tier from tier list row class or content
 */
function extractTier(element: Element): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  const tierText = element.textContent?.trim().toUpperCase() || ''

  if (tierText.includes('S') || element.classList.contains('tier-s')) return 'S'
  if (tierText.includes('A') || element.classList.contains('tier-a')) return 'A'
  if (tierText.includes('B') || element.classList.contains('tier-b')) return 'B'
  if (tierText.includes('C') || element.classList.contains('tier-c')) return 'C'
  if (tierText.includes('D') || element.classList.contains('tier-d')) return 'D'
  if (tierText.includes('F') || element.classList.contains('tier-f')) return 'F'

  return 'C' // Default to C tier if unknown
}

/**
 * Parse Maxroll D3 tier list page HTML into structured data
 */
export function parseTierListPage(html: string): TierListEntry[] {
  const entries: TierListEntry[] = []

  // Create a DOM parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Maxroll tier lists typically use tables or card-based layouts
  // Look for build entries with links to guides
  const buildLinks = doc.querySelectorAll('a[href*="/d3/build-guides/"]')

  buildLinks.forEach(link => {
    const href = link.getAttribute('href') || ''
    const buildName = link.textContent?.trim() || ''

    if (!buildName || !href) return

    // Try to extract class from URL or parent context
    let heroClass = ''
    const classMatch = href.match(/(barbarian|crusader|demon-hunter|monk|necromancer|witch-doctor|wizard)/i)
    if (classMatch) {
      heroClass = normalizeHeroClass(classMatch[1])
    }

    // Try to find tier from parent row or nearby elements
    let tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F' = 'C'
    const parent = link.closest('tr, .tier-row, .build-card, .tierlist-item')
    if (parent) {
      const tierCell = parent.querySelector('.tier, .tier-label, [class*="tier-"]')
      if (tierCell) {
        tier = extractTier(tierCell)
      }
    }

    // Extract set name from build name if present
    const setMatch = buildName.match(/(Inarius|Rathma|Trag'Oul|Pestilence|Masquerade|Wastes|Immortal King|Ninety Savages|Earth|Unhallowed|Marauder|Natalya|Shadow|GoD|Tal Rasha|Firebird|Vyr|DMO|Inna|Sunwuko|Raiment|Patterns|Akkhan|Invoker|Roland|Seeker|Valor|Zunimassa|Arachyr|Helltooth|Jade)/i)

    entries.push({
      buildName,
      heroClass,
      tier,
      guideUrl: href.startsWith('/') ? `https://maxroll.gg${href}` : href,
      setName: setMatch ? setMatch[1] : undefined
    })
  })

  // Deduplicate entries by guide URL
  const seen = new Set<string>()
  return entries.filter(entry => {
    if (seen.has(entry.guideUrl)) return false
    seen.add(entry.guideUrl)
    return true
  })
}

/**
 * Parse a Maxroll build guide page into structured data
 */
export function parseBuildGuidePage(html: string): MaxrollBuildGuide | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Extract build name from title
  const title = doc.querySelector('h1, .guide-title')?.textContent?.trim() || ''
  if (!title) return null

  // Extract hero class
  let heroClass = ''
  const classMatch = title.match(/(Barbarian|Crusader|Demon Hunter|Monk|Necromancer|Witch Doctor|Wizard)/i)
  if (classMatch) {
    heroClass = normalizeHeroClass(classMatch[1])
  }

  // Extract tier if visible
  const tierElement = doc.querySelector('.tier-badge, .build-tier')
  const tier = tierElement ? extractTier(tierElement) : 'B'

  // Extract skills
  const skills = parseSkills(doc)

  // Extract gear
  const gear = parseGear(doc)

  // Extract Kanai's Cube powers
  const kanaisCube = parseCubePowers(doc)

  // Extract legendary gems
  const legendaryGems = parseLegendaryGems(doc)

  // Extract playstyle/gameplay section
  const playstyleSection = doc.querySelector('.gameplay, .playstyle, #gameplay')
  const playstyle = playstyleSection?.textContent?.trim().slice(0, 500) || ''

  return {
    buildName: title,
    heroClass,
    tier: String(tier),
    guideUrl: '', // Will be set by caller
    gear,
    skills,
    kanaisCube,
    legendaryGems,
    playstyle
  }
}

/**
 * Parse skills section from build guide
 */
function parseSkills(doc: Document): MaxrollSkillSet {
  const active: Array<{ skill: string; rune: string }> = []
  const passive: string[] = []

  // Look for skill sections
  const skillElements = doc.querySelectorAll('.skill-item, .skill-slot, [class*="skill"]')

  skillElements.forEach(el => {
    const skillName = el.querySelector('.skill-name, .name')?.textContent?.trim()
    const runeName = el.querySelector('.rune-name, .rune')?.textContent?.trim()

    if (skillName) {
      // Check if it's marked as passive
      const isPassive = el.classList.contains('passive') ||
        el.closest('.passive-skills, .passives') !== null

      if (isPassive) {
        passive.push(skillName)
      } else if (runeName) {
        active.push({ skill: skillName, rune: runeName })
      }
    }
  })

  return { active, passive }
}

/**
 * Parse gear section from build guide
 */
function parseGear(doc: Document): MaxrollGearSlot[] {
  const gear: MaxrollGearSlot[] = []

  // Look for gear/equipment sections
  const gearElements = doc.querySelectorAll('.gear-slot, .equipment-slot, [class*="gear"]')

  gearElements.forEach(el => {
    const slot = el.getAttribute('data-slot') ||
      el.querySelector('.slot-name')?.textContent?.trim() ||
      ''
    const itemName = el.querySelector('.item-name, .primary-item')?.textContent?.trim() || ''

    if (slot && itemName) {
      const altElements = el.querySelectorAll('.alternative, .alt-item')
      const alternatives = Array.from(altElements)
        .map(alt => alt.textContent?.trim())
        .filter((text): text is string => !!text)

      const statsElements = el.querySelectorAll('.stat-priority, .stat')
      const statPriorities = Array.from(statsElements)
        .map(stat => stat.textContent?.trim())
        .filter((text): text is string => !!text)

      gear.push({
        slot,
        primaryItem: itemName,
        alternatives: alternatives.length > 0 ? alternatives : undefined,
        statPriorities
      })
    }
  })

  return gear
}

/**
 * Parse Kanai's Cube powers from build guide
 */
function parseCubePowers(doc: Document): MaxrollCubePowers {
  const cube: MaxrollCubePowers = {
    weapon: '',
    armor: '',
    jewelry: ''
  }

  // Look for cube section
  const cubeSection = doc.querySelector('.kanais-cube, .cube-powers, [class*="cube"]')
  if (!cubeSection) return cube

  const weaponEl = cubeSection.querySelector('.weapon, [data-slot="weapon"]')
  const armorEl = cubeSection.querySelector('.armor, [data-slot="armor"]')
  const jewelryEl = cubeSection.querySelector('.jewelry, [data-slot="jewelry"]')

  cube.weapon = weaponEl?.textContent?.trim() || ''
  cube.armor = armorEl?.textContent?.trim() || ''
  cube.jewelry = jewelryEl?.textContent?.trim() || ''

  return cube
}

/**
 * Parse legendary gems from build guide
 */
function parseLegendaryGems(doc: Document): MaxrollGem[] {
  const gems: MaxrollGem[] = []

  // Look for gem section
  const gemElements = doc.querySelectorAll('.legendary-gem, .gem-slot, [class*="gem"]')

  let priority = 1
  gemElements.forEach(el => {
    const name = el.querySelector('.gem-name, .name')?.textContent?.trim() ||
      el.textContent?.trim() || ''

    if (name && name.length > 0 && name.length < 50) {
      gems.push({
        name,
        targetRank: 25, // Default target
        priority: priority++
      })
    }
  })

  return gems
}

/**
 * Extract core items from a build guide for meta reference
 */
export function extractCoreItems(guide: MaxrollBuildGuide): string[] {
  const coreItems: string[] = []

  // Add all gear items
  guide.gear.forEach(slot => {
    if (slot.primaryItem) {
      coreItems.push(slot.primaryItem)
    }
  })

  // Add cube powers
  if (guide.kanaisCube.weapon) coreItems.push(guide.kanaisCube.weapon)
  if (guide.kanaisCube.armor) coreItems.push(guide.kanaisCube.armor)
  if (guide.kanaisCube.jewelry) coreItems.push(guide.kanaisCube.jewelry)

  return coreItems
}

/**
 * Extract key synergies from build guide
 */
export function extractKeySynergies(guide: MaxrollBuildGuide): string[] {
  const synergies: string[] = []

  // Look for set bonuses in item names
  const setItems = guide.gear.filter(g =>
    g.primaryItem.includes('\'s') || g.primaryItem.includes('Set')
  )

  if (setItems.length >= 2) {
    synergies.push(`${setItems.length}+ piece set bonus`)
  }

  // Add gem synergies
  if (guide.legendaryGems.length > 0) {
    synergies.push(`${guide.legendaryGems.length} legendary gems`)
  }

  // Add cube synergies
  const cubePowers = [guide.kanaisCube.weapon, guide.kanaisCube.armor, guide.kanaisCube.jewelry]
    .filter(p => p)
  if (cubePowers.length > 0) {
    synergies.push(`Kanai's Cube: ${cubePowers.join(', ')}`)
  }

  return synergies
}
