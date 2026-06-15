# Screening Mode — Client Screening Call Prep

## Purpose

A screening call (15–30 min with a client or platform intermediary) is the freelance equivalent of a recruiter screen. The client is checking fit, budget, and availability. Most freelancers lose these calls by being unprepared — vague on rates, fuzzy on scope, or caught off-guard by qualification questions. This mode produces a 1-page cheat sheet from the evaluated lead report: the top 5–10 questions the client is likely to ask, 3–5 red flags to listen for, and a script for the scope/rate/timeline conversation. The output fits on one screen — read it in the 2 minutes before the call starts.

## When to Use

- The user has a screening call scheduled and provides the lead slug or call time
- The user says "I have a call with {client} in {time}, prep me"
- The user asks "what should I ask during the screening call for {lead-slug}?"
- Auto-suggest after `lead` evaluation if the user indicates interest in proceeding

Do NOT use this mode for full interview prep (use `interview-prep.md`) or for evaluating a lead (use `lead.md`). Screening prep is a lightweight pre-call read, not a research project.

## Inputs

- **From user:** Lead slug (e.g., `ai-chatbot-123`) or client name. Optional: call time (for countdown context).
- **From system (auto-read):**
  - `reports/{num}-{client-slug}-{date}.md` — the lead evaluation report (required). The report contains the A–F scoring, the lead URL, and the detected niche.
  - `modes/_profile.md` — user's niches, narrative, rate floor, negotiation scripts, deal-breakers
  - `config/profile.yml` — identity details, location, role targets
  - `config/rates.yml` — rate floor and target rates per niche (if `_profile.md` defers here)
  - `data/clients.yml` (if exists) — past engagement history with this client
  - `data/leads.md` — tracker entry for the lead (status, notes)

If the evaluation report does not exist (no lead evaluation was done first), recommend running `lead` mode first. Screening prep without a scored report is possible but the cheat sheet will be thinner.

## Output Format

Write a single markdown block to the chat — this is the 1-page cheat sheet. Do NOT save to a file (the user reads it immediately before the call). Use this structure:

```markdown
## Screening Prep: {Client Name}
**Lead:** {report link} | **Call:** {date/time or "TBD"}
**Rate target:** ${rate}/hr | **Floor:** ${rate_floor}/hr
--- Plan ---
**Open the call** → {one-sentence framing}
**Questions they'll ask** → {5-10 bullet Q&A, cite report lines}
**Red flags to catch** → {3-5 specific statements to listen for}
**Your script** → {scope/rate/timeline conversation in one paragraph}
**Close the call** → {next-step ask}
--- Quick Drill ---
**If they say "{common objection}"** → {your response}
**If they say "{another objection}"** → {your response}
```

- Keep it tight. The user reads this in 2 minutes before the call.
- The 5-10 questions come from the lead evaluation: JD requirements, gaps, and rate concerns that the report identified.
- Red flags are specific phrases the client might say that signal trouble (scope creep, rate pressure, timeline unreality).
- The script draft covers scope confirmation, rate anchoring, and timeline boundaries in one flowing paragraph.
- The Quick Drill section handles the 2–3 most likely objections based on the report's risk analysis.

## Workflow

### Step 1 — Load the lead report

Read the evaluation report from `reports/`. Extract:
- The URL / JD description
- The niche detected (for framing)
- Block A (Lead Summary) — scope, deliverables, timeline
- Block B (Profile Match) — gaps and strong matches
- Block C (Rate Strategy) — rate analysis, rate floor compliance, market data
- Block D (Client/Platform Research) — client reputation, hire rate, past projects
- Block F (Engagement & Risk) — term concerns, red flags, negotiation leverage points
- Block G (Legitimacy) — trust signals, scam flags
- The machine summary (rate, grade, score)

If multiple reports match the lead slug, pick the most recent.

### Step 2 — Draft the question list

Generate 5–10 questions the client is likely to ask during a 15–30 min screening call. Group them by the concern they're testing:

