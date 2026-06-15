---
description: Evaluate a freelance lead (paste a URL or JD text)
argument-hint: "[URL or pasted text]"
---

# Lead Mode

## Purpose

This mode evaluates a single freelance lead (job posting, direct inquiry, or platform gig) using a 6-block A–F framework with a gating Block G legitimacy tier. Each block scores 0–5 according to criteria in `modes/blocks/lead-blocks.md`, and a weighted average produces the global score and letter grade. The mode produces a structured report in `reports/{num}-{client-slug}-{YYYY-MM-DD}.md` and a tracker TSV entry in `batch/tracker-additions/`. Block G (Legitimacy) is evaluated first — if the lead is flagged `likely-scam`, no further blocks are evaluated and no proposal is drafted.

## When to Use

- User pastes a job URL from Upwork, Toptal, Contra, Fiverr, Freelancer, or any freelance platform
- User pastes a job description as raw text (direct inquiry, email, message)
- User says "evaluate this lead" and provides context inline
- User asks "what do you think of this gig?" with a URL or description
- User asks "should I apply to this?" for a freelance opportunity

Do NOT use this mode for full-time employment evaluations (use `modes/oferta.md`) or for comparing multiple leads side by side (use `modes/leads.md`).

## Inputs

- **From user:** A URL to a freelance job posting, or a pasted job description / inquiry text.
- **From system (auto-read):**
  - `modes/blocks/lead-blocks.md` — 6-block scoring framework with criteria, red flags, and output formats
  - `modes/_profile.md` — user's niches, narrative, writing style, negotiation scripts
  - `modes/_shared.md` — scoring framework, grade boundaries, global rules, rate strategy, niche detection
  - `profile.md` — canonical CV / bio with skills, experience, projects, education, proof points
  - `article-digest.md` (if exists) — detailed case studies and portfolio metrics (overrides `profile.md` for metrics)
  - `config/rates.yml` — rate floor and target rates per niche
  - `config/profile.yml` — identity, location, role targets, salary range
  - `data/leads.md` — dedup against existing tracker entries
  - `data/clients.yml` (if exists) — past client engagement history
  - `data/scan-history.tsv` (if URL-based) — reposting detection

## Output Format

### Report file

Write to `reports/{num}-{client-slug}-{YYYY-MM-DD}.md` where `{num}` is the next sequential 3-digit zero-padded number (reserved via `node reserve-report-num.mjs`), `{client-slug}` is the client/company name in lowercase with hyphens, and `{YYYY-MM-DD}` is the current date.

```markdown
# {num} — {Client Name} — YYYY-MM-DD

**URL:** {source_url}
**Score:** {X.XX}/5
**Grade:** {A–F}
**Legitimacy:** {verified | caution | likely-scam}
**Rate:** ${target_rate}/hr (or ${fixed_price})
**Niche:** {detected niche}

---

## Block A — Lead Summary

{Scored paragraph + TL;DR + clarity table}

## Block B — Profile Match

{Requirement–proof-point mapping table + gaps + mitigation}

## Block C — Rate Strategy

{Market research + rate gap analysis + assessment}

## Block D — Client / Platform Research

{Signal table + risk assessment}

## Block E — Proposal Strategy

{Angle, top proof points, gap mitigation, proposal skeleton}

## Block F — Engagement & Risk

{Term table + red flags + risk assessment}

## Block G — Legitimacy

{Signal table + tier + context notes + recommendation}

---

## Machine Summary

```yaml
num: {num}
client: {client slug}
url: {source_url}
score: {X.XX}
grade: {A-F}
legitimacy: {tier}
rate: {string}
niche: {string}
blocks:
  A: {score}
  B: {score}
  C: {score}
  D: {score}
  E: {score}
  F: {score}
```

## Keywords Extracted

{list of 15–20 keywords from the lead for ATS / search optimization}
```

### Tracker entry

Write a single TSV line to `batch/tracker-additions/{num}-{client-slug}.tsv` with 9 tab-separated columns:

```
{num}	{YYYY-MM-DD}	{client}	{role}	{status}	{score}/5	{pdf_emoji}	[{num}](reports/{num}-{slug}-{date}.md)	{notes}
```

