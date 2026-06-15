# Lead Evaluation Blocks (6 blocks + Block G)

**Last updated:** 2026-06-15

The freelance-ops lead evaluation uses 6 weighted blocks (A-F) plus a legitimacy
tier (Block G) that gates the rest. Each block scores 0-5; the global score is a
weighted average mapped to a letter grade. See `modes/_shared.md` for the parent
scoring framework and grade boundaries.

**Weight reference:**

| Block | Weight | Focus |
|-------|--------|-------|
| A — Lead Summary | 1.0× | Scope, deliverables, budget, timeline |
| B — Profile Match | 2.0× | Skills, proof points, portfolio alignment |
| C — Rate Strategy | 1.5× | Target rate vs market vs lead budget |
| D — Client/Platform Research | 1.0× | Payment history, hire rate, reputation |
| E — Proposal Strategy | 1.0× | Differentiators, angle, social proof |
| F — Engagement & Risk | 1.5× | Terms, red flags, payment structure |

**Weighted score = Σ(block_score × weight) / Σ(weight).** Maximum: 5.0.

---

## Report Header (mandatory)

Every evaluation report MUST start with this machine-readable header:

```yaml
**Legitimacy:** {verified|caution|likely-scam}
**Rate:** ${target_rate}/hr (or ${fixed_price})
**Score:** {X.X}/5
**URL:** {source_url}
```

All 4 fields required. `URL` may be "N/A" if the lead was pasted as text.

---

## Block A — Lead Summary

**Weight:** 1.0×
**Purpose:** Understand what the client actually wants before scoring anything
else. A vague or incomplete lead cannot be evaluated accurately — this block
establishes whether there is enough signal to proceed.

### Scoring Criteria