| Client concern | Likely question | How to answer (cite report) |
|----------------|-----------------|-----------------------------|
| **Can you do the work?** | "Have you built something like this before?" | Lead with the closest proof point from Block B match table |
| **Can we afford you?** | "What's your rate?" or "Is this within your budget?" | Anchor at the rate target from Block C. If the report flags a gap, prepare a scope-trade script |
| **When can you start?** | "What's your availability / timeline?" | State current bandwidth. If lead timeline is aggressive, flag it |
| **Why us?** | "Why are you interested in this project?" | Connect to niche and past similar work from report |
| **Decision process** | "How do you typically scope and execute?" | Brief walkthrough of your process. Cite relevant case studies from Block B |
| **Logistics** | "Are you available in this timezone?" | Confirm from profile.yml location/timezone |

For each question, write the answer in 1–2 sentences. **Cite the relevant line from the evaluation report** — don't reason from scratch. The report already did the hard work.

Mark questions with `[inferred from JD]` if they come from scope requirements rather than client-side signals (same convention as `interview-prep.md`).

### Step 3 — Identify red flags

Read the evaluation report's risk sections (Blocks D, F, G) and extract 3–5 specific statements the client might make that would be warning signs:

| If the client says... | It means... | Action |
|----------------------|-------------|--------|
| "Scope might grow but the budget is fixed" | Scope creep without comp | Pause and re-scope before proceeding. Refer to Block F callout |
| "We'd like a trial project first" | Unpaid eval period | Define the trial scope and rate upfront. If Block G flagged this as `caution`, escalate |
| "Can you start Monday?" | Urgency without preparation | Check timeline feasibility vs Block A scope. Flag if scope is inconsistent |
| "We've had bad luck with freelancers" | Client trust issue or unreasonable expectations | Ask specifically what went wrong. Block D client research may reveal patterns |
| "Our budget is flexible" | Usually means below market | Probe for the actual range. Anchor with Block C market data |

Format red flags as a quick-reference list. The user should be able to scan them in 10 seconds.

### Step 4 — Draft the scope/rate/timeline script

Write one tight paragraph that the user can say (or adapt naturally) during the call. It covers:

1. **Scope framing** — restate your understanding of the project in your words ("So if I understand correctly, you need X delivered by Y date...")
2. **Rate anchoring** — state your rate, not your floor. Frame it as value, not price ("For this scope, my engagement rate is $X/hr. That covers...").
3. **Timeline boundaries** — state what's realistic and what would change the timeline ("I can deliver the core scope in 3 weeks. If the research phase expands, that shifts the timeline.")

The script must be grounded in the report's actual numbers (rate target, rate floor, timeline from Block A, scope from Block A). Do not generate a generic rate script.

### Step 5 — Add the Quick Drill

The evaluation report identified risks in Blocks C, F, and G. Each risk implies a potential objection. Write 2–3 "If they say X → you say Y" pairs for the most likely objections:

| Objection | Trigger source | Response |
|-----------|---------------|----------|
| "Can you do it for $X?" (below floor) | Block C rate gap | "My rate for this type of work is $target. If the budget is fixed at $X, here's what I'd cut from scope to make it work: {specific scope adjustment from report}" |
| "We need it by {unrealistic date}" | Block A timeline + scope mismatch | "I can deliver {core scope} by that date. The full scope as described needs {N} weeks. Want to prioritize the must-haves?" |
| "We'll have more work after this" | Block D / F — future-scope carrot | "Great, let's nail this one first. If the scope expands, we can adjust. For now, let's lock the current deliverables." |

### Step 6 — Review and output

Before showing the cheat sheet to the user, verify:
- [ ] Every question cites a specific line or section from the evaluation report
- [ ] Rate anchor is at or above `rate_floor` from `config/rates.yml` or `modes/_profile.md`
- [ ] Red flags are phrased as patterns to detect, not accusations
- [ ] Script fits in one paragraph (4–6 sentences)
- [ ] Quick Drill covers the 2–3 most likely objections from the report

