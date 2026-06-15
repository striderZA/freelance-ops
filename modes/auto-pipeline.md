---
description: Auto-detect and dispatch to the right mode based on user input
argument-hint: "[URL, JD text, command keyword, or paste from anywhere]"
---

# Mode: auto-pipeline — Auto-Detect + Dispatch

## Purpose

The single entry point for all user input. Classify what the user provided (a lead URL/JD, a command keyword, a question, or ambiguous text) and route to the correct mode. When the input clearly describes a freelance lead, execute the full pipeline: evaluate, report, PDF, and tracker entry. When the input is ambiguous or missing, show a menu.

## When to Use

**ALWAYS.** This mode runs on every user message that isn't already in an explicit mode (no `/freelance-ops lead`, `/freelance-ops scan`, etc.). It is the router that decides what happens next.

## Inputs

- **From user:** Any of: a URL (Upwork, Toptal, LinkedIn, company career page), pasted JD text, a command keyword, a question, or nothing.
- **From system (auto-read):**
  - `modes/_shared.md` — global rules, scoring framework, grade boundaries
  - `modes/_profile.md` — user's niches, rate floors, narrative, exclusions
  - `profile.md` — canonical CV / bio with proof points
  - `article-digest.md` (if exists) — detailed case studies and portfolio metrics
  - `config/rates.yml` — rate floor and target rates per niche
  - `config/profile.yml` — identity, location, target roles
  - `data/leads.md` — dedup against existing tracker entries

## Dispatch Logic

Read the user's message. Classify it into exactly one category below. Do not ask clarifying questions unless the input is truly ambiguous (no signal in any category).

### Category 1 — Explicit command keywords

If the message starts with or is a known command word, route directly:

| If user says... | Route to | Purpose |
|----------------|----------|---------|
| `evaluate` / `eval` / `lead` | `modes/lead.md` | Evaluate a single freelance lead |
| `scan` / `search` / `find` | `modes/scan.md` | Scan portals for new leads |
| `pipeline` / `inbox` | `modes/pipeline.md` | Process pending pipeline URLs |
| `batch` | `modes/batch.md` | Mass process multiple leads |
| `tracker` / `status` / `list` | `modes/tracker.md` | View lead tracker |
| `proposal` / `write proposal` | `modes/proposal.md` | Generate a proposal from a report |
| `pitch` / `submit` / `send` | `modes/pitch.md` | Submit through a platform |
| `cover` / `cover letter` | `modes/cover.md` | Generate a cover letter |
| `outreach` / `cold email` | `modes/outreach.md` | Cold outreach to direct clients |
| `nurture` / `follow up` | `modes/nurture.md` | Follow-up cadence for pending leads |
| `deep` / `research` / `vet` / `company` | `modes/deep.md` | Deep-dive client research |
| `screening` / `screen` / `call prep` | `modes/screening.md` | Screening call prep |
| `interview` / `onboard` / `setup` | `modes/interview.md` | Interactive profile interview |
| `patterns` / `analytics` / `trends` | `modes/patterns.md` | Rejection/win pattern analysis |
| `followup` / `cadence` | `modes/followup.md` | Follow-up cadence calculator |
| `portfolio` / `rate card` | `modes/portfolio.md` | Rate card and case study PDFs |
| `contacto` / `linkedin` / `connect` | `modes/contacto.md` | LinkedIn outreach messages |
| `compare` / `leads` / `rank` | `modes/leads.md` | Compare multiple leads |
| `project` / `case study` | `modes/project.md` | Evaluate a portfolio project |
| `training` / `course` / `cert` | `modes/training.md` | Evaluate a course or certification |
| `update` / `upgrade` / `check update` | `modes/update.md` | Check for system updates |
| `help` / `commands` / `what can you do` | Show menu (see Menu below) | — |
| `interview-prep` / `prep for` | `modes/interview-prep.md` | Full-time interview prep |

**Slug arguments:** If the command is followed by a slug (e.g., `proposal my-slug`), pass the slug as the argument to the target mode.

### Category 2 — Lead URL or JD text (single lead)

If the input looks like a freelance lead to evaluate:

**URL signals:** Contains a domain from a freelance platform (upwork.com, toptal.com, contra.com, fiverr.com, freelancer.com, peopleperhour.com, guru.com) OR looks like a company career page URL OR contains `/jobs/`, `/careers/`, `/gig/`, `/project/`, `/listing/`.

**JD text signals:** Contains role-related structure (title + responsibilities + requirements/budget/timeline) AND does NOT match the pattern of a question or command.

