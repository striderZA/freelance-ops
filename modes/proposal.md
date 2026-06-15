---
description: Generate a tailored proposal for a qualified lead
argument-hint: "[slug from lead report or --new]"
---

# Proposal Mode

## Purpose

This mode generates a tailored, client-facing proposal after a lead has been evaluated and scored 4.0+ (Grade B or higher). It reads the lead evaluation report (from `modes/lead.md`), the user's profile (`_profile.md`, `profile.md`), and rate card (`config/rates.yml`), then assembles a structured proposal with hook, relevant experience, plan, timeline, price, and call to action. The output is a professional PDF saved to `output/proposals/{num}-{client}-proposal.pdf` via `generate-pdf.mjs`. The goal is not to write the proposal for the user — it is to produce a first draft that the user reviews, edits, and approves before sending.

## When to Use

- After `modes/lead.md` returns a score >= 4.0 AND Block G is `verified` or `caution` with user override
- User says "write me a proposal for {client}" or "draft a proposal for lead number {num}"
- User explicitly asks to create a proposal from an evaluated lead (slug mode: `/freelance-ops proposal {slug}`)
- User wants to repurpose a past proposal structure for a new but similar lead

Do NOT use this mode for:
- Full-time employment cover letters (use `modes/cover.md`)
- Cold outreach or pitches (use `modes/pitch.md` or `modes/outreach.md`)
- Proposals for leads with score < 4.0 (unless user explicitly overrides)
- Proposals for leads with Block G = `likely-scam` (hard block — never draft)

## Inputs

- **From user:** A lead slug (from the evaluation report) or `--new` for a fresh proposal from scratch.
- **From system (auto-read):**
  - `reports/{num}-{client-slug}-{YYYY-MM-DD}.md` — the lead evaluation report (Block A–E, Block G tier, proposal draft from evaluation)
  - `modes/_profile.md` — user's niches, narrative, writing style, negotiation scripts
  - `modes/_shared.md` — global rules, rate strategy, anti-patterns
  - `profile.md` — canonical CV / bio with proof points and metrics
  - `article-digest.md` (if exists) — detailed case studies (overrides `profile.md` for metrics)
  - `config/rates.yml` — rate floor and target rates per niche
  - `config/profile.yml` — identity details, location, role targets
  - `data/clients.yml` (if exists) — past client engagement history for rate benchmarks
  - `writing-samples/` (if `_profile.md` has no cached `## Writing Style`) — style calibration
- **For slug mode:** The report number and slug are extracted from the user argument.
- **For --new mode:** The user provides lead context inline (client name, scope, budget, timeline).

## Output Format

### Proposal PDF

Write to `output/proposals/{num}-{client-slug}-proposal.pdf`.

- `{num}` = the same sequential number from the evaluation report (or next available if --new)
- `{client-slug}` = client name in lowercase with hyphens
- PDF format: A4 (use `--format=a4` with `generate-pdf.mjs`)

### Proposal HTML (intermediate)

Write to `/tmp/proposal-{num}-{client-slug}.html` as the intermediate HTML that feeds `generate-pdf.mjs`. Delete after PDF generation.

### Proposal structure (content, inside the PDF)

All proposal content follows this structure:

```markdown
# Proposal for {Client Name}

## Hook
<1-2 sentences. "I've been following your work on X and...">

## Relevant Experience
<2-3 proof points from profile / story bank>
- Point 1: {metric} {context} {relevance to this lead}
- Point 2: {metric} {context} {relevance to this lead}
- Point 3 (optional): {metric} {context} {relevance}

## Plan
{Bullet list of milestones or deliverables, concrete and scoped}

## Timeline
{Estimated duration, proposed start date, checkpoints}
{Scope trade-offs if timeline is tight}

## Price
{Total price OR hourly rate with estimated hours}
{Payment terms: milestone-based preferred, 50/50 or 30/30/40}
{Rationale: why this price for this scope}

## Call to Action
{Next step: introductory call, audit, sample milestone, or discovery session}
```

### HTML template

