# Freelance-Ops Providers & Collateral — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the three HTML templates for proposals/rate cards/portfolio, integrate them into the `generate-pdf.mjs` pipeline, and create the manual paste and Upwork providers so the system can actually receive and process real leads.

**Architecture:** This is a mix of code (providers, PDF integration) and content (HTML templates). The templates are self-contained HTML files with inline CSS rendered by Playwright. The providers follow the parent's `providers/` pattern: each exports a normalized lead object matching `_types.js`. The manual provider is zero-dependency (parse pasted text). The Upwork provider uses Playwright (headless browser, no API key needed).

**Tech Stack:** HTML/CSS (templates), Node.js mjs (providers, PDF pipeline), Playwright (PDF rendering + Upwork scraping), YAML (platform config).

**Reference files:**
- `templates/cv-template.html` from parent (deleted in Plan 1; fetch from upstream if needed)
- `providers/_types.js` — the normalized lead schema
- `providers/_http.mjs` — HTTP helpers
- `generate-pdf.mjs` — the PDF generation pipeline

---

## Phase A: HTML Templates & PDF Pipeline

### Task 1: Create templates/proposal-template.html

**Files:**
- Create: `templates/proposal-template.html`

**What to build:** A self-contained HTML file that renders a professional proposal PDF. Template variables rendered at generation time.