Route to **full auto-pipeline** (see below) → evaluates, reports, generates PDF, updates tracker.

### Category 3 — URL with multiple leads

If the URL points to a search/listing page (contains `/search`, `/jobs?`, `/gigs`, `/projects?`, `/browse`) OR the user pastes a list of URLs/JDs (multi-line with 2+ entries):

Route to `modes/leads.md` (comparison/ranking mode).

### Category 4 — Question

If the message is a question (ends with `?`, starts with `what/why/how/when/where/who/can/does/is/are`) and does NOT contain a full JD:

Route to conversational answer using profile context. Do NOT dispatch to a mode. Answer directly.

### Category 5 — Ambiguous or empty

If the message has no detectable signal in any category above, or the user just says "hi," "hello," "start," or nothing:

Show the Menu (see below). Do NOT proceed with any evaluation.

## Full Auto-Pipeline (Category 2 flow)

When the input is classified as a single freelance lead, execute in sequence:

### Step 0 — Extract JD

If the input is a **URL**, extract the JD content:

1. **Playwright (preferred):** Use `browser_navigate` + `browser_snapshot` to render the page. Most freelance platforms (Upwork, Toptal, Contra) and career portals (Lever, Greenhouse, Ashby) are SPAs that require JS rendering.
2. **fetch / WebFetch (fallback):** For static pages (company career pages, direct listings).
3. **Ask the user (last resort):** If extraction fails, ask them to paste the JD text directly.

If the input is **JD text**: use directly. Skip extraction.

### Step 0.5 — Liveness gate

Before any evaluation, confirm the posting is still live:

1. From Step 0 snapshot/fetched content, classify:
   - **active posting evidence:** title/role + real job description OR application/apply/bid/submit path
   - **closed posting evidence:** expired/closed/"no longer accepting"/"position filled", missing JD with only nav/footer, redirect to generic search page, 404/410
2. **If closed:** Stop immediately. Tell the user the link is dead. If the entry came from `data/pipeline.md`, mark it as closed. Do NOT evaluate.
3. **If JD text only (no URL):** Liveness cannot be verified — note it and proceed.
4. **If the snapshot is ambiguous** (e.g., login-wall, CAPTCHA, blocked): tell the user and ask them to paste the JD text directly.

### Step 1 — A-G Evaluation

Execute the full A-G evaluation from `modes/lead.md`. The evaluation has 6 scored blocks (A-F) plus the Block G legitimacy gate:

1. **Block A — Lead Summary:** Extract scope, deliverables, budget, timeline, engagement shape. Produce a TL;DR table with archetype, domain, function, engagement type, remote/onsite, team size.
2. **Block B — Profile Match:** Read `profile.md` + `article-digest.md`. Map each JD requirement to exact proof points. Flag gaps with mitigation strategy. Prioritize proof points by detected niche.
3. **Block C — Rate Strategy:** Read `config/rates.yml`. Compare target rate to lead budget. Enforce rate floor. Flag underpricing risk.
4. **Block D — Client/Platform Research:** Assess platform reputation, payment history, hire rate. Premium for direct/referral leads. Flag country risk.
5. **Block E — Proposal Fit:** Synthesize blocks A-D into a go/no-go recommendation. Articulate the hook — why THIS lead for THIS freelancer.
6. **Block F — Action Plan:** Next steps, questions for the screening call, documents to prepare.
7. **Block G — Legitimacy:** Classify as `verified`, `caution`, or `likely-scam`. Base on: payment method risk, scope vagueness, urgency pressure, off-platform requests, unprofessional communication.

Global score = weighted average of A-F (weights from `modes/_shared.md`). Map to letter grade. **If Block G = `likely-scam`, stop immediately — do not evaluate A-F, do not draft, do not generate PDF.**

### Step 2 — Save Report

Save the full evaluation in `reports/{num}-{client-slug}-{YYYY-MM-DD}.md`:

- **Report numbering:** Find the highest existing number in `reports/`. Increment by 1. Pad to 3 digits (e.g., `001`, `042`).
- **Client slug:** Derive from the client name — lowercase, alphanumeric + hyphens only (e.g., "Acme Corp" → `acme-corp`, "John's AI Startup" → `johns-ai-startup`).
- **Header:** Include `**URL:** {url}`, `**Score:** {X.X}/5 — {Grade}`, and `**Legitimacy:** {tier}`.
- **Content:** All 7 blocks (A-G). Each block's output as specified in `modes/blocks/lead-blocks.md`.
- **Proposal placeholder (only if score >= 4.0):** Append `## I) Proposal Draft` as an empty section for Step 3 to fill.

