# Freelance-Ops Dashboard, Polish & Go-Live — Implementation Plan

**Goal:** Finalize the freelance-ops pipeline — dashboard, docs hardening, CI cleanup, and v1.0.0-rc release.

**Architecture:** Mixed — Go Bubble Tea TUI rewrite (dashboard), markdown/code polish (README, SETUP, CI).

---

## Phase A: Quick Polish

### Task 1: npm install + dependency audit

**Files:** `package.json`, `node_modules/`, `package-lock.json`

- [ ] Step 1: `npm install` — installs `js-yaml`, `playwright`, `dotenv` etc.
- [ ] Step 2: `node test-all.mjs --quick` — count how many pre-existing failures are fixed by the install

**Result:** Hopefully 5-10 of the 21 pre-existing failures disappear (js-yaml related, etc.)

**Commit:** `chore: npm install and audit dependencies`

### Task 2: Rewrite the bottom half of README.md

**Files:** `README.md`

The top was rewritten in Plan 1. The bottom still has FTE content: Gemini CLI Integration, Usage section referencing old mode names, Pre-configured Portals (Greenhouse/Ashby/Lever), Project Structure (shows `cv.md`, `applications.md`, etc.), old warning about "ATS-optimized CVs".

Replace these sections with freelance equivalents:
- **Usage section:** Show `/freelance-ops` commands (all 18), with a "Starter flow" (paste lead → evaluate → propose → track)
- **How It Works:** Diagram the freelance pipeline (Lead → Qualify → Propose → Contract → Deliver → Invoice → Paid)
- **Project Structure:** Update the file tree to show real freelance-ops files
- **Pre-configured Platforms:** Mention Upwork (not Greenhouse/Ashby/Lever)
- **Status section:** Update the version to v0.3.0 and mention Plans 1-3 are complete

**Commit:** `docs: rewrite bottom half of README for freelance pipeline`

### Task 3: Rewrite docs/SETUP.md

**Files:** `docs/SETUP.md`

Currently references the parent's setup flow. Rewrite for freelance-ops:
- Quick start: `npx @striderZA/freelance-ops init` (or `npm install` + `npx playwright install chromium`)
- First run: `node doctor.mjs --json` → onboarding flow
- Personalization: fill in `modes/_profile.md`, `config/rates.yml`, `config/platforms.yml`
- Usage: paste a lead URL, run scan, evaluate, propose
- Troubleshooting: common issues (Playwright not installed, missing profile, rate limit)

**Commit:** `docs: rewrite SETUP.md for freelance-ops onboarding`

### Task 4: Update update-system.mjs SYSTEM_PATHS

**Files:** `update-system.mjs`

The `SYSTEM_PATHS` array (line 37+) still references old FTE mode files (`oferta.md`, `ofertas.md`, `cover.md`, `contacto.md`, `pdf.md`, `interview.md`, `interview-prep.md`, `latex.md`). It needs to reference the new 17 freelance mode files.

Read the current `SYSTEM_PATHS` array and replace with:

```javascript
const SYSTEM_PATHS = [
  'modes/_shared.md',
  'modes/_profile.template.md',
  'modes/blocks/lead-blocks.md',
  'modes/lead.md', 'modes/leads.md',
  'modes/proposal.md', 'modes/portfolio.md', 'modes/pitch.md',
  'modes/screening.md', 'modes/nurture.md', 'modes/outreach.md',
  'modes/pipeline.md', 'modes/scan.md',
  'modes/tracker.md', 'modes/auto-pipeline.md', 'modes/patterns.md',
  'modes/onboarding.md', 'modes/deep.md',
  'modes/training.md', 'modes/project.md',
  // Keep standard system files:
  'AGENTS.md', 'CLAUDE.md', 'OPENCODE.md', 'GEMINI.md',
  'templates/states.yml',
  'templates/proposal-template.html',
  'templates/rate-card-template.html',
  'templates/portfolio-template.html',
  'providers/_http.mjs', 'providers/_types.js',
  'providers/manual.mjs', 'providers/upwork.mjs',
  'providers/local-parser.mjs',
  'merge-tracker.mjs', 'dedup-tracker.mjs', 'normalize-statuses.mjs',
  'verify-pipeline.mjs', 'reserve-report-num.mjs',
  'doctor.mjs', 'update-system.mjs', 'scan.mjs', 'generate-pdf.mjs',
  'not-found-handler.mjs',
  // Multi-language modes
  ...glob.sync('modes/{ar,de,fr,ja,pt,ru,tr,ua}/*.md'),
  // CLI skill definitions
  '.claude/skills/freelance-ops/SKILL.md',
  '.opencode/skills/freelance-ops/SKILL.md',
  '.gemini/skills/freelance-ops/SKILL.md',
  '.qwen/skills/freelance-ops/SKILL.md',
  '.agents/skills/freelance-ops/SKILL.md'
];
```