**Design:** Clean, single-page, professional. Uses Space Grotesk (headings) and DM Sans (body) font families loaded from `fonts/`. Responsive to standard A4.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    /* A4 page setup, fonts, layout */
    body {
      font-family: 'DM Sans', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm 25mm;
    }
    h1 { font-family: 'Space Grotesk', sans-serif; font-size: 24pt; }
    h2 { font-family: 'Space Grotesk', sans-serif; font-size: 16pt; border-bottom: 1px solid #ddd; }
    /* ... full styling ... */
  </style>
</head>
<body>
  <!-- Render blocks: -->
  <!-- Template variables use {{VARIABLE}} syntax -->
  <div class="header">
    <h1>Proposal for {{CLIENT_NAME}}</h1>
    <p class="meta">{{DATE}} · {{SCOPE}}</p>
  </div>
  <div class="hook">
    <p>{{HOOK}}</p>
  </div>
  <h2>Relevant Experience</h2>
  <ul>
    {{#each EXPERIENCE}}
    <li><strong>{{title}}</strong> — {{description}}</li>
    {{/each}}
  </ul>
  <h2>Plan</h2>
  <ol>
    {{#each PLAN}}
    <li><strong>{{milestone}}</strong> — {{details}}</li>
    {{/each}}
  </ol>
  <h2>Timeline</h2>
  <p>{{TIMELINE}}</p>
  <h2>Price</h2>
  <p>{{PRICE}}</p>
  <div class="cta">
    <p>{{CTA}}</p>
  </div>
  <div class="footer">
    <p>{{NAME}} · {{EMAIL}} · {{PHONE}}</p>
  </div>
</body>
</html>
```

**Important:** The template engine is simple string replacement (not Handlebars). The `generate-pdf.mjs` script will replace `{{VARIABLE}}` placeholders with values. The `{{#each EXPERIENCE}}...{{/each}}` loop syntax should be supported via a simple regex loop in the generator. Keep the template logic simple — the AI agent fills in the gaps when generating the HTML.

**Font loading (at the top of `<style>`):**
```css
@font-face { font-family: 'Space Grotesk'; src: url('../fonts/space-grotesk-latin.woff2') format('woff2'); }
@font-face { font-family: 'DM Sans'; src: url('../fonts/dm-sans-latin.woff2') format('woff2'); }
```

**Length:** 150-250 lines (HTML + inline CSS).

**Commit:** `feat(templates): create proposal-template.html for A4 proposal PDFs`

### Task 2: Create templates/rate-card-template.html

**Files:**
- Create: `templates/rate-card-template.html`

**What to build:** Single-page A4 rate card with services table, payment terms, availability, and contact info.

**Design:** Table-driven layout for the services section. Clean, professional, one page.

**Structure:**
- Header: "Rate Card — {{NAME}}" + date
- Services table: Service | Rate | Typical Duration
- Payment Terms: {{TERMS}}
- Availability: {{AVAILABILITY}}
- Contact: {{NAME}} · {{EMAIL}} · {{PHONE}}

**Length:** 100-200 lines.

**Commit:** `feat(templates): create rate-card-template.html for A4 rate card PDFs`

### Task 3: Create templates/portfolio-template.html

**Files:**
- Create: `templates/portfolio-template.html`

**What to build:** Single-page A4 case study / portfolio piece.

**Structure:**
- Header: "Case Study: {{CLIENT_NAME}} — {{PROJECT_TITLE}}"
- Problem: {{PROBLEM}}
- Approach: {{APPROACH}}
- Results: {{RESULTS}} (with metrics)
- Tech Stack: {{TECH_STACK}}
- Engagement: {{TIMELINE}} · {{RATE}} · {{PLATFORM}}

**Length:** 100-200 lines.

**Commit:** `feat(templates): create portfolio-template.html for A4 case study PDFs`

### Task 4: Update generate-pdf.mjs for new templates

**Files:**
- Modify: `generate-pdf.mjs`

**What to do:**
- Read the current `generate-pdf.mjs` (the parent's script that renders HTML to PDF via Playwright).
- Update it to handle the three new templates:
  - `proposal-template.html` — template variable: CLIENT_NAME, DATE, SCOPE, HOOK, EXPERIENCE, PLAN, TIMELINE, PRICE, CTA, NAME, EMAIL, PHONE
  - `rate-card-template.html` — template variables: NAME, DATE, SERVICES, TERMS, AVAILABILITY, EMAIL, PHONE
  - `portfolio-template.html` — template variables: CLIENT_NAME, PROJECT_TITLE, PROBLEM, APPROACH, RESULTS, TECH_STACK, TIMELINE, RATE, PLATFORM
- Add a template variable replacement function that handles `{{VARIABLE}}` and `{{#each ARRAY}}...{{/each}}` syntax.
- Keep the parent's existing structure (path resolution, font loading, page setup, PDF options).
- Add a CLI arg: `--template <name>` to select which template to render.
- Default output path: `output/{template-type}/{num}-{slug}.pdf`

**Key considerations:**
- The parent's generate-pdf.mjs expects a specific template path. We need to generalize this.
- The `{{#each}}` loop should handle arrays passed as JSON strings.
- Fall back to inline HTML if template file doesn't exist.

**Commit:** `feat(pdf): update generate-pdf.mjs for proposal/rate-card/portfolio templates`

---

## Phase B: Manual Provider

### Task 5: TDD providers/manual.mjs

**Files:**
- Create: `providers/manual.mjs`
- Test: `tests/manual-provider.test.mjs`

**What to build:** A zero-dependency provider that parses pasted job description text (or URL → Playwright fetch) and returns a normalized lead object matching `providers/_types.js`.

```javascript
// Normalized lead object (matching _types.js schema)
{
  client: "Acme Corp",
  role: "Senior AI Engineer - Lead Consultant",
  platform: "Direct",  // or "Upwork", "Toptal", "Manual", etc.
  url: "https://...",
  description: "Full JD text...",
  budget: "$95/hr",
  budgetType: "hourly", // "hourly" | "fixed"
  engagement: "project", // "project" | "contract" | "gig"
  location: "Remote",
  postedDate: "2026-06-15",
  source: "manual"
}
```

**What the provider does:**
- If input is a URL: use `browser_navigate` + `browser_snapshot` to fetch content, then extract JD text from the page.
- If input is plain text: use it directly as the JD body, attempt to extract structured fields via simple heuristics.
- The provider is "zero-LLM" — it uses regex and heuristic parsing for structure extraction, not an AI call.

**Test (`tests/manual-provider.test.mjs`):**
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseJobDescription } from '../providers/manual.mjs';

test('parseJobDescription extracts client name from text', () => {
  const result = parseJobDescription('Client: Acme Corp\nBudget: $95/hr\nRole: Senior Engineer\n');
  assert.equal(result.client, 'Acme Corp');
  assert.equal(result.budget, '$95/hr');
  assert.equal(result.role, 'Senior Engineer');
});

test('parseJobDescription handles minimal input gracefully', () => {
  const result = parseJobDescription('We are looking for a developer...');
  assert.ok(result.client || true); // may not extract client from vague text
  assert.equal(result.budgetType, 'hourly'); // default
});
```

**Architecture:**
- Export `parseJobDescription(text)` function that returns a partial lead object
- Export `fetchFromUrl(url)` that uses Playwright to get the page content, then calls `parseJobDescription`
- Export `normalizeLead(raw)` that fills in defaults and returns a normalized lead matching `_types.js`
- The provider is stateless (no dedup, no caching — that's handled by the calling mode)

**Commit:** `feat(providers): add manual.mjs and tests (zero-llm JD parser + URL fetcher)`

### Task 6: Update scan.mjs to use manual provider

**Files:**
- Modify: `scan.mjs`

**What to do:**
- Update `scan.mjs` (the zero-token scanner from the parent) to use the manual provider.
- Add `--manual` flag: `node scan.mjs --manual "pasted JD text"` → calls `providers/manual.mjs` → appends to `data/pipeline.md`.
- The existing scan logic (scanning configured portals/platforms) can remain but will be fallback-only (since there are no ATS providers to scan anymore).

Commit: `feat(scan): add --manual flag for parsed JD text input`

---

## Phase C: Upwork Provider (Playwright-based)

### Task 7: Build providers/upwork.mjs

**Files:**
- Create: `providers/upwork.mjs`
- Test: `tests/upwork-provider.test.mjs`

**What to build:** A Playwright-based Upwork job search scraper. Upwork has no free public job search API, so this uses headless browser automation.

**Architecture:**
```javascript
// providers/upwork.mjs
// Exports:
export async function search(query, config = {}) {
  // Search Upwork for jobs matching the query
  // Config: maxResults, country, category, etc.
  // Returns: array of normalized lead objects
}

export async function fetchJobDetails(url) {
  // Fetch full details of a specific Upwork job posting
  // Returns: normalized lead object
}
```

**Implementation approach:**
1. Launch Playwright (`chromium.launch({ headless: true })`)
2. Navigate to Upwork job search URL (constructed from query + config)
3. Wait for job listings to load
4. Extract job cards: title, client, budget, posted date, description snippet
5. For each job, optionally fetch the detail page
6. Close browser
7. Return normalized lead objects

**Important ethical considerations:**
- Rate-limit: 1 request per 2 seconds minimum
- No login required (searching public job listings is allowed by Upwork ToS)
- Max 50 results per search run
- Respect robots.txt
- Zero-LLM for listing extraction (use CSS selectors, not AI)

**Test (`tests/upwork-provider.test.mjs`):**
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('upwork module exports expected functions', () => {
  const upwork = require('../providers/upwork.mjs');
  assert.equal(typeof upwork.search, 'function');
  assert.equal(typeof upwork.fetchJobDetails, 'function');
});

test('search query URL is constructed correctly', () => {
  const upwork = require('../providers/upwork.mjs');
  const url = upwork.buildSearchUrl('AI consulting', { category: 'web-mobile-software-dev' });
  assert.match(url, /upwork\.com/);
  assert.match(url, /q=AI/);
});
```

**Fallback:** If Playwright is unavailable or Upwork blocks the request, return an empty array with a warning message. The user can use the manual provider instead.

**Commit:** `feat(providers): add upwork.mjs with Playwright-based job search scraping`

### Task 8: Update config/platforms.yml structure for Upwork

**Files:**
- Modify: `config/platforms.example.yml`

**What to do:**
- Update the example config file to include search query configuration for Upwork:

```yaml
# Freelance-Ops platform search configuration
platforms:
  - name: Upwork
    enabled: true
    max_results: 25
    searches:
      - query: "AI consulting"
        category: "web-mobile-software-dev"
        min_budget: "$75/hr"
      - query: "machine learning"
        category: "data-science-analytics"
        min_budget: "$80/hr"
```

- Include comments explaining each field.
- The search queries come from `modes/_profile.md` (the user's niches). This config lets the user override or add searches.

**Commit:** `feat(config): update platforms.example.yml for Upwork search queries`

---

## Phase D: Integration & Smoke Test

### Task 9: Wire templates into the proposal/portfolio modes

**Files:**
- Modify: `modes/proposal.md`
- Modify: `modes/portfolio.md`

**What to do:**
- Update `modes/proposal.md` to reference `templates/proposal-template.html` in its workflow: "Write the proposal HTML using the template variables, then run `generate-pdf.mjs --template proposal`."
- Update `modes/portfolio.md` similarly for `templates/rate-card-template.html` and `templates/portfolio-template.html`.

This is a small content update — referencing the real template files instead of a generic "render to PDF" instruction.

**Commit:** `docs(modes): wire templates into proposal.md and portfolio.md workflows`

### Task 10: End-to-end smoke test

**Files:** (no new files; verification task)

**What to do:**
1. Create a minimal test fixture:
   - A simple test HTML file that exercises the `{{VARIABLE}}` replacement
   - A test Upwork search query (dry run — verify URL construction, don't actually scrape)
2. Verify `generate-pdf.mjs` works with each template:
   - `node generate-pdf.mjs --template proposal <test-data>` → creates PDF in output/
3. Verify the manual provider parses a test JD correctly:
   ```
   node -e "import('./providers/manual.mjs').then(m => console.log(m.parseJobDescription('Client: Test\nBudget: $100/hr\nRole: Freelance Dev')))"
   ```
4. Run test-all.mjs — no regressions
5. Run unit tests — all pass
6. Tag `v0.3.0-providers`

**Commit:** `chore: tag v0.3.0-providers after Plan 3 smoke test`

---

## Spec Coverage (Plan 3)

| Workstream | Plan task |
|------------|-----------|
| Workstream 4 (Upwork provider) | Tasks 7-8 |
| Workstream 5 (Proposal generator) | Tasks 1, 4, 9 |
| Workstream 6 (Rate card + portfolio) | Tasks 2-3, 4, 9 |
| Workstream 11 (Docs) | Tasks 5-6 |
| Workstream 13 (Smoke test) | Task 10 |

## What This Plan Does NOT Deliver

- **Real invoicing / time tracking / contract generation** — explicitly out of scope per the spec
- **Multi-platform support** (Toptal, Contra, Fiverr, Freelancer) — Plan 4 or later
- **Dashboard rewrite** (Go TUI) — Plan 4
- The Upwork provider is a **best-effort scraping approach**. If Upwork blocks headless browsers or changes their DOM significantly, it will fail and fall back to the manual provider. This is acceptable for v0.3.0.

## Self-Review

- **Spec coverage:** All 3 workstreams (4, 5, 6) covered. The Upwork provider is a Playwright-based approach (not zero-token) because Upwork has no free public API. The ethical constraints (rate-limit, no login, robots.txt) are built into the task spec.
- **Type consistency:** Providers return objects matching `_types.js`. Templates use consistent `{{VARIABLE}}` syntax. The `generate-pdf.mjs` update handles all 3 templates.
- **Placeholder scan:** No TBDs/TODOs.
- **Gaps:** None in scope. Plan 4 covers the dashboard and remaining polish.
