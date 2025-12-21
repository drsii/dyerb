<script setup lang="ts">
/**
 * @file SettingsView.vue
 * @description Configuration page for API credentials and app settings
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

import ApiKeyForm from '@/components/settings/ApiKeyForm.vue'
</script>

<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1>Settings</h1>
      <p class="description">
        Configure your Battle.net API credentials to access your Diablo III profile.
      </p>
    </div>

    <div class="settings-content">
      <section class="settings-section">
        <div class="section-header">
          <h2>API Configuration</h2>
        </div>
        <div class="card">
          <ApiKeyForm />
        </div>
      </section>

      <section class="settings-section">
        <div class="section-header">
          <h2>Setup Guide</h2>
        </div>
        <div class="card">
          <div class="setup-steps">
            <div class="step">
              <span class="step-number">1</span>
              <div class="step-content">
                <h4>Create a Battle.net Developer Application</h4>
                <p>
                  Go to the
                  <a href="https://develop.battle.net/access/clients" target="_blank" rel="noopener">
                    Battle.net Developer Portal
                  </a>
                  and create a new application.
                </p>
              </div>
            </div>

            <div class="step">
              <span class="step-number">2</span>
              <div class="step-content">
                <h4>Copy Your Credentials</h4>
                <p>
                  Copy the <strong>Client ID</strong> and <strong>Client Secret</strong>
                  from your application and paste them above.
                </p>
              </div>
            </div>

            <div class="step">
              <span class="step-number">3</span>
              <div class="step-content">
                <h4>Deploy the OAuth Proxy</h4>
                <p>
                  Battle.net requires a server for OAuth. Deploy the included
                  Cloudflare Worker and enter the URL above.
                </p>
                <pre class="code-block"><code># Navigate to workers folder
cd dyerb/workers

# Install wrangler if needed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npx wrangler deploy</code></pre>
                <p class="note">
                  After deploy, you'll get a URL like: <code>https://dyerb-proxy.&lt;your-account&gt;.workers.dev</code>
                </p>
              </div>
            </div>

            <div class="step">
              <span class="step-number">4</span>
              <div class="step-content">
                <h4>Make Your Profile Public</h4>
                <p>
                  In Battle.net account settings, ensure your Diablo III profile
                  is set to public visibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <div class="section-header">
          <h2>About</h2>
        </div>
        <div class="card">
          <p class="about-text">
            DYERB (Do You Even Rift Bro?) fetches your Diablo III character gear via the
            Battle.net API and helps you find upgrade opportunities by comparing
            your equipped items against the complete item database.
          </p>
          <div class="about-features">
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span>Analyze equipped gear</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🔍</span>
              <span>Browse item database</span>
            </div>
            <div class="feature">
              <span class="feature-icon">⬆️</span>
              <span>Find upgrade suggestions</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📱</span>
              <span>Works offline (PWA)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.settings-header .description {
  color: var(--text-secondary);
}

.settings-section {
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.setup-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step {
  display: flex;
  gap: 1rem;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--accent-gold);
  color: #000;
  font-weight: 700;
  border-radius: 50%;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.step-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.step-content a {
  color: var(--accent-gold);
}

.step-content .code-block {
  background: var(--bg-tertiary, #1a1a2e);
  border: 1px solid var(--border-color, #333);
  border-radius: 6px;
  padding: 1rem;
  margin: 0.75rem 0;
  overflow-x: auto;
}

.step-content .code-block code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--text-primary, #e0e0e0);
  white-space: pre;
}

.step-content .note {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.step-content .note code {
  background: var(--bg-tertiary, #1a1a2e);
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-size: 0.75rem;
}

.about-text {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.about-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.feature-icon {
  font-size: 1.25rem;
}
</style>
