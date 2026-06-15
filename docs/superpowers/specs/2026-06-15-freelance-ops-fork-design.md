# Freelance-Ops — Heavy Fork Design

**Date:** 2026-06-15
**Status:** Approved for planning
**Source fork:** `github.com/santifer/freelance-ops`
**Target dir:** `E:\Jaco\Projects\pi\freelance-ops`
**Scope:** Approach B — Full Pipeline, One Platform (Upwork), ~3-4 weeks

## Purpose

A heavy fork of `freelance-ops` that replaces the FTE-job-search pipeline with a freelance/short-term contract pipeline. The fork targets three engagement shapes:

- Freelance / contract via platforms (Upwork first; Toptal, Contra, Fiverr, Freelancer in later phases)
- Short-term contracts (1-6 months, sourced via cold outreach, not via ATS scanning)
- Hourly / gig work

The fork reuses the parent project's proven infrastructure (AI-CLI integration, data contract, dashboard, CI, update mechanism) and replaces the FTE-specific content, providers, tracker schema, and collateral generation.

## Non-Goals (v1)

- No ATS scanning (Greenhouse / Ashby / Lever / Workable / Workday / Recruitee / SmartRecruiters / SolidJobs are all dropped)
- No LaTeX CV export
- No multi-language mode ports (de/fr/ja/pt/ru/tr/ua/ar all deferred)
- No real payment integration (Stripe/Wise/PayPal)
- No real time-tracking integration (Harvest/Toggl)
- No legal-API contract generation (template markdown only)
- No multi-platform — Upwork is the only platform provider in v1

## Architecture Decisions

### Reuse as-is

- **Multi-CLI integration pattern.** Slash-command folders in `.claude/`, `.opencode/`, `.gemini/`, `.qwen/` all resolve to the same `modes/*.md` files. The fork keeps this structure intact; only the mode file contents and command descriptions change.
- **User/system data contract** (`DATA_CONTRACT.md`). The strict split between user-owned files (never auto-updated) and system-owned files (auto-updatable) is the core safety mechanism. Kept verbatim, with the user-layer file list updated for the freelance schema.
- **`update-system.mjs` mechanism.** Repointed from `santifer/freelance-ops` to `<this-fork>/<this-repo>`. Semver VERSION file + GitHub release tags, same JSON output schema.
- **Pipeline integrity scripts** — `merge-tracker.mjs`, `dedup-tracker.mjs`, `normalize-statuses.mjs`, `verify-pipeline.mjs`, `reserve-report-num.mjs`, `tracker-links.mjs`. All adapted to new states but the pattern stays.
- **`batch/` parallel worker pattern.** Headless CLI workers (`claude -p` / `opencode run` / `gemini -p`) process leads in parallel. Same plumbing; new prompt files.
- **Go Bubble Tea dashboard** (`dashboard/`). Schema rewrite for new columns and states. Same TUI framework.
- **GitHub Actions CI.** Existing test runner (`test-all.mjs`, ~63 checks) extended with new schema assertions.
- **Multi-language mode folder pattern.** `modes/<lang>/` override folders are ported to freelance context if/when needed.
- **`portals.yml` config shape** — repurposed as `config/platforms.yml` (Upwork search config).

### Replace (FTE-specific, file shape stays)

| Original | New | Function |
|----------|-----|----------|
| `modes/oferta.md` | `modes/lead.md` | Evaluate a single lead (A-F) |
| `modes/ofertas.md` | `modes/leads.md` | Compare/rank multiple leads |
| `modes/cover.md` | `modes/proposal.md` | Generate tailored proposal |
| `modes/pdf.md` | `modes/portfolio.md` | Update portfolio / rate card |
| `modes/apply.md` | `modes/pitch.md` | Submit proposal or send outreach |
| `modes/interview-prep.md` | `modes/screening.md` | Prep for client screening call |
| `modes/followup.md` | `modes/nurture.md` | Lead nurture cadence |
| `modes/contacto.md` | `modes/outreach.md` | Cold outreach to direct clients |
| `modes/pipeline.md` | (same) | Process pending lead URLs from inbox |
| `modes/scan.md` | (same) | Scan Upwork for new leads |
| `modes/tracker.md` | (same) | New state schema |
| `modes/auto-pipeline.md` | (same) | Lead → qualify → proposal → tracker |
| `modes/patterns.md` | (same) | No-response / win pattern analysis |
| `modes/interview.md` | `modes/onboarding.md` | Onboarding interview, freelance questions |
| `modes/deep.md` | (same) | Client/company research |
| `modes/training.md` | (same) | "Should I take this course to up my rate?" |
| `modes/project.md` | (same) | "Should I take this project at this rate?" |