### Step 3 — Generate Proposal + PDF (only if score >= 4.0)

If global score >= 4.0 (Grade B or higher) AND Block G is `verified` (or `caution` with user override):

1. Read `config/rates.yml` for the user's rate card and `config/profile.yml` for identity details.
2. Read `modes/_profile.md` for proposal style, positioning narrative, negotiation scripts.
3. Read `profile.md` + `article-digest.md` for relevant proof points matching the lead's niche.
4. Read `data/clients.yml` (if exists) for past engagement benchmarks and rate anchors.
5. Generate a tailored proposal with: hook sentence, relevant experience paragraph, proposed approach, timeline estimate, price quote (hourly or fixed from rate card), call to action.
6. Save the proposal draft into the report as `## I) Proposal Draft` (append to existing placeholder).
7. Run the PDF pipeline: read CV from `profile.md`, generate tailored HTML via `templates/portfolio-template.html`, render PDF:
   ```bash
   node generate-pdf.mjs output/proposals/{num}-{client-slug}-{YYYY-MM-DD}.html output/proposals/{num}-{client-slug}-{YYYY-MM-DD}.pdf --format=a4
   ```
8. Report: PDF path, number of pages, file size.

**For leads scoring < 4.0:** Skip entirely. State: "Score below threshold. Not recommended. Override with `pitch {slug}` if you disagree."

**After PDF generation:** Prompt the user: "Proposal drafted at `output/proposals/{num}-{client-slug}-{YYYY-MM-DD}.pdf`. Review before sending. Want me to walk you through the submission (`pitch {slug}`) or adjust the proposal?"

### Step 4 — Update Tracker

Write a TSV entry to `batch/tracker-additions/{num}-{client-slug}.tsv`:

```
{num}\t{date}\t{client}\t{role}\tEvaluated\t{score}/5\t{pdf_emoji}\t[{num}](reports/{num}-{slug}-{date}.md)\t{1-line summary}
```

Column order: num, date, client, role, status, score, pdf ✅/❌, report link, notes.

Then inform the user: "Tracker entry saved. Run `node merge-tracker.mjs` to merge into `data/leads.md`."

### Step 5 — Present Summary

After all steps complete, present a 5-line summary:

```
Lead:      {client} — {role}
Score:     {X.X}/5 ({Grade}) | Legitimacy: {tier}
URL:       {url}
Report:    reports/{num}-{client-slug}-{YYYY-MM-DD}.md
PDF:       output/proposals/{num}-{client-slug}-{YYYY-MM-DD}.pdf (if generated)
Next:      {recommended action}
```

### Step 6 — Learn

After every evaluation, update the system's understanding of the user's preferences. If the user says "this score is too high" or "you missed that I have experience in X" or "I wouldn't apply here," log the insight:

- **Scoring calibration:** Note under- or over-weighting of specific blocks for similar future leads.
- **Profile gaps:** If the user mentions unlisted experience, prompt them to update `profile.md` or `config/profile.yml`.
- **Exclusion updates:** If the user rejects a lead for a reason not in their exclusions, offer to update `modes/_profile.md` or `config/profile.yml`.

Store these in `modes/_profile.md` under a `## Auto-Learned Preferences` section. Do NOT write personalization to `modes/_shared.md`.

### Error Recovery

| Step failure | Action |
|-------------|--------|
| Step 0 (extraction) fails | Skip to Step 0.5 with a note. If JD is missing entirely, stop. |
| Step 0.5 (liveness) is inconclusive | Note "liveness unconfirmed" in report. Proceed with evaluation. |
| Step 1 (evaluation) fails mid-block | Score completed blocks. Mark incomplete blocks as `N/A`. Do not skip the entire evaluation. |
| Step 2 (saving report) fails | Output the report inline so the user can copy it. |
| Step 3 (PDF generation) fails | Note "PDF failed" in tracker. Continue. |
| Step 4 (tracker TSV) fails | Note the tracker data inline so the user can create it manually. |

## Menu

When the user's intent is ambiguous or they ask for help, display:

```
freelance-ops — Available modes

    lead <url/text>         Evaluate a freelance lead (full A-G pipeline)
    leads [list]            Compare multiple leads
    scan                    Scan portals for new leads
    pipeline                Process pending pipeline URLs
    batch [file]            Mass process leads
    proposal <slug>         Draft a proposal from a lead report
    pitch <slug>            Guide platform proposal submission
    outreach <target>       Cold outreach to direct clients
    nurture [slug]          Follow-up cadence for pending leads
    deep <name/url>         Deep-dive client research
    screening <slug>        Screening call prep
    interview               Interactive profile interview
    portfolio <subcmd>      Rate card / case study PDFs
    cover <slug|text>       Cover letter generator
    contacto <target>       LinkedIn outreach
    tracker                 View lead tracker
    patterns                Rejection/win pattern analysis
    followup                Follow-up cadence calculator
    update                  Check for system updates
    project <text>          Evaluate a portfolio project
    training <text>         Evaluate a course / certification
    help                    Show this menu

Usage: /freelance-ops <mode> [args]
Or just paste a lead URL or description — I'll auto-detect.
```

## Report Numbering

Reports use 3-digit zero-padded sequential numbers. To determine the next number:

1. Scan `reports/` for all files matching `{###}-*.md`.
2. Extract the highest numeric prefix.
3. Increment by 1. Pad to 3 digits (e.g., `042` → `043`).
4. If `reports/` is empty or no files match, start at `001`.

The same number is used for the report file, the TSV tracker entry, and the PDF filename.

## Edge Cases

| Input | Action |
|-------|--------|
| Pasted URL that requires login to view | Tell the user the page requires authentication. Ask them to paste the JD text instead. |
| Multiple URLs on separate lines | Route to `modes/leads.md` (comparison mode) |
| URL + text in same message | Use the text as the JD; verify liveness from the URL |
| User says "what do you think of this?" with no link | Ask for a URL or JD text |
| User says "evaluate this" with a short description but no JD | That's not enough for evaluation. Ask for the full JD. |
| User pastes a LinkedIn job post URL | Extract via Playwright (LinkedIn blocks WebFetch). If blocked, ask for JD text. |
| User pastes a URL + asks a question about the system | Answer the question; do NOT evaluate the URL as a lead |
| User says "scan every 3 days" | Route to automation setup (cron / loop skill / schedule) |
| User says "update my profile" | Route to `modes/interview.md` or edit `config/profile.yml` directly |
| Score >= 4.0 but no PDF generated | Continue with tracker update. Note "PDF pending" in notes. |
| Block G = `likely-scam` at any score | Hard stop. Do not evaluate. Do not draft. Tell the user why. |
| User overrides a low score | Respect the override. Generate proposal if they insist. Note the override in the report. |
| User pastes the same URL twice | Check `data/leads.md` for existing entry. If found, ask: "This lead was already evaluated as #{num}. Want to re-evaluate or view the existing report?" |
| User says nothing / just pastes a link with no context | Treat as Category 2. Proceed with full pipeline. |
| User says "no" to a suggested action | Do not insist. Revert to menu. |
| User says "generate PDF" without a lead context | Route to `modes/portfolio.md` (rate card / case study PDFs), not the lead PDF pipeline |
| User pastes a Google Drive / PDF link with a JD | Download and extract text. If inaccessible, ask the user to paste JD text directly. |
| User says "what's new?" or "anything for me?" | Run a quick scan check + pending leads count. Present summary of pending pipeline. Do not run full scan. |
| URL is an internal company career portal (Greenhouse/Lever/Ashby) | Extract via Playwright. These are SPAs; WebFetch will fail to render the JD. |
| User seems to be in an existing mode context (mid-evaluation) | Do NOT re-dispatch. Let the current mode complete. |
| User says "compare these two" with exactly 2 URLs/descriptions | Route to `modes/leads.md` (works for 2+ comparisons) |
| Lead has no budget listed (client says "tell me your rate") | In Block C, note "no budget disclosed." Score rate fit as neutral. Note negotiation opportunity. |
| Client profile has zero hire history on the platform | Block D flags as `unproven` — note in Block G as `caution` with explanation. |
| Lead description is in an image (screenshot) | Ask the user to paste the text or transcribe key details. Do not attempt OCR. |

## Language Detection

If the JD text or URL page is in a language other than English, detect it and suggest switching to the corresponding locale in `modes/<lang>/`:

| Detected language | Suggest modes dir | Example file |
|-------------------|-------------------|--------------|
| German | `modes/de/` | `modes/de/lead.md` |
| French | `modes/fr/` | `modes/fr/lead.md` |
| Arabic | `modes/ar/` | `modes/ar/lead.md` |
| Japanese | `modes/ja/` | `modes/ja/lead.md` |
| Turkish | `modes/tr/` | `modes/tr/lead.md` |

Only suggest if the user has NOT already set `language.modes_dir` in `config/profile.yml`. An explicit user preference always wins over auto-detection.

Do NOT switch modes automatically — present a one-line offer: "This JD appears to be in [language]. Want me to switch to the [language] evaluation mode?"