The proposal HTML should be wrapped in a clean, readable layout. Use a single-file HTML with inline styles. Two options:
1. If `templates/proposal-template.html` exists, read it and inject proposal content into the `{{content}}` placeholder.
2. If no template exists, generate inline HTML with:
   - A `proposal-template.html` fallback that sets font-family sans-serif, 1.2 line-height, 12pt body, 18pt title.
   - Sections separated by 1px light borders.
   - Bullet points with proper `•` markers, no custom icons.
   - A footer with "Proposal prepared by {name} — {date}".

Run the intermediate HTML through `generate-pdf.mjs`:
```bash
node generate-pdf.mjs /tmp/proposal-{num}-{client-slug}.html output/proposals/{num}-{client-slug}-proposal.pdf --format=a4
```

### Chat output

After generating the proposal PDF, summarize for the user:

```markdown
## Proposal: {Client Name}

**Output:** `output/proposals/{num}-{client-slug}-proposal.pdf`
**Price:** {total or rate}
**Timeline:** {estimated duration}

**Top proof points used:**
1. {proof point 1}
2. {proof point 2}

**Next step:** {CTA from proposal}

> Review and edit before sending. Run `/freelance-ops proposal {slug}` again to regenerate.
```

## Workflow

Follow these steps in order. Do not skip or reorder.

### Step 0 — Resolve mode and read system files

1. Determine the operation mode:
   - **Slug mode:** User provided a slug (e.g. `001-acme-corp`). Parse the report number from the slug prefix. Locate the report file in `reports/` by matching the slug prefix.
   - **--new mode:** User wants a fresh proposal. Collect client name, scope, budget, timeline from the user. No report file needed.

2. Read `modes/_shared.md` — global rules, rate strategy, writing style calibration rules.
3. Read `modes/_profile.md` — user's niches, narrative, writing style (check for cached `## Writing Style`).
4. Read `profile.md` and `article-digest.md` (if exists) — proof points, metrics, case studies.
5. Read `config/rates.yml` — current rate floor and target rates. Confirm rate before drafting.
6. Read `config/profile.yml` — name, email, location for the proposal footer.
7. If no cached `## Writing Style` in `_profile.md`, scan `writing-samples/` for style calibration (following `_shared.md` rules).

### Step 1 — Load lead context

8. **Slug mode:** Read the evaluation report at `reports/{num}-{client-slug}-{YYYY-MM-DD}.md`. Extract:
   - Client name, role/scope description (from Block A)
   - Proposed rate from the evaluation (Block C assessment)
   - Top proof points mapped to requirements (Block B)
   - Proposal draft if one was generated at evaluation time (use as starting material)
   - Block G tier and any caution flags
   - Niche classification for framing
   - Any gap mitigation strategies noted (Block B gaps section)

9. **--new mode:** Ask the user for:
   - Client / company name
   - Role or scope description
   - Budget range or rate
   - Timeline
   - Any specific requirements or pain points they know about
   - Decision-maker name (if known)

### Step 2 — Style calibration (if not cached)

10. If `_profile.md` has a `## Writing Style` section, use it directly. Skip scanning.
11. If no cached style, scan `writing-samples/` following `_shared.md` rules. Write extracted style to `_profile.md`.
12. If no writing samples exist, note it once without pressure. Use the `_shared.md` Professional Writing defaults.

### Step 3 — Select proof points

13. From `profile.md` and `article-digest.md`, identify the 2-3 proof points most relevant to the lead's scope. Criteria:
    - Highest overlap with the lead's stated needs (requirements from Block A/B)
    - Strongest metrics (prefer quantified impact over description)
    - Most recent (prefer last 2 years)
    - Most relevant to the detected niche

14. For each proof point, extract:
    - The metric (exact wording from source)
    - The context (what was built, for whom, with what stack)
    - The relevance (why this matters for this specific lead)

15. If the evaluation report's Block B already has a match table, use it as the primary source — do not re-read profile.md unless more proof points are needed.

### Step 4 — Draft the proposal

16. Write the proposal following the structure defined in Output Format above.

**Hook:**
- 1-2 sentences maximum.
- Show you understand their problem before talking about yourself.
- Format: "{Observation about their situation}. {How your background aligns}."
- Do NOT start with "I am writing to propose..." or "I am excited to..."
- Example: "Your team needs an AI chatbot that actually understands your product docs — not a generic FAQ wrapper. I've built three RAG-based support systems in the last 18 months, and each one cut ticket response time by more than half."

