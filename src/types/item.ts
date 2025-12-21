/**
 * @file types/item.ts
 * @description Item slot type mappings for gear analysis
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

// Slot to item type mapping for finding upgrades
export const SLOT_ITEM_TYPES: Record<string, string[]> = {
  head: ['helm', 'wizard-hat', 'spirit-stone', 'voodoo-mask'],
  shoulders: ['shoulders'],
  neck: ['amulet'],
  torso: ['chest-armor', 'cloak'],
  hands: ['gloves'],
  waist: ['belt', 'mighty-belt'],
  wrists: ['bracers'],
  legs: ['pants'],
  feet: ['boots'],
  leftFinger: ['ring'],
  rightFinger: ['ring'],
  mainHand: [
    'sword-1h',
    'axe-1h',
    'mace-1h',
    'dagger',
    'spear',
    'fist-weapon',
    'mighty-weapon-1h',
    'flail-1h',
    'ceremonial-knife',
    'scythe-1h',
    'wand',
    'sword-2h',
    'axe-2h',
    'mace-2h',
    'polearm',
    'staff',
    'mighty-weapon-2h',
    'flail-2h',
    'daibo',
    'scythe-2h',
    'bow',
    'crossbow',
    'hand-crossbow'
  ],
  offHand: [
    'shield',
    'crusader-shield',
    'source',
    'mojo',
    'quiver',
    'phylactery',
    'hand-crossbow'
  ]
}