**Column order:** num, date, client, role, status, score, pdf, report, notes.
- `status`: `Evaluated` (or `SKIP` if Block G halted)
- `pdf`: `❌` (PDF generation is a separate step)
- `notes`: one-line summary including legitimacy tier

### Chat output

After writing the report and tracker entry, summarize to the user:

```markdown
## Lead Evaluation: {Client Name}

**Score:** {X.XX}/5 — Grade {Grade}
**Legitimacy:** {tier}
**Rate:** {rate assessment}

**Top strengths:**
- {strength 1}
- {strength 2}
- {strength 3}

**Top risks / concerns:**
- {concern 1}
- {concern 2}

**Next step:** {propose / negotiate up / skip / investigate further}
```

## Workflow

Follow these steps in order. Do not skip or reorder.

### Step 0 — Read system files

1. Read `modes/blocks/lead-blocks.md` — understand the 6-block framework, scoring criteria per block, red flags, and output formats
2. Read `modes/_shared.md` — scoring weights, grade boundaries, global rules, niche detection
3. Read `modes/_profile.md` — user's niches, narrative, writing style, rate preferences
4. Read `profile.md` and `article-digest.md` (if exists) — proof points, skills, experience
5. Read `config/rates.yml` — current rate floor and target rates
6. Read `config/profile.yml` — identity details, location, role targets

### Step 1 — Capture input

7. If user provided a URL: Use Playwright (`browser_navigate` + `browser_snapshot`) to fetch the full page. Extract title, description, budget/rate, client info, platform. Handle 429 (rate-limit) by suggesting the user paste text instead.
8. If user provided text: Use the text directly as the JD body. Note that liveness cannot be verified.
9. Extract key fields: role/scope, client name (or platform handle), platform, budget/rate, timeline, engagement type, decision-maker, success criteria.

### Step 2 — Dedup and liveness

10. Read `data/leads.md` — if this exact client + role already exists, do NOT create a new entry. Update the existing row's score + notes instead.
11. Read `data/clients.yml` (if exists) — flag if this client has a past engagement history and note the relationship quality.
12. Read `data/scan-history.tsv` — check if the same scope was reposted multiple times (reposting signal for Block G).
13. **Liveness gate (URL inputs only):** Classify the posting:
    - **Active:** title/role + real description or apply path visible
    - **Closed:** expired/"no longer accepting"/redirect to generic page/404
    - If closed, **stop**. Tell the user the link is dead. Do not evaluate further.
    - If text input (no URL), note liveness cannot be verified and proceed.

### Step 3 — Block G (Legitimacy gate)