### Drop

- `modes/latex.md` (LaTeX CV export — no FTE use case)
- All eight ATS providers: `providers/{greenhouse,ashby,lever,workable,workday,recruitee,smartrecruiters,solidjobs}.mjs`
- `templates/cv-template.html`, `templates/cv-template.tex`
- `scan-ats-full.mjs` (entirely ATS-specific)
- Salary filter tests (`test-salary-filter.mjs` — no salary in v1 freelance schema)

### New files

- `modes/blocks/lead-blocks.md` — 6-block lead evaluation framework + Block G (freelance scam detection)
- `templates/proposal-template.html` — proposal PDF (Playwright)
- `templates/rate-card-template.html` — rate card PDF
- `templates/portfolio-template.html` — case study / portfolio piece
- `providers/upwork.mjs` — Upwork GraphQL/REST client
- `providers/manual.mjs` — paste a posting, AI parses
- `data/contracts/` — generated contract drafts (markdown)
- `data/invoices/` — generated invoice drafts (markdown)
- `data/clients.yml` — client ratings, payment history, repeat-customer tracking
- `config/rates.yml` — your rate card, platform minimums, target rates
- `config/platforms.yml` — Upwork profile, niches, specializations, search queries
- `examples/sample-leads/` — 3-5 example lead evaluations for calibration

## Lead Evaluation Framework (6 blocks)

The fork's `modes/blocks/lead-blocks.md` defines the new A-F scoring:

- **Block A — Lead Summary.** What the client wants (scope, deliverables), budget (or rate range), timeline, engagement shape (hourly / fixed / milestone), who's hiring.
- **Block B — Profile Match.** Your skills, proof points, and portfolio pieces vs. the lead's needs. Borrowed from the parent project.
- **Block C — Rate Strategy.** Target rate (hourly or fixed) given your `config/rates.yml`, market rate check, red-flag detection (rate too low, scope-vs-rate mismatch, "exposure" compensation, equity-only).
- **Block D — Client / Platform Research.** Client reputation, payment history (Upwork: hire rate, total spent, payment verified, country), platform signals (repeat-hire pattern, interview-to-hire ratio), prior freelancer reviews.
- **Block E — Proposal Strategy.** Angle, differentiators, social proof, structure. Identifies the 2-3 proof points from your story bank that map strongest to the lead.
- **Block F — Engagement & Risk.** Terms (IP assignment, NDA, exclusivity, kill fee), payment terms (milestones, escrow, net-N), red flags (off-platform request, upfront-payment demand, vague scope, undisclosed team).
- **Block G — Legitimacy.** Freelance-specific scam detection: advance-fee scam, overpayment scam, fake-client impersonation, MLM/pyramid signals, "test task" as unpaid labor, off-platform payment push.

The six core blocks produce a 0-5 score per block. Block G is a tier (`verified` / `caution` / `likely-scam`) that gates the rest. Final letter grade A-F, same convention as parent.

The header line carries `**Legitimacy:** {tier}` and `**Rate:** ${target_rate}/hr (or ${fixed_price})` for downstream scripts to parse.

## Tracker Schema

New canonical states in `templates/states.yml`:

```
New → Qualified → Proposed → Negotiating → Contracted →
In Progress → Delivered → Invoiced → Paid → Reviewed
```

Terminal off-ramps at any stage: `Rejected`, `Ghosted`, `Withdrew`, `Disputed`.

The 9-column TSV in `batch/tracker-additions/{num}-{slug}.tsv` is updated:

1. `num` (integer)
2. `date` (YYYY-MM-DD)
3. `client_or_company`
4. `role_or_scope` (short title)
5. `platform` (Upwork, Direct, Referral, etc.)
6. `status` (canonical)
7. `rate` (e.g. `$95/hr` or `$4500 fixed`)
8. `score` (`X.X/5`)
9. `report` (root-relative markdown link)
10. `notes` (one line)

`merge-tracker.mjs` is updated to handle the new column order and the new `platform` and `rate` columns.

## Collateral Generation

- **Proposal PDF.** Generated from a structured prompt: hook (1-2 sentences), relevant proof (2-3 examples from story bank), plan (milestones with hours), timeline, price, CTA. Renders via `generate-pdf.mjs` (Playwright) to A4 PDF.
- **Rate card PDF.** Pulls from `config/rates.yml` (your services, hourly rates, package prices, terms). Single-page A4.
- **Portfolio piece PDF.** Case study format: client, problem, approach, result (with metrics), tech, time, rate. Generated on demand from `data/portfolio/` markdown sources.

All three use the same `templates/*.html` → `generate-pdf.mjs` pipeline that the parent project already ships.

## Provider Strategy (v1)

**Upwork provider** (`providers/upwork.mjs`):
- Uses Upwork's GraphQL API for search (queries stored in `config/platforms.yml`).
- Rate-limit aware: respects 401/429, exponential backoff, persists cursor state in `data/scan-history.tsv` for dedup.
- Zero-token where possible (search results are structured JSON, not raw HTML).
- Fetches job details, client metadata (hire rate, total spent, country, payment verified, member since), and any attached files.

**Manual provider** (`providers/manual.mjs`):
- User pastes a posting (URL or raw text).
- AI extracts: client, scope, budget, timeline, rate type, country.
- Falls back to Playwright `browser_navigate` + `browser_snapshot` for URLs the AI can't fetch.

Both providers return a normalized lead object matching the schema in `providers/_types.js`.

## CLI Commands (v1)

Slash commands exposed in all four CLIs (`.claude/commands/`, `.opencode/commands/`, `.gemini/commands/`, `.qwen/commands/`):

| Command | Mode | Function |
|---------|------|----------|
| `/freelance-ops` | (menu) | Show all commands |
| `/freelance-ops-lead` | `lead` | Evaluate a lead (A-F) |
| `/freelance-ops-leads` | `leads` | Compare multiple leads |
| `/freelance-ops-proposal` | `proposal` | Generate tailored proposal |
| `/freelance-ops-portfolio` | `portfolio` | Update portfolio / rate card |
| `/freelance-ops-pitch` | `pitch` | Submit proposal / send outreach |
| `/freelance-ops-screening` | `screening` | Prep for client screening call |
| `/freelance-ops-nurture` | `nurture` | Lead nurture cadence |
| `/freelance-ops-outreach` | `outreach` | Cold outreach to direct clients |
| `/freelance-ops-pipeline` | `pipeline` | Process pending lead URLs |
| `/freelance-ops-scan` | `scan` | Scan Upwork for new leads |
| `/freelance-ops-tracker` | `tracker` | Lead status overview |
| `/freelance-ops-auto` | `auto-pipeline` | Lead → qualify → proposal → tracker |
| `/freelance-ops-patterns` | `patterns` | No-response / win pattern analysis |
| `/freelance-ops-onboarding` | `onboarding` | Interactive profile / portfolio interview |
| `/freelance-ops-deep` | `deep` | Client/company research |
| `/freelance-ops-training` | `training` | "Should I take this course to up my rate?" |
| `/freelance-ops-project` | `project` | "Should I take this project at this rate?" |

`/freelance-ops` (no args) auto-detects: pasted URL → scan, pasted JD/lead text → lead evaluation.

## Workstreams (Effort Estimate)

