---
description: Compare and rank multiple freelance leads side by side
argument-hint: "[pasted list of leads or use pipeline inbox]"
---

# Leads Mode

## Purpose

Compare 2+ freelance leads side by side, score each using the 6-block framework from `modes/blocks/lead-blocks.md` (Blocks A–F with a Block G legitimacy gate), rank them, and recommend the top 3 with a clear action per lead. Unlike single-lead mode, this does not produce individual reports or tracker entries — it is a chat-only comparison that helps the user prioritise their proposal queue when they have multiple options.

## When to Use

- User has 2+ leads they cannot choose between
- User wants to prioritise their proposal queue (which to write first, which to skip)
- User says "which of these should I pursue" and provides multiple URLs or pasted JDs
- User says "compare these" and pastes a list from Upwork, Toptal, Contra, or direct inquiries
- User asks to evaluate everything currently in `data/pipeline.md`

Do NOT use this mode for a single lead (use `modes/lead.md`), or for full-time employment comparisons (use `modes/ofertas.md`).

## Inputs

- **From user:** A list of freelance leads — can be URLs, pasted job descriptions, or "use my pipeline" to read `data/pipeline.md`. Must contain at least 2 leads.
- **From system (auto-read per lead):**
  - `modes/blocks/lead-blocks.md` — 6-block scoring framework with criteria, red flags, and output formats per block
  - `modes/_shared.md` — scoring framework, grade boundaries, global rules
  - `modes/_profile.md` — user's niches, narrative, writing style, negotiation scripts
  - `profile.md` — canonical CV with skills, experience, projects, proof points
  - `article-digest.md` (if exists) — detailed case studies and portfolio metrics
  - `config/rates.yml` — rate floor and target rates per niche
  - `config/profile.yml` — identity, location, role targets
  - `data/pipeline.md` — if user says "use my pipeline"
  - `data/clients.yml` (if exists) — past client engagement history (for Block D per lead)
  - `data/scan-history.tsv` — reposting detection (for Block G per lead)

## Output Format

Chat-only. No files are written (no reports, no tracker TSVs). Output is a structured comparison table followed by per-lead recommendations.

### Comparison table

```markdown
## Lead Comparison

| # | Client | Scope | Platform | Rate | Score | Grade | Legitimacy | Rec |
|---|--------|-------|----------|------|-------|-------|------------|-----|
| 1 | Acme Corp | AI Chatbot (4wk) | Upwork | $95/hr | 4.1/5 | B | verified | Propose |
| 2 | Beta Ltd | Full SaaS rebuild | Direct | $50k fixed | 3.3/5 | D | caution | Skip |
| 3 | Gamma Inc | Data pipeline (8wk) | Toptal | $120/hr | 4.6/5 | A | verified | Propose now |
```

Columns: sequential number, client name, short scope description, platform/source, rate/budget, weighted score, letter grade, legitimacy tier, recommended action.

### Per-lead recommendation block

Below the table, one block per lead with a concise summary:

```markdown
### 1. {Client} — {Score}/5 ({Grade})

**Why:** {1-2 sentences — strongest signal or dealbreaker}
**Action:** {Propose now / Propose / Consider / Skip / Wait for better}
**Block G:** {verified / caution / likely-scam}
**Top risk:** {single biggest concern}
```

### Ranking summary

```markdown
### Top 3 Recommendations

1. **{Client}** ({Score}) — {reason}
2. **{Client}** ({Score}) — {reason}
3. **{Client}** ({Score}) — {reason}

{Optional: "None meet your bar — suggest waiting for better opportunities" if all < 4.0}
```

## Workflow

Follow these steps in order. Do not skip or reorder.

### Step 0 — Gather leads

1. If user provided "use my pipeline" or "read pipeline": read `data/pipeline.md` — collect all pending (unchecked) entries. If the pipeline is empty, tell the user and offer to run a scan.
2. If user provided a pasted list: parse each line as either a URL or a plain text lead. URLs will be checked for liveness; text leads cannot be liveness-verified.
3. Minimum 2 leads required. If only 1 lead is provided, exit this mode and redirect to `modes/lead.md` with a note that single-lead evaluations use the full report pipeline.
4. Maximum recommended: 10 leads. If the user provides more, suggest batch processing for the remainder.

### Step 1 — Read system files (once)

5. Read `modes/blocks/lead-blocks.md` — understand the 6-block framework, scam detection heuristics, scoring criteria per block.
6. Read `modes/_shared.md` — grade boundaries, block weights, ethical rules.
7. Read `modes/_profile.md` — user's niches and narrative.
8. Read `profile.md` and `article-digest.md` (if exists) — proof points and metrics.
9. Read `config/rates.yml` and `config/profile.yml` — rate floor, target rate, identity.