14. Score Block G FIRST using the scam detection heuristics below and in `lead-blocks.md`. This is a gating check — it does NOT contribute to the 1–5 weighted score but determines whether evaluation continues.

    **Tiers:**
    - **verified** — No red flags detected. Proceed normally.
    - **caution** — 1–2 minor or ambiguous flags. Proceed with A–F but flag concerns in every relevant block.
    - **likely-scam** — Multiple high-confidence scam signals. STOP. No A–F. No proposal. Tracker: SKIP.

    **Scam archetypes to check (full details in lead-blocks.md):**

    | Archetype | Key signals |
    |-----------|-------------|
    | Advance-fee scam | Client asks for upfront "registration fee" / "verification deposit" to release the job |
    | Overpayment scam | Client "accidentally" overpays, asks to refund difference via wire / crypto |
    | Fake impersonation | Claims to be known company but uses free webmail or lookalike domain |
    | MLM / pyramid | Focus on "recruiting others," "residual income," vague product, commission-only |
    | Unpaid test task | Disproportionate "test" deliverable with no compensation |
    | Off-platform push | Wants to move off Upwork/Toptal to Wire / Western Union / crypto / gift cards |
    | Vague scope + high pay | "Earn $5k/week, no experience needed" — 1–2 sentence description |

    **Additional signals (increase probability when combined):**
    - Account created within 7 days with zero history
    - Pressure tactics: "Must start today," "Only hiring one person," "Offer expires soon"
    - Poor grammar combined with high pay promises
    - No interview process — hired instantly
    - Request for personal information (SSN, bank account, passport) before any contract
    - Company not found on Google, LinkedIn, or Glassdoor
    - Same scope reposted 3+ times in 90 days (check `data/scan-history.tsv`)
    - Client has zero hires despite being on platform for months
    - "Confidential project" as excuse to avoid sharing details

    **Ethical framing (MANDATORY):**
    - Present findings as observations, not accusations
    - Every signal can have a legitimate explanation — always note caveats
    - The user decides how to weight the evidence
    - Avoid definitive language like "this is a scam" — use "consistent with known scam patterns" or "multiple red flags detected"

    **Output format for Block G:**

    ```markdown
    ### Block G — Legitimacy

    **Tier:** {verified | caution | likely-scam}

    | Signal | Observed | Weight |
    |--------|----------|--------|
    | Advance-fee request | {Yes / No} | Critical |
    | Overpayment pattern | {Yes / No} | Critical |
    | Off-platform push | {Yes / No} | Critical |
    | Impersonation signals | {Yes / No} | High |
    | MLM/pyramid language | {Yes / No} | High |
    | Unpaid test task | {Yes / No} | High |
    | Vague scope + high pay | {Yes / No} | Medium |
    | Account age | {days or "N/A"} | Medium |
    | Company verifiable | {Yes / No / Partially} | Medium |
    | Interview process | {standard / rushed / none} | Medium |
    | Personal data requested | {Yes / No} | High |

    **Red flags detected:** {list}
    **Context notes:** {caveats and legitimate explanations}
    **Recommendation:** {Proceed / Proceed with caution / Do not engage}
    ```

    - **If `likely-scam`:** Hard stop. Do NOT proceed to Blocks A–F. Do NOT draft a proposal. Write tracker entry with status `SKIP` and scam reason. Tell the user.
    - **If `caution`:** Proceed with A–F but flag concerns in every relevant block.
    - **If `verified`:** Proceed normally.

### Step 4 — Score Blocks A–F

**How to score each block:** For each block, read its full scoring criteria from `modes/blocks/lead-blocks.md`, then produce the exact output format defined there. The summaries below are a quick reference — always consult the authoritative block file.

15. **Block A — Lead Summary** (weight 1.0×)

    Score scope clarity 0–5 using these anchors:
    - **5** — Crystal-clear: specific deliverables, timeline, budget/rate stated, engagement shape named, decision-maker identified, success criteria defined
    - **4** — Clear with 1–2 missing details (e.g. timeline implied but not explicit)
    - **3** — Moderate: scope area clear, deliverables fuzzy, budget range too wide
    - **2** — Vague: "I need an app" — no deliverables, budget, or timeline
    - **1** — Barely a lead: copied template, 2–3 sentences, window-shopping inquiry
    - **0** — Empty or incomprehensible. Do not proceed with other blocks. Log SKIP.

    Extract these fields into a TL;DR + key-value table + clarity assessment (`Clear | Adequate | Vague | Insufficient`):
    - Scope (named deliverables)
    - Timeline (stated or estimated)
    - Budget/Rate (stated range or "Not given")
    - Engagement shape (hourly / fixed / milestone / retainer / unclear)
    - Decision-maker (name if given, or "Unknown")
    - Success criteria (stated or "Not defined")

    **Red flags:** copied boilerplate, no budget/rate, unrealistic timeline, "rockstar"/"ninja" language, contradictory statements, scope creep boilerplate.

16. **Block B — Profile Match** (weight 2.0×)

    Score skills alignment 0–5:
    - **5** — Direct hit: every requirement maps to a concrete proof point with metrics
    - **4** — Strong: 80%+ requirements covered, 1–2 minor gaps with clear mitigation
    - **3** — Decent: core skills covered, 2–3 gaps needing active mitigation
    - **2** — Weak: some relevant skills but significant experience gaps
    - **1** — Poor: 1–2 transferable skills at most
    - **0** — No match. Do not propose.

    Map each JD requirement to a proof point from `profile.md` or `article-digest.md` in a table with columns: JD Requirement | User Proof Point | Source | Match (Direct / Adjacent / Gap). Include a Gaps & Mitigation section and Portfolio Coverage section.

    **Red flags:** tech stack mismatch, industry experience gap, seniority mismatch, "culture fit" as requirement, overlapping but not matching skills, outdated stack.