- **5** — Crystal-clear scope: specific deliverables, timeline (e.g. "3-month
  engagement, 2 milestones"), budget or rate range stated, engagement shape
  named (hourly / fixed-price / milestone / retainer), who the decision-maker
  is, and what success looks like. Example: "Build a Next.js MVP with Stripe
  integration over 8 weeks. Budget $15k-20k fixed. Single stakeholder (CTO)."
- **4** — Clear scope with 1-2 missing details. Most deliverables named,
  timeline implied but not explicit, or budget given as a rough range. Example:
  "AI chatbot for customer support. Prefer hourly, 3 months. Budget ~$10k."
- **3** — Moderate clarity: scope area is clear but deliverables are fuzzy.
  Budget mentioned but range too wide to be meaningful (e.g. "$5k-50k").
  Timeline loosely stated. Still workable but requires clarification.
- **2** — Vague: "I need an app" or "AI something." No deliverables, no
  budget, no timeline. You must ask basic questions before you can even assess
  fit.
- **1** — Barely a lead: copied from a template, placeholder text visible,
  2-3 sentences with no specifics. Likely a window-shopping inquiry.
- **0** — Empty or incomprehensible: no scope can be extracted. Do not
  proceed with other blocks. Log as SKIP.

### Red Flags

- **Copied boilerplate** (e.g. "We are looking for a talented developer to join
  our growing team") → Client did not write this, may not be serious
- **No budget or rate** after explicit request → Avoidant, may expect free work
- **Unrealistic timeline** (e.g. "Build a full SaaS in 2 weeks on $500") →
  Scope-blind, low-quality lead
- **"Rockstar" / "ninja" language** → Unprofessional client, likely hard to work
  with
- **Multiple contradictory statements** (e.g. "Entry-level task" + "10 years
  experience required") → Sloppy or cloned posting
- **Scope creep boilerplate** (e.g. "and other duties as assigned") →
  Expectation of unbounded work

### Output Format

Write a concise paragraph + key-value table:

```markdown
### Block A — Lead Summary

**TL;DR:** {1-sentence summary of what the client needs}

| Field | Value |
|-------|-------|
| Scope | {named deliverables} |
| Timeline | {stated or estimated} |
| Budget/Rate | {stated range or "Not given"} |
| Engagement shape | {hourly / fixed / milestone / retainer / unclear} |
| Decision-maker | {name if given, or "Unknown"} |
| Success criteria | {stated or "Not defined"} |
```

Followed by a clarity assessment: `Clear | Adequate | Vague | Insufficient`.

---

## Block B — Profile Match

**Weight:** 2.0×
**Purpose:** The core question — can you do the work? This is double-weighted
because it is the strongest predictor of delivery success and client
satisfaction. A low match score here is rarely compensated by high scores
elsewhere.

### Scoring Criteria

- **5** — Direct hit: every JD requirement maps to a concrete proof point in
  the user's profile. Client needs a RAG chatbot? User has shipped exactly
  that, mentioned with metrics. Tech stack is an exact subset of what the user
  works with daily. No skill gaps. Portfolio contains a case study in the same
  domain.
- **4** — Strong match: 80%+ of requirements have direct proof points. 1-2
  minor gaps (e.g. frontend framework they have not used) but adjacent
  experience covers it. Mitigation is straightforward: "Same pattern as X, just
  different framework."
- **3** — Decent match: core skill areas covered (e.g. can build the app), but
  specific tools or domain expertise missing. 2-3 gaps need active mitigation.
  The user can do the work but the proposal must address gaps head-on.
- **2** — Weak match: the user has some relevant skills but significant
  experience gaps. Client's core need is in a niche the user has not worked in.
  Would require learning on the client's dime.
- **1** — Poor match: 1-2 transferable skills at most. The user would be
  starting from near-zero in the key areas.
- **0** — No match: the user has none of the required skills. Do not propose.

### Red Flags

- **Tech stack mismatch** (user is Python/AI, client needs .NET/SharePoint) →
  Different career lane, do not force it
- **Industry experience gap** (first time in healthcare/fintech/defense) →
  Compliance and domain knowledge matter; flag explicitly
- **Seniority mismatch** (client asks for junior rate but staff-plus scope) →
  Either underpaid or unrealistic
- **"Culture fit" as a requirement** → Often a proxy for bias or vague hiring
- **Overlapping but not matching** (e.g. client wants MLOps, user has app dev
  + some Docker) → Adjacent but not the same; score honestly (2-3 range)
- **Outdated stack** (e.g. jQuery, Flash, AngularJS) → Client may be a
  maintenance trap

### Output Format

```markdown
### Block B — Profile Match

**Score:** {0-5}

| JD Requirement | User Proof Point | Source | Match |
|----------------|-----------------|--------|-------|
| {req 1} | {line from profile.md} | profile.md:N | Direct / Adjacent / Gap |
| {req 2} | {line from article-digest.md} | article-digest.md:N | Direct / Adjacent / Gap |
| ... | ... | ... | ... |

**Gaps & Mitigation:**
- {gap 1}: {hard blocker or nice-to-have?} → {mitigation plan}
- {gap 2}: {hard blocker or nice-to-have?} → {mitigation plan}

**Adjacent experience:** {list of relevant but not exact matches}

**Portfolio coverage:** {case studies that map to this lead}
```

---

## Block C — Rate Strategy

**Weight:** 1.5×
**Purpose:** Freelancers do not have a fixed salary — every engagement is a
pricing decision. This block ensures the user does not underprice their work,
accept a rate below their floor, or walk into a scope-vs-rate trap.

### Scoring Criteria

- **5** — Lead's stated rate/budget is at or above the user's target rate
  (`config/rates.yml` target, not just floor). Budget is appropriate for the
  scope. User can negotiate up from a position of strength. Example: user's
  target is $150/hr, lead offers $150-200/hr.
- **4** — Lead's rate is above the floor but below the target. Negotiation room
  is limited but acceptable. User can accept without regret. Example: target
  $150/hr, lead offers $120-140/hr — below target but above $100/hr floor.
- **3** — Rate is at the floor ($50/hr in current config). Acceptable but no
  room. Scope must be well-defined to avoid free work creep. Proposal should
  note the rate is at minimum.
- **2** — Rate is below the floor. User would need to negotiate up or walk.
  Only proceed if the user explicitly overrides with a reason (e.g. portfolio
  piece, strategic client, stepping stone).
- **1** — No rate stated after clear opportunity. "Open to offers" or "market
  rate" with no range. Equity-only, "exposure," or "deferred payment." Unlikely
  to lead to paid work.
- **0** — Rate is insulting (e.g. $5/hr for complex dev work), or lead
  explicitly expects free work. Do not propose.

### Red Flags

- **"Exposure" / "portfolio opportunity"** → Not a paying client. Only accept
  if user explicitly chooses pro-bono work for strategic reasons.
- **Equity-only** → 95% of equity offers from unknown companies are worthless.
  If equity is part of a mixed package, value it at $0 unless the company is
  verifiably funded and the terms are clear.
- **Rate below floor with no explanation** → The system hard-blocks this.
- **Unlimited work for fixed price** → Client wants a flat fee for all their
  work, as much as they need. Walk away.
- **"Do the first project cheap to prove yourself"** → Classic underpricing
  bait. The first project sets the rate precedent.
- **Vague scope + fixed budget** → The client will hold you to the scope they
  imagine, not the one written down. Risk of unpaid overwork.
- **Scope explosion pattern** (e.g. "simple changes" on day 1 → entire rewrite
  by week 2) → Hard to detect upfront but flag if reviews mention it
- **Commission / revenue-share as primary compensation** → Rarely pays out.
  Treat as $0 unless the product already has revenue.

### Output Format

```markdown
### Block C — Rate Strategy

**Score:** {0-5}

| Field | Value |
|-------|-------|
| Lead's stated rate/budget | {extract} |
| User's rate floor | {from config/rates.yml} |
| User's target rate | {from config/rates.yml} |
| Market range (researched) | {$low-$high}/hr for this niche |
| Rate gap | {above target / at target / below target / below floor} |

**Market research:** {WebSearch results — Glassdoor, Toptal, Upwork rate
insights for this niche + geography}

**Assessment:** {recommendation: propose / negotiate up / walk away}
```

---

## Block D — Client / Platform Research

**Weight:** 1.0×
**Purpose:** Can the client pay? Will they be a good client? For platform leads
(Upwork, Toptal, etc.), this block extracts everything the platform discloses.
For direct/referral leads, it weighs the relationship premium (20-30% over
platform rates).

### Scoring Criteria

- **5** — Direct referral from trusted source, or platform client with verified
  payment history, 90%+ hire rate, $100k+ total spent, repeat-hire pattern. No
  negative freelancer reviews. Company is well-known and actively funded.
- **4** — Platform client with good signals (verified payment, $50k+ spent,
  80%+ hire rate) but no repeat-hire evidence. Or direct lead from a known
  company with solid reputation. Minor flags (e.g. payment verified but country
  is high-risk) with mitigating context.
- **3** — Adequate signals: payment verified, some history, no negative marks.
  But sparse data — new to platform ($<10k spent) or limited reviews. Direct
  lead from an unknown company with no public profile. Neutral — proceed with
  standard caution.
- **2** — Concerning signals: no payment verification, country listed in
  high-risk zone, hire rate below 50%, or negative freelancer reviews about
  payment delays. Direct lead with no web presence / vanishingly small digital
  footprint.
- **1** — Multiple concerning signals: unverified payment, no hire history,
  new account (created this month), no reviews, vague company description.
  Likely a time waster.
- **0** — Account created today, zero history. Or direct lead with no company,
  no LinkedIn, no website, no references. Do not engage.

### Red Flags

- **Brand new platform account** (created within 7 days) → Scam or window
  shopper
- **No payment verification** on Upwork / Toptal / etc → Client has never paid
  a freelancer through the platform
- **Country mismatch** (client claims US company but account is from a different
  region) → Possible VPN / fake identity
- **Negative freelancer reviews** about late payment or scope creep → Trust
  broken
- **No web presence** (company has no website, no LinkedIn, no Glassdoor) →
  Could be a shell
- **Suspended account / re-registration** (client had a previous account that
  was flagged) → Hard to detect but worth searching
- **"Urgent" + no history** → Scam velocity pattern — post, collect, disappear
- **Too many open jobs** (client has 20+ active postings for the same role) →
  Aggregator or non-serious tester

### Output Format

```markdown
### Block D — Client / Platform Research

**Score:** {0-5}

| Signal | Finding | Weight |
|--------|---------|--------|
| Platform | {Upwork / Toptal / Direct / Referral} | — |
| Payment verified | {Yes / No / N/A} | Positive / Neutral / Concerning |
| Total spent | {amount or "New client"} | Positive / Neutral / Concerning |
| Hire rate | {% or "Unknown"} | Positive / Neutral / Concerning |
| Repeat-hire pattern | {Yes / No} | Positive / Neutral |
| Client country | {country} | Positive / Neutral / Concerning |
| Company web presence | {verified / minimal / none} | Positive / Neutral / Concerning |
| Freelancer reviews | {summary of reviews or "None available"} | Positive / Neutral / Concerning |
| Direct referral? | {Yes — from whom / No} | Premium: +20-30% rate |

**Assessment:** {Low risk / Moderate risk / High risk}
```

---

## Block E — Proposal Strategy

**Weight:** 1.0×
**Purpose:** How you win. A strong profile match means nothing with a generic
proposal. This block converts the analysis into a pitch — the angle,
differentiators, and social proof to lead with.

### Scoring Criteria

- **5** — The lead description contains enough detail to write a surgical
  proposal. The user has 3+ proof points that are nearly custom-fit for this
  exact scope. A unique angle is obvious (e.g. "I have already built this exact
  system for a competitor"). The user's portfolio has a directly relevant case
  study.
- **4** — Strong angle available. 2 specific proof points map cleanly. The
  scope is clear enough to draft a concrete approach paragraph. Only 1 minor
  gap to address.
- **3** — Decent angle — "I have done similar work for comparable clients."
  Proof points are adjacent but not exact. Proposal can be competent but not
  surprising. 1-2 gaps to mitigate.
- **2** — Generic angle only — "I am a full-stack developer with experience in
  your tech stack." No specific differentiator. Proof points are generic. Would
  sound like every other proposal.
- **1** — No clear angle. User has done vaguely related work. Proposal would
  be a stretch. Hard to write a compelling pitch without inventing.
- **0** — Nothing to work with. No relevant experience, no proof points, no
  angle. Do not propose.

### Red Flags

- **"I can do anything" positioning** → Sounds desperate, not competent
- **No differentiator identified** → The proposal will be generic and lost
- **Only technical fit, no business value** → Clients hire for outcomes, not
  tech stacks
- **Over-reliance on rate as differentiator** → Competing on price is a
  race to the bottom
- **Proposed scope does not match lead scope** (e.g. lead asks for a chatbot,
  proposal pitches a full platform) → Shows you did not read carefully

### Output Format

```markdown
### Block E — Proposal Strategy

**Score:** {0-5}

**Angle:** {1-sentence hook — why this user for this client}

**Top 3 proof points to lead with:**
1. {proof point from profile.md/article-digest.md} — maps to {JD requirement}
2. {proof point} — maps to {JD requirement}
3. {proof point} — maps to {JD requirement}

**Differentiator:** {what sets the user apart from other freelancers for this
specific lead}

**Gap mitigation:**
- {gap} → {phrase for the proposal}

**Proposal skeleton:**
1. Opening: {hook sentence}
2. Context: {1-2 sentences showing you understand their problem}
3. Credibility: {top 2 proof points, exact wording}
4. Approach: {how you would tackle the scope — not a full plan, a thinking
   demonstration}
5. Closing + next step: {call to action}
```

---

## Block F — Engagement & Risk

**Weight:** 1.5×
**Purpose:** Freelancers bear more risk than employees. Bad terms can make a
high-paying, well-matched lead toxic. This block evaluates the legal and
structural terms of the engagement.

### Scoring Criteria

- **5** — Ideal terms: escrow-protected milestone payments, clear IP assignment
  (work-for-hire with post-delivery transfer), reasonable NDA (no non-compete
  or non-solicit), kill fee clause, defined scope with change-order process.
  Client is happy to use the platform's standard contract.
- **4** — Good terms: milestone or net-15 payments, standard IP assignment, NDA
  is mutual and reasonable. 1 minor concern (e.g. no kill fee clause but scope
  is small).
- **3** — Acceptable terms: fixed-price with 50% upfront + 50% on delivery, or
  weekly hourly billing. NDA is one-sided but not egregious. No kill fee but
  scope is well-defined. Standard risk for freelance work.
- **2** — Concerning terms: net-30+ payment, no upfront, all IP assigned before
  full payment, broad NDA that restricts future work. Off-platform payment
  request. Vague scope with fixed price.
- **1** — Poor terms: "payment on completion" with long net terms, broad
  non-compete, all IP transfers upfront with no payment guarantee. Client
  refuses escrow. Significant scope undefined.
- **0** — Unacceptable: client demands full IP assignment before any payment,
  refuses written contract, demands work on spec ("complete then we decide if
  we pay"), or asks for bank details / SSN / passport copy upfront. Do not
  engage.

### Red Flags

- **Off-platform payment push** (Upwork/Toptal wants to move to Wire/WU) →
  Loses all platform protection
- **Full IP assignment before payment** → You hand over your leverage
- **No written contract** → Dispute resolution nightmare
- **"Start while we draft the contract"** → You work for free until they get
  around to it
- **Non-compete clause** in a freelance agreement → Unusual and restrictive
  for independents
- **Unlimited revisions** → Scope will expand infinitely at fixed price
- **Kill fee absent** for large engagements → Full loss if client cancels
- **Upfront fee to the client** (pay to apply, pay to bid) → Advance-fee scam
- **Request for personal documents** (SSN, passport, bank login) before
  contract → Identity theft or payment fraud setup
- **"We will pay you when the client pays us"** → You are the agency's
  bank; you bear the credit risk
- **Exclusivity clause** (cannot work for competitors during engagement) →
  Restricts your income for one client

### Output Format

```markdown
### Block F — Engagement & Risk

**Score:** {0-5}

| Term | Finding | Risk Level |
|------|---------|------------|
| Payment structure | {milestone / hourly / fixed / net-N / escrow} | Low / Medium / High |
| IP assignment | {work-for-hire / post-payment / upfront} | Low / Medium / High |
| NDA | {mutual / one-sided / none} | Low / Medium / High |
| Kill fee | {yes / no / N/A} | Low / High |
| Change order process | {defined / vague / none} | Low / Medium / High |
| Off-platform request | {none / requested} | Critical |
| Written contract | {yes / being drafted / no} | Low / High |
| Revision limit | {defined / unlimited / unspecified} | Low / Medium / High |

**Red flags detected:**
{list of active red flags with severity}

**Assessment:** {Low risk / Manageable risk / High risk / Do not engage}
```

---

## Block G — Legitimacy (TIER, not a score)

**Weight:** Gating — does not contribute to the 1-5 score.
**Purpose:** Assess whether the lead is a real, paying opportunity. A
`likely-scam` tier hard-stops all further processing — no proposal, no PDF, no
tracker entry (except a note to SKIP). This block is evaluated first, before
Blocks A-F.

### Tiers

- **verified** — No red flags detected. Proceed normally with A-F evaluation.
- **caution** — 1-2 minor or ambiguous flags. Proceed with A-F but flag the
  concerns in every block where they are relevant. Do not stop the process.
- **likely-scam** — Multiple high-confidence scam signals. STOP. Do not
  evaluate A-F. Do not draft a proposal. Log as SKIP with reason.

### Scam Detection Heuristics

Each pattern below is a known freelance scam archetype. Check for signals
before any evaluation.

**1. Advance-fee scam**
- Client asks for an upfront "registration fee," "verification deposit," or
  "insurance payment" to release the job or start work
- "Pay $50 to unlock the project" on a platform
- "We need a processing fee before we can issue your payment"
- Any request for the freelancer to send money to the client
- **Verdict:** High confidence scam. Mark `likely-scam`.

**2. Overpayment scam**
- Client "accidentally" overpays the first invoice (often by a large margin)
- Asks the freelancer to refund the difference via wire, PayPal, or crypto
- The original payment is typically from a stolen account and will be reversed
  by the bank weeks later — the freelancer is left holding the loss
- Often comes with urgency: "I need the refund today for payroll"
- **Verdict:** High confidence scam. Mark `likely-scam`.

**3. Fake client impersonation**
- Client claims to be from a well-known company but emails from
  `firstname.lastname@gmail.com` or a lookalike domain (e.g.
  `@googl-e.com` instead of `@google.com`)
- Cannot join a video call, always "traveling" or "in meetings"
- Company email is not verifiable via LinkedIn or the company directory
- Rushes the hiring process: hired within hours, no interview
- **Verdict:** High confidence if domain is fake or comms pressure is extreme.
  Mark `likely-scam`. If domain is legitimate but the person cannot be
  verified, mark `caution`.

**4. MLM / pyramid signals**
- Job description focuses on "building your own team," "recruiting others,"
  "residual income," or "passive earnings"
- Vague product description — "a revolutionary system" or "proprietary method"
- Commission structure is primary compensation, not a salary or flat fee
- "Uncapped earning potential" with no base
- Interview is a sales pitch for joining the MLM
- **Verdict:** High confidence. Mark `likely-scam`.

**5. "Test task" as unpaid labor**
- Client requests a substantial deliverable as a "test": build a full feature,
  write a comprehensive report, design an entire page
- Scope of the test task is disproportionate to a reasonable paid trial
  (e.g. "build our MVP backend as a test" vs "fix this CSS bug")
- Client has posted the same "test" multiple times — collecting free work
- No compensation offered for the test, or "exposure" as payment
- **Verdict:** Medium-High confidence. If the test is small (1-2 hours), mark
  `caution` with a note. If the test is a full deliverable, mark `likely-scam`.

**6. Off-platform payment push**
- Job is posted on Upwork / Toptal / Freelancer / Fiverr but client wants to
  move communication and payment off-platform immediately
- Payment method requested: Wire transfer, Western Union, MoneyGram, crypto
  (Bitcoin, USDT), gift cards, or PayPal Friends & Family
- "The platform takes too much fees" or "I had a bad experience with escrow"
- Losing platform protection means no dispute resolution, no payment protection,
  no escrow
- **Verdict:** High confidence scam if combined with any other flag (new
  account, no history, rush pressure). Mark `likely-scam`. If client has a
  long history on the platform and this is a one-off, mark `caution`.

**7. Vague scope + high pay mismatch**
- Job description: "Earn $5k/week, work from anywhere, no experience needed"
- Scope is described in 1-2 sentences with no specifics
- Pay is dramatically above market rate for the stated work
- "No interview required, start today"
- Grammatical errors, all-caps excitement, emoji-heavy descriptions
- **Verdict:** Medium confidence. Could be a scam or just an unserious client.
  Mark `caution` if no other flags. Mark `likely-scam` if combined with
  off-platform request or advance-fee.

### Additional Signals

These are not definitive on their own but increase scam probability when
combined:

- **Account created within 7 days** with zero history
- **Pressure tactics:** "Must start today" / "Only hiring one person" / "This
  offer expires soon"
- **Poor grammar / English** in the job description — not a flag alone, but
  suspicious when combined with "high pay"
- **No interview process** → hired instantly
- **Request for personal information** (SSN, bank account, passport photo,
  ID scan) before any contract
- **Company not found on Google** — no LinkedIn, no website, no news, no
  Glassdoor
- **Same scope reposted 3+ times in 90 days** (check `data/scan-history.tsv`)
  → Aggregator harvesting proposals, or scam re-spamming
- **Client has zero hires** despite being on the platform for months
- **"Confidential project"** as excuse to avoid sharing details or doing
  interviews

### Ethical Framing (MANDATORY)

- Present findings as observations, not accusations
- Every signal can have a legitimate explanation — note them
- The user decides how to weight the evidence
- Avoid definitive language like "this is a scam" — use "consistent with known
  scam patterns" or "multiple red flags detected"
- For `caution` leads, list both concerning signals and possible innocent
  explanations

### Output Format

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
| Account age | {days on platform or "N/A"} | Medium |
| Company verifiable | {Yes / No / Partially} | Medium |
| Interview process | {standard / rushed / none} | Medium |
| Personal data requested | {Yes / No} | High |

**Red flags detected:** {list of active flags}

**Context notes:** {any caveats — government job, niche role, recruiter-sourced,
evergreen posting, etc. — that explain potentially concerning signals}

**Recommendation:** {Proceed / Proceed with caution / Do not engage}
```

---

## Evaluation Order (IMPORTANT)

1. **Block G first** — Gate check. If `likely-scam`, stop. No A-F.
2. **Block A** — Scope clarity. Read entire lead.
3. **Block B** — Profile match. Read `profile.md`, `article-digest.md`.
4. **Block C** — Rate. Read `config/rates.yml`, do market research.
5. **Block D** — Client research. Do WebSearch, check platform signals.
6. **Block E** — Proposal strategy. Synthesize A-D into a pitch.
7. **Block F** — Risk. Evaluate terms.
8. **Calculate weighted score** — Apply block weights, produce letter grade.

## Reference

- Scoring framework and grade boundaries: `modes/_shared.md`
- Parent evaluation structure: `modes/oferta.md`
- Rate configuration: `config/rates.yml`
- User profile and niches: `modes/_profile.md`, `config/profile.yml`
- Proof points: `profile.md`, `article-digest.md`