**Relevant Experience:**
- 2-3 bullet points, each with: metric + context + relevance.
- Lead with the strongest, most directly relevant point first.
- Each bullet is 1-2 sentences maximum.
- Use exact metrics from profile.md or article-digest.md.
- Format: "• {Metric result} — {what was built} for {client/project type}. Directly relevant because {why it maps}."

**Plan:**
- 3-6 bullet milestones or deliverables.
- Concrete and scoped. No vague "collaborate closely with stakeholders."
- Each milestone should be independently deliverable and testable.
- Example: "Week 1: Data ingestion pipeline + vector index for {data source}. Deliverable: working RAG on 500 documents."
- If the plan is complex, include a brief architecture paragraph before the milestones.

**Timeline:**
- Total estimated duration. Proposed start date (use "ASAP" or "{date} based on availability").
- If the lead timeline is tight, explicitly state scope trade-offs: "Full scope in 6 weeks, or an MVP in 3 weeks with 2 core features."
- For hourly engagements: estimated total hours and weekly commitment.
- For fixed-price: milestone schedule with dates.

**Price:**
- State the price prominently. Be explicit about the pricing model.
- Fixed price preferred for well-defined scope: "Fixed price: ${amount}. 50% at kickoff, 50% at delivery."
- Hourly preferred for exploratory or evolving scope: "${rate}/hr, estimated {hours} hours. Invoiced weekly/monthly."
- If the lead stated a budget, explain how your price relates to it: "Your stated budget is ${lead budget}. My proposal comes in at ${proposal price} because {rationale — higher scope, additional service, etc.}"

**Call to Action:**
- One clear next step. Never leave it open-ended ("let me know what you think").
- Strong CTAs: "I'm available for a 15-minute discovery call this Thursday or Friday — let me know a time that works."
- If the lead requested specific deliverables (audit, sample, prototype), confirm scope and timeline for that deliverable.
- No pressure language ("before this offer expires", "I only have capacity for one client").

### Step 5 — Rate check

17. **MANDATORY:** Before finalizing the price section, confirm:
    - If hourly: rate >= `rate_floor` from `config/rates.yml`.
    - If fixed: effective hourly rate >= `rate_floor` (total price / estimated hours >= floor).
    - If the proposed rate is below `rate_floor`: HARD STOP. Ask the user to confirm the override. Do not generate the proposal without explicit confirmation.

18. If the rate is acceptable, log the rate in the proposal header. If the rate is above target, note it as a win.

### Step 6 — Assemble HTML and generate PDF

19. Build the HTML document:
    - Check if `templates/proposal-template.html` exists. If yes, read it, inject content into `{{content}}`, `{{client_name}}`, `{{date}}`, `{{author_name}}` placeholders.
    - If no template exists, build inline HTML with:
      ```html
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12pt; line-height: 1.5; color: #222; max-width: 700px; margin: 0 auto; padding: 40px; }
        h1 { font-size: 22pt; margin-bottom: 4pt; }
        h2 { font-size: 14pt; margin-top: 24pt; margin-bottom: 8pt; border-bottom: 1px solid #ddd; padding-bottom: 4pt; }
        ul { padding-left: 20px; }
        li { margin-bottom: 6pt; }
        .footer { margin-top: 40px; font-size: 9pt; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
      </style></head><body>
      {{content}}
      <div class="footer">Proposal prepared by {{author_name}} — {{date}}</div>
      </body></html>
      ```
    - Apply `_shared.md` writing style rules: no em dashes, no buzzwords, active voice, short sentences.

20. Save the HTML to `/tmp/proposal-{num}-{client-slug}.html`.

21. Run PDF generation:
    ```bash
    node generate-pdf.mjs /tmp/proposal-{num}-{client-slug}.html output/proposals/{num}-{client-slug}-proposal.pdf --format=a4
    ```

22. Verify the PDF was created. Check the output from `generate-pdf.mjs` for page count and size.

23. Delete the intermediate HTML file.

### Step 7 — Present to user

24. Show the output summary in chat (see Chat output format above).

