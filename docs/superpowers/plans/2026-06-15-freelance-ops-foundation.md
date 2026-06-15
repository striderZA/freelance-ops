# Freelance-Ops Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the new `freelance-ops` fork skeleton — rebranded, FTE content removed, new freelance state schema in place, AI-CLI shells wired up across all four CLIs, pipeline integrity scripts migrated, CI green.

**Architecture:** Heavy fork of `santifer/freelance-ops`. We keep the proven multi-CLI integration pattern (`.claude/`, `.opencode/`, `.gemini/`, `.qwen/` all pointing at the same `modes/*.md`), the user/system data-contract split, the pipeline integrity script pattern, and the self-update mechanism. We replace FTE-specific files (8 ATS providers, the `latex` mode, ATS templates, `scan-ats-full.mjs`, salary filter tests) with freelance shells. This plan delivers the **structural foundation only**; Plans 2-4 fill in the freelance content (modes, providers, templates, dashboard rewrite).

**Tech Stack:** Node.js (mjs), Playwright (PDF generation — out of scope this plan), YAML, Markdown, Go/Bubble Tea (dashboard — out of scope this plan), GitHub Actions.

**Working directory:** `E:\Jaco\Projects\pi\freelance-ops` (this directory is not yet a git repo — Task 1 fixes that).

**Naming note:** "freelance-ops" / "freelanceops" is the working brand throughout. If the user picks a different name later, the rename is mechanical (Task 2 is the single point of truth for naming).

---

## Phase A: Fork & Rename

### Task 1: Initialize git repo and clone parent as starting point

**Files:**
- Create: `E:\Jaco\Projects\pi\freelance-ops\` (already exists as empty dir, will be populated)
- Create: `.gitignore` (copied from parent)

- [ ] **Step 1: Initialize the local repo**

```bash
cd E:\Jaco\Projects\pi\freelance-ops
git init
git branch -m main
```

- [ ] **Step 2: Clone freelance-ops as a sibling and copy contents in**

```bash
git clone --depth 1 https://github.com/santifer/freelance-ops.git C:\Users\Jaco\AppData\Local\Temp\freelance-ops-source
Copy-Item -Recurse -Force C:\Users\Jaco\AppData\Local\Temp\freelance-ops-source\* E:\Jaco\Projects\pi\freelance-ops\
Copy-Item -Force C:\Users\Jaco\AppData\Local\Temp\freelance-ops-source\.gitignore E:\Jaco\Projects\pi\freelance-ops\
Remove-Item -Recurse -Force C:\Users\Jaco\AppData\Local\Temp\freelance-ops-source
```

Expected: working directory now contains all freelance-ops files. `.git/` is ours (empty), not the parent's.

- [ ] **Step 3: Make the first commit**

```bash
git add .gitignore
git commit -m "chore: initialize freelance-ops fork with parent .gitignore"
```

Note: we don't commit the parent's full contents yet — Task 2 renames them first. The first real commit is "forked from santifer/freelance-ops" once everything is rebranded.

### Task 2: Brand rename pass

**Files (all read+write):**
- All `.md`, `.mjs`, `.yml`, `.yaml`, `.json`, `.toml`, `.txt`, `.html`, `.tex`, `.go` files in the working tree
- File renames: see Step 4

- [ ] **Step 1: Identify files containing brand strings**

```bash
git ls-files | Select-String -Pattern '\.(md|mjs|yml|yaml|json|toml|txt|html|tex|go)$' |
  ForEach-Object { $f = $_.Line; $c = Get-Content $f -Raw -ErrorAction SilentlyContinue;
    if ($c -match 'career-?ops') { Write-Output $f } } > rename-targets.txt
Get-Content rename-targets.txt
```

Expected: a list of files containing `freelance-ops`, `freelanceops`, or `freelance-ops.org`. Review for any surprises.

- [ ] **Step 2: Replace brand strings in all text files**

```bash
Get-Content rename-targets.txt | ForEach-Object {
  $f = $_
  (Get-Content $f -Raw) `
    -replace 'freelance-ops\.org', 'freelance-ops.org' `
    -replace 'freelanceops', 'freelanceops' `
    -replace 'freelance-ops', 'freelance-ops' `
    -replace 'freelance_ops', 'freelance_ops' `
    -replace 'freelanceops', 'freelanceOps' `
    -replace 'freelance-ops', 'Freelance-Ops' `
    -replace 'Freelance Ops', 'Freelance Ops' `
    | Set-Content $f -NoNewline
}
Remove-Item rename-targets.txt
```

- [ ] **Step 3: Verify no brand residue remains**

```bash
git ls-files | Select-String -Pattern '\.(md|mjs|yml|yaml|json|toml|txt|html|tex|go)$' |
  ForEach-Object { $f = $_.Line; $c = Get-Content $f -Raw -ErrorAction SilentlyContinue;
    if ($c -match '(?i)career-?ops') { Write-Output $f } }
```

Expected: empty output. If anything prints, fix manually (likely an edge case in YAML strings, code comments, or URLs).

- [ ] **Step 4: Rename branded file paths and folders**

```bash
# Top-level files
git mv data/applications.md data/leads.md
git mv portals.yml config/platforms.yml
git mv templates/portals.example.yml templates/platforms.example.yml
git mv config/profile.yml.example config/profile.yml.example
git mv config/rates.yml.example config/rates.yml.example

# Folders containing the brand in the path
git mv .claude/skills/freelance-ops .claude/skills/freelance-ops
git mv .opencode/skills/freelance-ops .opencode/skills/freelance-ops
git mv .qwen/skills/freelance-ops .qwen/skills/freelance-ops
git mv .agents/skills/freelance-ops .agents/skills/freelance-ops

# Also rename any /freelance-ops slash command files in .claude/commands/, .opencode/commands/, .gemini/commands/, .qwen/commands/
# Pattern: {prefix}freelance-ops{...}.{ext} → {prefix}freelance-ops{...}.{ext}
Get-ChildItem -Recurse -File -Path .claude/commands, .opencode/commands, .gemini/commands, .qwen/commands |
  Where-Object { $_.Name -match 'freelance-ops' } |
  ForEach-Object {
    $newName = $_.Name -replace 'freelance-ops','freelance-ops'
    git mv $_.FullName (Join-Path $_.DirectoryName $newName)
  }
```

Expected: all paths updated. `git status` shows renames.

- [ ] **Step 5: Update package.json identity**

Edit `package.json`:
- `"name"`: `"freelance-ops"`
- `"description"`: `"AI-powered freelance and short-term contract pipeline built on AI coding CLIs."`
- `"version"`: `"0.1.0"`
- `"bin"`: keep structure but rename the `cops` shim path if it references freelance-ops
- `"repository"`: update `url` and `bugs.url` to the new fork
- `"author"`: update to user's name
- `"license"`: keep `"MIT"`
- Add `"funding"` block if publishing publicly (optional)

- [ ] **Step 6: Commit the rename**

```bash
git add -A
git commit -m "refactor: rename brand freelance-ops → freelance-ops across project"
```

### Task 3: Trim FTE-specific files (delete, don't just ignore)

**Files to delete:**
- `modes/latex.md` (no freelance use case)
- `providers/greenhouse.mjs`, `providers/ashby.mjs`, `providers/lever.mjs`, `providers/workable.mjs`, `providers/workday.mjs`, `providers/recruitee.mjs`, `providers/smartrecruiters.mjs`, `providers/solidjobs.mjs`
- `templates/cv-template.html`, `templates/cv-template.tex`
- `scan-ats-full.mjs` (ATS-specific)
- `test-salary-filter.mjs` (FTE-specific)
- `interview-prep/` folder (will be repurposed later in Plan 2)

- [ ] **Step 1: Delete the ATS providers and ATS-specific scripts**

```bash
git rm modes/latex.md
git rm providers/greenhouse.mjs providers/ashby.mjs providers/lever.mjs \
       providers/workable.mjs providers/workday.mjs providers/recruitee.mjs \
       providers/smartrecruiters.mjs providers/solidjobs.mjs