### Step 2 — Evaluate each lead (condensed A-G)

For each lead, run the scoring logic from `lead-blocks.md` in condensed form. Do NOT write individual reports or tracker entries.

**Per-lead evaluation sequence:**
10. **Liveness gate (URLs only):** Check if the posting is still active. Use Playwright (`browser_navigate` + `browser_snapshot`) to fetch the page. If closed/expired/404, mark as `Dead link — SKIP` and do not score further.
11. **Block G (Legitimacy):** Evaluate scam signals first. Use the heuristics in `lead-blocks.md` (advance-fee, off-platform push, impersonation, MLM, unpaid test task, overpayment, vague scope + high pay). Check `data/scan-history.tsv` for reposting. Produce a tier: `verified`, `caution`, or `likely-scam`.
    - If `likely-scam`: hard stop for this lead. Mark as `SKIP — likely scam` in the comparison table. Do not evaluate A-F.
    - If `caution` or `verified`: proceed.
12. **Block A (Lead Summary — weight 1.0x):** Score scope clarity 0-5 using the criteria in `lead-blocks.md`. Extract: scope, timeline, budget/rate, engagement shape, decision-maker, success criteria.
13. **Block B (Profile Match — weight 2.0x):** Score skills alignment 0-5. Map JD requirements to proof points from `profile.md` / `article-digest.md`. Note gaps and adjacent experience.
14. **Block C (Rate Strategy — weight 1.5x):** Score rate alignment 0-5. Compare lead's stated rate/budget against `config/rates.yml` floor and target. Do quick market research via WebSearch if available.
15. **Block D (Client/Platform Research — weight 1.0x):** Score client quality 0-5. Extract platform signals: payment verification, total spent, hire rate, repeat-hire pattern, country, web presence.
16. **Block E (Proposal Strategy — weight 1.0x):** Score angle quality 0-5. Identify the hook, top 2-3 proof points, unique differentiator.
17. **Block F (Engagement & Risk — weight 1.5x):** Score terms quality 0-5. Evaluate payment structure, IP assignment, NDA, kill fee, revision limits, off-platform requests.

18. **Calculate weighted score:** Apply the formula from `lead-blocks.md`:
    `(A×1.0 + B×2.0 + C×1.5 + D×1.0 + E×1.0 + F×1.5) / 8.0`
    Map to letter grade using boundaries from `_shared.md`:
    - A: 4.5-5.0
    - B: 4.0-4.4
    - C: 3.5-3.9
    - D: 3.0-3.4
    - F: < 3.0

### Step 3 — Rank and recommend

19. Sort leads by weighted score descending. If two leads have the same score, prioritise by Block B (profile match) score first, then Block G (verified > caution).
20. Generate the comparison table.
21. For each lead, generate the short recommendation block.
22. Generate the Top 3 summary.

### Step 4 — Present to user

23. Output the full comparison to chat.
24. If the top lead scores >= 4.0 AND Block G is `verified`, explicitly recommend proposing now.
25. If all leads score < 4.0, explicitly recommend waiting for better opportunities.
26. If any lead has `likely-scam` Block G, flag it with scam signals so the user can report or avoid.

## Edge Cases

- **Only 1 lead provided:** Exit leads mode. Redirect to `modes/lead.md` for a full single-lead evaluation with report and tracker entry.
- **All leads < 4.0:** Strongly recommend waiting. "None of these meet your quality bar. Consider running a new scan or refining your search terms."
- **All leads `likely-scam`:** Warn the user that their pipeline is contaminated. Recommend running a new scan and reviewing sources.
- **One strong lead, multiple weak ones:** Present the strong lead as the clear winner with "focus on this first." Note the weak leads as "skip unless you have bandwidth."
- **Leads across different platforms:** Include the platform column in the comparison table. Platform-specific risk (Upwork escrow vs direct referral vs Fiverr) is already captured in Block D and Block F scores.
- **Mixed input types (URLs + text):** For text leads, note that liveness and Block D signals cannot be fully verified. Mark `Legitimacy` as `unverified (text input)`.
- **Pipeline is empty:** Tell the user "your pipeline is empty. Want me to run a scan or paste a lead to evaluate?"
- **Rate-limit on platform URL:** Skip liveness check for that lead, note "could not verify liveness (rate-limited)" and proceed with text analysis of what is visible.
- **Duplicate leads (same client + role across multiple inputs):** Deduplicate before evaluating. Keep the latest version. Flag the duplicate in the notes.
- **Lead requires clarification to score:** Score Block A honestly at 2 or lower (vague). Note in the comparison what information is missing. Do not fabricate details.

## Examples

### Example 1: 3 leads, clear winner

