# freelance-ops -- AI Freelance Pipeline

## Origin

This system was built and used by [santifer](https://santifer.io) to run a freelance / contract pipeline: scanning Upwork, Toptal and direct leads; qualifying with a 6-block A-F scoring system; drafting proposals backed by proof points; tracking every lead from `New` → `Paid`; and defending the rate floor. The lead archetypes, scoring logic, proposal templates and proof-point structure reflect his specific freelance practice in AI / automation engagements.

The portfolio that goes with this system is also open source: [cv-santiago](https://github.com/santifer/cv-santiago).

**It will work out of the box, but it's designed to be made yours.** If the archetypes don't match your niches, the modes are in the wrong language, or the scoring doesn't fit your priorities -- just ask. You (AI Agent) can edit the user's files. The user says "change the archetypes to data engineering" and you do it. That's the whole point.

## Data Contract (CRITICAL)

There are two layers. Read `DATA_CONTRACT.md` for the full list.

**User Layer (NEVER auto-updated, personalization goes HERE):**
- `profile.md` (CV / portfolio source of truth)
- `config/profile.yml`, `config/rates.yml`, `config/platforms.yml`
- `modes/_profile.md` (your niches, rate floor, negotiation scripts)
- `data/leads.md`, `data/clients.yml`, `data/portfolio/`, `data/contracts/`, `data/invoices/`
- `data/pipeline.md`, `data/scan-history.tsv`
- `reports/*`, `output/*`, `interview-prep/*` (repurposed for screening)

**System Layer (auto-updatable, DON'T put user data here):**
- `modes/_shared.md`, `modes/lead.md`, all other modes
- `modes/blocks/lead-blocks.md` (6-block + G framework)
- `CLAUDE.md`, `OPENCODE.md`, `GEMINI.md`, `AGENTS.md`
- `*.mjs` scripts, `dashboard/*`, `templates/*`, `batch/*`
- `.claude/skills/*`, `.opencode/skills/*`, `.gemini/commands/*`, `.qwen/commands/*`

**THE RULE: When the user asks to customize anything (niches, positioning, rate floor, proposal scripts, proof points, platform policy, exclusions), ALWAYS write to `modes/_profile.md`, `config/profile.yml`, or `config/rates.yml`. NEVER edit `modes/_shared.md` for user-specific content.** This ensures system updates don't overwrite their customizations.

## Update Check

On the first message of each session, run the update checker silently:

```bash
node update-system.mjs check
```

Parse the JSON output:
- `{"status": "update-available", "local": "1.0.0", "remote": "1.1.0", "changelog": "..."}` → tell the user:
  > "freelance-ops update available (v{local} → v{remote}). Your data (profile, rate card, leads, reports) will NOT be touched. Want me to update?"
  If yes → run `node update-system.mjs apply`. If no → run `node update-system.mjs dismiss`.
- `{"status": "up-to-date"}` → say nothing
- `{"status": "dismissed"}` → say nothing
- `{"status": "offline"}` → say nothing
- `{"status": "no-remote-version"}` → say nothing (checker reached GitHub but neither VERSION nor the latest release tag parsed as semver — treat as a silent non-failure, same as offline)

The user can also say "check for updates" or "update freelance-ops" at any time to force a check.
To rollback: `node update-system.mjs rollback`

## What is freelance-ops

AI-powered, CLI-agnostic freelance pipeline: lead tracking, lead evaluation, proposal generation, platform scanning, batch processing, and rate-floor enforcement. Runs on any AI coding CLI that follows the [open agent skill standard](https://agentskills.io) (Claude Code, Codex, Gemini, OpenCode, Qwen, Copilot, Kimi).

### Main Files

| File | Function |
|------|----------|
| `data/leads.md` | Lead pipeline (was `data/applications.md`) |
| `data/pipeline.md` | Inbox of pending lead URLs |
| `data/scan-history.tsv` | Scanner dedup history |
| `data/clients.yml` | Client profile / payment history cache |
| `data/portfolio/` | Past engagement artifacts, case studies |
| `data/contracts/` | Active + archived contract templates |
| `data/invoices/` | Invoice drafts and payment status |
| `config/profile.yml` | Identity, positioning, proof points, exclusions |
| `config/rates.yml` | Rate floor + target rate per niche/platform |
| `config/platforms.yml` | (renamed from `portals.yml`) Platform + query config |
| `profile.md` | (renamed from `cv.md`) Canonical CV / portfolio source |
| `modes/_profile.md` | Niches, narrative, negotiation scripts (user overrides) |
| `modes/blocks/lead-blocks.md` | 6-block A-F + G (legitimacy tier) framework |
| `modes/_shared.md` | System scoring, global rules, tools |
| `templates/cv-template.html` | HTML template for CVs / proposals |
| `generate-pdf.mjs` | Playwright: HTML to PDF |
| `generate-latex.mjs` | LaTeX CV validator + pdflatex compiler |
| `interview-prep/story-bank.md` | Accumulated STAR+R stories across evaluations |
| `interview-prep/{client}-{scope}.md` | Client-specific screening / kickoff intel reports |
| `analyze-patterns.mjs` | Pattern analysis script (JSON output) |
| `followup-cadence.mjs` | Follow-up cadence calculator (JSON output) |
| `data/follow-ups.md` | Follow-up history tracker |
| `scan.mjs` | Zero-token platform scanner — hits Greenhouse/Ashby/Lever APIs directly, zero LLM cost |
| `check-liveness.mjs` | Lead posting liveness checker |
| `liveness-core.mjs` | Shared liveness logic (expired signals win over generic Apply text) |
| `reports/` | Lead evaluation reports (format: `{###}-{client-slug}-{YYYY-MM-DD}.md`). Blocks A-F + G (Legitimacy tier). Header includes `**Legitimacy:** {verified|caution|likely-scam}`. |

### OpenCode Commands

When using [OpenCode](https://opencode.ai), the following slash commands are available (defined in `.opencode/commands/`):

| Command | Claude Code Equivalent | Description |
|---------|------------------------|-------------|
| `/freelance-ops` | `/freelance-ops` | Show menu or evaluate lead with args |
| `/freelance-ops-lead` | `/freelance-ops lead` | Evaluate a single lead (A-F + G legitimacy) |
| `/freelance-ops-leads` | `/freelance-ops leads` | Compare and rank multiple leads |
| `/freelance-ops-proposal` | `/freelance-ops proposal` | Draft a tailored proposal for a qualified lead |
| `/freelance-ops-pitch` | `/freelance-ops pitch` | Draft a short pitch / opener (DM, cold email) |
| `/freelance-ops-outreach` | `/freelance-ops outreach` | Draft LinkedIn / email outreach (find contacts + draft) |
| `/freelance-ops-screening` | `/freelance-ops screening` | Screen a client (payment history, scam signals) |
| `/freelance-ops-nurture` | `/freelance-ops nurture` | Nurture past leads / warm pipeline |
| `/freelance-ops-portfolio` | `/freelance-ops portfolio` | Review portfolio piece vs target niches |
| `/freelance-ops-deep` | `/freelance-ops deep` | Deep research on a client or platform |
| `/freelance-ops-auto` | `/freelance-ops auto` | Auto-pipeline: evaluate + proposal + tracker from a JD/URL |
| `/freelance-ops-pipeline` | `/freelance-ops pipeline` | Process pending URLs from `data/pipeline.md` |
| `/freelance-ops-scan` | `/freelance-ops scan` | Scan platforms for new leads |
| `/freelance-ops-tracker` | `/freelance-ops tracker` | Pipeline status overview |
| `/freelance-ops-patterns` | `/freelance-ops patterns` | Analyze rejection / ghost patterns and improve targeting |
| `/freelance-ops-followup` | `/freelance-ops followup` | Follow-up cadence tracker |
| `/freelance-ops-onboarding` | `/freelance-ops onboarding` | Interactive onboarding interview (niches, rate card, proof points) |
| `/freelance-ops-training` | `/freelance-ops training` | Evaluate a course / cert against your niches |
| `/freelance-ops-project` | `/freelance-ops project` | Evaluate a portfolio project idea |

**Note:** OpenCode commands invoke the same `.claude/skills/freelance-ops/SKILL.md` skill used by Claude Code. The `modes/*` files are shared between both platforms.

### Gemini CLI Commands

When using the [Gemini CLI](https://github.com/google-gemini/gemini-cli), the following slash commands are available (defined in `.gemini/commands/`):

| Command | Claude Code Equivalent | Description |
|---------|------------------------|-------------|
| `/freelance-ops` | `/freelance-ops` | Show menu or evaluate lead with args |
| `/freelance-ops-lead` | `/freelance-ops lead` | Evaluate a single lead (A-F + G legitimacy) |
| `/freelance-ops-leads` | `/freelance-ops leads` | Compare and rank multiple leads |
| `/freelance-ops-proposal` | `/freelance-ops proposal` | Draft a tailored proposal for a qualified lead |
| `/freelance-ops-pitch` | `/freelance-ops pitch` | Draft a short pitch / opener (DM, cold email) |
| `/freelance-ops-outreach` | `/freelance-ops outreach` | Draft LinkedIn / email outreach (find contacts + draft) |
| `/freelance-ops-screening` | `/freelance-ops screening` | Screen a client (payment history, scam signals) |
| `/freelance-ops-nurture` | `/freelance-ops nurture` | Nurture past leads / warm pipeline |
| `/freelance-ops-portfolio` | `/freelance-ops portfolio` | Review portfolio piece vs target niches |
| `/freelance-ops-deep` | `/freelance-ops deep` | Deep research on a client or platform |
| `/freelance-ops-auto` | `/freelance-ops auto` | Auto-pipeline: evaluate + proposal + tracker from a JD/URL |
| `/freelance-ops-pipeline` | `/freelance-ops pipeline` | Process pending URLs from `data/pipeline.md` |
| `/freelance-ops-scan` | `/freelance-ops scan` | Scan platforms for new leads |
| `/freelance-ops-tracker` | `/freelance-ops tracker` | Pipeline status overview |
| `/freelance-ops-patterns` | `/freelance-ops patterns` | Analyze rejection / ghost patterns and improve targeting |
| `/freelance-ops-followup` | `/freelance-ops followup` | Follow-up cadence tracker |
| `/freelance-ops-onboarding` | `/freelance-ops onboarding` | Interactive onboarding interview |
| `/freelance-ops-training` | `/freelance-ops training` | Evaluate a course / cert against your niches |
| `/freelance-ops-project` | `/freelance-ops project` | Evaluate a portfolio project idea |

**Note:** Gemini CLI commands are defined in `.gemini/commands/*.toml`. The project context is auto-loaded from `GEMINI.md`. All `modes/*` files are shared across Claude Code, OpenCode, Gemini, and Qwen.

### First Run — Onboarding (IMPORTANT)

**Before doing ANYTHING else, check if the system is set up.** On the first message of each session, run the cold-start check — one deterministic source of truth (this doc and `doctor.mjs` share the same prerequisite list, so they can never drift):

```bash
node doctor.mjs --json
```

Output: `{"onboardingNeeded": <bool>, "missing": [...], "warnings": [...]}`, where `missing` lists whichever of `profile.md`, `config/profile.yml`, `config/rates.yml`, `modes/_profile.md`, `config/platforms.yml` are absent. `warnings` is reserved for non-blocking setup signals.

- If `modes/_profile.md` is in `missing`, copy it silently from `modes/_profile.template.md` (the user's customization file — never overwritten by updates). It's then resolved.
- **If, after that, `onboardingNeeded` is still true (any of `profile.md` / `config/profile.yml` / `config/rates.yml` / `config/platforms.yml` is missing), enter onboarding mode.** Do NOT proceed with evaluations, scans, or any other mode until the basics are in place. Guide the user step by step:

#### Step 1: Profile / CV (required)
If `profile.md` is missing, ask:
> "I don't have your profile / CV yet. You can either:
> 1. Paste your CV here and I'll convert it to markdown
> 2. Paste your LinkedIn URL and I'll extract the key info
> 3. Tell me about your experience and I'll draft a profile for you
>
> Which do you prefer?"

Create `profile.md` (the freelance rename of `cv.md`) from whatever they provide. Make it clean markdown with standard sections (Summary, Experience, Projects, Clients, Education, Skills, Tools).

#### Step 2: Profile config (required)
If `config/profile.yml` is missing, copy from `config/profile.example.yml` and then ask:
> "I need a few details to personalize the system:
> - Your full name and email
> - Your location and timezone
> - What freelance niches are you targeting? (e.g., 'AI consulting', 'Web app development', 'LLMOps')
> - Your platforms (Upwork, Toptal, Contra, direct/referral)
> - Your rate floor and target rate (per hour, or per fixed-price band)
>
> I'll set everything up for you."

Fill in `config/profile.yml` with their answers. Store niches, positioning, proof points and exclusions in `modes/_profile.md` (or `config/profile.yml`); never edit `modes/_shared.md` for user-specific content.

#### Step 3: Rate card (required)
If `config/rates.yml` is missing:
> "Let's set your rate card. I'll create a starter with the targets and platform notes you gave me. You can fine-tune later."

Create `config/rates.yml` with rate_floor, target_rate, and per-platform overrides.

#### Step 4: Platforms (recommended)
If `config/platforms.yml` is missing:
> "I'll set up the lead scanner with 45+ pre-configured sources. Want me to customize the search keywords for your niches?"

Copy `templates/portals.example.yml` → `config/platforms.yml`. If they gave niches in Step 2, update `title_filter.positive` to match.

#### Step 5: Tracker
If `data/leads.md` doesn't exist, create it:
```markdown
# Leads Pipeline

| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |
|---|------|----------------|------------|----------|--------|------|-------|--------|-------|
```

#### Step 6: Get to know the user (important for quality)

After the basics are set up, proactively ask for more context. The more you know, the better your evaluations will be:

> "The basics are ready. But the system works much better when it knows you well. Can you tell me more about:
> - What makes you unique? What's your 'superpower' that other freelancers don't have?
> - What kind of work excites you? What drains you?
> - Any deal-breakers? (e.g., no equity-only, no agencies, no <$X/hr, no crypto, no adult)
> - Your best client outcome — the one you'd lead with in a proposal
> - Any case studies, articles, or open-source work you've published?
>
> The more context you give me, the better I filter. Think of it as onboarding a recruiter — the first week I need to learn about you, then I become invaluable."

Store any insights the user shares in `config/profile.yml` (under `narrative`), `modes/_profile.md`, or in `data/portfolio/` if they share proof points. Do not put user-specific niches or framing into `modes/_shared.md`.

**After every evaluation, learn.** If the user says "this score is too high, I wouldn't propose here" or "you missed that I have a case study in X", update your understanding in `modes/_profile.md`, `config/profile.yml`, or `data/portfolio/`. The system should get smarter with every interaction without putting personalization into system-layer files.

#### Step 7: Ready
Once all files exist, confirm:
> "You're all set! You can now:
> - Paste a lead URL or description to evaluate it
> - Run `/freelance-ops scan` (or `/freelance-ops-scan` if using OpenCode) to search platforms
> - Run `/freelance-ops` to see all commands
>
> Everything is customizable — just ask me to change anything.
>
> Tip: A public portfolio + case studies dramatically improves your proposal response rate. If you don't have one yet, the author's portfolio is also open source: github.com/santifer/cv-santiago — feel free to fork it and make it yours."

Then suggest automation:
> "Want me to scan for new leads automatically? I can set up a recurring scan every few days so you don't miss anything. Just say 'scan every 3 days' and I'll configure it."

If the user accepts, use the `/loop` or `/schedule` skill (if available) to set up a recurring `/freelance-ops scan` (or `/freelance-ops-scan` if using OpenCode). If those aren't available, suggest adding a cron job or remind them to run `/freelance-ops scan` periodically.

### Personalization

This system is designed to be customized by YOU (AI Agent). When the user asks you to change niches, translate modes, adjust scoring, add platforms, or modify proposal scripts -- do it directly. You read the same files you use, so you know exactly what to edit.

**Common customization requests:**
- "Change the niches to [web dev / data / devops / AI consulting]" → edit `modes/_profile.md` or `config/profile.yml`
- "Translate the modes to English" → edit all files in `modes/`
- "Add these sources to my scanner" → edit `config/platforms.yml`
- "Update my rate card" → edit `config/rates.yml`
- "Update my profile / positioning" → edit `config/profile.yml` and `modes/_profile.md`
- "Change the proposal template design" → edit `templates/cv-template.html`
- "Adjust the scoring weights" → edit `modes/_profile.md` for user-specific weighting, or edit `modes/_shared.md` and `batch/batch-prompt.md` only when changing the shared system defaults for everyone

### Language Modes

Default modes are in `modes/` (English). Additional language-specific modes are available:

- **German (DACH market):** `modes/de/` — native German translations with DACH-specific vocabulary (13. Monatsgehalt, Probezeit, Kündigungsfrist, AGG, Tarifvertrag, etc.). Includes `_shared.md`, `angebot.md` (evaluation), `bewerben.md` (apply), `pipeline.md`.
- **French (Francophone market):** `modes/fr/` — native French translations with France/Belgium/Switzerland/Luxembourg-specific vocabulary (CDI/CDD, convention collective SYNTEC, RTT, mutuelle, prévoyance, 13e mois, intéressement/participation, titres-restaurant, CSE, portage salarial, etc.). Includes `_shared.md`, `offre.md` (evaluation), `postuler.md` (apply), `pipeline.md`.
- **Arabic (Middle East / Arab market):** `modes/ar/` — native Arabic translations with Arab region-specific vocabulary (مكافأة نهاية الخدمة, التأمينات الاجتماعية, راتب إجمالي/صافي, فترة التجربة, فترة الإخطار, البدلات, etc.). Includes `_shared.md`, `fursah.md` (evaluation), `takdeem.md` (apply), `pipeline.md`.
- **Japanese (Japan market):** `modes/ja/` — native Japanese translations with Japan-specific vocabulary (正社員, 業務委託, 賞与, 退職金, みなし残業, 年俸制, 36協定, 通勤手当, 住宅手当, etc.). Includes `_shared.md`, `kyujin.md` (evaluation), `oubo.md` (apply), `pipeline.md`.
- **Turkish (Turkey market):** `modes/tr/` — native Turkish translations with Turkey-specific vocabulary (SGK, kıdem tazminatı, ihbar süresi, brüt/net maaş, AGİ, BES, yemek kartı, yol yardımı, TÜFE zammı, etc.). Includes `_shared.md`, `is-ilani.md` (evaluation), `basvuru.md` (apply), `pipeline.md`.

**When to use German modes:** If the user is targeting German-language leads, lives in DACH, or asks for German output. Either:
1. User says "use German modes" → read from `modes/de/` instead of `modes/`
2. User sets `language.modes_dir: modes/de` in `config/profile.yml` → always use German modes
3. You detect a German lead → suggest switching to German modes

**When to use French modes:** If the user is targeting French-language leads, lives in France/Belgium/Switzerland/Luxembourg/Quebec, or asks for French output. Either:
1. User says "use French modes" → read from `modes/fr/` instead of `modes/`
2. User sets `language.modes_dir: modes/fr` in `config/profile.yml` → always use French modes
3. You detect a French lead → suggest switching to French modes

**When to use Arabic modes:** If the user is targeting Arabic-language leads, lives in the Middle East / Arab region, or asks for Arabic output. Either:
1. User says "use Arabic modes" → read from `modes/ar/` instead of `modes/`
2. User sets `language.modes_dir: modes/ar` in `config/profile.yml` → always use Arabic modes
3. You detect an Arabic lead → suggest switching to Arabic modes

**When to use Japanese modes:** If the user is targeting Japanese-language leads, lives in Japan, or asks for Japanese output. Either:
1. User says "use Japanese modes" → read from `modes/ja/` instead of `modes/`
2. User sets `language.modes_dir: modes/ja` in `config/profile.yml` → always use Japanese modes
3. You detect a Japanese lead → suggest switching to Japanese modes

**When to use Turkish modes:** If the user is targeting Turkish-language leads, lives in Turkey, or asks for Turkish output. Either:
1. User says "use Turkish modes" → read from `modes/tr/` instead of `modes/`
2. User sets `language.modes_dir: modes/tr` in `config/profile.yml` → always use Turkish modes
3. You detect a Turkish lead → suggest switching to Turkish modes

**When NOT to:** If the user is working English-language leads, even at French, German, Arabic, Japanese, or Turkish companies, use the default English modes — *unless* the user has explicitly requested another mode in this conversation, or `language.modes_dir` is set in `config/profile.yml` (the explicit user preference always wins over lead-language detection).

### Skill Modes

| If the user... | Mode |
|----------------|------|
| Pastes JD/lead text or URL (no sub-command) | `auto` (auto-pipeline: evaluate + proposal + tracker) |
| Asks to evaluate a single lead | `lead` |
| Asks to compare multiple leads | `leads` |
| Asks to draft a proposal | `proposal` |
| Asks to draft a short pitch / DM | `pitch` |
| Asks for LinkedIn / cold outreach | `outreach` |
| Asks to screen a client (scam signals, payment) | `screening` |
| Asks to re-engage past leads | `nurture` |
| Asks to review a portfolio piece | `portfolio` |
| Asks for client / platform research | `deep` |
| Preps for a kickoff call at specific client | `interview-prep` (repurposed for screening) |
| Wants interactive onboarding | `onboarding` |
| Wants to generate CV / PDF | `pdf` |
| Evaluates a course / cert | `training` |
| Evaluates a portfolio project idea | `project` |
| Asks about lead status | `tracker` |
| Asks about rejection / ghost patterns | `patterns` |
| Asks about follow-ups or proposal cadence | `followup` |
| Wants to update the system | `update` |
| Wants to fill a platform application form | `apply` |

### Profile Source of Truth

- `profile.md` in project root is the canonical profile / CV (was `cv.md`)
- `data/portfolio/` holds case studies, code samples, and writing samples
- `config/profile.yml` holds identity, positioning, proof points, exclusions
- `config/rates.yml` holds rate floor + target rate per niche/platform
- `modes/_profile.md` holds your niches, narrative, and negotiation scripts
- **NEVER hardcode metrics** -- read them from these files at evaluation time

---

## Ethical Use -- CRITICAL

**This system is designed for quality, not quantity.** The goal is to help the user win the few leads worth their time -- not to spam platforms with mass proposals.

- **NEVER submit a proposal without the user reviewing it first.** Draft proposals, fill forms, generate PDFs -- but always STOP before clicking Submit/Send. The user makes the final call.
- **Strongly discourage low-fit leads.** If a score is below 4.0/5, explicitly recommend against proposing. The user's time and the client's time are both valuable. Only proceed if the user has a specific reason to override the score.
- **Respect the rate floor.** Do not draft proposals that propose below `rate_floor` from `config/rates.yml` unless the user explicitly overrides. The system should defend the user's pricing.
- **Quality over speed.** A well-targeted proposal to 5 leads beats a generic blast to 50. Guide the user toward fewer, better proposals.
- **Respect clients' time.** Every proposal a human reads costs someone's attention. Only send what's worth reading.

---

## Lead Verification -- MANDATORY

**NEVER trust WebSearch/WebFetch to verify if a lead is still active.** ALWAYS use Playwright:
1. `browser_navigate` to the URL
2. `browser_snapshot` to read content
3. Only footer/navbar without lead = closed. Title + description + Apply = active.
4. Cross-check against Block G legitimacy signals (advance-fee, off-platform payment push, vague scope + high pay, "test task" as unpaid labor).

**Exception for batch workers (headless mode):** Playwright is not available in headless pipe mode. Use WebFetch as fallback and mark the report header with `**Verification:** unconfirmed (batch mode)`. The user can verify manually later.

---

## CI/CD and Quality

- **GitHub Actions** run on every PR: `test-all.mjs` (63+ checks), auto-labeler (risk-based: 🔴 core-architecture, ⚠️ agent-behavior, 📄 docs), welcome bot for first-time contributors
- **Branch protection** on `main`: status checks must pass before merge. No direct pushes to main (except admin bypass).
- **Dependabot** monitors npm, Go modules, and GitHub Actions for security updates
- **Contributing process**: issue first → discussion → PR with linked issue → CI passes → maintainer review → merge

## Community and Governance

- **Code of Conduct**: Contributor Covenant 2.1 with enforcement actions (see `CODE_OF_CONDUCT.md`)
- **Governance**: BDFL model with contributor ladder — Participant → Contributor → Triager → Reviewer → Maintainer (see `GOVERNANCE.md`)
- **Security**: private vulnerability reporting via email (see `SECURITY.md`)
- **Support**: help questions go to Discord/Discussions, not issues (see `SUPPORT.md`)
- **Discord**: https://discord.gg/8pRpHETxa4

## Headless / Batch Mode

When spawning headless workers for batch processing, use the appropriate command for your CLI:

| CLI | Command |
|-----|---------|
| Claude Code | `claude -p "prompt"` |
| **OpenCode** | `opencode run "prompt"` |
| Gemini CLI | `gemini -p "prompt"` |
| Copilot CLI | `copilot -p "prompt"` |
| Codex | `codex exec "prompt"` |
| Qwen | `qwen -p "prompt"` |

## Stack and Conventions

- Node.js (mjs modules), Playwright (PDF + scraping), YAML (config), HTML/CSS (template), Markdown (data), Canva MCP (optional visual CV)
- Scripts in `.mjs`, configuration in YAML
- Output in `output/` (gitignored), Reports in `reports/`
- Lead descriptions in `jds/` (referenced as `local:jds/{file}` in pipeline.md)
- Batch in `batch/` (gitignored except scripts and prompt)
- Report numbering: sequential 3-digit zero-padded, max existing + 1
- **RULE: After each batch of evaluations, run `node merge-tracker.mjs`** to merge tracker additions and avoid duplications.
- **RULE: NEVER create new entries in leads.md if client+scope already exists.** Update the existing entry.

### TSV Format for Tracker Additions (Freelance-Ops)

Write one TSV file per evaluation to `batch/tracker-additions/{num}-{client-slug}.tsv`. Single line, 10 tab-separated columns:

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
8. `score` -- format `X.X/5` (e.g., `4.2/5`)
9. `report` -- markdown link, root-relative `[num](reports/...)`
10. `notes` -- one-line summary

**Note:** In `leads.md`, the column order is: # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes.
The merge script handles the column swap automatically.

**Report link normalization:** The TSV always carries a **root-relative** `[num](reports/...)` link. `merge-tracker.mjs` rewrites it so the link is relative to the tracker file's own directory before writing it into the tracker — `../reports/...` when the tracker is at `data/leads.md`, or `reports/...` at the root layout. This keeps links clickable from the tracker (markdown links resolve relative to the file that contains them). Normalization is idempotent. To fix links in an existing tracker, run `node merge-tracker.mjs --migrate` (see #760).

### Pipeline Integrity

1. **NEVER edit leads.md to ADD new entries** -- Write TSV in `batch/tracker-additions/` and `merge-tracker.mjs` handles the merge.
2. **YES you can edit leads.md to UPDATE status/notes of existing entries.**
3. All reports MUST include `**URL:**` in the header (between Score and PDF). Include `**Legitimacy:** {tier}` (see Block G in `modes/blocks/lead-blocks.md`).
4. All statuses MUST be canonical (see `templates/states.yml`).
5. Health check: `node verify-pipeline.mjs`
6. Normalize statuses: `node normalize-statuses.mjs`
7. Dedup: `node dedup-tracker.mjs`

### Canonical States (leads.md)

**Source of truth:** `templates/states.yml`

**Main pipeline:**
| State | When to use |
|-------|-------------|
| `New` | Lead captured, not yet evaluated |
| `Qualified` | Evaluated and scored >= 4.0/5, ready to propose |
| `Proposed` | Proposal sent, awaiting response |
| `Negotiating` | In back-and-forth on terms, rate, or scope |
| `Contracted` | Contract signed / work order accepted |
| `In Progress` | Actively working on the engagement |
| `Delivered` | Work delivered, awaiting client acceptance |
| `Invoiced` | Invoice sent, awaiting payment |
| `Paid` | Payment received |
| `Reviewed` | Client review collected, engagement closed |

**Terminal off-ramps (valid from any non-terminal state):**
| State | When to use |
|-------|-------------|
| `Rejected` | Client rejected proposal or terminated engagement |
| `Ghosted` | No response for >14 days, no follow-up planned |
| `Withdrew` | Candidate withdrew from opportunity |
| `Disputed` | Disagreement over scope, deliverables, or payment |

**RULES:**
- No markdown bold (`**`) in status field
- No dates in status field (use the date column)
- No extra text (use the notes column)
@AGENTS.md
<!-- Add anything Claude Code specific that other agents don't need -->