17. **Block C — Rate Strategy** (weight 1.5×)

    Score rate alignment 0–5:
    - **5** — Lead's rate at or above target rate (`config/rates.yml` target, not floor)
    - **4** — Above floor but below target — acceptable, limited negotiation room
    - **3** — At floor — acceptable but no room, scope must be well-defined
    - **2** — Below floor — need to negotiate up or walk
    - **1** — No rate stated, "open to offers," equity-only, "exposure"
    - **0** — Insulting rate ($5/hr for complex work) or explicitly expects free work

    Do WebSearch (Glassdoor, Toptal, Upwork rate insights) for market rates in this niche + geography. Output: Lead's rate, user's floor, user's target, market range, rate gap assessment. Include a WebSearch cite.

    **Red flags:** "exposure"/"portfolio opportunity", equity-only, unlimited work for fixed price, "prove yourself cheap", vague scope + fixed budget, commission/revenue-share.

18. **Block D — Client / Platform Research** (weight 1.0×)

    Score client quality 0–5:
    - **5** — Direct referral from trusted source, or platform client with verified payment, 90%+ hire rate, $100k+ spent, repeat-hire pattern, known company
    - **4** — Good signals: $50k+ spent, 80%+ hire rate, or direct lead from known company
    - **3** — Adequate: payment verified, some history, no negative marks, but sparse data
    - **2** — Concerning: no payment verification, high-risk country, hire rate below 50%
    - **1** — Multiple concerning: unverified payment, no hire history, new account, no reviews
    - **0** — Account created today, zero history. Or no company, no LinkedIn, no website.

    Extract platform signals into a table: Platform, Payment verified, Total spent, Hire rate, Repeat-hire pattern, Client country, Company web presence, Freelancer reviews, Direct referral.

    **Red flags:** brand new account, no payment verification, country mismatch, negative freelancer reviews, no web presence, "urgent" + no history, too many open jobs.

19. **Block E — Proposal Strategy** (weight 1.0×)

    Score angle quality 0–5:
    - **5** — Lead has enough detail for a surgical proposal. 3+ custom-fit proof points. Unique angle obvious.
    - **4** — Strong angle. 2 specific proof points map cleanly. Only 1 minor gap.
    - **3** — Decent angle — "similar work for comparable clients." Proof points adjacent.
    - **2** — Generic angle only — "I am a full-stack developer with experience in your tech stack."
    - **1** — No clear angle. Work is vaguely related. Proposal would be a stretch.
    - **0** — Nothing to work with. Do not propose.

    Output: 1-sentence Angle (hook), Top 3 proof points with exact wording, Differentiator (what sets you apart), Gap mitigation phrases, Proposal skeleton (opening → context → credibility → approach → closing).

    **Red flags:** "I can do anything" positioning, no differentiator, only technical fit (no business value), competing on price, proposed scope does not match lead scope.

20. **Block F — Engagement & Risk** (weight 1.5×)

    Score terms quality 0–5:
    - **5** — Ideal: escrow-protected milestones, clear IP (work-for-hire), reasonable NDA, kill fee, change-order process, platform contract
    - **4** — Good: milestone or net-15, standard IP, mutual NDA, 1 minor concern
    - **3** — Acceptable: 50% upfront + 50% delivery, or weekly hourly. Standard freelance risk.
    - **2** — Concerning: net-30+, no upfront, all IP assigned before full payment, off-platform request
    - **1** — Poor: "payment on completion" with long net terms, broad non-compete, no escrow
    - **0** — Unacceptable: full IP before payment, no written contract, "complete then we decide if we pay," asks for bank details/SSN/passport

    Output a term table: Payment structure, IP assignment, NDA, Kill fee, Change order process, Off-platform request, Written contract, Revision limit. Each with Finding and Risk Level (Low / Medium / High / Critical). List active red flags with severity.

    **Red flags:** off-platform payment push, full IP assignment before payment, no written contract, "start while we draft," non-compete, unlimited revisions, no kill fee for large engagements, upfront fee to client, request for personal documents, "we pay you when client pays us," exclusivity clause.

### Step 5 — Calculate score

