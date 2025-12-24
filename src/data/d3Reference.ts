/**
 * @file data/d3Reference.ts
 * @description Diablo III reference data for AI recommendation validation
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

/**
 * Passive skills by class - used to validate AI doesn't recommend passives as active skills
 */
export const CLASS_PASSIVES: Record<string, string[]> = {
  barbarian: [
    'Pound of Flesh', 'Ruthless', 'Nerves of Steel', 'Weapons Master',
    'Inspiring Presence', 'Berserker Rage', 'Bloodthirst', 'Animosity',
    'Superstition', 'Tough as Nails', 'No Escape', 'Relentless',
    'Brawler', 'Juggernaut', 'Unforgiving', 'Boon of Bul-Kathos',
    'Earthen Might', 'Sword and Board', 'Rampage'
  ],
  crusader: [
    'Heavenly Strength', 'Fervor', 'Vigilant', 'Righteousness',
    'Insurmountable', 'Fanaticism', 'Indestructible', 'Holy Cause',
    'Wrathful', 'Divine Fortress', 'Lord Commander', 'Hold Your Ground',
    'Long Arm of the Law', 'Iron Maiden', 'Renewal', 'Finery',
    'Blunt', 'Towering Shield'
  ],
  'demon-hunter': [
    'Thrill of the Hunt', 'Tactical Advantage', 'Blood Vengeance', 'Steady Aim',
    'Cull the Weak', 'Night Stalker', 'Brooding', 'Hot Pursuit',
    'Archery', 'Numbing Traps', 'Perfectionist', 'Custom Engineering',
    'Grenadier', 'Sharpshooter', 'Ballistics', 'Leech',
    'Ambush', 'Awareness', 'Single Out'
  ],
  monk: [
    'Resolve', 'Fleet Footed', 'Exalted Soul', 'Transcendence',
    'Chant of Resonance', 'Seize the Initiative', 'The Guardian\'s Path', 'Sixth Sense',
    'Determination', 'Relentless Assault', 'Beacon of Ytar', 'Alacrity',
    'Harmony', 'Combination Strike', 'Near Death Experience', 'Unity',
    'Momentum', 'Mythic Rhythm'
  ],
  necromancer: [
    'Bone Prison', 'Life from Death', 'Fueled by Death', 'Stand Alone',
    'Swift Harvesting', 'Commander of the Dead', 'Rigor Mortis',
    'Overwhelming Essence', 'Dark Reaping', 'Spreading Malediction',
    'Eternal Torment', 'Final Service', 'Rathma\'s Shield',
    'Blood is Power', 'Draw Life', 'Aberrant Animator',
    'Blood for Blood', 'Extended Servitude', 'Grisly Tribute'
  ],
  'witch-doctor': [
    'Jungle Fortitude', 'Circle of Life', 'Spiritual Attunement', 'Gruesome Feast',
    'Blood Ritual', 'Bad Medicine', 'Zombie Handler', 'Pierce the Veil',
    'Spirit Vessel', 'Fetish Sycophants', 'Rush of Essence', 'Vision Quest',
    'Fierce Loyalty', 'Grave Injustice', 'Tribal Rites', 'Confidence Ritual',
    'Creeping Death', 'Physical Attunement', 'Midnight Feast', 'Swampland Attunement'
  ],
  wizard: [
    'Power Hungry', 'Blur', 'Evocation', 'Glass Cannon',
    'Prodigy', 'Astral Presence', 'Illusionist', 'Cold Blooded',
    'Conflagration', 'Paralysis', 'Galvanizing Ward', 'Temporal Flux',
    'Dominance', 'Arcane Dynamo', 'Unwavering Will', 'Audacity',
    'Elemental Exposure', 'Unstable Anomaly'
  ]
}

/**
 * Ring and jewelry sets that consume multiple slots
 * Used to detect impossible slot conflicts in recommendations
 */
export interface SetSlotInfo {
  slots: string[]
  items: string[]
}