Then output the markdown block as shown in Output Format.

## Edge Cases

| Situation | Handling |
|-----------|----------|
| **No evaluation report exists** | Can't do full screening prep. Offer to run `lead` evaluation first, or generate a lighter cheat sheet from whatever the user provides (client name, role, rate context) |
| **Multiple leads for the same client** | Use the most recent evaluation report. If they're for different roles, ask which role the call is for |
| **Call is in < 5 minutes** | Skip the detailed question-by-question breakdown. Output just: questions (no answers), red flags, and the rate script — the 30-second emergency version |
| **Call time unknown** | Omit the call countdown. Still produce the full cheat sheet |
| **Client canceled / call is off** | Don't generate anything. Ask the user if they want to reschedule the prep or discard |
| **Lead report has Block G = `likely-scam`** | Strongly warn the user not to take the call. If they proceed anyway, prep a script focused entirely on verifying the client's legitimacy |
| **User hasn't set a rate target** | Flag this: "No rate target in profile. Recommend anchoring with 'I calibrate to market for this type of work — can you share your budget range?'" Then produce the rest of the sheet |
| **Client is a repeat client** | Read `data/clients.yml` for past engagement history. Reference the working relationship in the script ("Happy to work with you again. Based on our last project...") |

## Examples

### Example 1: Scope-creep client

**Context:** A mid-sized ecommerce company posted a lead for an AI chatbot MVP at $8k fixed price. The lead evaluation scored 3.8/5 (Grade C). Block A flagged vague deliverables ("integrate AI chatbot" — which one? which platform?). Block F flagged "scope might grow but budget is fixed." The user has a 20-min screening call.

```markdown
## Screening Prep: ShopFlow Inc.
**Lead:** reports/023-shopflow-2026-06-14.md | **Call:** Today 3pm ET
**Rate target:** Fixed $8k | **Floor:** $6k
--- Plan ---
**Open** → "I reviewed the chatbot scope and have a few clarifications to make sure I estimate accurately."
**Q1:** "Have you built ecommerce chatbots before?" → Yes, 3 similar projects. [profile.md:42] Most recent: product-recommendation bot for a D2C brand that handled 12k conversations/month.
**Q2:** "What platform / LLM do you recommend?" → I typically use Chat API or open-source depending on data privacy requirements. What's your data policy?
**Q3:** "Can you start in 2 weeks?" → Yes, available mid-July. [Report: Block A notes 3-week timeline in lead]
**Q4:** "Is $8k reasonable for this?" → For a well-scoped MVP with 3 conversation flows and 1 integration, yes. If scope expands beyond that, we re-estimate. [Block C rate analysis confirms $8k is competitive for AI chatbot MVP]
**Q5:** "What does your process look like?" → Discovery → wireframes → prototype (2 rounds feedback) → delivery with handoff. [Block E proposal skeleton]
**Red flags:**
- "Scope might grow but budget is fixed" → REQUEST WRITTEN SCOPE before starting. This is the #1 risk. [Block F]
- "We want to move fast" combined with "we don't have detailed requirements yet" → Speed without specs = churn. Push for a discovery phase.
- "Our last freelancer couldn't deliver" → Ask what went wrong. Could be a legit data point or a pattern of unreasonable expectations.
**Script:** "So if I understand correctly, you need a customer-facing chatbot for ShopFlow's product catalog, handling FAQs and purchase assistance — 3 core conversation flows, one Shopify integration, delivered in 3 weeks. For that scope, the engagement is $8k fixed. My process is: 3 days discovery to lock the conversation map, 1 week prototype, 1 week integration and testing. If the scope expands beyond 3 flows and 1 integration, we re-estimate — I don't do unlimited scope at a fixed price. That protects both of us."
**Close** → "I'll send a brief scope document after this call. If it matches your expectations, we can start next week."
--- Quick Drill ---
**If they say "the scope is pretty simple, should be less"** → "I priced it for the scope described. If there's less to it, let's narrow the scope doc and I'll adjust the quote."
**If they say "we might need ongoing maintenance too"** → "Great — let's scope that as a separate retainer once the MVP ships. For now, let's lock the build scope."
```

