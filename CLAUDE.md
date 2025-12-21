# D3 Gear Analyzer

## Project Overview

Vue 3 + Vite PWA for analyzing Diablo III character gear via Battle.net API. Provides gear analysis, upgrade suggestions, and AI-powered build recommendations.

## Tech Stack

- Vue 3.5 with Composition API (`<script setup>`)
- TypeScript 5.9 (strict mode)
- Pinia for state management
- Vue Router 4
- Vite 7 with PWA plugin
- Cloudflare Workers (OAuth proxy in `workers/`)

## Architecture

```
src/
├── components/     # Feature-organized Vue components
│   ├── common/     # Shared UI (header, sidebar, spinner)
│   ├── advisor/    # Build recommendation components
│   ├── analysis/   # Upgrade analysis
│   ├── gear/       # Gear display (grid, slots, tooltips)
│   ├── hero/       # Hero profile display
│   ├── skills/     # Skills and cube powers
│   └── settings/   # Configuration forms
├── views/          # Page-level route components (*View.vue)
├── stores/         # Pinia state management
├── services/       # API clients and business logic
├── types/          # TypeScript interfaces
├── router/         # Vue Router configuration
└── assets/         # Styles and static files

workers/            # Cloudflare Worker backend (OAuth proxy)
public/             # PWA assets and icons
```

## Code Standards

### File Headers

Every source file (except trivial re-exports) requires this header:

```typescript
/**
 * @file [filename]
 * @description [one-line purpose]
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */
```

For Vue SFCs, place inside `<script setup>` block before imports.

### When Modifying Files

- Add header if missing
- Update `@ai-assisted` version if using newer Claude Code version
- Run `claude --version` to get current version

### Skip Headers For

- `types/index.ts` (re-exports only)
- `vite-env.d.ts` (Vite boilerplate)
- CSS files
- JSON files (no comment support)

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build (vue-tsc + vite) |
| `npm run type-check` | TypeScript validation only |
| `npm run preview` | Preview production build |

## External APIs

- **Battle.net API** - Diablo III profile and hero data
- **Claude API** - AI-powered build analysis (via `services/claudeAnalysis.ts`)

## State Management

Pinia stores in `src/stores/`:

| Store | Purpose |
|-------|---------|
| `settings` | API keys, region, UI preferences |
| `auth` | OAuth token management |
| `profile` | Battle.net profile data |
| `hero` | Current hero and gear |
| `analysis` | Gear analysis results |
| `claudeAnalysis` | AI recommendation caching |
| `savedReports` | Persisted reports (localStorage) |