25. **DO NOT** send the proposal. The user must review, edit, and approve. Say: "Your proposal draft is ready. Review the PDF at `output/proposals/{num}-{client-slug}-proposal.pdf` and let me know if you want changes."

26. If the user requests edits, update the HTML and regenerate. Keep iterating until the user approves.

27. After user approval, optionally record the proposal in `data/leads.md` (update status to `Proposed` for this lead).

## Edge Cases

- **No lead report found (slug mode):** If the slug does not match any file in `reports/`, list the available reports and ask the user to pick one. Do not guess.
- **Missing profile:** If `profile.md` is absent or empty, stop and ask the user to complete onboarding first. Cannot generate a credible proposal without proof points.
- **Missing rates config:** Default rate_floor is $50/hr. Flag the missing config and recommend running onboarding. The user can override the rate verbally.
- **Score < 4.0 but user insists:** Generate the proposal but include a prominent warning at the top: "⚠️ This lead scored {score}/5 — below the recommended threshold. Proceed with caution."
- **Block G = caution:** Include a note in the proposal's hook section: "Note: I've reviewed the opportunity and noted [specific concern]. My proposal assumes [mitigation]." Do not hide the concern.
- **Block G = likely-scam:** HARD BLOCK. Do not generate any proposal text. Tell the user: "This lead was flagged as potentially fraudulent. I cannot draft a proposal."
- **Very short timeline required:** If the lead's timeline is compressed, include a "phased approach" option in the Plan section. Offer an MVP-first strategy: "Core functionality in {short timeline}, then iterate."
- **No budget stated by lead:** Propose based on the user's target rate and explain the rationale. Flag that this is a proposed price, not negotiated. Use a range: "${X}-${Y} depending on final scope."
- **Lead is a referral (not platform):** Apply 20-30% rate premium per `_shared.md` guidance. Note the relationship premium in the price rationale.
- **Direct client vs agency:** If the lead is an agency/intermediary, price transparently: "Your standard markup is understood. My rate is ${rate}, which we can include in your billing structure."
- **Incomplete lead context (--new mode):** Ask clarifying questions before drafting. Do not fill gaps with assumptions. Minimum required: client name, scope, budget/rate, timeline.
- **Proposal is too long:** Keep it to one page if possible. Two pages maximum for complex scopes. If the draft exceeds 2 pages, trim the Plan section — move details to an appendix.
- **Language mismatch:** If the lead is in a non-English language, draft the proposal in that language (apply the same writing style). Detect the lead language from the report or user input.

## Examples

### Example 1: AI consultation proposal

**Lead context:** SaaS startup needs an AI strategy consultation: "Help us figure out where to apply AI in our product roadmap. We have 50k users, a dev team of 8, and no ML experience on staff. Budget: $15k-25k for a 4-week engagement."

**Profile state:** Niche = AI consulting / advisory. Rate floor = $150/hr, target = $200/hr. Profile has 2 relevant case studies (Toptal AI strategy engagement, fractional AI lead for Series A startup).

**Proposal generated:**

```markdown
# Proposal for [Startup Name]

## Hook
You've built a product with 50k users and a strong dev team — now you need to figure out
where AI adds real value, not just buzzword features. I help teams without ML backgrounds
identify, prioritize, and start building AI features in weeks, not quarters.

## Relevant Experience
- **AI strategy for Toptal client ($200k ARR product):** Audited the product surface,
  identified 7 high-impact AI insertion points, and built a prioritized roadmap. The client
  shipped their first AI feature in 3 weeks and saw a 22% increase in user retention within
  2 months. Directly relevant because your team size and AI maturity level are comparable.
- **Fractional AI lead, Series A startup:** Joined a 10-person engineering team with zero ML
  experience as their first AI hire. Set up the evaluation framework, selected models
  (GPT-4 + Claude), and shipped a customer-facing AI feature in 6 weeks. The engagement
  grew to 6 months as the team built internal AI capability — relevance because I don't
  just advise, I enable your team to continue without me.

## Plan
1. Discovery sprint (1 week): Interview stakeholders, audit current product surface, map
   user pain points where AI could help.
2. Opportunity assessment (1 week): For each candidate feature, estimate effort vs impact.
   Deliverable: prioritized opportunity matrix.
3. Technical spike (1 week): Build a working prototype of the #1 opportunity. Validate
   with real data. Make build-vs-buy recommendation.
4. Roadmap and playbook (1 week): Written AI roadmap with milestones for the next 3-6
   months. Hiring guide if you decide to bring AI capability in-house.

## Timeline
4 weeks total. Available to start within 2 weeks.
Milestone checkpoints: end of each week with a deliverable.
Light-touch async communication between milestones (Slack + Loom).

## Price
Fixed price: $18,000. Within your stated budget.
Payment: 50% at kickoff ($9,000), 25% at prototype milestone ($4,500),
25% at delivery ($4,500).
Rationale: $18k / 4 weeks = $180/hr effective — aligned with market rates for
fractional AI consulting ($150-250/hr).

## Call to Action
I'm available for a 20-minute discovery call this week to discuss your product and surface
the highest-impact opportunities. Send me a time that works.
```

