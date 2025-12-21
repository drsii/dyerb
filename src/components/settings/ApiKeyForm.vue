<script setup lang="ts">
/**
 * @file ApiKeyForm.vue
 * @description Battle.net and Claude API credential configuration form
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { Region } from '@/types'

const settings = useSettingsStore()

// Local form state
const formData = ref({
  clientId: settings.clientId,
  clientSecret: settings.clientSecret,
  region: settings.region as Region,
  battletag: settings.battletag,
  proxyUrl: settings.proxyUrl,
  claudeApiKey: settings.claudeApiKey
})

const showSecrets = ref(false)
const showClaudeKey = ref(false)
const isSaving = ref(false)
const saveMessage = ref('')

const isValid = computed(() => {
  return (
    formData.value.clientId.trim() !== '' &&
    formData.value.clientSecret.trim() !== '' &&
    formData.value.battletag.trim() !== '' &&
    isValidBattletag(formData.value.battletag)
  )
})

function isValidBattletag(tag: string): boolean {
  // BattleTag format: 3-12 characters, # or -, then 4-8 digits
  const pattern = /^[a-zA-Z][a-zA-Z0-9]{2,11}[#\-]\d{4,8}$/
  return pattern.test(tag)
}

async function handleSave() {
  if (!isValid.value) return

  isSaving.value = true
  saveMessage.value = ''

  try {
    settings.updateSettings({
      clientId: formData.value.clientId.trim(),
      clientSecret: formData.value.clientSecret.trim(),
      region: formData.value.region,
      battletag: formData.value.battletag.trim(),
      proxyUrl: formData.value.proxyUrl.trim(),
      claudeApiKey: formData.value.claudeApiKey.trim()
    })

    saveMessage.value = 'Settings saved successfully!'

    // Clear message after 3 seconds
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  } catch (error) {
    saveMessage.value = 'Failed to save settings'
    console.error('Save error:', error)
  } finally {
    isSaving.value = false
  }
}

function handleClear() {
  if (confirm('Are you sure you want to clear all settings?')) {
    settings.clearSettings()
    formData.value = {
      clientId: '',
      clientSecret: '',
      region: 'us',
      battletag: '',
      proxyUrl: settings.proxyUrl,
      claudeApiKey: ''
    }
  }
}

function handleDestroyAllData() {
  if (confirm('⚠️ This will permanently delete ALL local data including:\n\n• API keys and credentials\n• Saved reports\n• Cached data\n• Service worker cache\n\nThis cannot be undone. Continue?')) {
    settings.destroyAllData()
    formData.value = {
      clientId: '',
      clientSecret: '',
      region: 'us',
      battletag: '',
      proxyUrl: settings.proxyUrl,
      claudeApiKey: ''
    }
    saveMessage.value = 'All data destroyed successfully'
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  }
}
</script>

<template>
  <form class="api-key-form" @submit.prevent="handleSave">
    <div class="form-group">
      <label for="clientId">Client ID</label>
      <input
        id="clientId"
        v-model="formData.clientId"
        type="text"
        placeholder="Enter your Battle.net Client ID"
        autocomplete="off"
      />
      <p class="form-help">
        Get this from
        <a href="https://develop.battle.net/access/clients" target="_blank" rel="noopener">
          Battle.net Developer Portal
        </a>
      </p>
    </div>

    <div class="form-group">
      <label for="clientSecret">Client Secret</label>
      <div class="input-with-toggle">
        <input
          id="clientSecret"
          v-model="formData.clientSecret"
          :type="showSecrets ? 'text' : 'password'"
          placeholder="Enter your Client Secret"
          autocomplete="off"
        />
        <button
          type="button"
          class="toggle-visibility"
          @click="showSecrets = !showSecrets"
        >
          {{ showSecrets ? 'Hide' : 'Show' }}
        </button>
      </div>
    </div>

    <div class="form-group">
      <label for="battletag">BattleTag</label>
      <input
        id="battletag"
        v-model="formData.battletag"
        type="text"
        placeholder="Player#1234"
        autocomplete="off"
      />
      <p
        v-if="formData.battletag && !isValidBattletag(formData.battletag)"
        class="form-error"
      >
        Invalid BattleTag format. Use format: Name#1234
      </p>
    </div>

    <div class="form-group">
      <label for="region">Region</label>
      <select id="region" v-model="formData.region">
        <option value="us">Americas (US)</option>
        <option value="eu">Europe (EU)</option>
        <option value="kr">Korea (KR)</option>
        <option value="tw">Taiwan (TW)</option>
      </select>
    </div>

    <div class="form-group">
      <label for="proxyUrl">Proxy URL</label>
      <input
        id="proxyUrl"
        v-model="formData.proxyUrl"
        type="url"
        placeholder="https://your-worker.workers.dev"
      />
      <p class="form-help">
        Cloudflare Worker URL for OAuth proxy (required for authentication)
      </p>
    </div>

    <!-- Claude API Section -->
    <div class="section-divider">
      <h3>AI Build Advisor (Optional)</h3>
      <p class="section-description">
        Enable AI-powered build suggestions using Claude
      </p>
    </div>

    <div class="form-group">
      <label for="claudeApiKey">Claude API Key</label>
      <div class="input-with-toggle">
        <input
          id="claudeApiKey"
          v-model="formData.claudeApiKey"
          :type="showClaudeKey ? 'text' : 'password'"
          placeholder="sk-ant-api..."
          autocomplete="off"
        />
        <button
          type="button"
          class="toggle-visibility"
          @click="showClaudeKey = !showClaudeKey"
        >
          {{ showClaudeKey ? 'Hide' : 'Show' }}
        </button>
      </div>
      <p class="form-help">
        Get your API key from
        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">
          Anthropic Console
        </a>
        - enables AI build recommendations
      </p>
    </div>

    <div v-if="saveMessage" class="form-message" :class="{ error: saveMessage.includes('Failed') }">
      {{ saveMessage }}
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary" :disabled="!isValid || isSaving">
        {{ isSaving ? 'Saving...' : 'Save Settings' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="handleClear">
        Clear Settings
      </button>
    </div>

    <div class="danger-zone">
      <h3>Danger Zone</h3>
      <p>Permanently delete all local data including API keys, saved reports, and cached data.</p>
      <button type="button" class="btn btn-danger" @click="handleDestroyAllData">
        Destroy All Data
      </button>
    </div>
  </form>
</template>

<style scoped>
.api-key-form {
  max-width: 480px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  width: 100%;
}

.form-help {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.form-help a {
  color: var(--accent-gold);
}

.form-error {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--accent-red);
}

.input-with-toggle {
  display: flex;
  gap: 0.5rem;
}

.input-with-toggle input {
  flex: 1;
}

.toggle-visibility {
  padding: 0.625rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  white-space: nowrap;
}

.toggle-visibility:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.form-message {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  background: rgba(39, 174, 96, 0.1);
  color: var(--accent-green);
  border: 1px solid var(--accent-green);
}

.form-message.error {
  background: rgba(192, 57, 43, 0.1);
  color: var(--accent-red);
  border-color: var(--accent-red);
}

.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.section-divider {
  margin: 2rem 0 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.section-divider h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent-gold);
  margin-bottom: 0.25rem;
}

.section-description {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.danger-zone {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--accent-red);
  border-radius: 8px;
  background: rgba(192, 57, 43, 0.05);
}

.danger-zone h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent-red);
  margin-bottom: 0.5rem;
}

.danger-zone p {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.btn-danger {
  background: var(--accent-red);
  border-color: var(--accent-red);
  color: white;
}

.btn-danger:hover {
  background: #a93226;
  border-color: #a93226;
}
</style>
