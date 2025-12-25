/**
 * @file data/d3Reference.ts
 * @description Diablo III reference data for AI recommendation validation
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20251101)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import type { ItemAcquisition } from '@/types/progression'

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
  // Necromancer Sets
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
  },

  // Craftable Sets (2pc + 3pc bonuses)
  'Captain Crimson\'s Trimmings': {
    2: 'Regenerates 6000 Life per Second. Reduces cooldown of all skills by 20%',
    3: 'Damage dealt is increased by your percentage of Cooldown Reduction. Damage taken is reduced by your percentage of Resource Cost Reduction'
  },
  'Sage\'s Journey': {
    2: 'Gain Death\'s Breath after killing an elite pack',
    3: 'Double the amount of Death\'s Breath that drop'
  },
  'Aughild\'s Authority': {
    2: 'Reduces damage taken by 15%',
    3: 'Reduces damage taken from elites by 30%. Increases damage dealt to elites by 30%'
  },
  'Born\'s Command': {
    2: 'Reduces all cooldowns by 10%',
    3: '+15% Life. +20% bonus experience'
  },
  'Cain\'s Destiny': {
    2: '+50% bonus experience',
    3: 'Attack Speed increased by 8%. 25% better chance of finding a Legendary item'
  },
  'Asheara\'s Vestments': {
    2: '+20% Life',
    3: 'Attacks cause your followers to occasionally come to your aid'
  },
  'Guardian\'s Jeopardy': {
    2: '+250 Vitality',
    3: '+15% movement speed. Regenerates 8000 Life per Second'
  },
  'Demon\'s Hide': {
    2: 'Reduces damage from melee attacks by 20%',
    3: 'Reduces damage from ranged attacks by 20%'
  },

  // Barbarian Sets
  'Wrath of the Wastes': {
    2: 'Increase the damage per second of Rend by 500% and its duration to 15 seconds',
    4: 'During Whirlwind and for 3 seconds after, you gain 50% damage reduction and your applied Rends deal triple damage',
    6: 'Whirlwind gains the effect of the Dust Devils rune and Whirlwind and its Dust Devils deal 10,000% increased damage'
  },
  'Immortal King\'s Call': {
    2: 'Call of the Ancients last until they die',
    4: 'Reduce the cooldown of Wrath of the Berserker and Call of the Ancients by 3 seconds for every 10 Fury you spend with an attack',
    6: 'While both Wrath of the Berserker and Call of the Ancients are active, you deal 4000% increased damage'
  },
  'Horde of the Ninety Savages': {
    2: 'Double the effectiveness of shouts. Shouts instead grant 100% increased damage',
    4: 'Each stack of Frenzy reduces damage taken by 6% and increases damage dealt by 10%',
    6: 'Frenzy deals 10,000% increased damage'
  },
  'Might of the Earth': {
    2: 'Reduce the cooldown of Earthquake, Ground Stomp, Leap, and Avalanche by 1 second for every 30 Fury spent with an attack',
    4: 'Leap causes an Earthquake when you land. Leap gains the effect of the Iron Impact rune and the rune effect and duration are increased by 150%',
    6: 'Increase the damage of Earthquake, Avalanche, Leap, Ground Stomp, Ancient Spear, and Seismic Slam by 20,000%'
  },

  // Demon Hunter Sets
  'Unhallowed Essence': {
    2: 'Your generators generate 2 additional Hatred and 1 Discipline',
    4: 'Gain 60% damage reduction and deal 60% increased damage for 8 seconds if no enemy is within 10 yards of you',
    6: 'Your generators, Multishot, and Vengeance deal 100% increased damage for every point of Discipline you have'
  },
  'Natalya\'s Vengeance': {
    2: 'Reduce the cooldown of Rain of Vengeance by 4 seconds when you hit with a Hatred-generating attack or a Hatred-spending attack',
    4: 'Rain of Vengeance deals 100% increased damage',
    6: 'After casting Rain of Vengeance, deal 14,000% increased damage and take 60% reduced damage for 10 seconds'
  },
  'Marauder\'s': {
    2: 'Companion calls all companion types to your side',
    4: 'Sentries deal 400% increased damage and cast Elemental Arrow, Chakram, Impale, Multishot, and Cluster Arrow when you do',
    6: 'Your primary skills, Elemental Arrow, Chakram, Impale, Multishot, Cluster Arrow, Companions, and Vengeance deal 12,000% increased damage for every active Sentry'
  },

  // Wizard Sets
  'Tal Rasha\'s Elements': {
    2: 'Damaging enemies with Arcane, Cold, Fire or Lightning will cause a Meteor of the same damage type to fall from the sky. There is an 8 second cooldown for each damage type',
    4: 'Arcane, Cold, Fire, and Lightning attacks each increase all of your resistances by 25% for 8 seconds',
    6: 'Attacks increase your damage by 2000% for 8 seconds. Arcane, Cold, Fire, and Lightning attacks each add one stack. At 4 stacks, each element\'s damage bonus is increased to 8000%'
  },
  'Firebird\'s Finery': {
    2: 'When you die, a meteor falls from the sky and revives you. This effect has a 60 second cooldown',
    4: 'Your damage is increased by 80% and damage taken reduced by 3% for each enemy that is Ignited. This effect can stack up to 20 times',
    6: 'You gain 2500% increased damage while Ignite is applied to a target. Hitting an Ignited enemy with a non-channeling fire spell deals Ignite damage multiplied by Combustion stacks'
  },

  // Monk Sets
  'Inna\'s Mantra': {
    2: 'Increase the passive effect of your Mystic Ally and the damage of your Mystic Ally by 100%',
    4: 'Gain the base effect of all four Mantras at all times. Your Mystic Allies are unkillable',
    6: 'Gain the passive abilities of the five runed Mystic Allies at all times. Attacking enemies creates your runed Mystic Allies that deal 950% weapon damage on hit. Your Mystic Allies deal 9500% increased damage'
  },
  'Patterns of Justice': {
    2: 'Sweeping Wind gains the effect of every rune, and movement speed is increased by 5% for each stack of Sweeping Wind',
    4: 'Tempest Rush gains the effect of the Flurry rune, and Tempest Rush and Flurry deal 15,000% increased damage',
    6: 'Hitting with Tempest Rush while Sweeping Wind is active increases the size of Sweeping Wind and also increases all damage dealt by 15,000%'
  },

  // Crusader Sets
  'Aegis of Valor': {
    2: 'Attacking with Fist of the Heavens empowers you, allowing Heaven\'s Fury to deal 100% increased damage for 5 seconds. Stacks up to 3 times multiplicatively',
    4: 'Hitting with Fist of the Heavens generates 5 Wrath and reduces damage taken by 1% for 5 seconds. Stacks up to 50 times',
    6: 'Increase the damage of Fist of the Heavens and Heaven\'s Fury by 20,000%'
  },
  'Armor of Akkhan': {
    2: 'Reduce the cost of all abilities by 50% while Akarat\'s Champion is active',
    4: 'Reduce the cooldown of Akarat\'s Champion by 50%',
    6: 'While Akarat\'s Champion is active, deal 2000% increased damage and take 50% less damage'
  },
  'Roland\'s Legacy': {
    2: 'Every use of Shield Bash and Sweep Attack reduces the cooldowns of your Laws and Defensive Skills by 1 second',
    4: 'Increase the damage of Shield Bash and Sweep Attack by 13,000%',
    6: 'Every use of Shield Bash or Sweep Attack that hits an enemy grants 75% increased Attack Speed for 5 seconds. This effect stacks up to 5 times'
  },

  // Witch Doctor Sets
  'Zunimassa\'s Haunt': {
    2: 'Your Fetish Army lasts until they die and the cooldown of your Fetish Army is reduced by 80%',
    4: 'You and your Fetishes take 3% reduced damage for every Fetish you have alive',
    6: 'Enemies hit by your Mana spenders take 15,000% increased damage from your Pets for 8 seconds'
  },
  'Spirit of Arachyr': {
    2: 'Summon a permanent Spider Queen who leaves behind webs that deal 4000% weapon damage over 5 seconds and Slows enemies. The Spider Queen is commanded to move to where you cast your Corpse Spiders',
    4: 'Hex gains the effect of the Toad of Hugeness rune. After Toad of Hugeness pulls in an enemy, you deal 50% increased damage for 15 seconds',
    6: 'The damage of your creature skills is increased by 9000%. Creature skills are Corpse Spiders, Plague of Toads, Firebats, Locust Swarm, Hex, and Piranhas'
  }
}

/**
 * Item acquisition data - how to farm each item
 * Used for generating realistic upgrade recommendations with farming guidance
 */