### Example 2: Budget-sensitive client

**Context:** A nonprofit posted a lead for a data dashboard ($5k budget). The evaluation scored 4.0/5 (Grade B). Strong profile match (Block B: 4.5) but Block C flagged the budget as 30% below the user's target rate ($75/hr target, $5k at ~$60/hr effective). Block D showed the client has no prior platform hire history. The user likes the mission and wants to take the call.

```markdown
## Screening Prep: GreenData Foundation
**Lead:** reports/024-greendata-2026-06-14.md | **Call:** Tomorrow 11am ET
**Rate target:** $75/hr | **Floor:** $60/hr (mission discount)
--- Plan ---
**Open** → "Thanks for the opportunity — I've worked with similar mission-driven orgs and understand the budget constraints."
**Q1:** "What's your experience with data dashboards?" → 3 dashboard projects in the last 2 years. [article-digest.md:18-22] Most relevant: environmental monitoring dashboard with real-time sensor data.
**Q2:** "Why are you interested in working with us?" → The climate-data mission aligns with past projects — I built a similar dashboard for Conservation International. [profile.md:55]
**Q3:** "The budget is $5k — does that work?" → "For the scope described, my standard rate is $75/hr. I understand your budget is $5k — I'm open to scoping to fit that. Here's what $5k gets you: {core features}. If we need {nice-to-have features}, that's a phase 2." [Explicitly name the scope trade. Don't just discount.]
**Q4:** "How long would it take?" → With the scoped-to-budget version, 2.5 weeks. Full scope as described in the lead would be 4 weeks / $7.5k.
**Q5:** "Have you worked with nonprofits before?" → Yes — ClearWater Initiative, Conservation International. [profile.md:50-60] Grant-funded timelines are something I'm familiar with.
**Red flags:**
- "This is a small project but could lead to more" → Always treat the current project as the only project. Scope and price it independently.
- "Our budget is soft, we can probably find more" → Means the $5k is aspirational. Ask for the actual approved number before scoping.
- "We need it done quickly for a grant report" → Timeline pressure from a hard deadline. Confirm the date before committing.
**Script:** "I understand GreenData needs a grant-impact dashboard showing 5 data sources with drill-down visualizations. The $5k budget covers a focused version: core metric views for 3 data sources with monthly refresh support. The 2 premium features in the lead — real-time API feed and PDF export — would be phase 2 at $2.5k. This protects your grant budget and gives you something working fast. My rate on this engagement is $75/hr, and I'll scope the work so the $5k covers a complete, shippable product."
**Close** → "I'll draft a scope document that fits the $5k budget. You can review and we'll align on priorities before I start."
--- Quick Drill ---
**If they say "$5k is all we have"** → "Understood. Then let's prioritize: which 3 of the 5 data sources matter most? I'll build for that scope."
**If they say "we think $5k is market rate for this"** → "For a single-developer dashboard without real-time data, that's fair. My typical rate is $75/hr. I'm offering a scoped version at $5k because I care about the mission — but the scope has to match the budget."
```

### Example 3: Vague-scope client

**Context:** A SaaS startup posted "Need help with AI — flexible budget, remote, 3 months, $15k-$30k." The lead evaluation scored 3.2/5 (Grade D). Block A scored low (2.5/5) because the scope was unclear ("AI help" — no specific deliverable). Block C couldn't rate properly because $15k-$30k for "AI help" is anywhere from high to low depending on what it actually is. Block D was neutral (new platform user, no hire history). The user is on the fence about taking the call.

