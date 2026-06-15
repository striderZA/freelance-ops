# Freelance-Ops Mode Content & Onboarding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author the full content for all 17 freelance-ops mode files, the onboarding interview, and the 6-block evaluation heuristics. Replace the current stubs with production-quality prompts that guide the AI agent correctly.

**Architecture:** This is content authoring, not code with TDD. The "test" for each mode is two-fold: (1) **spec compliance** — does the mode follow the design structure and freelance context? (2) **content quality** — is the prompt clear, well-organized, and would it guide an AI agent to produce the right output for a real user? Each mode is a self-contained `.md` file in `modes/`. The parent project (`santifer/career-ops`) modes are the structural reference — read the equivalent parent mode before writing the freelance version.

**Tech Stack:** Markdown, AI-agent prompts. No code.

**Reference docs to read first:**
- `docs/superpowers/specs/2026-06-15-freelance-ops-fork-design.md` — full design (Lead Evaluation Framework, Pipeline States, Collateral, CLI Commands)
- `modes/_shared.md` — current state (rewritten in Task 21 of Plan 1)
- `modes/_profile.template.md` — current state (rewritten in Task 21 of Plan 1)
- `modes/blocks/lead-blocks.md` — current state (stub from Task 18 of Plan 1)
- For each mode, the equivalent parent mode at `https://raw.githubusercontent.com/santifer/career-ops/main/modes/<name>.md` (use `webfetch` to read it)

---

## Mode Content Template

Every mode file (`modes/X.md`) should follow this structure. The implementer should use this template and adapt for the specific mode's purpose.

```markdown
---
description: <one-line description shown in CLI command lists>
argument-hint: <e.g., "[URL or pasted text]">
---

# <Mode Name> Mode

## Purpose

<One paragraph: what this mode does, who it's for, when to invoke it.>

## When to Use

<Bullet list of trigger conditions. Be specific.>

## Inputs

- What the user provides (URL, pasted text, command-line args)
- What the system reads automatically (`modes/_profile.md`, `data/clients.yml`, `data/leads.md`, etc.)

## Output Format

<Specify the structure of what the AI produces. If it writes a report file, specify the path and header schema. If it's a chat-only response, specify sections.>

## Workflow

<Step-by-step instructions for the AI agent. Use imperative voice ("Read...", "Evaluate...", "Write..."). Be specific about which tools/files to use.>

## Edge Cases

- <What to do if user profile is missing>
- <What to do if input is ambiguous>
- <What to do if a referenced file doesn't exist>

## Examples

<2-3 worked examples showing input → output. Use realistic freelance scenarios.>

## Anti-Patterns

<What NOT to do. Common mistakes the AI might make.>
```

**Length target:** 200-500 lines per mode. Substantive but focused.

**Tone:** Imperative voice ("Read the profile", "Evaluate block X"). Not descriptive ("This mode does X").

**Reference to shared framework:** Modes that involve lead evaluation should reference `modes/blocks/lead-blocks.md` for the 6-block framework. Modes that involve the user profile should reference `modes/_profile.md` (and instruct the user to fill it in if missing).

---

## Phase A: Shared Framework (already mostly done; review and refine)

### Task 1: Refine modes/_shared.md

**Files:**
- Read: `modes/_shared.md` (current state from Plan 1 Task 21)
- Modify: `modes/_shared.md`

**What to do:**
- Read the current `modes/_shared.md`. It was written in Plan 1 Task 21 as a freelance-flavored rewrite of the parent's `_shared.md`. Verify it covers:
  - Scoring framework (6 blocks, 0-5 per block, weighted average → letter grade)
  - Block weights and rationale
  - Ethical use: "Don't propose below 4.0/5"
  - Quality-over-quantity stance
  - Evidence-driven evaluation (cite specific files/sections)
  - Writing style (concise, specific, no fluff)
  - Cross-references to `modes/blocks/lead-blocks.md`, `modes/_profile.md`, `data/leads.md`
- Add anything missing. The file should be 200-400 lines.
- If a section is unclear, tighten it.