### Example 2: Web development proposal

**Lead context:** "Need a landing page + booking system for my boutique hotel. Next.js frontend, Sanity CMS, Stripe for payments. Timeline: 5 weeks. Budget: $8k-12k."

**Profile state:** Niche = Web app development. Rate floor = $80/hr, target = $120/hr. Profile has relevant Next.js case studies.

**Proposal generated:**

```markdown
# Proposal for [Hotel Name]

## Hook
Your hotel needs a booking experience that matches the quality of your rooms — not
a generic calendar widget. I've built CMS-driven booking systems for boutique properties
that handle availability, deposits, and seasonal pricing without the bloat of a full PMS.

## Relevant Experience
- **Next.js + Sanity booking system for a 12-room boutique hotel:** Built a custom booking
  flow with real-time availability, Stripe deposits (50% at booking), and automated
  confirmation emails. The client saw a 34% increase in direct bookings within 3 months
  by reducing the booking flow from 5 steps to 3. Directly relevant because the scope
  (Next.js, Sanity, Stripe, boutique hotel) is nearly identical.
- **CMS migration project (headless Sanity):** Migrated a legacy WordPress site to
  Sanity headless CMS for a hospitality client. The non-technical team manages content
  independently now — no developer needed to publish a room update or seasonal promotion.

## Plan
1. Design + content architecture (week 1): Wireframe key pages (home, rooms, booking
   flow). Set up Sanity content models for rooms, rates, availability, promotions.
2. Frontend build (weeks 2-3): Next.js pages with static generation for SEO. Responsive
   design, optimized images, fast loading.
3. Booking engine (weeks 3-4): Stripe payment integration, real-time availability
   calendar, deposit handling, email confirmations (via Resend/SendGrid).
4. CMS handoff + launch (week 5): Sanity training for your staff, content population,
   DNS setup, launch.

## Timeline
5 weeks total. Start: within 1 week.
Checkpoints: design review (week 1), booking flow demo (week 3), soft launch (week 4),
full launch (week 5).

## Price
Fixed price: $10,500. Within your stated budget.
Payment: 40% at kickoff ($4,200), 30% at booking demo ($3,150), 30% at launch ($3,150).
Rationale: Based on 6 previous hospitality projects. Scope like this averages 80-100 hours
at $105/hr effective — within market range for Next.js + CMS projects.

## Call to Action
Let's schedule a 30-minute scope call this week. I'll review your current site and booking
flow, and we can refine the milestones together.
```

### Example 3: Design proposal (hourly engagement)

**Lead context:** "We're redesigning our SaaS dashboard. It's complex — 15+ screens, data visualization components, dark mode. We have a design lead but need a senior UI developer who can implement in React + Tailwind. Scope is loosely defined — expect 2-4 months of work. Budget: $60-80k total."

**Profile state:** Niche = Web app development / UI engineering. Rate floor = $80/hr, target = $120/hr. Profile has design system and data viz experience.

**Proposal generated:**