**Input:** 3 Upwork URLs:
- Lead A: "AI Chatbot for customer support — 4wk, $95/hr, CTO is DM, client has $50k+ spent, 90% hire rate"
- Lead B: "Full SaaS rebuild — no budget stated, client is new to platform, scope is vague"
- Lead C: "Data pipeline in Python — 8wk, $130/hr, referral from former colleague, well-defined deliverables"

**Expected output:**

| # | Client | Scope | Platform | Rate | Score | Grade | Legitimacy | Rec |
|---|--------|-------|----------|------|-------|-------|------------|-----|
| 1 | Ref Client | Data pipeline (8wk) | Direct (referral) | $130/hr | 4.6/5 | A | verified | Propose now |
| 2 | Acme Corp | AI Chatbot (4wk) | Upwork | $95/hr | 4.1/5 | B | verified | Propose |
| 3 | New Startup | Full SaaS rebuild | Upwork | Not stated | 2.1/5 | F | caution | Skip |

**Top 3:**
1. **Ref Client** (4.6) — Referral premium + clear scope + above target rate
2. **Acme Corp** (4.1) — Strong match, good platform signals, room to negotiate up
3. **New Startup** (2.1) — Vague scope, no budget, new client — skip

### Example 2: 1 strong lead, 2 weak

**Input:** 3 leads from Toptal:
- Lead A: "Mobile app API — 6wk, $140/hr, well-scoped, client has 5 previous hires on Toptal"
- Lead B: "Fix a few CSS bugs" — $200 fixed, no timeline, no details
- Lead C: "Machine learning platform" — $15/hr, equity-only, client account created 2 days ago

**Expected output:**

| # | Client | Scope | Platform | Rate | Score | Grade | Legitimacy | Rec |
|---|--------|-------|----------|------|-------|-------|------------|-----|
| 1 | API Co | Mobile API (6wk) | Toptal | $140/hr | 4.5/5 | A | verified | Propose now |
| 2 | Bug Client | CSS fixes | Toptal | $200 fixed | 1.8/5 | F | caution | Skip |
| 3 | ML Startup | ML platform | Toptal | $15/hr + equity | 0.8/5 | F | likely-scam | Skip |

**Top 3:**
1. **API Co** (4.5) — Strong match, above target rate, well-scoped
2. **Bug Client** (1.8) — Below rate floor, scope too small to be worthwhile
3. **ML Startup** (0.8) — Multiple scam signals (below floor, equity-only, new account, no history)

### Example 3: All weak

**Input:** 3 leads all scoring below 4.0:
- Lead A: "WordPress site update" — $500 fixed, user is an AI/LLM specialist
- Lead B: "Ruby on Rails migration" — $60/hr, user has no Rails experience
- Lead C: "Data entry" — $10/hr, not a technical role

**Expected output:**

| # | Client | Scope | Platform | Rate | Score | Grade | Legitimacy | Rec |
|---|--------|-------|----------|------|-------|-------|------------|-----|
| 1 | WP Client | WordPress update | Upwork | $500 fixed | 2.8/5 | F | verified | Skip |
| 2 | Rails Co | Rails migration | Direct | $60/hr | 2.2/5 | F | verified | Skip |
| 3 | Data Entry | Data entry | Fiverr | $10/hr | 1.0/5 | F | caution | Skip |

**Top 3:** None meet your quality bar. Suggest waiting for better opportunities or refining search keywords to match your AI/LLM niche.

## Anti-Patterns

- **Score inflation in comparison mode:** Giving higher scores than in single-lead mode because you "have to pick one." Score each lead independently using the same criteria. The ranking follows from honest scoring.
- **Ignoring Block G in comparison:** A `likely-scam` lead must be flagged regardless of how high its other scores might be. One scam lead in a comparison does not justify skipping the gate.
- **Recommending a weak lead just to fill the Top 3:** Better to recommend only 1-2 strong leads than to pad the list. "Wait for better" is a valid recommendation.
- **Comparing across unrelated niches:** If leads span fundamentally different niches (e.g. AI consulting vs WordPress maintenance), note that the comparison is apples-to-oranges. Score by platform and rate risk instead.
- **Skipping system file reads:** Comparison mode still needs `profile.md`, `_profile.md`, `config/rates.yml`, and `lead-blocks.md`. The scoring framework is the same as single-lead mode. Never skip reading them.
- **Recommending based on rate alone without checking match:** A high-paying lead with a poor profile match (Block B) will still result in a failed proposal. Score all blocks.

## Block G Dependency Map (per lead)

```
For each lead:
  Block G (Legitimacy)
    ├─ likely-scam ──→ SKIP. Do not evaluate A-F. Mark in table.
    ├─ caution ──→ Proceed A-F. Flag concerns in recommendation block.
    └─ verified ──→ Proceed A-F normally.
```