**Quality criteria:**
- Every scoring claim has rationale
- Anti-patterns are explicit (e.g., "don't pad the score to meet a quota")
- Cross-references to other files are accurate
- The "ethics" section is clear about not spamming clients

**Commit:** `docs(modes): refine _shared.md scoring framework`

### Task 2: Refine modes/_profile.template.md

**Files:**
- Read: `modes/_profile.template.md` (current state from Plan 1 Task 21)
- Modify: `modes/_profile.template.md`

**What to do:**
- Read the current `_profile.template.md`. It was written in Plan 1 Task 21 with freelance fields (niches, rate_floor, target_rate, platforms, positioning, proof_points, past_engagements, availability, exclusions, negotiation scripts).
- Verify all 10 freelance-specific fields are present and well-documented:
  1. `name`, `email`, `location`, `timezone`
  2. `niches` (list, with rates per niche)
  3. `rate_floor`, `target_rate` (per platform)
  4. `platforms` (Upwork, Toptal, Direct, etc., with profile URLs)
  5. `positioning` (one-paragraph "what you do, for whom, why you")
  6. `proof_points` (3-10 bullets with metrics)
  7. `past_engagements` (with platform, scope, rate, outcome, rating)
  8. `availability` (hours/week, timezone, lead time)
  9. `exclusions` (industries, scopes, client types you don't take)
  10. `negotiation_scripts` (rate pushback, scope creep, late payment)
- Each field should have a clear comment explaining its purpose, an example value, and a "leave blank to skip" note where applicable.
- Add a YAML schema validator (machine-readable) at the top in a comment.

**Quality criteria:**
- Every field is documented with example + purpose
- The template is copy-pasteable (someone can `cp modes/_profile.template.md modes/_profile.md` and fill in)
- Comments explain WHY each field matters (not just what it is)

**Commit:** `docs(modes): refine _profile.template.md with full freelance schema`

### Task 3: Expand modes/blocks/lead-blocks.md with full heuristics

**Files:**
- Read: `modes/blocks/lead-blocks.md` (current state from Plan 1 Task 18)
- Modify: `modes/blocks/lead-blocks.md`

**What to do:**
- The current `lead-blocks.md` is a stub with high-level block descriptions. Expand each block (A, B, C, D, E, F, G) with:
  - **Specific scoring criteria** (what 0/2/3/4/5 looks like)
  - **Concrete red flags** (what to flag for each block)
  - **Output format** (exactly what to write in the report for each block)
  - **Weight rationale** (why this block matters for freelancers)
- For Block G (legitimacy), include the full scam detection heuristics from the spec:
  - Advance-fee scam
  - Overpayment scam
  - Fake client impersonation
  - MLM / pyramid signals
  - "Test task" as unpaid labor
  - Off-platform payment push
  - Vague scope + high pay mismatch
- Target length: 400-600 lines.

**Quality criteria:**
- Each block has at least 5 specific scoring criteria (with examples)
- Block G has all 7 scam patterns from the spec
- The report header format (`**Legitimacy:** {tier}`, `**Rate:**`, `**Score:**`, `**URL:**`) is documented

**Commit:** `docs(modes): expand lead-blocks.md with full 6-block + G heuristics`

---

## Phase B: Core Evaluation Modes (the heart of the system)

### Task 4: Author modes/lead.md

**Files:**
- Create: `modes/lead.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/oferta.md` for structure.

**Purpose:** The single most important mode. Evaluates a freelance lead (a posted job or a direct inquiry) using the 6-block A-F framework + Block G legitimacy tier. Produces a report in `reports/NNN-{slug}-{YYYY-MM-DD}.md` and a tracker entry in `batch/tracker-additions/`.

**Structure to follow:**
1. Frontmatter (description, argument-hint)
2. Purpose (1 paragraph)
3. When to use (3-5 trigger conditions)
4. Inputs (URL or pasted JD text, reads `modes/_profile.md`, `config/rates.yml`, `modes/blocks/lead-blocks.md`)
5. Output format (report file with header + 6 blocks + tracker TSV)
6. Workflow (10-15 steps: parse input, fetch full JD, score each block, compute weighted grade, write report, write tracker TSV, hand off)
7. Edge cases (missing profile, incomplete JD, duplicate lead, scam)
8. Examples (2-3: "strong Upwork lead", "weak Fiverr gig", "likely scam")
9. Anti-patterns (don't apply without score, don't skip Block G, don't inflate scores)

**Length:** 400-600 lines.

**Quality criteria:**
- Workflow is explicit and step-by-step
- Each block has a clear "how to score" instruction (not just "score 0-5")
- Output format matches the report header schema in `modes/blocks/lead-blocks.md`
- Examples are realistic (real platform, real rate, real scope)
- Anti-patterns include "score inflation" and "scope-blind enthusiasm"

**Commit:** `feat(modes): author lead.md (6-block A-F + G lead evaluation)`

### Task 5: Author modes/leads.md

**Files:**
- Create: `modes/leads.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/ofertas.md` for structure.

**Purpose:** Compare and rank multiple leads from `data/pipeline.md` (or pasted list). Produces a comparison table and a recommended action per lead.

**Structure to follow:**
1. Frontmatter
2. Purpose
3. When to use (when you have 2+ leads to triage)
4. Inputs (reads `data/pipeline.md` or accepts pasted list)
5. Output format (chat-only response with comparison table + recommended actions)
6. Workflow (read all leads, score each via `modes/lead.md` logic, rank, recommend top 3)
7. Edge cases
8. Examples
9. Anti-patterns (don't recommend without scoring, don't pad the top with weak leads)

**Length:** 200-350 lines.

**Quality criteria:**
- Comparison table is consistent across leads (same columns, same scoring)
- Recommendation is explicit (not "all are decent")
- Anti-patterns include "false balance" (treating a 2/5 lead as competitive with a 4.5/5)

**Commit:** `feat(modes): author leads.md (compare and rank multiple leads)`

### Task 6: Author modes/deep.md

**Files:**
- Create: `modes/deep.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/deep.md`.

**Purpose:** Deep client/company research. Given a client name, produce a research report: who they are, what they do, payment reputation, recent activity, red flags.

**Structure:** Same template. Key sections:
- Inputs (client name, Upwork profile URL, company domain)
- Output (research report with sections: Identity, Reputation, Financial Health, Recent Activity, Red Flags)
- Workflow (web search, Upwork public profile, LinkedIn, Glassdoor, etc.)
- Edge cases (private profile, no public info, name collision)

**Length:** 250-400 lines.

**Quality criteria:**
- Sources are cited (URLs)
- Red flags are specific (not vague "be careful")
- Output is actionable (recommend proceed / decline / ask for more info)

**Commit:** `feat(modes): author deep.md (client/company research)`

---

## Phase C: Collateral Generation Modes

### Task 7: Author modes/proposal.md

**Files:**
- Create: `modes/proposal.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/cover.md` and `https://raw.githubusercontent.com/santifer/career-ops/main/modes/cover.md` (cover letter generation, but adapt for proposals).

**Purpose:** Generate a tailored proposal for a specific lead. Reads the lead's report (from `modes/lead.md`), the user's profile (`modes/_profile.md`), and produces a PDF proposal via the HTML template.

**Structure to follow:**
1. Frontmatter
2. Purpose
3. When to use (after a lead scores 4.0+ and you decide to propose)
4. Inputs (lead report path, user profile)
5. Output format (proposal PDF in `output/proposals/NNN-{client}-proposal.pdf`)
6. Workflow (read lead report, identify 2-3 strongest proof points, draft proposal with structure: hook → relevant experience → plan → timeline → price → CTA, render to PDF)
7. Edge cases (no proof points match, profile is sparse, lead has unusual requirements)
8. Examples (2-3: AI consulting, web dev, design)
9. Anti-patterns (don't lie about experience, don't undercut the lead's stated budget, don't make promises you can't keep)

**Length:** 300-450 lines.

**Quality criteria:**
- Proposal structure is explicit and consistent
- Price handling is clear (fixed vs hourly, with rationale)
- Anti-patterns include "phantom experience" and "race-to-the-bottom pricing"

**Commit:** `feat(modes): author proposal.md (tailored proposal generation)`

### Task 8: Author modes/portfolio.md

**Files:**
- Create: `modes/portfolio.md` (replace stub)

**Reference:** No direct parent equivalent. Synthesize from `modes/proposal.md` + the design doc.

**Purpose:** Generate or update the user's rate card and portfolio pieces. Reads the user's profile and past engagements, produces:
- A rate card PDF (services + hourly rates + terms)
- 1+ portfolio case studies (each a PDF, structured: client → problem → approach → result → tech → time → rate)

**Structure:** Same template. Key sections:
- Inputs (user profile, past engagements from `data/clients.yml`, optional specific portfolio request)
- Output (rate card PDF + 1+ portfolio case study PDFs in `output/portfolio/`)
- Workflow (read profile, extract past engagements, draft rate card, draft 1+ case studies, render to PDF)
- Edge cases (no past engagements yet, portfolio request too specific, profile is thin)
- Examples (3: AI consultant with 5 past gigs, web dev with 10, designer with 3)
- Anti-patterns (don't fabricate results, don't include NDAs without permission, don't fudge the metrics)

**Length:** 250-400 lines.

**Quality criteria:**
- Rate card format is clear (services, rates, terms, payment methods, lead time)
- Case study structure is consistent
- Anti-patterns include "metric inflation" and "credit theft"

**Commit:** `feat(modes): author portfolio.md (rate card + case study generation)`

### Task 9: Author modes/pitch.md

**Files:**
- Create: `modes/pitch.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/apply.md` and adapt.

**Purpose:** Guide the user through submitting a proposal on a platform (Upwork, Toptal, direct). The AI drafts, the human reviews, the human clicks submit. The mode is interactive — it walks through the platform's form fields and helps fill them in.

**Structure:** Same template. Key sections:
- Inputs (lead slug, platform, optional form fields)
- Output (chat guidance, NOT an automated submit)
- Workflow (load lead context, identify platform-specific fields, draft each field, hand off to human for review)
- Edge cases (platform UI changes, two-factor auth, file uploads)
- Examples (3 platforms: Upwork, Toptal, Direct email)
- Anti-patterns (NEVER auto-submit, ALWAYS require human review)

**Length:** 200-350 lines.

**Quality criteria:**
- Explicit "human reviews before submit" at every step
- Platform-specific guidance is accurate (Upwork connects, proposal cover letter, milestones)
- Anti-patterns include "auto-submit" and "skip review on low-priority leads"

**Commit:** `feat(modes): author pitch.md (platform submission guidance)`

---

## Phase D: Communication Modes

### Task 10: Author modes/screening.md

**Files:**
- Create: `modes/screening.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/interview-prep.md` and adapt for freelance screening calls (much shorter than FTE interviews).

**Purpose:** Prep for a client screening call (15-30 min video/phone). Produces a 1-page cheat sheet: questions to ask, red flags to watch for, scope/rate/timeline topics to cover.

**Structure:** Same template. Key sections:
- Inputs (lead slug, optional call time)
- Output (1-page screening prep markdown, optionally printed)
- Workflow (load lead context, identify 5-10 questions, identify 3-5 red flags, draft rate/scope/timeline script)
- Edge cases (low-information lead, very short call, no prep time)
- Examples (3: scope-creep-prone client, budget-sensitive client, vague-scope client)
- Anti-patterns (don't rehearse scripted answers, don't ignore your own rate floor)

**Length:** 200-350 lines.

**Quality criteria:**
- Cheat sheet is genuinely 1 page (not a 20-page doc)
- Questions are specific to the lead (not generic)
- Red flags are concrete and observable
- Anti-patterns include "desperation" and "over-promising to win"

**Commit:** `feat(modes): author screening.md (client screening call prep)`

### Task 11: Author modes/nurture.md

**Files:**
- Create: `modes/nurture.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/followup.md` and adapt.

**Purpose:** Track and generate follow-up messages for leads in `data/leads.md` that are awaiting response. Produces a cadence of follow-up messages (e.g., day 3, day 7, day 14) and a tracker history.

**Structure:** Same template. Key sections:
- Inputs (lead slug, optional cadence override)
- Output (follow-up message draft, cadence schedule, tracker history entry in `data/follow-ups.md`)
- Workflow (load lead context, determine where in cadence, draft message appropriate to stage, save to history)
- Edge cases (client already responded, lead moved to terminal state, very long silence)
- Examples (3: gentle nudge, value-add follow-up, polite close-out)
- Anti-patterns (don't spam, don't ignore the cadence, don't escalate rudely)

**Length:** 250-400 lines.

**Quality criteria:**
- Cadence is explicit (day 3, 7, 14 — with reason)
- Each follow-up message has a purpose (not just "checking in")
- Terminal state handling is clear (when to move to Ghosted)

**Commit:** `feat(modes): author nurture.md (lead follow-up cadence)`

### Task 12: Author modes/outreach.md

**Files:**
- Create: `modes/outreach.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/contacto.md` and adapt for cold outreach to direct clients.

**Purpose:** Cold outreach to potential direct clients (not platform-mediated). Generates a personalized message that:
- Identifies a specific problem the client has
- Positions the user's relevant experience
- Offers a specific next step (call, audit, intro)

**Structure:** Same template. Key sections:
- Inputs (target company or person, optional hook/context)
- Output (outreach message, optional follow-up sequence, contact record in `data/clients.yml`)
- Workflow (research the target, identify a hook, draft personalized message, suggest follow-up cadence)
- Edge cases (no public info on target, no clear hook, target is competitor)
- Examples (3: agency → startup, consultant → mid-size company, dev → non-tech company with tech need)
- Anti-patterns (don't be generic, don't mass-send, don't lie about knowing them)

**Length:** 250-400 lines.

**Quality criteria:**
- Message has a specific hook (not "I love your work")
- Call-to-action is concrete
- Personalization is verifiable (AI cites the source of the personalization)

**Commit:** `feat(modes): author outreach.md (cold outreach to direct clients)`

---

## Phase E: Pipeline Modes

### Task 13: Author modes/pipeline.md

**Files:**
- Create: `modes/pipeline.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/pipeline.md`.

**Purpose:** Process pending URLs from `data/pipeline.md` (the inbox). For each URL, fetch the full JD, then run `modes/lead.md` evaluation. Produces N reports + tracker entries.

**Structure:** Same template. Key sections:
- Inputs (reads `data/pipeline.md`)
- Output (N reports + N tracker entries, one per URL; updates `data/pipeline.md` to mark processed)
- Workflow (read inbox, for each URL: fetch → run lead eval → write report → write tracker → mark processed)
- Edge cases (URL 404, rate-limited, paywalled, requires login)
- Examples (3: clean Upwork batch, mix of valid + dead links, batch with scam)
- Anti-patterns (don't process leads scoring below 3.0, don't skip Block G)

**Length:** 200-300 lines.

**Quality criteria:**
- Loop is explicit (handle N leads, not just one)
- Failure handling per-lead (one bad link doesn't stop the batch)
- Auto-discard threshold is clear (score < 3.0 = don't bother)

**Commit:** `feat(modes): author pipeline.md (batch process pending URLs)`

### Task 14: Author modes/scan.md

**Files:**
- Create: `modes/scan.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/scan.md` and adapt. The new scan.mjs will be built in Plan 3, so this mode is the "wrapper" that calls it.

**Purpose:** Scan Upwork for new leads matching the user's `config/platforms.yml` search config. Calls `scan.mjs` (zero-token), appends new leads to `data/pipeline.md`.

**Structure:** Same template. Key sections:
- Inputs (reads `config/platforms.yml`, optional `--max=N` flag)
- Output (new rows in `data/pipeline.md`, scan summary in chat)
- Workflow (call scan.mjs, dedup against `data/scan-history.tsv`, append new leads to pipeline, report count)
- Edge cases (API rate limit, auth failure, no new leads, all duplicates)
- Examples (3: clean scan, mixed new + dup, all duplicates)
- Anti-patterns (don't run scan continuously, don't ignore rate limits)

**Length:** 200-300 lines.

**Quality criteria:**
- Scan result is summarized (count of new, dup, errors)
- Dedup logic is explicit
- Failure modes are clear (what to do if API is down)

**Commit:** `feat(modes): author scan.md (Upwork scanning wrapper)`

### Task 15: Author modes/tracker.md

**Files:**
- Create: `modes/tracker.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/tracker.md`.

**Purpose:** View and update the lead tracker (`data/leads.md`). Provides a chat-driven interface to the tracker: filter, sort, update statuses, view details.

**Structure:** Same template. Key sections:
- Inputs (optional filter args: status, platform, score range)
- Output (chat summary of current state, optional updates to `data/leads.md`)
- Workflow (read tracker, apply filter, present summary, optionally update on user request)
- Edge cases (empty tracker, malformed row, concurrent updates)
- Examples (3: "show all Qualified leads", "show all leads above 4.0", "mark lead 5 as Proposed")
- Anti-patterns (don't update without user confirmation, don't show stale data)

**Length:** 200-300 lines.

**Quality criteria:**
- Filtering is explicit (which column, which operator)
- Update confirmation is required (AI proposes, human confirms)
- Read-only mode is the default

**Commit:** `feat(modes): author tracker.md (chat-driven tracker view)`

### Task 16: Author modes/auto-pipeline.md

**Files:**
- Create: `modes/auto-pipeline.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/auto-pipeline.md`.

**Purpose:** Auto-detect mode. When the user pastes a URL or text without specifying a mode, route it to the right mode (URL → scan or pipeline, text → lead eval, command → that mode). Show a menu if input is ambiguous.

**Structure:** Same template. Key sections:
- Inputs (anything: URL, text, command, no args)
- Output (dispatched to the right mode, or a menu if ambiguous)
- Workflow (detect input type, route to scan/pipeline/lead/command, fall back to menu)
- Edge cases (ambiguous input, multi-line text, both URL and text)
- Examples (3: "here's a URL" → scan, "this is a JD" → lead eval, no args → menu)
- Anti-patterns (don't auto-eval without checking, don't ignore context)

**Length:** 200-300 lines.

**Quality criteria:**
- Detection logic is explicit (URL pattern, text length, command prefix)
- Menu is shown for ambiguous input
- The mode delegates cleanly to other modes

**Commit:** `feat(modes): author auto-pipeline.md (auto-detect + dispatch)`

### Task 17: Author modes/patterns.md

**Files:**
- Create: `modes/patterns.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/patterns.md`.

**Purpose:** Analyze win/loss patterns across the tracker. Find common factors in leads that converted (Paid) vs. leads that didn't (Rejected, Ghosted, Withdrew). Output actionable insights.

**Structure:** Same template. Key sections:
- Inputs (reads `data/leads.md`, optional date range)
- Output (chat analysis: win patterns, loss patterns, recommendations)
- Workflow (load all leads, segment by outcome, find common attributes, output insights)
- Edge cases (insufficient data, no wins yet, no losses yet)
- Examples (3: "why am I losing Upwork leads", "what's different about my Paid leads", "platform comparison")
- Anti-patterns (don't over-fit to small samples, don't ignore confounding factors)

**Length:** 250-400 lines.

**Quality criteria:**
- Sample size is reported (n=X wins, n=Y losses)
- Patterns are testable (verifiable, not just observations)
- Recommendations are specific

**Commit:** `feat(modes): author patterns.md (win/loss pattern analysis)`

---

## Phase F: Meta Modes

### Task 18: Author modes/onboarding.md

**Files:**
- Create: `modes/onboarding.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/interview.md` and adapt.

**Purpose:** Interactive onboarding interview. Walks the user through filling out `modes/_profile.md`, `config/profile.yml`, `config/rates.yml`, `config/platforms.yml`. The first-run experience.

**Structure:** Same template. Key sections:
- Inputs (none on first run; subsequent runs: optional section to re-fill)
- Output (populated user files: `modes/_profile.md`, `config/profile.yml`, `config/rates.yml`, `config/platforms.yml`)
- Workflow (ask 1 question at a time, validate answer, write to file, move to next; cover all 10 fields from `_profile.template.md`)
- Edge cases (user wants to skip fields, user doesn't know an answer, partial completion)
- Examples (3: full first-time onboarding, re-run to update rate, skip niche details)
- Anti-patterns (don't ask all questions at once, don't require every field)

**Length:** 300-450 lines.

**Quality criteria:**
- Questions are 1-at-a-time (per brainstorming skill guidance)
- Each question has a "skip" option
- User can re-run for individual sections

**Commit:** `feat(modes): author onboarding.md (interactive profile interview)`

### Task 19: Author modes/training.md

**Files:**
- Create: `modes/training.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/training.md` and adapt.

**Purpose:** Evaluate a course/cert against the user's freelance goals. Given a course, decide: is it worth the time and money?

**Structure:** Same template. Key sections:
- Inputs (course name/URL, optional cost)
- Output (chat eval: recommend / not recommend / neutral, with rationale)
- Workflow (research the course, evaluate ROI against user's rate + niches, output recommendation)
- Edge cases (no public info, course is too new, free vs paid)
- Examples (3: "should I take this AWS cert", "is this $500 course worth it", "free YouTube course vs paid Udemy")
- Anti-patterns (don't recommend without ROI analysis, don't over-index on cert prestige)

**Length:** 200-300 lines.

**Quality criteria:**
- ROI calculation is explicit (course cost / hourly rate = hours of work to recoup)
- Recommendation is data-driven

**Commit:** `feat(modes): author training.md (course/cert ROI evaluation)`

### Task 20: Author modes/project.md

**Files:**
- Create: `modes/project.md` (replace stub)

**Reference:** Fetch `https://raw.githubusercontent.com/santifer/career-ops/main/modes/project.md` and adapt.

**Purpose:** Evaluate a portfolio project idea. Given a project concept, decide: is it worth building, and how does it serve the user's positioning?

**Structure:** Same template. Key sections:
- Inputs (project idea/description)
- Output (chat eval: build / skip / pivot, with positioning rationale)
- Workflow (evaluate against user's niches + target clients, assess build cost vs marketing ROI, output recommendation)
- Edge cases (project is too vague, project duplicates existing portfolio)
- Examples (3: "should I build a SaaS side project", "is this case study worth writing up", "should I open-source this tool")
- Anti-patterns (don't recommend building without a target audience, don't ignore opportunity cost)

**Length:** 200-300 lines.

**Quality criteria:**
- Project is evaluated against the user's positioning (not just "is it cool")
- Build cost is estimated (hours → dollar value)
- Recommendation is conditional (build IF X, skip IF Y)

**Commit:** `feat(modes): author project.md (portfolio project ROI evaluation)`

---

## Phase G: CLI Integration (connect authored content to slash commands)

### Task 21: Update 4 CLI SKILL.md files

**Files:**
- Modify: `.claude/skills/freelance-ops/SKILL.md`
- Modify: `.opencode/skills/freelance-ops/SKILL.md`
- Modify: `.gemini/skills/freelance-ops/SKILL.md`
- Modify: `.qwen/skills/freelance-ops/SKILL.md`
- Modify: `.agents/skills/freelance-ops/SKILL.md` (canonical)

**What to do:**
- Read each SKILL.md (Plan 1 Task 19 wrote stubs).
- Verify each one points at the right mode files (the 17 now-authored modes).
- Update the command lists in each to reference the actual mode content (description, argument-hint from frontmatter).
- For the canonical `.agents/skills/freelance-ops/SKILL.md`, also update the Onboarding section to reference the new `modes/onboarding.md`.

**Quality criteria:**
- All 18 commands listed in each SKILL.md are correct
- Descriptions match the mode frontmatter
- No references to FTE/old mode names

**Commit:** `feat(cli): update 4 CLI SKILL.md files to reference authored mode content`

### Task 22: Update 18 stub commands per CLI to be fully functional

**Files:**
- Modify: 18 stub commands in `.claude/commands/freelance-ops-*.md`
- Modify: 18 stub commands in `.opencode/commands/freelance-ops-*.md`
- Modify: 18 stub commands in `.gemini/commands/freelance-ops-*.toml`
- Modify: 18 stub commands in `.qwen/commands/freelance-ops-*.toml`

**What to do:**
- For each stub command, replace the STUB body with: "Read and execute `modes/<name>.md` with the user's argument." (Plus a 1-line description in frontmatter.)
- For the base `freelance-ops.md` / `.toml` (the menu), update to: "Show the freelance-ops menu or evaluate the lead at the URL/text given as the argument." (Plus a 1-line description.)
- The TOML files (Gemini, Qwen) use the `description` and `prompt` fields.

**Quality criteria:**
- Each command delegates to the right mode file
- Descriptions are accurate (1 line, from the mode's frontmatter)
- No STUB markers remain

**Commit:** `feat(cli): update 72 stub commands (18 × 4 CLIs) to delegate to authored modes`

### Task 23: Final smoke test

**Files:** (no new files; verification task)

**What to do:**
- Run the full test suite to confirm no regressions
- Verify all 17 mode files are no longer stubs
- Verify all CLI commands delegate correctly
- Tag v0.2.0-content

**Steps:**
1. `node --test tests/*.test.mjs` — all pass
2. `node test-all.mjs` — structural checks pass (no STUB markers)
3. `node doctor.mjs --json` — onboardingNeeded: false
4. `git grep -l 'STUB' modes/ .claude/commands/ .opencode/commands/ .gemini/commands/ .qwen/commands/` — 0 results
5. `git grep -l 'career-ops\|careerops' modes/ .claude/commands/ .opencode/commands/ .gemini/commands/ .qwen/commands/ CLAUDE.md AGENTS.md` — 0 results in mode/command files (CHANGELOG/CONTRIBUTORS allowed)

**Commit:** `chore: tag v0.2.0-content after Plan 2 smoke test`

---

## Spec Coverage (Plan 2)

| Spec section | Plan task |
|--------------|-----------|
| Workstream 2 (Mode re-authoring) | Tasks 4-20 (17 modes) |
| Workstream 3 (Lead evaluation framework) | Task 3 (lead-blocks.md) |
| Workstream 12 (Onboarding mode rewrite) | Task 18 (onboarding.md) |
| _shared.md refinement | Task 1 |
| _profile.template.md refinement | Task 2 |
| CLI integration of authored content | Tasks 21-22 |

## What This Plan Does NOT Deliver

- **Real Upwork provider (`providers/upwork.mjs`)** — Plan 3
- **Real proposal / rate card / portfolio PDF templates** — Plan 3 (modes/proposal.md and modes/portfolio.md tell the AI what to write; Plan 3 builds the actual template files)
- **Dashboard rewrite (Go TUI)** — Plan 4
- **Multi-language mode ports** — Plan 4
- **Plan 2 doesn't include `modes/batch.md`, `modes/update.md`** — these are utilities (parallel processing, self-update) that were in the parent but don't have direct freelance equivalents yet. They can be added in Plan 3 or 4.

## Self-Review

**Spec coverage:** All 17 mode files + onboarding + 6-block heuristics + CLI integration covered.

**Type consistency:** The mode content template is reused for all 17 modes. Block scoring references `modes/blocks/lead-blocks.md` consistently.

**Placeholder scan:** No TBDs/TODOs in the spec itself. The mode files will have specific content (no placeholders) when the implementer authors them.

**Gaps:** None in scope. Plan 3+ cover the remaining workstreams.
