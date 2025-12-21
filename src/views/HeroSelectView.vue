<script setup lang="ts">
/**
 * @file HeroSelectView.vue
 * @description Hero selection page displaying all characters from Battle.net profile
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import HeroCard from '@/components/hero/HeroCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const profile = useProfileStore()
const auth = useAuthStore()

onMounted(async () => {
  // Authenticate first
  if (!auth.isAuthenticated) {
    await auth.authenticate()
  }

  // Then fetch heroes
  if (auth.isAuthenticated && profile.heroes.length === 0) {
    await profile.fetchHeroes()
  }
})

function handleSelectHero(heroId: number) {
  router.push(`/dashboard/${heroId}`)
}

async function handleRefresh() {
  await profile.fetchHeroes()
}
</script>

<template>
  <div class="hero-select-view">
    <div class="view-header">
      <div>
        <h1>Select a Hero</h1>
        <p class="description">Choose a hero to analyze their gear</p>
      </div>
      <button
        v-if="profile.heroes.length > 0"
        class="btn btn-secondary"
        :disabled="profile.isLoading"
        @click="handleRefresh"
      >
        {{ profile.isLoading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <!-- Auth Error -->
    <div v-if="auth.error" class="error-card">
      <h3>Authentication Error</h3>
      <p>{{ auth.error }}</p>
      <router-link to="/settings" class="btn btn-primary">
        Check Settings
      </router-link>
    </div>

    <!-- Loading -->
    <div v-else-if="auth.isLoading || profile.isLoading" class="loading-state">
      <LoadingSpinner
        :message="auth.isLoading ? 'Authenticating...' : 'Loading heroes...'"
      />
    </div>

    <!-- Profile Error -->
    <div v-else-if="profile.error" class="error-card">
      <h3>Error Loading Heroes</h3>
      <p>{{ profile.error }}</p>
      <div class="error-actions">
        <button class="btn btn-primary" @click="handleRefresh">
          Try Again
        </button>
        <router-link to="/settings" class="btn btn-secondary">
          Check Settings
        </router-link>
      </div>
    </div>

    <!-- No Heroes -->
    <div v-else-if="profile.heroes.length === 0" class="empty-state">
      <div class="empty-icon">🎮</div>
      <h3>No Heroes Found</h3>
      <p>
        No heroes were found on this account. Make sure your profile is public
        and you have created at least one character.
      </p>
      <button class="btn btn-primary" @click="handleRefresh">
        Refresh
      </button>
    </div>

    <!-- Hero List -->
    <div v-else class="hero-grid">
      <HeroCard
        v-for="hero in profile.heroes"
        :key="hero.heroId"
        :hero="hero"
        @select="handleSelectHero"
      />
    </div>
  </div>
</template>

<style scoped>
.hero-select-view {
  max-width: 900px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.view-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.view-header .description {
  color: var(--text-secondary);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.error-card {
  background: rgba(192, 57, 43, 0.1);
  border: 1px solid var(--accent-red);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.error-card h3 {
  color: var(--accent-red);
  margin-bottom: 0.5rem;
}

.error-card p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  white-space: pre-line;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  max-width: 400px;
  margin: 0 auto 1.5rem;
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

@media (max-width: 640px) {
  .view-header {
    flex-direction: column;
    gap: 1rem;
  }

  .hero-grid {
    grid-template-columns: 1fr;
  }
}
</style>