```markdown
# Proposal for [SaaS Company]

## Hook
You need a senior hand who speaks both design and code — someone who can take Figma
screens and ship polished, accessible, responsive UI without hand-holding. I've built
data-dense dashboards for fintech and analytics products where every pixel matters.

## Relevant Experience
- **Full dashboard redesign, fintech startup (React + Tailwind):** Rebuilt the entire
  customer-facing analytics dashboard — 20+ screens, real-time charts (D3 + Recharts),
  dark mode, internationalization. Reduced render time 40% by optimizing re-renders
  and virtualization. The design team's velocity increased because they trusted the
  implementation to match without pixel-pushing reviews.
- **Design system implementation (React + Tailwind + Storybook):** Built a component
  library with 60+ components from scratch. Design-to-code handoff time dropped from
  3 days to 4 hours. The design lead could preview every component in Storybook before
  it hit production.

## Plan
- Phase 1 — Foundation (3-4 weeks): Core component library translation to production code,
  theme system (light + dark), data visualization pattern library.
- Phase 2 — Screen buildout (6-8 weeks): Priority screens based on roadmap. Iterate with
  design lead. Each screen is 2-5 components from the library.
- Phase 3 — Polish + optimization (2-4 weeks): Accessibility audit, performance tuning,
  responsive edge cases, dark mode QA.

## Timeline
Estimated: 3-5 months total. Weekly check-ins with your design lead.
I can commit 25-30 hours/week starting within 2 weeks.
Flexible to scale up to 40 hours/week for critical milestones.

## Price
Hourly: $135/hr. Estimated 300-500 hours based on scope.
Billed weekly via invoice. Net-15 terms.
Rationale: Your budget ($60-80k) maps to 440-590 hours at this rate — the estimate
fits within budget. Hourly billing is the right model here because the scope is
evolving. If scope firms up, we can reframe as fixed-price milestones.

## Call to Action
I'd like to review your Figma files and current component library for a 1-hour technical
scoping session. After that I'll give you a more precise timeline and milestone estimate.
```

## Anti-Patterns

- **Phantom experience:** Including a proof point that doesn't exist or embellishing metrics. All proof points must be traceable to `profile.md` or `article-digest.md` line numbers. If the user doesn't have directly relevant experience, frame adjacent experience honestly — don't fabricate.
- **Race-to-the-bottom pricing:** Undercutting the lead's stated budget to win the deal. If the lead says $15k-25k and the proposal comes in at $8k, that signals desperation or inexperience. Align price to scope, not to the floor of their range.
- **Generic proposal structure:** Using the same 3-bullet plan for every lead. The Plan section must be specific to this lead's stated scope. If the lead described 5 deliverables, address all 5. Template cloning loses deals.
- **No CTA or weak CTA:** "Let me know if you're interested" is not a call to action. Every proposal must end with a specific, actionable next step. The user edits the CTA before sending — but the draft must have one.
- **Skipping the rate check:** Writing a proposal at a rate below `rate_floor` without user confirmation. Apply the check in Step 5 — no exceptions.
- **Proposing before the lead evaluation:** Generating a proposal for a lead that was never run through `modes/lead.md`. The evaluation is prerequisite — it scopes the proposal, catches red flags, and maps proof points.
- **Overpromising timeline:** If the scope requires 10 weeks and the lead wants 6, don't say "yes" and plan to work nights. Offer a phased approach or reduced scope. A missed deadline destroys credibility faster than a higher bid.
- **Ignoring Block G flags:** Drafting a proposal for a lead with `caution` signals without flagging them. The user decides whether to proceed, but the proposal must note the concern.
- **Pricing in a vacuum:** Proposing a fixed price without anchoring to the lead's stated budget. If no budget was given, explain the rationale for the proposed price. Never just drop a number.
- **One-size template for fixed vs hourly:** Fixed-price proposals need milestone breakdowns. Hourly proposals need estimated hours and weekly commitment. Don't mix the formats.
- **Hidden assumptions:** Assuming the client wants tech details when they care about business outcomes. The Hook and Relevant Experience sections should speak in outcomes, not architecture diagrams. Architecture belongs in the Plan (if the client is technical) or in a separate technical appendix.
- **No revision round before sending:** Generating the PDF and declaring it done. The user must review every proposal. The mode generates a draft — the user sends the final version.

## Length target: 300-450 lines. This file is part of the System Layer (auto-updatable).