export const ITEM_ACQUISITION: Record<string, Partial<ItemAcquisition>> = {
  // ============================================
  // CRAFTABLE SETS - Always quick to obtain
  // ============================================
  "Captain Crimson's Trimmings": {
    slot: 'waist,legs,wrists',
    methods: ['crafting'],
    primaryMethod: 'crafting',
    estimatedTime: 'quick',
    bountyMaterialsRequired: true,
    craftingRecipeSource: 'Bounty cache (any act)',
    notes: 'Best 3pc set for CDR builds. Craft at Blacksmith after finding recipe.'
  },
  "Sage's Journey": {
    slot: 'head,hands,feet',
    methods: ['crafting'],
    primaryMethod: 'crafting',
    estimatedTime: 'quick',
    bountyMaterialsRequired: true,
    craftingRecipeSource: 'Bounty cache (any act)',
    notes: 'Double Death\'s Breath drops. Great for farming builds.'
  },
  "Aughild's Authority": {
    slot: 'shoulders,torso,wrists',
    methods: ['crafting'],
    primaryMethod: 'crafting',
    estimatedTime: 'quick',
    bountyMaterialsRequired: true,
    craftingRecipeSource: 'Bounty cache (any act)',
    notes: '30% elite damage bonus. Strong defensive option.'
  },
  "Born's Command": {
    slot: 'shoulders,torso,mainHand',
    methods: ['crafting'],
    primaryMethod: 'crafting',
    estimatedTime: 'quick',
    bountyMaterialsRequired: true,
    craftingRecipeSource: 'Bounty cache (any act)',
    notes: 'CDR and XP bonus. Good for leveling and speed builds.'
  },
  "Cain's Destiny": {
    slot: 'head,hands,legs',
    methods: ['crafting'],
    primaryMethod: 'crafting',
    estimatedTime: 'quick',
    bountyMaterialsRequired: true,
    craftingRecipeSource: 'Bounty cache (any act)',
    notes: 'XP and magic find bonus. Speed farming option.'
  },

  // ============================================
  // NECROMANCER ITEMS
  // ============================================
  // Weapons
  'Scythe of the Cycle': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    bloodShardCost: 75,
    notes: 'Core for secondary skill builds. Upgrade rare scythes at cube.'
  },
  "Trag'Oul's Corroded Fang": {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    bloodShardCost: 75,
    notes: 'Core for curse-based builds. Upgrade rare scythes.'
  },
  "Reilena's Shadowhook": {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    bloodShardCost: 75,
    notes: 'Essence stacking builds. Best in slot for Bone Spear.'
  },
  "Nayr's Black Death": {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    bloodShardCost: 75,
    notes: 'Poison skill builds. Stack different poison skills.'
  },
  'Bloodtide Blade': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    bloodShardCost: 75,
    notes: 'Death Nova builds. Scales with enemy density.'
  },
  'Funerary Pick': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    bloodShardCost: 75,
    notes: 'Siphon Blood builds. Generates corpses.'
  },

  // Off-hands
  'Lost Time': {
    slot: 'offHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    bloodShardCost: 75,
    notes: 'Cold builds. Slows enemies for Krysbin\'s synergy.'
  },
  'Iron Rose': {
    slot: 'offHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    bloodShardCost: 75,
    notes: 'Blood Nova procs. Siphon Blood synergy.'
  },
  "Leger's Disdain": {
    slot: 'offHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    bloodShardCost: 75,
    notes: 'Grim Scythe builds. Essence scaling.'
  },

  // Rings
  "Krysbin's Sentence": {
    slot: 'leftFinger,rightFinger',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 50,
    bloodShardCost: 50,
    notes: 'Best damage ring for CC builds. Pairs with cold/stun effects.'
  },
  "Circle of Nailuj's Evol": {
    slot: 'leftFinger,rightFinger',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 50,
    bloodShardCost: 50,
    notes: 'Skeletal Mage builds. Double mage summons.'
  },

  // Amulets
  'Haunted Visions': {
    slot: 'neck',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 50,
    bloodShardCost: 100,
    notes: 'Simulacrum builds. Permanent uptime.'
  },

  // ============================================
  // UNIVERSAL ITEMS (All Classes)
  // ============================================
  // Rings
  'Focus': {
    slot: 'leftFinger,rightFinger',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 50,
    bloodShardCost: 50,
    notes: 'Part of Focus & Restraint. Generator/spender damage bonus.'
  },
  'Restraint': {
    slot: 'leftFinger,rightFinger',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 50,
    bloodShardCost: 50,
    notes: 'Part of Focus & Restraint. Generator/spender damage bonus.'
  },
  'The Compass Rose': {
    slot: 'leftFinger,rightFinger',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 50,
    bloodShardCost: 50,
    notes: 'Part of Endless Walk set. Standing still = damage.'
  },
  'Convention of Elements': {
    slot: 'leftFinger,rightFinger',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 50,
    bloodShardCost: 50,
    notes: 'Rotating 200% damage buff. Best cubed for most builds.'
  },
  'Unity': {
    slot: 'leftFinger,rightFinger',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 50,
    bloodShardCost: 50,
    notes: '50% damage split with follower (needs immortal relic). Solo pushing.'
  },
  'Ring of Royal Grandeur': {
    slot: 'leftFinger,rightFinger',
    methods: ['bounty'],
    primaryMethod: 'bounty',
    estimatedTime: 'medium',
    bountyMaterialsRequired: true,
    dropLocations: ['Act 1 Bounty Cache'],
    notes: 'Reduces set requirements by 1. Only from Act 1 bounties!'
  },
  'Avarice Band': {
    slot: 'leftFinger,rightFinger',
    methods: ['bounty'],
    primaryMethod: 'bounty',
    estimatedTime: 'medium',
    bountyMaterialsRequired: true,
    dropLocations: ['Act 3 Bounty Cache'],
    notes: 'Gold pickup radius. Speed farming. Only from Act 3 bounties!'
  },
  'Stone of Jordan': {
    slot: 'leftFinger,rightFinger',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 50,
    bloodShardCost: 50,
    notes: 'Elite damage. Good for push builds.'
  },
  'Oculus Ring': {
    slot: 'leftFinger,rightFinger',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'world_drop',
    estimatedTime: 'quick',
    notes: 'Spawns damage zones. Put on follower!'
  },

  // Amulets
  "The Traveler's Pledge": {
    slot: 'neck',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 50,
    bloodShardCost: 100,
    notes: 'Part of Endless Walk set. Standing still = damage.'
  },
  'Hellfire Amulet': {
    slot: 'neck',
    methods: ['crafting'],
    primaryMethod: 'crafting',
    estimatedTime: 'long',
    notes: 'Crafted from Uber boss materials. Grants 5th passive.'
  },
  'Squirt\'s Necklace': {
    slot: 'neck',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'world_drop',
    estimatedTime: 'quick',
    notes: 'Stacking damage when not hit. Glass cannon builds.'
  },
  'The Flavor of Time': {
    slot: 'neck',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'world_drop',
    estimatedTime: 'quick',
    notes: 'Double pylon duration. Put on follower!'
  },

  // Armor - Universal
  'Aquila Cuirass': {
    slot: 'torso',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'kadala',
    estimatedTime: 'medium',
    bloodShardCost: 25,
    deathsBreathCost: 25,
    notes: '50% DR above 90% resource. Best cubed for most builds.'
  },
  "Stone Gauntlets": {
    slot: 'hands',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'kadala',
    estimatedTime: 'medium',
    bloodShardCost: 25,
    deathsBreathCost: 25,
    notes: 'Massive armor stacking. Needs Ingeom or Ice Climbers to offset slow.'
  },
  'Ice Climbers': {
    slot: 'feet',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'kadala',
    estimatedTime: 'medium',
    bloodShardCost: 25,
    deathsBreathCost: 25,
    notes: 'Immune to freeze and slow. Counters Stone Gauntlets.'
  },
  'Nemesis Bracers': {
    slot: 'wrists',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'kadala',
    estimatedTime: 'quick',
    bloodShardCost: 25,
    notes: 'Spawns elites from shrines. Speed farming or follower.'
  },
  'Strongarm Bracers': {
    slot: 'wrists',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'kadala',
    estimatedTime: 'quick',
    bloodShardCost: 25,
    notes: 'Knockback = 30% more damage. Pairs with CC skills.'
  },
  "Goldwrap": {
    slot: 'waist',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'kadala',
    estimatedTime: 'quick',
    bloodShardCost: 25,
    notes: 'Gold = armor. Speed farming with Boon of the Hoarder.'
  },
  'The Witching Hour': {
    slot: 'waist',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'kadala',
    estimatedTime: 'long',
    bloodShardCost: 25,
    notes: 'Attack speed + crit damage. Rare drop, best belt for DPS.'
  },
  "Leoric's Crown": {
    slot: 'head',
    methods: ['cube_upgrade', 'kadala', 'greater_rift', 'world_drop'],
    primaryMethod: 'kadala',
    estimatedTime: 'quick',
    bloodShardCost: 25,
    notes: 'Double gem effect in helm. CDR with diamond.'
  },
  "Pride's Fall": {
    slot: 'head',
    methods: ['bounty'],
    primaryMethod: 'bounty',
    estimatedTime: 'medium',
    bountyMaterialsRequired: true,
    dropLocations: ['Act 3 Bounty Cache'],
    notes: '30% resource cost reduction. Only from Act 3 bounties!'
  },

  // ============================================
  // LEGENDARY GEMS
  // ============================================
  'Bane of the Trapped': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    notes: 'First gem to level. Auto-slows at rank 25.'
  },
  'Bane of the Stricken': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    notes: 'Boss killer. Essential for high GR pushing.'
  },
  'Bane of the Powerful': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    notes: 'Easy damage buff. Good for speed farming.'
  },
  'Zei\'s Stone of Vengeance': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    notes: 'Ranged builds. Damage increases with distance.'
  },
  'Enforcer': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    notes: 'Pet builds. +15% pet damage.'
  },
  'Esoteric Alteration': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    notes: 'Non-physical DR. Survival gem for pushing.'
  },
  'Molten Wildebeest\'s Gizzard': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    notes: 'Shield and life regen. Pairs with Squirt\'s Necklace.'
  },
  'Gogok of Swiftness': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    notes: 'CDR and attack speed. Great for cooldown builds.'
  },
  'Pain Enhancer': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    notes: 'Attack speed from bleeds. AoE builds.'
  },
  'Boon of the Hoarder': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    dropLocations: ['Greed\'s Domain (Vault)'],
    notes: 'Gold explosions. Speed farming with Goldwrap.'
  },
  'Gem of Efficacious Toxin': {
    slot: 'gem',
    methods: ['greater_rift'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'quick',
    notes: 'Poison DoT + 10% damage taken debuff.'
  },

  // ============================================
  // FOLLOWER ITEMS
  // ============================================
  'Enchanting Favor': {
    slot: 'follower',
    methods: ['world_drop', 'kadala'],
    primaryMethod: 'world_drop',
    estimatedTime: 'medium',
    notes: 'Enchantress immortal relic. Required for Unity combo.'
  },
  'Skeleton Key': {
    slot: 'follower',
    methods: ['world_drop', 'kadala'],
    primaryMethod: 'world_drop',
    estimatedTime: 'medium',
    notes: 'Scoundrel immortal relic. Required for Unity combo.'
  },
  'Smoking Thurible': {
    slot: 'follower',
    methods: ['world_drop', 'kadala'],
    primaryMethod: 'world_drop',
    estimatedTime: 'medium',
    notes: 'Templar immortal relic. Required for Unity combo.'
  },

  // ============================================
  // BARBARIAN ITEMS
  // ============================================
  'Bul-Kathos\'s Oath': {
    slot: 'mainHand,offHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Whirlwind set weapons. Fury generation.'
  },
  'The Furnace': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'long',
    deathsBreathCost: 25,
    notes: 'Elite damage. Often cubed.'
  },
  'Blade of the Tribes': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Leap/Earthquake builds.'
  },

  // ============================================
  // DEMON HUNTER ITEMS
  // ============================================
  'Yang\'s Recurve': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Multishot build core. Resource cost reduction.'
  },
  'Dead Man\'s Legacy': {
    slot: 'offHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Multishot hits twice. Essential for UE build.'
  },
  'Fortress Ballista': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Shield on attack. Survivability option.'
  },
  'Dawn': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Vengeance CDR. 100% uptime with 37% CDR.'
  },
  'Lord Greenstone\'s Fan': {
    slot: 'offHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Fan of Knives damage. GoD build.'
  },

  // ============================================
  // WIZARD ITEMS
  // ============================================
  'Deathwish': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Channeling damage. Vyr/Chantodo builds.'
  },
  'Etched Sigil': {
    slot: 'offHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Auto-cast spenders while channeling.'
  },
  'Chantodo\'s Resolve': {
    slot: 'mainHand,offHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Archon build core. Wave of Destruction.'
  },
  'The Twisted Sword': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Energy Twister damage.'
  },

  // ============================================
  // MONK ITEMS
  // ============================================
  'Kyoshiro\'s Blade': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Wave of Light damage.'
  },
  'Balance': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Tempest Rush damage.'
  },
  'Vengeful Wind': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Sweeping Wind stacks. Patterns of Justice.'
  },
  'Won Khim Lau': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Lightning pillar damage.'
  },

  // ============================================
  // CRUSADER ITEMS
  // ============================================
  'Akkhan\'s Leniency': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Blessed Shield bounces.'
  },
  'Fate of the Fell': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Heaven\'s Fury builds.'
  },
  'Blade of Prophecy': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Condemn explosions.'
  },

  // ============================================
  // WITCH DOCTOR ITEMS
  // ============================================
  'The Dagger of Darts': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Carnevil build core.'
  },
  'Sacred Harvester': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Soul Harvest stacks. Jade Harvester.'
  },
  'Voo\'s Juicer': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Spirit Barrage damage.'
  },
  'The Barber': {
    slot: 'mainHand',
    methods: ['cube_upgrade', 'kadala', 'greater_rift'],
    primaryMethod: 'cube_upgrade',
    estimatedTime: 'medium',
    deathsBreathCost: 25,
    notes: 'Spirit Barrage explosions.'
  }
}