21. Compute weighted average: `Σ(block_score × weight) / Σ(weight)` using the weights from `lead-blocks.md` (A: 1.0, B: 2.0, C: 1.5, D: 1.0, E: 1.0, F: 1.5). Map to letter grade using boundaries from `_shared.md`:
    - A: 4.5–5.0
    - B: 4.0–4.4
    - C: 3.5–3.9
    - D: 3.0–3.4
    - F: < 3.0

### Step 6 — Save outputs

22. Reserve report number: run `node reserve-report-num.mjs` to claim the next sequential number (stdout returns `{###}`).
23. Write the report file to `reports/{num}-{client-slug}-{YYYY-MM-DD}.md` with all block content, machine summary YAML, and extracted keywords.
24. Run `node reserve-report-num.mjs --release {num}` to release the sentinel.
25. Write tracker TSV entry to `batch/tracker-additions/{num}-{client-slug}.tsv`.
26. If score >= 4.0 AND Block G is `verified`, append a **Proposal Draft** to the report under `## Proposal Draft` (see Proposal Draft section below).
27. Present the result to the user in chat (score, grade, top strengths/risks, next step).

## Edge Cases

- **Missing profile (`profile.md` empty or placeholder):** Ask the user to run `modes/onboarding.md` first. Do not evaluate leads without a profile — the match cannot be scored.
- **Missing rate config:** Default rate_floor is $50/hr. Flag that no rate config was found and suggest running onboarding.
- **Incomplete JD:** Note what's missing (budget, timeline, scope). Score Block A honestly based on available signal. Flag uncertainty in the report intro.
- **Duplicate lead (client + role already in leads.md):** Do NOT create a new entry. Update the existing row's score and notes. Add a note about the re-evaluation date.
- **Block G = likely-scam:** Hard stop. Do NOT evaluate A–F. Do NOT draft a proposal. Write `SKIP` in tracker with reason. Report to the user.
- **Block G = caution with good A–F score:** A high score does NOT override Block G. Flag concerns in all blocks. The user decides.
- **Rate-limit on Upwork/Platform URL:** Suggest the user paste the text of the job description instead. Do not keep retrying.
- **Non-freelance post:** If the lead is clearly a full-time W-2 position (not freelance/contract), flag it and lower Block F (engagement risk — employment misclassification is a legal risk). Note that oferta.md is the correct mode.
- **Direct referral lead (no platform):** Apply 20–30% rate premium in Block C assessment. Note relationship premium in Block D.
- **Client is an agency / intermediary:** Flag in Block D. Note that the end-client is unknown. Adjust Block F for potential fee-skimming.
- **No budget stated:** Score Block C at 1 (no rate). Flag that the lead is likely early-stage or window-shopping.
- **Government / institutional lead:** Longer sales cycles are standard. Adjust Block F timeline expectations. Flag procurement process in Block D.
- **Lead is in a different language:** Detect language. If not English, generate evaluation in the lead's language. Flag language requirement in Block B.
- **Score below 4.0:** Explicitly recommend against proposing unless the user overrides. Below 3.5 is a strong "do not propose."

## Proposal Draft (auto-generated after Block G, if score >= 4.0 AND verified)

After saving the report and recording in the tracker, append a proposal draft to the report file under `## Proposal Draft`. This is a starting point — not the final proposal. The user completes it via `modes/proposal.md`.

### How to generate the draft

1. Read `profile.md` — select 4 achievement bullets most relevant to the lead's top requirements (exact wording, real metrics only)
2. Read `config/profile.yml` — extract name, current role, years of experience
3. Write a 1-sentence opening hook based on the lead scope and your specific differentiator
4. Write a 1-paragraph context statement showing you understand their problem
5. List the top 2 proof points with concrete metrics
6. Describe your approach in 2–3 sentences — not a full plan, a thinking demonstration
7. Close with a clear call to action (proposed next step: a 15-min call, a sample deliverable, etc.)
8. Detect and flag any gaps (domain mismatch, rate gap, timeline urgency) so the user sees them immediately

### Draft format to append to the report

