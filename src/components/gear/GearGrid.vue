<script setup lang="ts">
/**
 * @file GearGrid.vue
 * @description Equipment grid layout displaying all gear slots
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { computed } from 'vue'
import GearSlot from './GearSlot.vue'
import type { Item } from '@/types'
import { SLOT_NAMES } from '@/types/hero'

const props = defineProps<{
  items: Record<string, Item>
}>()

defineEmits<{
  selectSlot: [slotKey: string]
}>()

// Slots organized by visual layout
const layoutSlots = computed(() => ({
  top: ['head'],
  upper: ['shoulders', 'neck', 'torso'],
  middle: ['hands', 'waist', 'wrists'],
  lower: ['legs'],
  bottom: ['feet'],
  rings: ['leftFinger', 'rightFinger'],
  weapons: ['mainHand', 'offHand']
}))

function getSlotName(key: string): string {
  return SLOT_NAMES[key] || key
}

function getItem(slotKey: string): Item | undefined {
  return props.items[slotKey]
}
</script>

<template>
  <div class="gear-grid">
    <!-- Top row: Head -->
    <div class="gear-row top">
      <GearSlot
        v-for="slot in layoutSlots.top"
        :key="slot"
        :slot-key="slot"
        :slot-name="getSlotName(slot)"
        :item="getItem(slot)"
        @click="$emit('selectSlot', slot)"
      />
    </div>

    <!-- Upper row: Shoulders, Neck, Chest -->
    <div class="gear-row upper">
      <GearSlot
        v-for="slot in layoutSlots.upper"
        :key="slot"
        :slot-key="slot"
        :slot-name="getSlotName(slot)"
        :item="getItem(slot)"
        @click="$emit('selectSlot', slot)"
      />
    </div>

    <!-- Middle row: Hands, Belt, Bracers -->
    <div class="gear-row middle">
      <GearSlot
        v-for="slot in layoutSlots.middle"
        :key="slot"
        :slot-key="slot"
        :slot-name="getSlotName(slot)"
        :item="getItem(slot)"
        @click="$emit('selectSlot', slot)"
      />
    </div>

    <!-- Lower row: Left Ring, Legs, Right Ring -->
    <div class="gear-row lower-with-rings">
      <GearSlot
        slot-key="leftFinger"
        :slot-name="getSlotName('leftFinger')"
        :item="getItem('leftFinger')"
        @click="$emit('selectSlot', 'leftFinger')"
      />
      <GearSlot
        v-for="slot in layoutSlots.lower"
        :key="slot"
        :slot-key="slot"
        :slot-name="getSlotName(slot)"
        :item="getItem(slot)"
        @click="$emit('selectSlot', slot)"
      />
      <GearSlot
        slot-key="rightFinger"
        :slot-name="getSlotName('rightFinger')"
        :item="getItem('rightFinger')"
        @click="$emit('selectSlot', 'rightFinger')"
      />
    </div>

    <!-- Bottom row: Main Hand, Feet, Off Hand -->
    <div class="gear-row bottom-with-weapons">
      <GearSlot
        slot-key="mainHand"
        :slot-name="getSlotName('mainHand')"
        :item="getItem('mainHand')"
        @click="$emit('selectSlot', 'mainHand')"
      />
      <GearSlot
        v-for="slot in layoutSlots.bottom"
        :key="slot"
        :slot-key="slot"
        :slot-name="getSlotName(slot)"
        :item="getItem(slot)"
        @click="$emit('selectSlot', slot)"
      />
      <GearSlot
        slot-key="offHand"
        :slot-name="getSlotName('offHand')"
        :item="getItem('offHand')"
        @click="$emit('selectSlot', 'offHand')"
      />
    </div>
  </div>
</template>

<style scoped>
.gear-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 600px;
}

.gear-row {
  display: grid;
  gap: 0.75rem;
}

.gear-row.top {
  grid-template-columns: 1fr;
  max-width: 200px;
  margin: 0 auto;
}

.gear-row.upper,
.gear-row.middle,
.gear-row.lower-with-rings,
.gear-row.bottom-with-weapons {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 640px) {
  .gear-row.upper,
  .gear-row.middle,
  .gear-row.lower-with-rings,
  .gear-row.bottom-with-weapons {
    grid-template-columns: 1fr;
  }
}
</style>