git rm scan-ats-full.mjs
git rm test-salary-filter.mjs
git rm templates/cv-template.html templates/cv-template.tex
```

- [ ] **Step 2: Rename interview-prep to a freelance-flavored name (defer content; Plan 2)**

```bash
# Keep folder, content will be overwritten in Plan 2
# (or move to data/screening/ to be created in Plan 2)
```

For now: leave `interview-prep/` alone. Plan 2 rewrites its content (screening calls) and may rename it.

- [ ] **Step 3: Commit the trim**

```bash
git add -A
git commit -m "refactor: drop FTE-specific files (8 ATS providers, latex, CV templates, salary filter)"
```

### Task 4: Update LICENSE with attribution

**Files:**
- Modify: `LICENSE` (no change to MIT text, but add attribution header note)
- Create: `NOTICE` (parent attribution)

- [ ] **Step 1: Create NOTICE with parent attribution**

Create `NOTICE` (new file):

```
Freelance-Ops
Copyright (c) 2026 [Your Name]

This project is a fork of freelance-ops by santifer.
Original project: https://github.com/santifer/freelance-ops
Copyright (c) 2024-2026 santifer and freelance-ops contributors
Licensed under MIT (see LICENSE).

Freelance-Ops is distributed under the MIT License (see LICENSE).
A copy of the original MIT License is included in the LICENSE file.
```

- [ ] **Step 2: Commit**

```bash
git add NOTICE
git commit -m "docs: add NOTICE with parent project attribution"
```

### Task 5: Rewrite README for freelance context

**Files:**
- Modify: `README.md` (replace hero section, "What Is This", "Features", "Quick Start")
- Modify: `docs/SETUP.md`
- Delete: localized READMEs (will be re-translated in Plan 4 if needed) — `README.{ar,cn,de,es,fr,ja,ko-KR,pl,pt-BR,ru,ua,zh-TW}.md`

- [ ] **Step 1: Delete localized READMEs (defer retranslation)**

```bash
git rm README.ar.md README.cn.md README.de.md README.es.md README.fr.md \
       README.ja.md README.ko-KR.md README.pl.md README.pt-BR.md \
       README.ru.md README.ua.md README.zh-TW.md
```

- [ ] **Step 2: Rewrite README.md**

Replace top section through "Features" with freelance framing. Key sections:

```markdown
# Freelance-Ops

[hero banner: docs/hero-banner.jpg]

*I built this because hunting freelance / contract work felt like a full-time job.
So I engineered the system I wish I had.*

Freelance-ops turns any AI coding CLI into a full freelance pipeline command center.
Instead of tracking leads in a spreadsheet, you get an AI-powered pipeline that:

- **Qualifies leads** with a structured A-F scoring system (6 weighted blocks)
- **Generates tailored proposals** — research-backed, PDF-ready
- **Scans platforms** automatically (Upwork first; Toptal, Contra, Fiverr later)
- **Tracks your pipeline** from `New` → `Paid` in a single source of truth
- **Warns on scam patterns** (advance fees, off-platform payment, fake clients)
- **Stores your rate card** and helps you defend it

> **Important: This is NOT a spray-and-proposal tool.** Freelance-ops is a filter.
> It helps you find the few leads worth your time. The system strongly recommends
> against proposing on anything scoring below 4.0/5. Your time is valuable, and so
> is the client's. Always review before sending.

## Quick Start

```bash
npx freelance-ops init    # one-shot install
cd freelance-ops
claude                    # or opencode / gemini / codex / qwen
```

On first launch, freelance-ops walks you through setup — your niches, rate card,
and proof points — by chatting. Nothing to edit by hand.

## Status

v0.1.0 (Foundation). See `docs/superpowers/specs/2026-06-15-freelance-ops-fork-design.md`
for scope. Phase 1 (this release) delivers the fork skeleton, state machine, and CLI shells.
Phase 2+ adds the freelance content (modes, providers, templates, dashboard).
```

Fill in real screenshots/demo gif in Plan 4 (docs/demo.gif). For now, leave a placeholder.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for freelance-ops context"
```

---

## Phase B: Data Contract & State Schema

### Task 6: TDD the new state machine

**Files:**
- Modify: `templates/states.yml`

- [ ] **Step 1: Write the new states.yml**

Replace `templates/states.yml` contents:

```yaml
# Freelance-Ops canonical lead states
# Source of truth for all status fields. merge-tracker.mjs and
# normalize-statuses.mjs both validate against this list.

states:
  # Main pipeline
  - name: New
    description: Lead captured, not yet evaluated
  - name: Qualified
    description: Lead evaluated and scored >= 4.0/5, ready to propose
  - name: Proposed
    description: Proposal sent, awaiting response
  - name: Negotiating
    description: In back-and-forth on terms, rate, or scope
  - name: Contracted
    description: Contract signed / work order accepted
  - name: In Progress
    description: Actively working on the engagement
  - name: Delivered
    description: Work delivered, awaiting client acceptance
  - name: Invoiced
    description: Invoice sent, awaiting payment
  - name: Paid
    description: Payment received
  - name: Reviewed
    description: Client review collected, engagement closed

  # Terminal off-ramps (valid from any non-terminal state)
  - name: Rejected
    description: Client rejected proposal or terminated engagement
  - name: Ghosted
    description: No response for >14 days, no follow-up planned
  - name: Withdrew
    description: Candidate withdrew from opportunity
  - name: Disputed
    description: Disagreement over scope, deliverables, or payment
```

- [ ] **Step 2: Write a structural test**

Create `tests/states.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const statesPath = join(__dirname, '..', 'templates', 'states.yml');

test('states.yml has 14 states total', () => {
  const content = readFileSync(statesPath, 'utf8');
  const matches = content.match(/- name: /g) || [];
  assert.equal(matches.length, 14, `expected 14 states, found ${matches.length}`);
});

test('states.yml includes all 10 main pipeline states', () => {
  const content = readFileSync(statesPath, 'utf8');
  const required = ['New','Qualified','Proposed','Negotiating','Contracted',
                    'In Progress','Delivered','Invoiced','Paid','Reviewed'];
  for (const s of required) {
    assert.match(content, new RegExp(`- name: ${s.replace(/ /g, ' ')}\\b`), `missing state: ${s}`);
  }
});

test('states.yml includes all 4 terminal states', () => {
  const content = readFileSync(statesPath, 'utf8');
  for (const s of ['Rejected','Ghosted','Withdrew','Disputed']) {
    assert.match(content, new RegExp(`- name: ${s}\\b`), `missing state: ${s}`);
  }
});
```

- [ ] **Step 3: Run the test**

Run: `node --test tests/states.test.mjs`
Expected: 3 passing.

- [ ] **Step 4: Add the test to test-all.mjs (placeholder, replaced in Task 32)**

For now, just add a comment to `test-all.mjs`:
```javascript
// TODO Task 32: add states.test.mjs to the test runner
```

- [ ] **Step 5: Commit**

```bash
git add templates/states.yml tests/states.test.mjs
git commit -m "feat(states): new freelance state machine with 10 main + 4 terminal states"
```

### Task 7: Update DATA_CONTRACT.md

**Files:**
- Modify: `DATA_CONTRACT.md`

- [ ] **Step 1: Rewrite the user-layer file list**

In `DATA_CONTRACT.md`, replace the "User Layer" section with:

```markdown
**User Layer (NEVER auto-updated, personalization goes HERE):**
- `cv.md` → renamed to `profile.md` (Plan 2)
- `config/profile.yml`
- `config/rates.yml`
- `config/platforms.yml`
- `modes/_profile.md`
- `data/leads.md` (was `applications.md`)
- `data/clients.yml`
- `data/portfolio/`
- `data/contracts/`
- `data/invoices/`
- `data/pipeline.md`
- `data/scan-history.tsv`
- `portals.yml` → `config/platforms.yml`
- `reports/*`
- `output/*`
- `interview-prep/` → repurposed for screening (Plan 2)
```

Keep the "System Layer" section as-is, just add the new files:

```markdown
**System Layer (auto-updatable, DON'T put user data here):**
- `modes/_shared.md`
- `modes/blocks/lead-blocks.md`
- `modes/lead.md`, `modes/leads.md`, `modes/proposal.md`, `modes/portfolio.md`,
  `modes/pitch.md`, `modes/screening.md`, `modes/nurture.md`, `modes/outreach.md`,
  `modes/pipeline.md`, `modes/scan.md`, `modes/tracker.md`,
  `modes/auto-pipeline.md`, `modes/patterns.md`, `modes/onboarding.md`,
  `modes/deep.md`, `modes/training.md`, `modes/project.md`
- `CLAUDE.md`, `*.mjs` scripts, `dashboard/*`, `templates/*`, `batch/*`
```

- [ ] **Step 2: Commit**

```bash
git add DATA_CONTRACT.md
git commit -m "docs: update DATA_CONTRACT for freelance-ops schema"
```

### Task 8: Create the leads.md tracker with new column schema

**Files:**
- Create: `data/leads.md` (replaces `data/applications.md`)
- Modify: `modes/_profile.template.md` (note: rename to `_profile.template.md` if needed)

- [ ] **Step 1: Create the new tracker with header**

`data/leads.md`:

```markdown
# Freelance-Ops Lead Tracker

| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |
|---|------|----------------|------------|----------|--------|------|-------|--------|-------|
```

- [ ] **Step 2: Commit**

```bash
git add data/leads.md
git commit -m "feat(tracker): new leads.md with 10-column freelance schema"
```

Note: `data/applications.md` was renamed in Task 2. If you see a stale one, `git rm data/applications.md`.

### Task 9: Document the new TSV format

**Files:**
- Modify: `CLAUDE.md` (or its freelance-ops equivalent after the rename; the parent file is now `CLAUDE.md` post-rename, but if you renamed it, this section's "CLAUDE.md" is whatever it became)

- [ ] **Step 1: Find the TSV format section**

Search `CLAUDE.md` (or your renamed equivalent) for "TSV Format for Tracker Additions" and replace that block with:

```markdown
### TSV Format for Tracker Additions (Freelance-Ops)

Write one TSV file per evaluation to `batch/tracker-additions/{num}-{client-slug}.tsv`.
Single line, 10 tab-separated columns:

```
{num}\t{date}\t{client_or_company}\t{role_or_scope}\t{platform}\t{status}\t{rate}\t{score}/5\t[{num}](reports/{num}-{slug}-{date}.md)\t{note}
```

**Column order (IMPORTANT -- status BEFORE score, platform + rate inserted):**
1. `num` -- sequential number (integer)
2. `date` -- YYYY-MM-DD
3. `client_or_company` -- short name
4. `role_or_scope` -- short scope description
5. `platform` -- Upwork | Direct | Referral | Toptal | Contra | Other
6. `status` -- canonical (see `templates/states.yml`)
7. `rate` -- e.g. `$95/hr` or `$4500 fixed` (empty if not yet proposed)
8. `score` -- format `X.X/5` (e.g. `4.2/5`)
9. `report` -- markdown link, root-relative `[num](reports/...)`
10. `notes` -- one-line summary

**Note:** In `leads.md`, the column order is: # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes.
The merge script handles the column swap automatically.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document new 10-column TSV tracker format"
```

### Task 10: Create data/clients.yml schema

**Files:**
- Create: `data/clients.yml` (empty, with header)
- Create: `data/clients.yml.example` (template)

- [ ] **Step 1: Create the example file**

`data/clients.yml.example`:

```yaml
# Freelance-Ops client registry
# Tracks repeat clients, payment history, and ratings across engagements.
# One entry per client (or company for B2B contracts).

clients: []

# Schema (per client):
# - name: string                          # Client or company name
#   platform: string                      # Upwork | Direct | Referral | ...
#   contact_email: string                 # Optional
#   first_seen: YYYY-MM-DD
#   last_seen: YYYY-MM-DD
#   engagements:                          # List of past engagements
#     - slug: string                      # Slug used in reports
#       date: YYYY-MM-DD
#       scope: string
#       rate: string                      # e.g. "$95/hr" or "$4500 fixed"
#       outcome: Paid | Disputed | Withdrew
#       rating: 1-5                       # Your rating of the client
#       payment_on_time: bool
#       would_work_again: bool
#   notes: string                         # Free-form
```

- [ ] **Step 2: Create the empty actual file**

`data/clients.yml`:

```yaml
clients: []
```

- [ ] **Step 3: Commit**

```bash
git add data/clients.yml data/clients.yml.example
git commit -m "feat(data): add clients.yml schema for client ratings and history"
```

---

## Phase C: Pipeline Integrity Scripts

### Task 11: TDD merge-tracker.mjs for new TSV format

**Files:**
- Modify: `merge-tracker.mjs`
- Test: `tests/merge-tracker.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/merge-tracker.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('merge-tracker.mjs handles new 10-column TSV format', () => {
  const dir = mkdtempSync(join(tmpdir(), 'merge-test-'));
  try {
    // Set up minimal fixture
    const trackerDir = join(dir, 'data');
    const batchDir = join(dir, 'batch', 'tracker-additions');
    const reportsDir = join(dir, 'reports');
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n');
    writeFileSync(join(batchDir, '001-acme-co.tsv'),
      '001\t2026-06-15\tAcme Co\tAI consulting\tUpwork\tQualified\t$95/hr\t4.5/5\t[001](reports/001-acme-co-2026-06-15.md)\tStrong fit\n');

    const scriptPath = join(import.meta.dirname, '..', 'merge-tracker.mjs');
    execFileSync('node', [scriptPath], { cwd: dir, stdio: 'pipe' });

    const result = readFileSync(join(trackerDir, 'leads.md'), 'utf8');
    assert.match(result, /Acme Co/);
    assert.match(result, /Upwork/);
    assert.match(result, /\$95\/hr/);
    assert.match(result, /4\.5\/5/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('merge-tracker.mjs is idempotent (running twice does not duplicate)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'merge-test-'));
  try {
    const trackerDir = join(dir, 'data');
    const batchDir = join(dir, 'batch', 'tracker-additions');
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n');
    writeFileSync(join(batchDir, '001-acme-co.tsv'),
      '001\t2026-06-15\tAcme Co\tAI consulting\tUpwork\tQualified\t$95/hr\t4.5/5\t[001](reports/001-acme-co-2026-06-15.md)\tStrong fit\n');

    const scriptPath = join(import.meta.dirname, '..', 'merge-tracker.mjs');
    execFileSync('node', [scriptPath], { cwd: dir, stdio: 'pipe' });
    execFileSync('node', [scriptPath], { cwd: dir, stdio: 'pipe' });

    const result = readFileSync(join(trackerDir, 'leads.md'), 'utf8');
    const matches = result.match(/Acme Co/g) || [];
    assert.equal(matches.length, 1, 'should appear exactly once after two runs');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/merge-tracker.test.mjs`
Expected: FAIL — `merge-tracker.mjs` still uses the old column order.

- [ ] **Step 3: Update merge-tracker.mjs**

Read the existing `merge-tracker.mjs` first. Find the line that maps TSV columns to the tracker row. Update the column count and ordering:

```javascript
// Old: expected 9 columns (num, date, company, role, status, score, pdf, report, notes)
// New: 10 columns (num, date, client_or_company, role_or_scope, platform, status, rate, score, report, notes)
```

Concretely, find the array that splits the TSV line (`line.split('\t')` or similar) and update the indices:

```javascript
// Example of the column mapping section (exact code depends on existing implementation):
const [num, date, clientOrCompany, roleOrScope, platform, status, rate, score, report, notes] = line.split('\t');

// Build the tracker row in the column order used by leads.md:
const row = `| ${num} | ${date} | ${clientOrCompany} | ${roleOrScope} | ${platform} | ${status} | ${rate} | ${score} | ${report} | ${notes} |`;
```

Also update any dedup key logic to use `${clientOrCompany}|${roleOrScope}` (was `${company}|${role}`).

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/merge-tracker.test.mjs`
Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add merge-tracker.mjs tests/merge-tracker.test.mjs
git commit -m "feat(tracker): merge-tracker.mjs handles 10-column freelance schema"
```

### Task 12: TDD normalize-statuses.mjs for new states

**Files:**
- Modify: `normalize-statuses.mjs`
- Test: `tests/normalize-statuses.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/normalize-statuses.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('normalize-statuses.mjs recognizes all 14 freelance states', () => {
  const dir = mkdtempSync(join(tmpdir(), 'norm-test-'));
  try {
    const trackerDir = join(dir, 'data');
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n' +
      '| 1 | 2026-06-15 | Acme | AI work | Upwork | qualified | $95/hr | 4.0/5 | [1](reports/1.md) | note |\n' +
      '| 2 | 2026-06-15 | Beta | web app | Direct | in-progress | $80/hr | 4.5/5 | [2](reports/2.md) | note |\n');

    const scriptPath = join(import.meta.dirname, '..', 'normalize-statuses.mjs');
    execFileSync('node', [scriptPath], { cwd: dir, stdio: 'pipe' });

    const result = readFileSync(join(trackerDir, 'leads.md'), 'utf8');
    assert.match(result, /\|\s*Qualified\s*\|/);
    assert.match(result, /\|\s*In Progress\s*\|/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/normalize-statuses.test.mjs`
Expected: FAIL — `normalize-statuses.mjs` doesn't recognize `In Progress`.

- [ ] **Step 3: Update normalize-statuses.mjs**

Find the list of canonical states in the script. Replace with:

```javascript
const CANONICAL_STATES = [
  'New', 'Qualified', 'Proposed', 'Negotiating', 'Contracted',
  'In Progress', 'Delivered', 'Invoiced', 'Paid', 'Reviewed',
  'Rejected', 'Ghosted', 'Withdrew', 'Disputed'
];

// Add normalization rules for common variants:
const NORMALIZE = {
  'in-progress': 'In Progress',
  'inprogress': 'In Progress',
  'in_progress': 'In Progress',
  'wip': 'In Progress',
  'working': 'In Progress',
  'qualified': 'Qualified',
  'qual': 'Qualified',
  'proposed': 'Proposed',
  'sent': 'Proposed',
  'submitted': 'Proposed',
  'negotiating': 'Negotiating',
  'in negotiation': 'Negotiating',
  'contracted': 'Contracted',
  'hired': 'Contracted',
  'signed': 'Contracted',
  'delivered': 'Delivered',
  'complete': 'Delivered',
  'completed': 'Delivered',
  'invoiced': 'Invoiced',
  'paid': 'Paid',
  'reviewed': 'Reviewed',
  'rejected': 'Rejected',
  'declined': 'Rejected',
  'ghosted': 'Ghosted',
  'no response': 'Ghosted',
  'withdrew': 'Withdrew',
  'withdrawn': 'Withdrew',
  'disputed': 'Disputed'
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/normalize-statuses.test.mjs`
Expected: 1 passing.

- [ ] **Step 5: Commit**

```bash
git add normalize-statuses.mjs tests/normalize-statuses.test.mjs
git commit -m "feat(tracker): normalize-statuses.mjs handles 14 freelance states"
```

### Task 13: TDD dedup-tracker.mjs for new schema

**Files:**
- Modify: `dedup-tracker.mjs`
- Test: `tests/dedup-tracker.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/dedup-tracker.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('dedup-tracker.mjs dedupes by client+scope across new schema', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dedup-test-'));
  try {
    const trackerDir = join(dir, 'data');
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n' +
      '| 1 | 2026-06-15 | Acme | AI consulting | Upwork | Qualified | $95/hr | 4.5/5 | [1](r1.md) | first |\n' +
      '| 2 | 2026-06-15 | Acme | AI consulting | Upwork | Proposed | $95/hr | 4.5/5 | [2](r2.md) | duplicate |\n');

    const scriptPath = join(import.meta.dirname, '..', 'dedup-tracker.mjs');
    execFileSync('node', [scriptPath], { cwd: dir, stdio: 'pipe' });

    const result = readFileSync(join(trackerDir, 'leads.md'), 'utf8');
    const acmeCount = (result.match(/\| Acme \|/g) || []).length;
    assert.equal(acmeCount, 1, 'should keep only one Acme AI consulting row');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/dedup-tracker.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Update dedup-tracker.mjs**

Find the dedup key construction. Change from `${company}|${role}` to `${clientOrCompany}|${roleOrScope}` and use the new column indices.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/dedup-tracker.test.mjs`
Expected: 1 passing.

- [ ] **Step 5: Commit**

```bash
git add dedup-tracker.mjs tests/dedup-tracker.test.mjs
git commit -m "feat(tracker): dedup-tracker.mjs uses new client+scope keys"
```

### Task 14: TDD verify-pipeline.mjs for new state machine

**Files:**
- Modify: `verify-pipeline.mjs`
- Test: `tests/verify-pipeline.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/verify-pipeline.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('verify-pipeline.mjs exits 0 on a fixture with one entry per state', () => {
  const dir = mkdtempSync(join(tmpdir(), 'verify-test-'));
  try {
    const trackerDir = join(dir, 'data');
    const reportsDir = join(dir, 'reports');
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n' +
      '| 1 | 2026-06-15 | A | work | Upwork | New | | | [1](r.md) | |\n' +
      '| 2 | 2026-06-15 | B | work | Upwork | Qualified | $95/hr | 4.0/5 | [2](r.md) | |\n');
    writeFileSync(join(reportsDir, 'r.md'), '# report\n');

    const scriptPath = join(import.meta.dirname, '..', 'verify-pipeline.mjs');
    const result = execFileSync('node', [scriptPath], { cwd: dir, stdio: 'pipe' });
    assert.equal(result.toString().trim(), ''); // empty output on success
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verify-pipeline.mjs exits non-zero on unknown status', () => {
  const dir = mkdtempSync(join(tmpdir(), 'verify-test-'));
  try {
    const trackerDir = join(dir, 'data');
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n' +
      '| 1 | 2026-06-15 | A | work | Upwork | BogusState | | | [1](r.md) | |\n');

    const scriptPath = join(import.meta.dirname, '..', 'verify-pipeline.mjs');
    assert.throws(
      () => execFileSync('node', [scriptPath], { cwd: dir, stdio: 'pipe' }),
      /non-zero/,
      'should exit non-zero on unknown state'
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/verify-pipeline.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Update verify-pipeline.mjs**

Find the canonical states list. Replace with the 14 freelance states. Update column count assertions (was 9, now 10).

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/verify-pipeline.test.mjs`
Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add verify-pipeline.mjs tests/verify-pipeline.test.mjs
git commit -m "feat(tracker): verify-pipeline.mjs validates 14-state freelance machine"
```

### Task 15: Verify reserve-report-num.mjs and tracker-links.mjs

**Files:**
- Read: `reserve-report-num.mjs`, `tracker-links.mjs`

- [ ] **Step 1: Read both scripts**

Open `reserve-report-num.mjs` and `tracker-links.mjs`. Confirm:
- `reserve-report-num.mjs` doesn't reference company/role specifics — likely no changes needed.
- `tracker-links.mjs` handles root-relative `[num](reports/...)` rewrite — likely no changes needed (it operates on link text, not on column content).

- [ ] **Step 2: If changes are needed, add tests first; otherwise add a structural test that they parse**

Create `tests/scripts-parse.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('reserve-report-num.mjs runs without error', () => {
  const result = execFileSync('node', ['reserve-report-num.mjs'], { encoding: 'utf8' });
  assert.match(result, /^\d+$/, 'should print a single number');
});

test('tracker-links.mjs runs without error on empty tracker', () => {
  execFileSync('node', ['tracker-links.mjs'], { stdio: 'pipe' });
  // No output expected, no error
});
```

- [ ] **Step 3: Run the tests**

Run: `node --test tests/scripts-parse.test.mjs`
Expected: 2 passing (or modify scripts to pass).

- [ ] **Step 4: Commit**

```bash
git add tests/scripts-parse.test.mjs
git commit -m "test: verify reserve-report-num.mjs and tracker-links.mjs still parse"
```

---

## Phase D: AI-CLI Integration Shells

### Task 16: Rewrite the canonical SKILL.md

**Files:**
- Modify: `CLAUDE.md` (the top-level file the parent project uses as Claude Code's project context — find it; it may already exist as `CLAUDE.md` post-rename, or it may be `OPENCODE.md`, `GEMINI.md`, `AGENTS.md` per CLI)

- [ ] **Step 1: Read the current top-level skill file and identify the equivalent for freelance-ops**

The parent project uses `CLAUDE.md` as the project context (auto-loaded by Claude Code). Other CLIs use `OPENCODE.md`, `GEMINI.md`, `AGENTS.md`, etc. Plan 4 will rewrite each. For now, rewrite `CLAUDE.md` as the canonical reference; other CLIs will be synced from it.

- [ ] **Step 2: Rewrite CLAUDE.md**

Replace the contents with the freelance-ops version. Key sections (keep the same structure as parent for ease of future sync):

```markdown
# Freelance-Ops -- AI Freelance Pipeline

## Origin

This system is a fork of [freelance-ops](https://github.com/santifer/freelance-ops),
adapted for freelance / short-term contract work. The original was built by
santifer to land a Head of Applied AI role. This fork keeps the proven
multi-CLI integration, data contract, and pipeline integrity patterns; it
replaces the FTE-specific content (modes, providers, templates) with freelance
equivalents.

See `docs/superpowers/specs/2026-06-15-freelance-ops-fork-design.md` for scope
and architecture.

## Data Contract (CRITICAL)

Two layers. Read `DATA_CONTRACT.md` for the full list.

**User Layer (NEVER auto-updated, personalization goes HERE):**
- `profile.md` (renamed from `cv.md`)
- `config/profile.yml`, `config/rates.yml`, `config/platforms.yml`
- `modes/_profile.md`
- `data/leads.md`, `data/clients.yml`, `data/portfolio/`, `data/contracts/`,
  `data/invoices/`, `data/pipeline.md`, `data/scan-history.tsv`
- `reports/*`, `output/*`, `interview-prep/`

**System Layer (auto-updatable, DON'T put user data here):**
- `modes/_shared.md`, `modes/blocks/lead-blocks.md`
- All 17 `modes/*.md` (see DATA_CONTRACT.md for the list)
- `CLAUDE.md`, `*.mjs` scripts, `dashboard/*`, `templates/*`, `batch/*`

**THE RULE: When the user asks to customize anything (niches, rate floor,
proposal angles, proof points, client preferences), ALWAYS write to
`modes/_profile.md`, `config/profile.yml`, or `config/rates.yml`. NEVER edit
`modes/_shared.md` for user-specific content.**

## Update Check

```bash
node update-system.mjs check
```

(Repointed to freelance-ops upstream. Same JSON output schema as parent.)

## What is freelance-ops

AI-powered freelance pipeline built on AI coding CLIs: lead qualification,
proposal generation, platform scanning, pipeline tracking.

### Main Files

| File | Function |
|------|----------|
| `data/leads.md` | Lead tracker (10 columns: #, Date, Client/Company, Role/Scope, Platform, Status, Rate, Score, Report, Notes) |
| `data/pipeline.md` | Inbox of pending lead URLs |
| `data/scan-history.tsv` | Platform scanner dedup history |
| `data/clients.yml` | Client ratings + payment history |
| `config/platforms.yml` | Platform-specific search config |
| `config/rates.yml` | User's rate card and platform minimums |
| `templates/proposal-template.html` | HTML template for proposals |
| `templates/rate-card-template.html` | HTML template for rate card |
| `templates/portfolio-template.html` | HTML template for portfolio piece |
| `generate-pdf.mjs` | Playwright: HTML to PDF (proposals, rate cards, portfolio) |
| `modes/lead.md` | Evaluate a single lead (6 blocks A-F + Block G legitimacy) |
| `modes/proposal.md` | Generate a tailored proposal |
| `scan.mjs` | Zero-token Upwork scanner (GraphQL/REST) |
| `merge-tracker.mjs` | Merge TSV tracker additions |
| `data/follow-ups.md` | Nurture cadence history |

### Lead Evaluation: 6 Blocks (see modes/blocks/lead-blocks.md)

- Block A: Lead Summary (scope, budget, timeline, engagement shape)
- Block B: Profile Match (your skills vs their needs)
- Block C: Rate Strategy (target rate, market check, red flags)
- Block D: Client/Platform Research (reputation, payment history)
- Block E: Proposal Strategy (angle, differentiators, social proof)
- Block F: Engagement & Risk (terms, payment, red flags)
- Block G: Legitimacy (freelance-specific scam detection)

### Pipeline States (see templates/states.yml)

New → Qualified → Proposed → Negotiating → Contracted →
In Progress → Delivered → Invoiced → Paid → Reviewed
Plus terminals: Rejected, Ghosted, Withdrew, Disputed.

### OpenCode Commands

(Filled in Plan 4 when the OpenCode command files are authored.)

### Gemini CLI Commands

(Filled in Plan 4.)

### First Run -- Onboarding (IMPORTANT)

(Plan 2: rewrite `modes/onboarding.md` for freelance context.)
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: rewrite CLAUDE.md for freelance-ops context"
```

### Task 17: Create 17 stub mode files

**Files:**
- Create: 17 `modes/*.md` files (headers only, content in Plan 2)

- [ ] **Step 1: Create the stub directory and a template generator**

Run this in PowerShell to create all 17 mode stubs from a template:

```powershell
$modes = @(
  'lead','leads','proposal','portfolio','pitch','screening',
  'nurture','outreach','pipeline','scan','tracker',
  'auto-pipeline','patterns','onboarding','deep','training','project'
)

foreach ($m in $modes) {
  $path = "modes\$m.md"
  $title = ($m -replace '-',' ') | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) }
  @"
# $title Mode (STUB)

**Status:** STUB - content authored in Plan 2
**See:** docs/superpowers/specs/2026-06-15-freelance-ops-fork-design.md

This mode is reserved. The full prompt and evaluation logic will be written
when the freelance content phase begins.

For now, this file exists so that:
- The state machine is fully wired
- Slash command shells can resolve
- CI structural tests pass

The parent project's `modes/` folder is the reference for the structure and
depth of the final content. Each freelance mode will follow the same shape:
  1. Purpose (one paragraph)
  2. When to use
  3. Inputs (what the user provides)
  4. Output format
  5. Workflow (step-by-step)
  6. Edge cases
  7. Examples

(Full content: Plan 2.)
"@ | Set-Content -Path $path -NoNewline
  git add $path
}
```

- [ ] **Step 2: Verify all 17 mode files exist**

```bash
ls modes/*.md | wc -l
```

Expected: 18 (17 new + `_shared.md` from parent). Plus the locale folders `modes/{ar,de,fr,ja,pt,ru,tr,ua}/` (kept empty; populated in Plan 4 if needed).

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(modes): create 17 stub mode files (content in Plan 2)"
```

### Task 18: Create the lead-blocks.md file

**Files:**
- Create: `modes/blocks/lead-blocks.md`

- [ ] **Step 1: Create the directory and the file**

`modes/blocks/lead-blocks.md`:

```markdown
# Lead Evaluation Blocks (6 blocks + Block G)

**Status:** STUB - detailed heuristics authored in Plan 2 / Plan 3.
**See:** docs/superpowers/specs/2026-06-15-freelance-ops-fork-design.md

The freelance-ops lead evaluation is structured as 6 weighted blocks (A-F) plus
a legitimacy tier (Block G) that gates the rest. Each block produces a 0-5
score; the final letter grade is the average.

## Block A -- Lead Summary

What the client wants. Scope, deliverables, budget or rate range, timeline,
engagement shape (hourly / fixed-price / milestone / retainer), who's hiring.

## Block B -- Profile Match

Your skills, proof points, and portfolio pieces vs. the lead's needs. Borrowed
in shape from the parent project's CV match block.

## Block C -- Rate Strategy

Target rate (hourly or fixed) given your `config/rates.yml`. Market rate check.
Red-flag detection: rate too low, scope-vs-rate mismatch, "exposure"
compensation, equity-only, speculative work.

## Block D -- Client / Platform Research

Client reputation, payment history (Upwork: hire rate, total spent, payment
verified, country), platform signals (repeat-hire pattern, interview-to-hire
ratio), prior freelancer reviews.

## Block E -- Proposal Strategy

Angle, differentiators, social proof. Identifies the 2-3 proof points from
your story bank that map strongest to the lead. Outputs the proposal skeleton.

## Block F -- Engagement & Risk

Terms (IP assignment, NDA, exclusivity, kill fee), payment terms (milestones,
escrow, net-N), red flags (off-platform request, upfront-payment demand, vague
scope, undisclosed team).

## Block G -- Legitimacy (TIER, not a score)

Freelance-specific scam detection. Output is a tier, not a 0-5:

- `verified` -- no red flags, proceed
- `caution` -- 1-2 minor flags, proceed with eyes open
- `likely-scam` -- DO NOT PROPOSE. Common patterns:
  - Advance-fee scam (asks for payment to release the job)
  - Overpayment scam (will "accidentally" overpay and ask for a refund)
  - Fake client impersonation (impersonates a known company)
  - MLM / pyramid signals (recruitment focus, vague product)
  - "Test task" as unpaid labor (large scope request, no compensation)
  - Off-platform payment push (Upwork job but wants to pay via Wire/Western Union)
  - Vague scope + high pay mismatch

## Report Header (machine-readable)

```yaml
**Legitimacy:** {verified|caution|likely-scam}
**Rate:** ${target_rate}/hr (or ${fixed_price})
**Score:** {X.X}/5
**URL:** {source_url}
```

(Full heuristics: Plan 2 for Blocks A-F, Plan 3 for Block G specifically.)
```

- [ ] **Step 2: Commit**

```bash
git add modes/blocks/lead-blocks.md
git commit -m "feat(modes): create blocks/lead-blocks.md with 6-block + G framework"
```

### Task 19: Rewrite the four CLI SKILL.md files

**Files:**
- Modify: `.claude/skills/freelance-ops/SKILL.md`
- Modify: `.opencode/skills/freelance-ops/SKILL.md`
- Modify: `.gemini/skills/freelance-ops/SKILL.md` (if exists, otherwise create)
- Modify: `.qwen/skills/freelance-ops/SKILL.md` (if exists, otherwise create)
- Modify: `.agents/skills/freelance-ops/SKILL.md` (the canonical open-agents one)

- [ ] **Step 1: Read the parent project's SKILL.md to understand the structure**

The four CLI SKILL.md files in the parent project are typically thin pointers
to `modes/*.md`. Read `.agents/skills/freelance-ops/SKILL.md` (now renamed to
`.agents/skills/freelance-ops/SKILL.md`) to see the pattern.

- [ ] **Step 2: Rewrite the canonical `.agents/skills/freelance-ops/SKILL.md`**

Replace the contents with a freelance-flavored version that:
- Updates the system description
- Updates the Onboarding section to reference freelance concepts (niches, rate floor, platforms)
- Keeps the same Update Check / First Run / Personalization structure

(Same shape as parent's SKILL.md, with prose rewritten. Detailed content
in Plan 2.)

- [ ] **Step 3: Sync the other three CLI SKILL.md files**

For `.claude/`, `.opencode/`, `.gemini/`, `.qwen/`:
- These are typically thin shims pointing at the canonical one
- Update their content to point at `.agents/skills/freelance-ops/SKILL.md` or the modes
- Update the system description to freelance

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/freelance-ops/SKILL.md
git add .opencode/skills/freelance-ops/SKILL.md
git add .gemini/skills/freelance-ops/SKILL.md
git add .qwen/skills/freelance-ops/SKILL.md
git add .agents/skills/freelance-ops/SKILL.md
git commit -m "feat(cli): rewrite SKILL.md files in all 4 CLI skill folders"
```

### Task 20: Create stub slash commands for all 4 CLIs

**Files:**
- Create: 18 stub commands in `.claude/commands/`
- Create: 18 stub commands in `.opencode/commands/`
- Create: 18 stub commands in `.gemini/commands/` (TOML)
- Create: 18 stub commands in `.qwen/commands/` (TOML)

- [ ] **Step 1: Generate the 18 Claude Code slash commands**

PowerShell:

```powershell
$cmds = @(
  'freelance-ops','freelance-ops-lead','freelance-ops-leads',
  'freelance-ops-proposal','freelance-ops-portfolio','freelance-ops-pitch',
  'freelance-ops-screening','freelance-ops-nurture','freelance-ops-outreach',
  'freelance-ops-pipeline','freelance-ops-scan','freelance-ops-tracker',
  'freelance-ops-auto','freelance-ops-patterns','freelance-ops-onboarding',
  'freelance-ops-deep','freelance-ops-training','freelance-ops-project'
)

foreach ($c in $cmds) {
  $name = $c -replace '^freelance-ops-?',''
  $title = if ($name -eq '') { 'menu' } else { $name }
  @"
# /freelance-ops${name} (STUB)

**Status:** STUB - command shell only. Mode content authored in Plan 2.

This command is wired up so that the CLI recognizes it. When run, it should
delegate to the corresponding mode file:

  \`\`\`
  Read and execute modes/$title.md
  \`\`\`

For Plan 2+ (the content phase), each command will be fully implemented with:
- Description and arguments
- Invokes the right mode file
- Handles the auto-detect case (no args → show menu, with URL → scan, with text → lead)
"@ | Set-Content -Path ".claude\commands\$c.md" -NoNewline
  git add ".claude\commands\$c.md"
}
```

- [ ] **Step 2: Mirror to .opencode/commands/ (same .md format)**

```bash
Copy-Item -Recurse -Force .claude\commands\* .opencode\commands\
git add .opencode/commands/
```

- [ ] **Step 3: Mirror to .gemini/commands/ as TOML shims**

Gemini uses TOML. Generate thin shims:

```powershell
foreach ($c in $cmds) {
  $name = $c -replace '^freelance-ops-?',''
  $prompt = if ($name -eq '') {
    "Show the freelance-ops menu or evaluate the lead at the URL/text given as the argument."
  } else {
    "Read and execute modes/$name.md with the user's argument."
  }
  @"
description = "freelance-ops: $name (STUB - Plan 2)"
prompt = """
$prompt
"""
"@ | Set-Content -Path ".gemini\commands\$c.toml" -NoNewline
  git add ".gemini\commands\$c.toml"
}
```

- [ ] **Step 4: Mirror to .qwen/commands/ as TOML shims**

```bash
Copy-Item -Recurse -Force .gemini\commands\* .qwen\commands\
git add .qwen/commands/
```

- [ ] **Step 5: Verify and commit**

```bash
ls .claude/commands/ | wc -l    # expected 18
ls .opencode/commands/ | wc -l  # expected 18
ls .gemini/commands/ | wc -l    # expected 18
ls .qwen/commands/ | wc -l      # expected 18
git commit -m "feat(cli): create 18 stub slash commands per CLI (4 CLIs total)"
```

---

## Phase E: Mode & Profile Templates

### Task 21: Update _shared.md and _profile.template.md

**Files:**
- Modify: `modes/_shared.md`
- Modify: `modes/_profile.template.md`

- [ ] **Step 1: Read the parent's _shared.md and _profile.template.md**

These two files are central: `_shared.md` is system-level (auto-updatable),
`_profile.template.md` is the template users copy into `_profile.md`
(user-level, never overwritten).

- [ ] **Step 2: Rewrite modes/_shared.md for freelance context**

Replace FTE-specific scoring logic, archetypes, and proof-point structures
with freelance equivalents:

- Archetypes → Niche categories (e.g. "AI consulting", "Web app development")
- Salary target → Rate floor + target rate
- Career story → Positioning narrative (who you serve, what you deliver, why you)
- Proof points → Past engagements, client outcomes, code samples, published writing
- Comp research → Market rate references per niche/platform

Keep the structure: System-level scoring framework, evidence-driven
evaluation, ethical use section (still applies -- quality over spray).

- [ ] **Step 3: Rewrite modes/_profile.template.md for freelance context**

Replace FTE fields with freelance fields:

- `name`, `email`, `location`, `timezone` (keep)
- `niches` (list, with rates per niche)
- `rate_floor` and `target_rate` (per platform)
- `platforms` (Upwork, Toptal, Direct, etc., with profile URLs)
- `positioning` (one-paragraph "what you do, for whom, why you")
- `proof_points` (3-10 bullets with metrics)
- `past_engagements` (with platform, scope, rate, outcome, rating)
- `availability` (hours/week, timezone, lead time)
- `exclusions` (industries, scopes, client types you don't take)

- [ ] **Step 4: Commit**

```bash
git add modes/_shared.md modes/_profile.template.md
git commit -m "feat(modes): rewrite _shared.md and _profile.template.md for freelance"
```

---

## Phase F: Doctor & Update Plumbing

### Task 22: TDD doctor.mjs updates

**Files:**
- Modify: `doctor.mjs`
- Test: `tests/doctor.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/doctor.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('doctor.mjs reports onboardingNeeded when rates.yml is missing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'doctor-test-'));
  try {
    // Create all required files EXCEPT rates.yml
    writeFileSync(join(dir, 'profile.md'), '# me\n');
    writeFileSync(join(dir, 'config', 'profile.yml'), 'name: test\n');
    writeFileSync(join(dir, 'config', 'platforms.yml'), 'platforms: []\n');
    writeFileSync(join(dir, 'modes', '_profile.md'), 'niches: []\n');
    writeFileSync(join(dir, 'data', 'leads.md'), '| # |\n');

    const scriptPath = join(import.meta.dirname, '..', 'doctor.mjs');
    const result = execFileSync('node', [scriptPath, '--json'], { cwd: dir, encoding: 'utf8' });
    const json = JSON.parse(result);
    assert.equal(json.onboardingNeeded, true);
    assert.ok(json.missing.includes('config/rates.yml'),
      'should list rates.yml as missing');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('doctor.mjs reports onboardingNeeded=false when all files present', () => {
  const dir = mkdtempSync(join(tmpdir(), 'doctor-test-'));
  try {
    writeFileSync(join(dir, 'profile.md'), '# me\n');
    writeFileSync(join(dir, 'config', 'profile.yml'), 'name: test\n');
    writeFileSync(join(dir, 'config', 'rates.yml'), 'rate_floor: $50/hr\n');
    writeFileSync(join(dir, 'config', 'platforms.yml'), 'platforms: []\n');
    writeFileSync(join(dir, 'modes', '_profile.md'), 'niches: []\n');
    writeFileSync(join(dir, 'data', 'leads.md'), '| # |\n');

    const scriptPath = join(import.meta.dirname, '..', 'doctor.mjs');
    const result = execFileSync('node', [scriptPath, '--json'], { cwd: dir, encoding: 'utf8' });
    const json = JSON.parse(result);
    assert.equal(json.onboardingNeeded, false);
    assert.deepEqual(json.missing, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/doctor.test.mjs`
Expected: FAIL — `doctor.mjs` doesn't know about `rates.yml`.

- [ ] **Step 3: Update doctor.mjs**

Find the list of "required user files" in `doctor.mjs`. Update:

```javascript
// Old: cv.md, config/profile.yml, modes/_profile.md, portals.yml
// New: profile.md, config/profile.yml, config/rates.yml,
//      config/platforms.yml, modes/_profile.md, data/leads.md

const REQUIRED_USER_FILES = [
  'profile.md',
  'config/profile.yml',
  'config/rates.yml',
  'config/platforms.yml',
  'modes/_profile.md',
  'data/leads.md'
];
```

Also update the output schema documentation in any comments.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/doctor.test.mjs`
Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add doctor.mjs tests/doctor.test.mjs
git commit -m "feat(setup): doctor.mjs checks for new freelance prerequisites"
```

### Task 23: Update update-system.mjs for new upstream

**Files:**
- Modify: `update-system.mjs`
- Test: `tests/update-system.test.mjs`

- [ ] **Step 1: Read the parent's update-system.mjs**

Find the hardcoded upstream URL/repo. It's typically a constant near the top:
`GITHUB_REPO` or similar.

- [ ] **Step 2: Update the upstream reference**

```javascript
// Old: const GITHUB_REPO = 'santifer/freelance-ops';
// New: const GITHUB_REPO = '<your-username>/freelance-ops';
//      (TBD: replace with actual fork owner)
const GITHUB_REPO = 'YOUR_USERNAME/freelance-ops';
```

Add a placeholder note:

```javascript
// IMPORTANT: After forking, set GITHUB_REPO to your fork's owner/name.
// Until then, the update checker will hit the parent's releases, which is wrong.
```

- [ ] **Step 3: Write a test that catches the placeholder**

`tests/update-system.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const updatePath = join(__dirname, '..', 'update-system.mjs');

test('update-system.mjs GITHUB_REPO points at the freelance-ops fork, not the parent', () => {
  const content = readFileSync(updatePath, 'utf8');
  assert.doesNotMatch(content, /santifer\/freelance-ops/,
    'must not still reference the parent project');
  assert.match(content, /freelance-ops/, 'should reference the new fork');
});
```

- [ ] **Step 4: Run the test**

Run: `node --test tests/update-system.test.mjs`
Expected: 1 passing.

- [ ] **Step 5: Commit**

```bash
git add update-system.mjs tests/update-system.test.mjs
git commit -m "feat(setup): update-system.mjs repointed at freelance-ops fork"
```

---

## Phase G: CI & Smoke Test

### Task 24: Update .github/workflows/ for new test suite

**Files:**
- Modify: `.github/workflows/ci.yml` (or whatever the parent's main workflow is called)

- [ ] **Step 1: Read the parent's CI workflow**

Open `.github/workflows/*.yml`. Find the test step that runs `test-all.mjs`.

- [ ] **Step 2: Update test command if needed**

The CI typically runs:

```yaml
- name: Run tests
  run: node test-all.mjs
```

If the parent's test-all.mjs runs node --test, no change needed. Otherwise update the test invocation.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/
git commit -m "ci: confirm workflow runs new freelance-ops test suite"
```

### Task 25: Update test-all.mjs to wire in new test files

**Files:**
- Modify: `test-all.mjs`

- [ ] **Step 1: Read test-all.mjs to understand its structure**

It's typically a script that runs many checks: file presence, schema validity,
content presence, language consistency, etc.

- [ ] **Step 2: Add the new test files to the test runner**

Find the section that runs node:test tests. Add:

```javascript
import { run } from 'node:test';
run({ files: [
  'tests/states.test.mjs',
  'tests/merge-tracker.test.mjs',
  'tests/normalize-statuses.test.mjs',
  'tests/dedup-tracker.test.mjs',
  'tests/verify-pipeline.test.mjs',
  'tests/scripts-parse.test.mjs',
  'tests/doctor.test.mjs',
  'tests/update-system.test.mjs'
]});
```

(Exact integration depends on existing test-all.mjs structure; adapt.)

- [ ] **Step 3: Add new structural checks for freelance-ops**

Append to test-all.mjs:

```javascript
// New structural checks for freelance-ops fork
const fs = require('node:fs');

const checks = [
  // Removed FTE files
  { path: 'modes/latex.md', shouldExist: false },
  { path: 'providers/greenhouse.mjs', shouldExist: false },
  { path: 'providers/ashby.mjs', shouldExist: false },
  { path: 'providers/lever.mjs', shouldExist: false },
  { path: 'providers/workable.mjs', shouldExist: false },
  { path: 'providers/workday.mjs', shouldExist: false },
  { path: 'providers/recruitee.mjs', shouldExist: false },
  { path: 'providers/smartrecruiters.mjs', shouldExist: false },
  { path: 'providers/solidjobs.mjs', shouldExist: false },
  { path: 'scan-ats-full.mjs', shouldExist: false },
  { path: 'test-salary-filter.mjs', shouldExist: false },
  { path: 'templates/cv-template.html', shouldExist: false },
  { path: 'templates/cv-template.tex', shouldExist: false },

  // New required files
  { path: 'data/leads.md', shouldExist: true },
  { path: 'data/clients.yml', shouldExist: true },
  { path: 'templates/states.yml', shouldExist: true },
  { path: 'modes/blocks/lead-blocks.md', shouldExist: true },
  { path: 'NOTICE', shouldExist: true },

  // 17 mode stubs
  ...['lead','leads','proposal','portfolio','pitch','screening',
      'nurture','outreach','pipeline','scan','tracker',
      'auto-pipeline','patterns','onboarding','deep','training','project']
    .map(m => ({ path: `modes/${m}.md`, shouldExist: true })),

  // 4 CLI skill folders
  { path: '.claude/skills/freelance-ops/SKILL.md', shouldExist: true },
  { path: '.opencode/skills/freelance-ops/SKILL.md', shouldExist: true },
  { path: '.gemini/skills/freelance-ops/SKILL.md', shouldExist: true },
  { path: '.qwen/skills/freelance-ops/SKILL.md', shouldExist: true },
  { path: '.agents/skills/freelance-ops/SKILL.md', shouldExist: true },

  // 18 commands per CLI
  ...['freelance-ops-lead','freelance-ops-leads','freelance-ops-proposal',
      'freelance-ops-portfolio','freelance-ops-pitch','freelance-ops-screening',
      'freelance-ops-nurture','freelance-ops-outreach','freelance-ops-pipeline',
      'freelance-ops-scan','freelance-ops-tracker','freelance-ops-auto',
      'freelance-ops-patterns','freelance-ops-onboarding','freelance-ops-deep',
      'freelance-ops-training','freelance-ops-project']
    .flatMap(c => [
      { path: `.claude/commands/${c}.md`, shouldExist: true },
      { path: `.opencode/commands/${c}.md`, shouldExist: true },
      { path: `.gemini/commands/${c}.toml`, shouldExist: true },
      { path: `.qwen/commands/${c}.toml`, shouldExist: true }
    ])
];

let failures = 0;
for (const { path, shouldExist } of checks) {
  const exists = fs.existsSync(path);
  if (exists !== shouldExist) {
    console.error(`FAIL: ${path} should ${shouldExist ? 'exist' : 'not exist'} but ${exists ? 'exists' : 'does not'}`);
    failures++;
  }
}
if (failures > 0) {
  console.error(`\n${failures} structural check(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${checks.length} structural checks passed.`);
```

- [ ] **Step 4: Run the full test suite**

Run: `node test-all.mjs`
Expected: all checks pass.

- [ ] **Step 5: Commit**

```bash
git add test-all.mjs
git commit -m "test: wire new test files into test-all.mjs and add freelance structural checks"
```

### Task 26: Smoke test the foundation

**Files:** (no new files; verification task)

- [ ] **Step 1: Set up a minimal config for the smoke test**

```bash
mkdir -p config data reports batch/tracker-additions modes interview-prep output
echo "# me" > profile.md
echo "name: test user" > config/profile.yml
echo "rate_floor: \$50/hr" > config/rates.yml
echo "platforms: []" > config/platforms.yml
echo "niches: []" > modes/_profile.md
echo "# Tracker" > data/leads.md
echo "| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |" >> data/leads.md
echo "|---|------|----------------|------------|----------|--------|------|-------|--------|-------|" >> data/leads.md
echo "clients: []" > data/clients.yml
```

- [ ] **Step 2: Run doctor.mjs**

Run: `node doctor.mjs --json`
Expected: `{"onboardingNeeded":false,"missing":[],"warnings":[]}`

- [ ] **Step 3: Run test-all.mjs**

Run: `node test-all.mjs`
Expected: all checks pass.

- [ ] **Step 4: Run verify-pipeline.mjs**

Run: `node verify-pipeline.mjs`
Expected: exits 0, no output.

- [ ] **Step 5: Run merge-tracker.mjs with a sample TSV**

Create a test TSV:
```bash
echo -e "001\t2026-06-15\tAcme Co\tAI consulting\tUpwork\tQualified\t\$95/hr\t4.5/5\t[001](reports/001-acme-co-2026-06-15.md)\tStrong fit" > batch/tracker-additions/001-acme-co.tsv
node merge-tracker.mjs
cat data/leads.md
```

Expected: the Acme Co row appears in leads.md.

- [ ] **Step 6: Run dedup-tracker.mjs**

Run: `node merge-tracker.mjs && node dedup-tracker.mjs`
Expected: no duplicate rows.

- [ ] **Step 7: Run normalize-statuses.mjs**

```bash
echo -e "002\t2026-06-15\tBeta Co\tweb app\tDirect\tin-progress\t\$80/hr\t4.0/5\t[002](reports/002-beta-co-2026-06-15.md)\tnote" > batch/tracker-additions/002-beta-co.tsv
node merge-tracker.mjs
node normalize-statuses.mjs
cat data/leads.md
```

Expected: `in-progress` is normalized to `In Progress`.

- [ ] **Step 8: Final commit and tag v0.1.0-foundation**

```bash
git add -A
git commit -m "chore: foundation smoke test fixtures"
git tag v0.1.0-foundation
```

---

## Acceptance Criteria (this plan)

Foundation v0.1.0 is "done" when:

1. ✅ All FTE-specific files removed (8 ATS providers, latex mode, CV templates, salary filter, scan-ats-full).
2. ✅ Brand renamed `freelance-ops` → `freelance-ops` everywhere.
3. ✅ `templates/states.yml` defines 14 freelance states.
4. ✅ `data/leads.md` uses the new 10-column schema.
5. ✅ `merge-tracker.mjs`, `dedup-tracker.mjs`, `normalize-statuses.mjs`, `verify-pipeline.mjs` all pass their tests on the new schema.
6. ✅ `doctor.mjs` checks for `config/rates.yml` and other new prerequisites.
7. ✅ `update-system.mjs` repointed at the new fork.
8. ✅ 17 mode stubs created.
9. ✅ `modes/blocks/lead-blocks.md` defines the 6-block + G framework.
10. ✅ All 4 CLI skill folders (`.claude/`, `.opencode/`, `.gemini/`, `.qwen/`) have SKILL.md + 18 slash command files.
11. ✅ CI workflow runs the full test suite.
12. ✅ `node doctor.mjs --json` returns `{"onboardingNeeded":false,"missing":[]}`.
13. ✅ `node test-all.mjs` exits 0.
14. ✅ `node verify-pipeline.mjs` exits 0 on the test fixture.
15. ✅ Smoke test: a sample TSV can be merged, deduped, and normalized.

## What This Plan Does NOT Deliver

- **Real freelance content in modes/*.md** — that's Plan 2 (the 25-35h of mode re-authoring).
- **Upwork provider** — that's Plan 3.
- **Proposal / rate card / portfolio HTML templates** — that's Plan 3.
- **Dashboard (Go TUI) rewrite** — that's Plan 4.
- **Multi-language mode ports** — that's Plan 4 (deferred).
- **Real invoicing / time tracking / contract generation** — explicitly out of scope per spec.

## Next Plans (out of scope for this document)

- **Plan 2: Mode Content & Onboarding** — author the full 17 modes + onboarding + 6-block heuristics. ~35-50h.
- **Plan 3: Providers & Collateral** — Upwork provider, manual paste provider, proposal/rate card/portfolio templates, `generate-pdf.mjs` integration. ~25-35h.
- **Plan 4: Dashboard, CI Hardening & Polish** — Go TUI rewrite, multi-language port, full docs, demo, troubleshooting. ~15-25h.

Each plan produces working, testable software on its own.

---

## Self-Review

**Spec coverage:**

| Spec section | Plan task |
|--------------|-----------|
| Fork & rebrand (Workstream 1) | Tasks 1-5 |
| Mode re-authoring (Workstream 2) | Deferred to Plan 2 (this plan creates stubs only) |
| Lead evaluation framework (Workstream 3) | Task 18 (stub) + Plan 2 (heuristics) |
| Upwork provider (Workstream 4) | Deferred to Plan 3 |
| Proposal generator (Workstream 5) | Deferred to Plan 3 |
| Rate card + portfolio (Workstream 6) | Deferred to Plan 3 |
| Tracker schema migration (Workstream 7) | Tasks 6-10, 11-15 |
| Dashboard rewrite (Workstream 8) | Deferred to Plan 4 |
| Pipeline integrity scripts (Workstream 9) | Tasks 11-15 |
| CI tests (Workstream 10) | Tasks 24-25 |
| Docs + onboarding (Workstream 11) | Task 5 (README) + Plan 4 (full docs) |
| Onboarding mode rewrite (Workstream 12) | Deferred to Plan 2 |
| Self-update plumbing (Workstream 13) | Task 23 |

**Type consistency:** the column-count constant (10) and state list (14 states) are used consistently across tasks 6, 8, 9, 11, 12, 13, 14, 22.

**Placeholder scan:** no "TBD"/"TODO"/"implement later" outside the explicit stub sections (Tasks 17, 18, 19, 20) which are intentionally stubs for Plan 2. Task 23 has one explicit `YOUR_USERNAME/freelance-ops` placeholder that the user must fill in.

**Gaps:** none in scope of this plan. Plan 2-4 cover the remaining workstreams.