| # | Workstream | Hours | Notes |
|---|------------|-------|-------|
| 1 | **Fork + rebrand + cleanup** | 4-6 | Rename, trim, README, LICENSE, TRADEMARK, license attribution to parent |
| 2 | **Mode re-authoring** (the core) | 25-35 | Rewrite all 17 `modes/*.md` with new prompts, examples, scoring (latex dropped) |
| 3 | **Lead evaluation framework** (6 blocks + Block G) | 6-10 | New `modes/blocks/lead-blocks.md`; freelance-specific scam heuristics |
| 4 | **Upwork provider** | 10-15 | GraphQL/REST client, search queries, rate-limit handling, dedup |
| 5 | **Proposal generator** | 8-12 | HTML template + Playwright PDF + AI prompt that produces structure |
| 6 | **Rate card + portfolio generators** | 6-10 | Two HTML templates + generation scripts |
| 7 | **Tracker schema migration** | 4-6 | New `states.yml`, migration script, update `merge-tracker.mjs` |
| 8 | **Dashboard rewrite (Go TUI)** | 8-12 | New columns, new states, new filters (rate, platform, stage) |
| 9 | **Pipeline integrity scripts** | 3-4 | Adapt dedup, status normalization, health check for new states |
| 10 | **CI tests** | 4-6 | Update `test-all.mjs` checks for new schema (rename, file presence, no FTE residue) |
| 11 | **Docs + onboarding** | 4-6 | New SETUP, README, examples, walkthrough |
| 12 | **Onboarding mode rewrite** | 3-4 | New questions for freelance context (niches, rate floor, platform prefs) |
| 13 | **Self-update plumbing** | 2-3 | Point `update-system.mjs` at the new fork's repo |
| | **Total** | **~85-130 h** (3-4 weeks full-time) | |

### Hidden costs (not in main estimate)

- First week of real use = reveals gaps, iterate: 15-20 h
- Translating modes to other languages: 10-15 h per language (deferred)
- Scoring calibration against real leads: 5-10 h
- Triage / weight tuning: 5 h

### Open scope decisions (deferred until v1 is in use)

- **Invoicing**: real integration (Stripe/Wise/PayPal = +15 h) vs. markdown draft the user copies (default, 2 h)
- **Time tracking**: integrate Harvest/Toggl (+10 h) vs. markdown log (default, 1 h)
- **Contract generation**: TermsFeed-style legal API (+20 h) vs. template markdown (default, 4 h)
- **Multi-platform**: each additional platform = 8-12 h (Toptal, Contra, Fiverr, Freelancer)

## Acceptance Criteria

A v1 release is "done" when:

1. `npm install && npx playwright install chromium && node doctor.mjs` returns green on a clean machine.
2. The onboarding flow collects a niche, rate floor, and 2-3 proof points, and produces a populated `config/rates.yml` and `config/platforms.yml`.
3. `/freelance-ops-scan` against Upwork returns ≥1 lead in a 24-hour test query, with zero LLM tokens used.
4. `/freelance-ops-lead` on a pasted posting produces a 6-block A-F report + tracker entry, in <90 seconds.
5. `/freelance-ops-proposal` produces a PDF <2 pages that passes a "would I send this to a client" gut check.
6. The dashboard launches and shows columns for client, platform, rate, status, score.
7. `node verify-pipeline.mjs` exits 0 on a test fixture with one entry in each state.
8. All `test-all.mjs` checks pass in CI.

## Risks

- **Upwork API access.** Upwork's public API access has been tightened over time; v1 may need to lean on manual paste + Playwright scraping as a fallback. Build the manual provider first to de-risk.
- **LLM cost on first runs.** The parent project warns the first evaluations aren't great (no profile context). The fork inherits the same issue; onboarding mode needs to be thorough enough to mitigate.
- **Scam detection (Block G) is a moving target.** Heuristics need ongoing maintenance as new scam patterns emerge. Document the heuristics, don't hardcode them.
- **State schema churn.** The 10-state pipeline is more complex than the parent's 7. Some states may collapse in practice (e.g. Negotiating often blends into Contracted). Plan a v1.1 review after 30 days of real use.

## Spec Self-Review

- No TBDs / placeholders: all sections complete.
- Internal consistency: workstream hours (~85-130 h) match the section-by-section scope. State machine in tracker schema matches CLI command list.
- Scope: single implementation plan, not a multi-system decomposition.
- Ambiguity: lead evaluation blocks are defined; proposal structure is defined; tracker columns are defined. Where deferred (invoicing, time tracking, contracts), explicit defaults are stated.