```markdown
## Proposal Draft

> Draft generated at evaluation time. Complete via `modes/proposal.md` to fill in
> angles, confirm research, and generate the final proposal.
> Gaps flagged below — address them during the proposal flow.

---

**Opening**
{1-sentence hook — why you for this specific scope}

**Context**
{1–2 sentences showing you understand their problem, their industry, their pain point}

**Credibility**
- {proof point 1 from profile.md/article-digest.md, exact wording + metric}
- {proof point 2 from profile.md/article-digest.md, exact wording + metric}

**Approach**
{2–3 sentences — how you would tackle the scope. Demonstrate thinking, not a full plan.}

**Closing + next step**
{1 sentence with call to action e.g. "Happy to discuss in a 15-min call to align on scope."}

---

**Gaps flagged:**
{List any detected gaps — domain mismatch, rate gap, timeline urgency, missing portfolio items. If none, write "None detected."}

**Lead keywords to mirror:**
{8–10 exact phrases from the lead description}
```

Apply all writing style rules from `_shared.md` Professional Writing section. No em dashes, no buzzwords, active voice, concrete claims only.

## Examples

### Example 1: Strong Upwork lead

**Input:** Upwork URL for "AI Chatbot for Customer Support — 4-week engagement, $95/hr, Next.js + LangChain + RAG on Postgres. Client has $50k+ spent, 90% hire rate, verified payment."

**Profile state:** Niche = AI consulting / LLM app build, rate floor = $75/hr, target = $120/hr. Profile has 3 relevant proof points (RAG chatbot for Toptal client, LLM observability pipeline, agentic workflow case study).

**Expected evaluation:**
- **Block G:** verified — platform account is 2 years old, verified payment, 15 hires
- **Block A:** 5/5 — crystal-clear deliverables (AI chatbot with RAG), 4-week timeline, $95/hr budget, engagement shape (hourly), CTO is decision-maker
- **Block B:** 4/5 — strong match on all core skills (LangChain, RAG, Postgres). 1 minor gap: Next.js (user uses React, adjacent). Mitigation: "Same patterns, different framework."
- **Block C:** 4/5 — $95/hr above $75/hr floor, below $120/hr target. Room to negotiate to $110-120/hr based on market data ($100-160/hr for AI consulting).
- **Block D:** 4/5 — $50k+ spent, 90% hire rate, verified payment, US-based, repeat-hire pattern evident. Company has LinkedIn page with 200+ employees.
- **Block E:** 4/5 — Clear angle: "I built a RAG chatbot for a Toptal client that reduced ticket resolution time by 60%." Profile has 3 directly relevant proof points.
- **Block F:** 4/5 — Platform escrow, standard Upwork contract, hourly billing. NDA is mutual. No off-platform requests. Minor gap: no kill fee clause (but scope is only 4 weeks).

- **Weighted score:** (5×1.0 + 4×2.0 + 4×1.5 + 4×1.0 + 4×1.0 + 4×1.5) / (1.0+2.0+1.5+1.0+1.0+1.5) = 4.13/5 — **Grade B**
- **Report:** `reports/001-acme-corp-2026-06-15.md`
- **Tracker:** `001  2026-06-15  Acme Corp  AI Chatbot Developer  Evaluated  4.1/5  ❌  [001](reports/001-acme-corp-2026-06-15.md)  Good match, negotiate rate up`

### Example 2: Weak lead with rate mismatch

**Input:** Fiverr gig for "Full AI Platform with Chatbots, Dashboards, and Automation" — $500 fixed price. No timeline. Client is new to Fiverr, no payment history.

**Profile state:** Niche = AI consulting, rate floor = $75/hr, target = $120/hr.

**Expected evaluation:**
- **Block G:** caution — new account (created 3 days ago), zero hires, no payment verified. Scope is extremely broad for $500. Vague scope + ambitious promises is a medium signal.
- **Block A:** 2/5 — "Full AI Platform" with no specifics. No timeline. Budget is $500 for a platform that would typically cost $15k-50k. Decision-maker unknown. Clarity: Vague.
- **Block B:** 3/5 — Core AI/LLM skills match, but scope is unrealistic at this price. The user can build chatbots and dashboards but not a complete "AI platform" for $500.
- **Block C:** 0/5 — $500 fixed for "Full AI Platform" with chatbots, dashboards, and automation. At $75/hr floor, this is ~6.5 hours of work for months of scope. Insulting rate.
- **Block D:** 1/5 — New Fiverr account, no payment verified, no hire history, no reviews. Cannot verify company. High risk of time-wasting.
- **Block E:** 1/5 — No angle possible. The only "differentiator" would be working for an unsustainable rate. No proposal should be written.
- **Block F:** 2/5 — Fiverr platform provides basic protection, but $500 fixed for "unlimited scope" is a guaranteed loss. No contract beyond platform TOS.