/**
 * Get acquisition info for an item, with defaults for unknown items
 */
export function getItemAcquisition(itemName: string): Partial<ItemAcquisition> {
  // Direct lookup
  if (ITEM_ACQUISITION[itemName]) {
    return ITEM_ACQUISITION[itemName]
  }

  // Try case-insensitive lookup
  const lowerName = itemName.toLowerCase()
  for (const [key, value] of Object.entries(ITEM_ACQUISITION)) {
    if (key.toLowerCase() === lowerName) {
      return value
    }
  }

  // Default for unknown items
  return {
    methods: ['greater_rift', 'kadala', 'cube_upgrade'],
    primaryMethod: 'greater_rift',
    estimatedTime: 'medium',
    notes: 'Check Maxroll.gg for specific farming advice.'
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

/**
 * Check if the hero has Ring of Royal Grandeur equipped or cubed
 * RoRG reduces set requirements by 1 (5pc counts as 6pc)
 */
export function hasRingOfRoyalGrandeur(
  items: Record<string, { name?: string }>,
  cubePowers?: { jewelry?: string }
): boolean {
  // Check cubed jewelry
  if (cubePowers?.jewelry?.toLowerCase().includes('ring of royal grandeur')) {
    return true
  }

  // Check equipped rings
  const ringSlots = ['leftFinger', 'rightFinger']
  for (const slot of ringSlots) {
    const item = items[slot]
    if (item?.name?.toLowerCase().includes('ring of royal grandeur')) {
      return true
    }
  }

  return false
}

/**
 * Calculate effective pieces for a set considering Ring of Royal Grandeur
 * RoRG only works if you have at least 2 pieces of a set
 */
export function getEffectivePieces(actualPieces: number, hasRoRG: boolean): number {
  if (!hasRoRG || actualPieces < 2) {
    return actualPieces
  }
  return actualPieces + 1
}

/**
 * Get set bonus for a given set and piece count, considering RoRG
 */
export function getActiveSetBonuses(
  setName: string,
  actualPieces: number,
  hasRoRG: boolean
): { pieces: number; bonus: string; isRoRGEnabled: boolean }[] {
  const bonuses = SET_BONUSES[setName]
  if (!bonuses) return []

  const effectivePieces = getEffectivePieces(actualPieces, hasRoRG)

  return Object.entries(bonuses)
    .filter(([pieces]) => Number(pieces) <= effectivePieces)
    .map(([pieces, bonus]) => ({
      pieces: Number(pieces),
      bonus,
      isRoRGEnabled: hasRoRG && Number(pieces) > actualPieces
    }))
    .sort((a, b) => a.pieces - b.pieces)
}