```markdown
## Screening Prep: Nexus Startup
**Lead:** reports/025-nexus-2026-06-14.md | **Call:** Today 5pm ET
**Rate target:** Unknown (scope undefined) | **Floor:** $100/hr
--- Plan ---
**Open** → "I'm excited about AI work but I need to understand the specific problem before I can quote or timeline."
**Q1 [inferred from JD]:** "What kind of AI are you building?" → The lead says "AI help" — I need to narrow this. Options: RAG chatbot, agent automation, training pipeline, data extraction. Which one? [This is the most important question of the call.]
**Q2 [inferred from JD]:** "What problem are you solving?" → Every AI project starts with a business problem. What's the pain point? What have you tried? [If they can't answer this, the project isn't ready for a freelancer.]
**Q3:** "What's your timeline?" → Lead says 3 months. That's enough time for a meaningful engagement. But 3 months of "AI help" with no deliverable is 3 months of churn.
**Q4:** "Do you have the data?" → This is the #1 failure point for AI projects. Without data, the project is a research phase, not a build phase.
**Q5:** "What does success look like?" → Define the "done" condition. A working chatbot? A POC? A deployed model? Acceptance criteria?
**Red flags:**
- "We don't know exactly what we need" → Project is in discovery phase. Bill for discovery separately or scope it as a consulting engagement. Don't commit to a build without specs.
- "Budget is $15k-$30k, flexible" → The 2x range means they haven't budgeted seriously. Clarify what drives the ceiling.
- "We're moving fast on AI" → Startup urgency + vague scope = danger. Insist on a written scope before committing.
- "This is just the beginning of our AI journey" → Translation: the current project is undefined and they want a partner to figure it out with them. Charge consulting rates, not build rates.
**Script:** "Nexus, I'd love to help with your AI work. But 'AI help' is broad — I need to understand the specific problem. Could you describe: what's the business pain point? Do you have the data? What does success look like in 3 months? Once I understand that, I can give you a concrete scope and a fixed price or a T&M rate with a cap. My rate floor is $100/hr for technical AI work. If the engagement is more consulting/advisory (research, recommendations, vendor selection), we can discuss a different structure. Let's start with the problem and scope from there."
**Close** → "If the scope feels clear after this call, I can draft a proposal within 48 hours. If not, I'd recommend a 2-week paid discovery engagement to define the plan."
--- Quick Drill ---
**If they say "we were hoping you'd help us figure out what we need"** → "Perfect — that's a consulting engagement. I charge $150/hr for discovery work. We define the problem, the data requirements, and a build plan. That becomes the spec for the build phase."
**If they say "just give us a ballpark for 'AI work'"** → "Without specifics, a ballpark is misleading. For a known-scope RAG chatbot: $15k-$25k. For an open-ended AI consulting retainer: $10k/month. Let's narrow it on this call."
```

## Anti-Patterns

| Anti-pattern | What it looks like | How to avoid |
|-------------|-------------------|-------------|
| **No report, no prep** | Generating screening questions without reading the lead evaluation | The report is the source of truth for scope, rate, and risks. Always read it first |
| **Scripted-sounding answers** | Writing word-for-word dialogue the user won't say naturally | Use bullet prompts, not scripts. The "Script" section should be one framing paragraph the user internalizes, not recites |
| **Rate ambiguity** | "We can figure out the rate later" | Anchor the rate early. Write it in the cheat sheet. The screening call is the right time |
| **Ignoring Block G** | Prepping for a `likely-scam` client | If Block G says `likely-scam`, the prep warns not to take the call. Respect that |
| **Over-preparation** | Writing 10 questions with 3-sentence answers each for a 15-min call | 5–7 questions max. Tight answers. The user needs to scan in 2 minutes, not study for an exam |
| **Excessive detail** | Adding background research, company history, team bios | That's `interview-prep` content. Screening prep is fast and tactical |
| **Ignoring the floor** | Writing a script that accepts below the rate floor | Verify every script and drill answer is at or above `rate_floor`. If the user wants a discount, they must explicitly override |
| **Assume the client is rational** | Writing a script that expects the client to appreciate thorough scoping | Some clients want a quick yes. The script should serve the user's interests first, not assume good faith |