- **Weighted score:** (2×1.0 + 3×2.0 + 0×1.5 + 1×1.0 + 1×1.0 + 2×1.5) / (1.0+2.0+1.5+1.0+1.0+1.5) = 1.71/5 — **Grade F**
- **Report:** `reports/002-unknown-client-2026-06-15.md` (only written if user insists)
- **Chat output:** "This lead pays ~$6.50/hr effective for the scope claimed. Strongly recommend skipping."

### Example 3: Likely scam

**Input:** Upwork job: "Build entire SaaS platform with AI features, payment processing, mobile app — $10,000, must complete in 2 weeks. Client wants to move to WhatsApp for communication and will pay via Wire transfer."

**Profile state:** rate floor = $75/hr.

**Expected evaluation:**
- **Block G:** likely-scam — multiple high-confidence signals detected:
  1. Off-platform push (WhatsApp + Wire transfer) — critical signal
  2. Unrealistic scope/timeline/pay ratio ($10k for full SaaS + AI + mobile in 2 weeks)
  3. Urgency pressure ("must complete in 2 weeks")
  4. Wire transfer is irreversible and untraceable — classic scam payout method
- **Hard stop.** Do NOT evaluate A–F. Do NOT draft proposal.
- **Tracker:** SKIP with reason "Likely scam — off-platform payment push (WhatsApp + Wire), unrealistic scope/timeline/pay ratio, urgency pressure."
- **Chat:** "This lead matches multiple known scam patterns (off-platform payment push, unrealistic scope/timeline/pay ratio, urgency pressure). I strongly recommend skipping it. No proposal drafted."

## Anti-Patterns

- **Score inflation:** Giving a 4+ because the lead "looks interesting" without checking profile match. Score each block independently. Let the math produce the global score.
- **Scope-blind enthusiasm:** Rating a lead highly after reading only the title. Read the entire description before scoring. Block A comes first for a reason.
- **Ignoring Block G:** Drafting a proposal or continuing evaluation after a `likely-scam` detection. Block G gates everything — respect it.
- **Rate avoidance:** Avoiding the rate conversation or inflating Block C score because the user "might accept less." Hard-block anything below `config/rates.yml` `rate_floor`. Flag the floor in the report.
- **Proposing without a profile:** Generating a proposal without reading `_profile.md` and `profile.md` first. The profile defines positioning. Never skip it.
- **Template cloning:** Writing the same proposal structure for every lead. Adapt every proposal to the specific scope, niche, and client signal.
- **Hardcoding proof points:** Writing metrics from memory instead of reading `profile.md` and `article-digest.md` at evaluation time. Always read the source files.
- **Downplaying Block D red flags:** Weak client research can waste weeks. Payment history and hire rate matter as much as technical fit.
- **Overlooking engagement risk (Block F):** A high match + good rate can still be a terrible engagement if the terms are one-sided. Score Block F honestly.
- **Re-evaluating a duplicate as new:** Always check `data/leads.md` first. Duplicate evaluations clutter the tracker and waste report numbers.
- **The 100% trap:** Spending too long perfecting one evaluation. 80/20 rule — ship 10 evaluations at 80% quality rather than 1 at 100%.

## Block G Dependency Map

```
Block G (Legitimacy)
  │
  ├─ likely-scam ──→ STOP. No A–F. No proposal. Tracker: SKIP.
  │
  ├─ caution ──→ Proceed A–F. Flag concerns per block.
  │               If score >= 4.0, generate proposal draft with caution flags.
  │
  └─ verified ──→ Proceed A–F normally.
                  If score >= 4.0, generate proposal draft.
```

## Length target: 400–600 lines. This file is part of the System Layer (auto-updatable).
