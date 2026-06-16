# Setup Guide

## Prerequisites
- Node.js 20+
- Git

## Quick Start
1. Clone: `git clone https://github.com/striderZA/freelance-ops.git && cd freelance-ops`
2. Install: `npm install`
3. Install Playwright: `npx playwright install chromium`
4. Health check: `node doctor.mjs --json`
5. Follow the onboarding flow (pastes a lead URL or text)

## Personalization
- Fill in `modes/_profile.md` — your niches, rate floor, positioning
- Fill in `config/rates.yml` — your rate card
- Fill in `config/platforms.yml` — platforms you scan (Upwork)

## Usage
1. Paste a lead URL → auto-pipeline runs lead.md
2. Run `node scan.mjs --manual "text"` for JD text
3. Evaluate with `/freelance-ops-lead`
4. Generate a proposal with `/freelance-ops-proposal`

## Troubleshooting
- `node doctor.mjs` fails → missing config files
- Playwright error → `npx playwright install chromium`
- npm install fails → Node version < 20