Also update any references to `scan-ats-full.mjs` (deleted in Plan 1) and `validate-portals.mjs` (should be `validate-platforms.mjs` eventually, but probably just remove for now).

**Commit:** `feat(update): update SYSTEM_PATHS for 17 freelance mode files`

---

## Phase B: Dashboard (Go TUI)

### Task 5: Update dashboard data model for freelance schema

**Files:** `dashboard/internal/data/career.go`

The Go dashboard reads `data/applications.md` and parses the FTE table into a Go struct. It needs to:
1. Read `data/leads.md` instead
2. Parse the 10-column schema (#, Date, Client/Company, Role/Scope, Platform, Status, Rate, Score, Report, Notes)
3. Add new struct fields: `Platform`, `Rate`, `Score` (float)
4. Update the status constants (was 8 FTE states, now 14 freelance states)
5. Update the `derive.go` transform logic for new states

**Changes to check/update:**
- `career.go` — struct field names, column parse indices, test fixtures
- `career_test.go` — update fixtures to use new 10-column format
- `derive.go` — state machine transitions? If present, update
- `derive_test.go` — update for new states

**Commit:** `feat(dashboard): update data model for 10-column freelance schema`

### Task 6: Update dashboard UI for freelance states + columns

**Files:** `dashboard/internal/ui/screens/pipeline.go`

The pipeline screen renders the tracker table with columns + status colors. It needs to:
1. Add `Platform` and `Rate` columns to the table
2. Update status label rendering (14 states instead of 8)
3. Update color mapping per state (e.g., green for `Paid`, orange for `Negotiating`, red for `Ghosted`)
4. Add filtering by platform (Upwork/Direct/Referral)
5. Handle empty/zero score and rate gracefully

**Color mapping for freelance states:**
- `New` — gray
- `Qualified` — blue
- `Proposed` — cyan
- `Negotiating` — yellow
- `Contracted` — green
- `In Progress` — bright green
- `Delivered` — green
- `Invoiced` — bright white
- `Paid` — bright green
- `Reviewed` — white
- `Rejected` — red
- `Ghosted` — dim
- `Withdrew` — gray
- `Disputed` — red

**Commit:** `feat(dashboard): update pipeline screen for freelance states and columns`

---

## Phase C: CI Hardening

### Task 7: Fix fixable CI test failures

Run `node test-all.mjs --quick` and identify which failures are fixable vs environmental.

**Likely fixable:**
- Missing `js-yaml` → already fixed by `npm install` (Task 1)
- Missing provider modules → update the test assertions to acknowledge they're gone
- Structural checks that reference old files → update

**Likely NOT fixable (environmental):**
- `spawnSync chmod ENOENT` on Windows → Windows ACL issue
- Dashboard Go build without Go installed → requires Go toolchain
- SQLite index issues → Windows-specific

**Iterate:** fix what's feasible in test-all.mjs and the structural checks. Don't chase Windows-specific issues.

**Commit:** `ci: fix fixable test failures (provider assertions, structural checks)`

### Task 8: Run full test-all.mjs and document remaining failures

- Run `node test-all.mjs` and capture the output
- Document the remaining failures with reasons
- Ensure the failure list is stable (not flaky)

---

## Phase D: Release

### Task 9: Final smoke test + tag v1.0.0-rc

- Run `node --test tests/*.test.mjs` — all pass
- Run `node test-all.mjs` — documented failures only
- `node doctor.mjs --json` — green
- Verify all 17 mode files exist and are non-stub
- Verify all 3 templates exist
- Verify all 4 CLI skill folders have current SKILL.md
- Verify all 72 commands delegate correctly
- Verify `data/leads.md` and `data/clients.yml` exist
- Tag `v1.0.0-rc`

---

## Effort Estimate

| Task | Hours | Type |
|------|-------|------|
| 1. npm install | 0.5 | Mechanical |
| 2. README bottom rewrite | 2-3 | Writing |
| 3. SETUP.md rewrite | 1-2 | Writing |
| 4. update-system.mjs paths | 1 | Mechanical |
| 5. Dashboard data model | 3-5 | Code |
| 6. Dashboard UI | 4-6 | Code |
| 7. CI fixable failures | 2-4 | Code/Test |
| 8. Document remaining failures | 1 | Documentation |
| 9. Smoke test + tag | 1 | Verification |
| **Total** | **15-23h** | |
