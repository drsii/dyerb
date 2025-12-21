<script setup lang="ts">
/**
 * @file DashboardView.vue
 * @description Hero gear dashboard with equipment grid and upgrade suggestions
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHeroStore } from '@/stores/hero'
import { useAnalysisStore } from '@/stores/analysis'
import GearGrid from '@/components/gear/GearGrid.vue'
import ItemTooltip from '@/components/gear/ItemTooltip.vue'
import SkillBar from '@/components/skills/SkillBar.vue'
import CubePowers from '@/components/skills/CubePowers.vue'
import UpgradePanel from '@/components/analysis/UpgradePanel.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { Item } from '@/types'

const route = useRoute()
const router = useRouter()
const heroStore = useHeroStore()
const analysisStore = useAnalysisStore()

const heroId = computed(() => Number(route.params.heroId))
const selectedItem = ref<Item | null>(null)
const showTooltip = ref(false)
const showAnalysis = ref(true)

onMounted(async () => {
  if (heroId.value) {
    await heroStore.loadHero(heroId.value)
  }
})

watch(() => heroStore.currentHero, (hero) => {
  if (hero) {
    analysisStore.analyzeHero(hero)
  }
}, { immediate: true })

function handleSlotClick(slotKey: string) {
  const item = heroStore.getItemBySlot(slotKey)
  if (item) {
    selectedItem.value = item
    showTooltip.value = true
  }
}

function handleCloseTooltip() {
  showTooltip.value = false
  selectedItem.value = null
}

function formatNumber(num?: number): string {
  if (!num) return '—'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toLocaleString()
}

function goBack() {
  router.push('/heroes')
}
</script>

<template>
  <div class="dashboard-view">
    <!-- Loading State -->
    <div v-if="heroStore.isLoading" class="loading-state">
      <LoadingSpinner message="Loading hero data..." />
    </div>

    <!-- Error State -->
    <div v-else-if="heroStore.error" class="error-state">
      <h2>Error Loading Hero</h2>
      <p>{{ heroStore.error }}</p>
      <button class="btn btn-primary" @click="goBack">Back to Heroes</button>
    </div>

    <!-- Hero Dashboard -->
    <template v-else-if="heroStore.currentHero">
      <div class="dashboard-header">
        <button class="btn btn-secondary back-btn" @click="goBack">
          ← Back
        </button>
        <div class="hero-info">
          <h1>{{ heroStore.currentHero.name }}</h1>
          <div class="hero-subtitle">
            Level {{ heroStore.currentHero.level }}
            {{ heroStore.currentHero.heroClass }}
            <span v-if="heroStore.currentHero.paragonLevel" class="paragon">
              (P{{ heroStore.currentHero.paragonLevel }})
            </span>
            <span v-if="heroStore.currentHero.seasonal" class="badge seasonal">Seasonal</span>
            <span v-if="heroStore.currentHero.hardcore" class="badge hardcore">Hardcore</span>
          </div>
        </div>
        <button class="btn btn-ai" @click="router.push('/build-advisor')">
          🤖 Get Build Advice
        </button>
      </div>

      <div class="dashboard-content">
        <!-- Left Sidebar: Stats & Skills -->
        <aside class="dashboard-sidebar">
          <!-- Stats Card -->
          <div class="card stats-card">
            <div class="stats-header">
              <h3>Character Stats</h3>
              <div
                class="gear-score-badge"
                :class="{
                  low: analysisStore.overallScore < 50,
                  medium: analysisStore.overallScore >= 50 && analysisStore.overallScore < 80,
                  high: analysisStore.overallScore >= 80
                }"
              >
                <span class="score-value">{{ analysisStore.overallScore }}</span>
                <span class="score-label">Score</span>
              </div>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Damage</span>
                <span class="stat-value damage">
                  {{ formatNumber(heroStore.currentHero.damage) }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Toughness</span>
                <span class="stat-value toughness">
                  {{ formatNumber(heroStore.currentHero.toughness) }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Recovery</span>
                <span class="stat-value recovery">
                  {{ formatNumber(heroStore.currentHero.recovery) }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Life</span>
                <span class="stat-value life">
                  {{ formatNumber(heroStore.currentHero.life) }}
                </span>
              </div>
            </div>

            <!-- Active Sets -->
            <div v-if="analysisStore.activeSets.length > 0" class="active-sets">
              <h4>Active Sets</h4>
              <div class="set-list">
                <div v-for="set in analysisStore.activeSets" :key="set.setName" class="set-item">
                  <span class="set-name quality-set">{{ set.setName }}</span>
                  <span class="set-count">{{ set.piecesEquipped }}/6</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Skills -->
          <div class="card">
            <h3>Skills</h3>
            <SkillBar
              :active-skills="heroStore.currentHero.activeSkills"
              :passive-skills="heroStore.currentHero.passiveSkills"
            />
          </div>

          <!-- Kanai's Cube -->
          <div class="card">
            <CubePowers :powers="heroStore.currentHero.cubePowers" />
          </div>

          <!-- Legendary Gems -->
          <div v-if="heroStore.legendaryGems.length > 0" class="card">
            <h3>Legendary Gems</h3>
            <div class="gems-list">
              <div
                v-for="(gem, index) in heroStore.legendaryGems"
                :key="index"
                class="gem-item"
              >
                <span class="gem-name">{{ gem.name }}</span>
                <span v-if="gem.rank" class="gem-rank">Rank {{ gem.rank }}</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main: Gear Grid -->
        <main class="dashboard-main">
          <div class="card">
            <h3>Equipped Gear</h3>
            <p class="card-description">Click on an item to view details</p>
            <GearGrid
              :items="heroStore.equippedItems"
              @select-slot="handleSlotClick"
            />
          </div>
        </main>

        <!-- Right Sidebar: Analysis -->
        <aside v-if="showAnalysis" class="dashboard-analysis">
          <div class="card">
            <div class="analysis-header">
              <h3>Gear Analysis</h3>
              <button class="btn-icon" @click="showAnalysis = false" title="Hide">
                &times;
              </button>
            </div>
            <UpgradePanel />
          </div>
        </aside>

        <!-- Show Analysis Button (when hidden) -->
        <button
          v-else
          class="show-analysis-btn"
          @click="showAnalysis = true"
        >
          Show Analysis
        </button>
      </div>
    </template>

    <!-- Item Tooltip -->
    <ItemTooltip
      v-if="selectedItem"
      :item="selectedItem"
      :visible="showTooltip"
      @close="handleCloseTooltip"
    />
  </div>
</template>

<style scoped>
.dashboard-view {
  max-width: 1400px;
  margin: 0 auto;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.error-state h2 {
  color: var(--accent-red);
  margin-bottom: 0.5rem;
}

.error-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.dashboard-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.back-btn {
  flex-shrink: 0;
}

.btn-ai {
  margin-left: auto;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ai:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.hero-info h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.hero-subtitle {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.paragon {
  color: var(--accent-blue);
}

.badge {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.badge.seasonal {
  background: var(--accent-green);
  color: #000;
}

.badge.hardcore {
  background: var(--accent-red);
  color: #fff;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 320px 1fr 300px;
  gap: 1.5rem;
  align-items: start;
  position: relative;
}

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-sidebar .card {
  padding: 1.25rem;
}

.dashboard-sidebar h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stats-header h3 {
  margin-bottom: 0;
}

.gear-score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid var(--border-color);
  background: var(--bg-tertiary);
}

.gear-score-badge.low {
  border-color: var(--accent-red);
}

.gear-score-badge.medium {
  border-color: var(--accent-orange);
}

.gear-score-badge.high {
  border-color: var(--accent-green);
}

.gear-score-badge .score-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.gear-score-badge.low .score-value {
  color: var(--accent-red);
}

.gear-score-badge.medium .score-value {
  color: var(--accent-orange);
}

.gear-score-badge.high .score-value {
  color: var(--accent-green);
}

.gear-score-badge .score-label {
  font-size: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  margin-top: 0.125rem;
}

.active-sets {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.active-sets h4 {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
}

.stat-value.damage {
  color: var(--accent-red);
}

.stat-value.toughness {
  color: var(--accent-blue);
}

.stat-value.recovery {
  color: var(--accent-green);
}

.stat-value.life {
  color: var(--text-primary);
}

.set-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.set-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.set-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.set-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.gems-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gem-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.gem-name {
  font-size: 0.875rem;
  color: #bf94ff;
}

.gem-rank {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.dashboard-main .card {
  padding: 1.5rem;
}

.dashboard-main h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.dashboard-analysis .card {
  padding: 0;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0;
}

.analysis-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.btn-icon:hover {
  color: var(--text-primary);
}

.show-analysis-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.show-analysis-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 280px 1fr;
  }

  .dashboard-analysis {
    grid-column: 1 / -1;
    order: 3;
  }
}

@media (max-width: 900px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .dashboard-sidebar {
    order: 2;
  }

  .dashboard-main {
    order: 1;
  }

  .dashboard-analysis {
    order: 3;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