export const JEWELRY_SETS: Record<string, SetSlotInfo> = {
  'Focus and Restraint': {
    slots: ['leftFinger', 'rightFinger'],
    items: ['Focus', 'Restraint']
  },
  'Endless Walk': {
    slots: ['neck', 'leftFinger'],
    items: ['The Traveler\'s Pledge', 'The Compass Rose']
  },
  'Bastions of Will': {
    slots: ['leftFinger', 'rightFinger'],
    items: ['Focus', 'Restraint']
  }
}

/**
 * Common legendary effects - accurate descriptions for reference
 * Used to help validate AI isn't inventing item effects
 */
export const LEGENDARY_EFFECTS: Record<string, string> = {
  // Necromancer weapons
  'Scythe of the Cycle': 'Secondary skills deal up to 400% increased damage while Bone Armor is active, but reduce the remaining duration of Bone Armor by 4 seconds',
  'Trag\'Oul\'s Corroded Fang': 'The Cursed Scythe rune for Grim Scythe now has a 100% chance to apply a curse and you deal 175-200% increased damage to cursed enemies',
  'Reilena\'s Shadowhook': 'Every point of Maximum Essence increases your damage by 0.5% and Bone Spikes generates 2-5 additional Essence',
  'Nayr\'s Black Death': 'Each different poison skill you use increases the damage of your poison skills by 75-100% for 15 seconds',
  'Bloodtide Blade': 'Death Nova deals 80-100% increased damage for every enemy within 25 yards',
  'Funerary Pick': 'Siphon Blood deals 75-100% additional damage and drains enemies dry to leave a corpse every 3 kills',

  // Necromancer off-hands
  'Lost Time': 'Cold skills reduce the movement speed of enemies by 30%. Gain 8% movement speed for 5 seconds for each enemy hit. Max 5 stacks',
  'Iron Rose': 'Attacking with Siphon Blood has a 40-50% chance to also cast a free Blood Nova',
  'Leger\'s Disdain': 'Grim Scythe deals an additional 7-10% damage for each point of essence it restores',

  // Rings
  'Krysbin\'s Sentence': 'You deal 75-100% increased damage against slowed enemies or triple this bonus against enemies that are stunned, frozen, or blinded',
  'Circle of Nailuj\'s Evol': 'You now raise two Skeletal Mages with each cast and they last 25-50% longer',
  'Focus': 'After casting a resource-generating attack, you deal 50% increased damage for 5 seconds',
  'Restraint': 'After casting a resource-spending attack, you deal 50% increased damage for 5 seconds',
  'The Compass Rose': 'While moving, you take 30% reduced damage. While standing still, you deal 100% increased damage',

  // Amulets
  'The Traveler\'s Pledge': 'While moving, you take 30% reduced damage. While standing still, you deal 100% increased damage',
  'Haunted Visions': 'Simulacrum now drains 1% of your maximum life every second. Simulacrum can no longer be killed',

  // Armor
  'Aquila Cuirass': 'While above 90-95% primary resource, all damage taken is reduced by 50%',
  'Razeth\'s Volition': 'Skeletal Mage gains the effect of the Gift of Death rune',

  // Legendary Gems
  'Bane of the Trapped': 'Increase damage against enemies under the effects of control-impairing effects by 15% plus 0.3% per rank. At rank 25, gain an aura that reduces the movement speed of enemies within 15 yards by 30%',
  'Bane of the Stricken': 'Each attack you make against an enemy increases the damage it takes from your attacks by 0.8% plus 0.01% per rank. At rank 25, gain 25% increased damage against Rift Guardians and bosses',
  'Esoteric Alteration': 'Gain 10% non-Physical damage reduction plus an additional 0.5% per rank. At rank 25, while below 50% Life, your non-Physical damage reduction is increased by 75%',
  'Enforcer': 'Increase the damage of your pets by 15% plus 0.3% per rank. At rank 25, your pets take 25% less damage',
  'Gem of Efficacious Toxin': 'Poison all enemies hit for 2000% weapon damage over 10 seconds. At rank 25, all enemies poisoned by you take 10% increased damage from all sources',
  'Zei\'s Stone of Vengeance': 'Damage you deal is increased by 4% plus 0.08% per rank for every 10 yards between you and the enemy hit. At rank 25, 20% chance on hit to Stun the enemy for 1 second',
  'Pain Enhancer': 'Critical hits cause the enemy to bleed for 2500% weapon damage as Physical over 3 seconds. At rank 25, gain Blood Frenzy, granting 3% increased Attack Speed for each bleeding enemy within 20 yards',
  'Gogok of Swiftness': 'Gain Swiftness with every attack, increasing your Attack Speed by 1% and Dodge by 0.5% for 4 seconds. This effect stacks up to 15 times. At rank 25, gain 1% Cooldown Reduction per stack of Swiftness'
}

/**
 * Major set bonuses for reference
 */
export const SET_BONUSES: Record<string, Record<number, string>> = {
  'Grace of Inarius': {
    2: 'Bone Armor damage is increased by 1000%',
    4: 'Bone Armor grants an additional 3% damage reduction per enemy hit',
    6: 'Bone Armor also activates a swirling tornado of bone, dealing 1000% weapon damage to all nearby enemies and increasing the damage they take from the Necromancer by 10,000%'
  },
  'Trag\'Oul\'s Avatar': {
    2: 'Blood Rush gains the effect of every rune',
    4: 'While at full Life, your healing from skills is added to your maximum Life for 45 seconds, up to 100% more',
    6: 'Your Life-spending abilities deal 10,000% increased damage and your healing from skills is increased by 100%'
  },
  'Bones of Rathma': {
    2: 'Your Skeletal Mages gain the effect of the Gift of Death and Singularity runes',
    4: 'You gain 1% damage reduction for 15 seconds each time your Skeletal Mages deal damage. Max 75 stacks',
    6: 'Each active Skeletal Mage increases the damage of your Skeletal Mages and Army of the Dead by 1000%'
  },
  'Pestilence Master\'s Shroud': {
    2: 'Each corpse you consume fires a Corpse Lance at a nearby enemy',
    4: 'Each enemy you hit with Bone Spear, Corpse Lance, or Corpse Explosion reduces your damage taken by 2%, up to a maximum of 50%. Lasts 15 seconds',
    6: 'Each corpse you consume grants you an Empowered Bone Spear charge that increases the damage of your next Bone Spear by 6000%. You can have up to 100 charges'
  },
  'Masquerade of the Burning Carnival': {
    2: 'Your Simulacrums no longer take damage, gains all runes, and its cooldown is refreshed when you die',
    4: 'While you have a Simulacrum, damage taken is reduced by 50%. Damage dealt to you is split with your Simulacrums',
    6: 'Bone Spear cast by you and your Simulacrums deals 10,000% increased damage'
  }
}

/**
 * Get passive skills for a given class
 */
export function getPassivesForClass(heroClass: string): string[] {
  const normalized = heroClass.toLowerCase().replace(' ', '-')
  return CLASS_PASSIVES[normalized] || []
}

/**
 * Check if a skill name is a passive for the given class
 */
export function isPassiveSkill(heroClass: string, skillName: string): boolean {
  const passives = getPassivesForClass(heroClass)
  return passives.some(p => p.toLowerCase() === skillName.toLowerCase())
}

/**
 * Check for ring slot conflicts
 * Returns conflicting set names if there's an issue
 */
export function checkRingSlotConflicts(recommendedSets: string[]): string[] | null {
  const ringSets = recommendedSets.filter(setName => {
    const setInfo = Object.entries(JEWELRY_SETS).find(
      ([name]) => name.toLowerCase() === setName.toLowerCase() ||
                  setName.toLowerCase().includes(name.toLowerCase())
    )
    return setInfo && setInfo[1].slots.includes('leftFinger')
  })

  if (ringSets.length > 1) {
    return ringSets
  }

  return null
}

export interface ValidationWarning {
  type: 'skill_type_error' | 'slot_conflict' | 'unknown_item'
  message: string
  severity: 'error' | 'warning'
}
