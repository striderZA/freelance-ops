---
description: Generate or update your freelance rate card and portfolio case studies
argument-hint: "[rate-card | case-study <slug> | list]"
---

# Portfolio Mode

## Purpose

This mode generates two outputs: a **rate card** (your services, rates, payment terms, and availability on a single page) and **portfolio case study PDFs** (client-by-client writeups with problem, approach, results, tech, engagement details). It reads your profile, past engagements, and metrics from `profile.md`, `config/rates.yml`, `data/clients.yml`, and `article-digest.md`, then drafts and renders professional PDFs via the `templates/rate-card-template.html` and `templates/portfolio-template.html` Playwright pipeline.

## When to Use

- A client or prospect asks for your rate card
- You want to send a polished overview of services + rates before a screening call
- You just completed an engagement and want to capture it as a case study
- You're updating rates and need to reissue your rate card
- A prospect says "send me examples of similar work" — generate 1-2 case study PDFs tailored to their industry
- You're building your Upwork/Toptal profile and need portfolio attachments

## Inputs

- **`config/rates.yml`** — rate floor, day rate, target engagement bands. Primary source for service rates.
- **`config/profile.yml`** — your name, email, location, timezone, positioning narrative, availability.
- **`modes/_profile.md`** — niches, rate floor per niche, negotiation scripts, exclusions. Overrides defaults from `_shared.md` and `rates.yml`.
- **`modes/_shared.md`** — system context, professional writing rules, Unicode normalization rules for ATS.
- **`profile.md`** (was `cv.md`) — canonical bio, skills, experience, proof points.
- **`article-digest.md`** (if exists) — detailed case studies and portfolio metrics. Takes precedence over `profile.md` for metrics.
- **`data/clients.yml`** (recommended) — past engagements with client name, platform, scope, rate, duration, outcome, rating. Source for case study content.
- **`data/portfolio/`** (optional, if directory exists) — per-client markdown case studies that override auto-generated drafts. Each file is `{slug}.md` with problem/approach/results/tech/engagement sections.
- **`writing-samples/`** — style calibration for the professional voice used in case study prose. Check `_profile.md` `## Writing Style` first before scanning files.

## Output Format

### Rate card

Generate `output/rate-card.pdf` — single-page A4 PDF via:
```bash
node generate-pdf.mjs --template rate-card --vars '{"NAME":"...","DATE":"...","SERVICES":[...],"TERMS":"...","AVAILABILITY":"...","EMAIL":"...","PHONE":"..."}'
```
The PDF header includes your name, email, location, and "Valid from {date}."

Also write the markdown source to `output/rate-card.md` for quick reference and version history:

```markdown
# Rate Card — {Name}

**Valid from:** {YYYY-MM-DD}

## Services

| Service | Rate | Typical Duration |
|---------|------|------------------|
| {Niche/service 1} | ${rate}/hr | {duration} |
| {Niche/service 2} | ${rate}/hr | {duration} |
| {Niche/service 3} | ${rate}/hr | {duration} |

## Payment Terms

- Deposit: {X%}
- Milestones: {Y-based}
- Net D: {N days}
- Late payment: {fee structure}

## Availability

{Current load, lead time, timezone overlap}
```

### Case study

For each case study, generate `output/portfolio/{slug}.pdf` — A4 PDF via:
```bash
node generate-pdf.mjs --template portfolio --vars '{"CLIENT_NAME":"...","PROJECT_TITLE":"...",...}'
```

Also write the markdown source to `output/portfolio/{slug}.md`:

```markdown
# Case Study: {Client Name} — {Project Title}

**Client:** {Name or "Confidential — NDA"}
**Platform:** {Upwork / Direct / Referral / Toptal}

## Problem

<2-3 paragraphs: what the client needed, the business context, the pain point>

## Approach

<2-3 paragraphs: how you solved it, key decisions, why this approach>

## Results

- {Metric 1}: {before → after}
- {Metric 2}: {before → after}
- {Metric 3}: {before → after}

## Tech Stack

{Technologies used, comma-separated}

## Engagement

- **Timeline:** {start date} — {end date}
- **Duration:** {X months} ({Y hours total})
- **Rate:** ${rate}/hr (${total} total)
- **Role:** {Your role / title on the engagement}
- **Team:** {Your team size, if applicable}
```

### Case study index

Write or update `output/portfolio/index.md` — a table of all generated case studies with slug, client, platform, rate, and date:

```markdown
# Portfolio Case Studies

| Slug | Client | Platform | Rate | Duration | Generated |
|------|--------|----------|------|----------|-----------|
| {slug} | {client} | {platform} | ${rate} | {duration} | {date} |
```

## Workflow

### Step 0 — Read system files

1. Read `modes/_shared.md` — professional writing rules, Unicode normalization rules, global conventions.
2. Read `modes/_profile.md` — niches, rate floor per niche, writing style cache, negotiation scripts.
3. Read `config/rates.yml` — rate floor, day rate, target bands.
4. Read `config/profile.yml` — name, email, location, timezone, availability, positioning.
5. Read `profile.md` — canonical bio, proof points, skills.
6. Read `article-digest.md` (if exists) — detailed metrics and case study drafts. Takes precedence for metrics.
7. Read `data/clients.yml` (if exists) — past engagement data.
8. Check `_profile.md` `## Writing Style` — if cached, use it directly. If absent, scan `writing-samples/` (skipping `README.md`) and extract style markers (tone, sentence structure, punctuation, vocabulary), then write to `_profile.md` under `## Writing Style`.

### Step 1 — Determine action

Ask the user what to generate if not specified in the argument:

- `rate-card` — generate only the rate card
- `case-study <slug>` — generate a single case study for a specific past engagement
- `list` — list available past engagements from `data/clients.yml` with their slugs
- No argument — generate both the rate card and case studies for all past engagements

### Step 2 — Draft rate card

9. Extract user's name, email, location from `config/profile.yml`. Fall back to `modes/_profile.md` or `profile.md`.
10. Build the services table:
    - Read niches from `modes/_profile.md` (niche table with rate floor and target rate). Each niche becomes a service row.
    - Read `config/rates.yml` for the global rate floor and day rate. Override per-niche with `_profile.md` if value is set.
    - Read `config/profile.yml` `positioning` or `modes/_profile.md` `## Your Positioning Narrative` for service descriptions.
    - Typical duration per service: if `_profile.md` has an `availability.lead_time` or past engagements show a pattern, estimate from there. Default to "2-4 weeks" for standard engagements.
11. Set payment terms:
    - **Deposit:** Default 50% for new clients, 30% for repeat. Read `_profile.md` negotiation scripts for overrides.
    - **Milestones:** Default "weekly hourly" or "50/50 fixed." Customize per niche.
    - **Net D:** Default Net-15. Read `_profile.md` late-payment script for terms.
    - **Late payment:** Default "1.5% monthly / 18% APR after 30 days." Customize per `_profile.md`.
12. Set availability:
    - Read `config/profile.yml` `availability` (hours_per_week, timezone_overlap, lead_time, current_load).
    - Fall back to `modes/_profile.md` `## Your Availability`.
13. Write to `output/rate-card.md` in the rate card markdown format.
14. Render rate card: run
    ```bash
    node generate-pdf.mjs --template rate-card --vars '{"NAME":"...","DATE":"...","SERVICES":[...],"TERMS":"...","AVAILABILITY":"...","EMAIL":"...","PHONE":"..."}'
    ```
    This produces `output/rate-card.pdf`.
15. Validate the PDF exists at `output/rate-card.pdf`. If not, warn the user and keep the markdown as a fallback.

### Step 3 — Draft case studies

16. Read `data/clients.yml` — extract past engagements. If the file doesn't exist or is empty, check `config/profile.yml` for `past_engagements`, then `modes/_profile.md` `## Your Past Engagements`.
17. For each past engagement (or the single one requested):
    a. Create a slug from the client name: lowercase, replace spaces with hyphens, strip special characters. If `Confidential`, use `confidential-{n}` where n is the engagement index.
    b. Check `data/portfolio/{slug}.md` — if a hand-written case study exists, use it verbatim instead of auto-generating. This allows the user to write their own case study prose while keeping the pipeline intact.
    c. If no hand-written case study exists, auto-generate:
       - **Problem:** Derive from the `scope` and `outcome` fields in the engagement entry. If `scope` is "Built RAG pipeline," expand into a 2-3 paragraph narrative: describe the client context (B2B legaltech, 15-lawyer firm, legacy document retrieval), the pain point (manual discovery averaging 4h per case), and what they needed (automated semantic search across 50k+ documents).
       - **Approach:** Describe the architecture and key decisions. Include tech stack decisions, why this approach over alternatives, any trade-offs made. Based on the engagement `scope` and the user's niche expertise from `_profile.md`.
       - **Results:** Pull metrics from `article-digest.md` first. If absent, derive from `outcome` field (e.g. "Extended twice, 2x scope" → "Client satisfaction led to two extensions, doubling original scope"). If no metrics are available, describe qualitative outcomes honestly ("Delivered on time, within budget, client extended the engagement").
       - **Tech Stack:** Infer from the `scope` description and the user's known tech stack (from `profile.md` and `_profile.md` niches). For example, "RAG pipeline" → "LangChain, PostgreSQL, pgvector, OpenAI, FastAPI."
       - **Engagement:** Use the engagement's `rate`, `duration`, `platform`, and `rating` directly. If `client` is "Confidential," note "Confidential — NDA" in the client name field.
    d. Write to `output/portfolio/{slug}.md`.
    e. For each case study, run:
       ```bash
       node generate-pdf.mjs --template portfolio --vars '{"CLIENT_NAME":"...","PROJECT_TITLE":"...",...}'
       ```
       This produces `output/portfolio/{slug}.pdf`.
    f. Validate the PDF exists.
18. Write or update `output/portfolio/index.md` with the table of all generated case studies.

### Step 4 — Present results

19. Show the user a summary:
    - Rate card: `output/rate-card.pdf` (✓ generated or ❌ failed)
    - Case studies: list each slug with client name and status
    - Total output size and path
20. If any PDF generation failed, keep the markdown files and note the path so the user can still use the content.
21. If generated for a specific prospect, offer to attach the relevant case study to the proposal flow: "Want me to reference this case study in your proposal draft?"

## Edge Cases

- **No past engagements (`data/clients.yml` missing or empty):** Generate the rate card only. Skip case study generation. Tell the user: "I don't have any past engagements recorded. You can add them to `data/clients.yml` or `config/profile.yml` `past_engagements` and I'll generate case studies from them."
- **Profile is very thin (no `profile.md` metrics, minimal `rates.yml`):** Generate the rate card with placeholders flagged with `[NEEDS INPUT]`. Tell the user: "Your profile is sparse — I've generated a draft rate card, but the services, rates, and availability need your input. Run `modes/onboarding.md` to fill in the gaps, or edit `config/rates.yml` and `config/profile.yml` directly."
- **NDA prevents naming the client:** In the case study, use "Confidential — {industry}" instead of the client name (e.g. "Confidential — Legaltech company"). The slug becomes `confidential-{n}`. Strip any identifying metadata. Do NOT include the client name, project name, or any unique technical detail that could identify them. Flag in the case study header: "Client name withheld due to NDA — content approved for portfolio use."
- **No explicit metrics in `article-digest.md` or `profile.md`:** Describe outcomes qualitatively. Do NOT fabricate numbers. Use phrases like "Client satisfaction led to contract extension" or "Delivered ahead of schedule" instead of invented percentages.
- **Past engagement has no rate recorded:** Use `config/rates.yml` rate_floor as a placeholder. Flag with `[RATE NOT RECORDED - estimated at floor]` in the case study.
- **`templates/rate-card-template.html` or `templates/portfolio-template.html` don't exist yet:** Generate markdown files only. Note to the user: "HTML templates not found — markdown versions are in `output/`. The PDF templates need to be created in `templates/` when you're ready to generate PDFs."
- **`data/portfolio/{slug}.md` already exists (user wrote their own case study):** Use it verbatim. Do NOT overwrite it with auto-generated content. Just update the engagement metadata (rate, duration) if `data/clients.yml` has newer data.
- **Case study slug collides with an existing file:** Append `-1`, `-2` etc. to the slug until unique. Warn the user about the collision.
- **User wants to delete or redact a case study:** Remove the file from `output/portfolio/` and remove the entry from `output/portfolio/index.md`. Do not delete `data/portfolio/{slug}.md` (user-authored) without explicit instruction.

## Examples

### Example 1: AI consultant with 5 past gigs

**Input:** `data/clients.yml` has 5 entries: 3 Upwork (RAG chatbot, LLM observability, agentic workflow) + 1 Toptal (AI strategy) + 1 direct (fractional AI lead). Rate floor $75/hr, target $120/hr. Niches: AI consulting, LLM app build, agentic workflow.

**Rate card output:**
- Services table: AI consulting / advisory ($120-150/hr, 4-8 weeks), LLM app / RAG build ($100-130/hr, 3-6 weeks), Agentic workflow ($120-140/hr, 4-8 weeks), Technical writing / docs ($90-110/hr, 2-4 weeks).
- Payment terms: 50% deposit (new clients), milestones at 25/25/25/25 (projects over $10k), Net-15, 1.5% monthly late fee.
- Availability: 25h/wk, 9am-12pm ET overlap, 1-2 week lead time, currently 15h/wk committed.

**Case study output:** 5 PDFs generated:
- `output/portfolio/legaltech-rag.pdf` — "Confidential — Legaltech company: RAG pipeline for document discovery." Problem: 50k+ legal docs, 4h per case for manual search. Approach: LangChain + pgvector with hybrid search. Results: Reduced search time from 4h to 12min (83% reduction), extended twice. Tech: Python, LangChain, PostgreSQL, pgvector, OpenAI Ada-002. Engagement: $120/hr, 4 months.
- `output/portfolio/saas-ops-llm.pdf` — "SaaS ops startup: LLM observability and evaluation framework." Problem: No visibility into LLM response quality, manual eval. Approach: Built eval harness with LLM-as-judge, dashboard, CI integration. Results: Caught 23% regressions before deployment, adopted by 3 teams. Tech: Python, LangSmith, FastAPI, React dashboard. Engagement: $100/hr, 3 months.
- Plus 3 more (agentic workflow, AI strategy, fractional AI lead).

### Example 2: Web developer with 10 past gigs

**Input:** `data/clients.yml` has 10 entries spanning Next.js MVPs, Shopify stores, WordPress migrations, and API integrations. 8 on Upwork, 2 direct referrals. Rate floor $50/hr, target $85/hr. Single niche: web app development.

**Rate card output:**
- Services table: Web app development (Next.js / full-stack, $75-95/hr, 2-6 weeks), E-commerce (Shopify + custom, $65-85/hr, 3-8 weeks), API integration / automation ($60-80/hr, 1-3 weeks), Maintenance & support ($85/hr, ongoing retainer).
- Payment terms: 50% upfront (fixed projects under $5k), milestones (projects over $5k), Net-15, 2% monthly late fee after 30 days.
- Availability: 30h/wk, flexible timezone, 1-week lead, currently 10h/wk free.

**Case study output:** Skip generation (10 is too many for a single pass). Instead generate the rate card and the top 3 most recent/comparable gigs. Ask the user: "You have 10 past engagements. I'll generate case studies for the 3 most recent ones by default. Which ones do you want, or should I generate all 10?"

### Example 3: Designer with 3 past gigs

**Input:** `data/clients.yml` has 3 entries: 2 on Upwork (brand identity + mobile app UI), 1 direct (website redesign). Rate floor $40/hr, target $65/hr. Niches: UI/UX design, brand identity.

**Rate card output:**
- Services table: UI/UX design ($55-75/hr, 2-6 weeks), Brand identity ($50-70/hr, 3-8 weeks), Website design ($55-75/hr, 2-5 weeks), Design systems ($65-85/hr, 4-10 weeks).
- Payment terms: 50% deposit, 50% on delivery. Net-15. 1.5% monthly late fee.
- Availability: 20h/wk, prefers async (GMT-5), 1-week lead, fully available.

**Case study output:** 3 PDFs:
- `output/portfolio/saas-ui.pdf` — "SaaS startup: Mobile app UI redesign." Problem: User engagement dropping, 40% dropoff at onboarding. Approach: User research → wireframes → high-fidelity prototype with design system foundations. Results: Onboarding completion up 35%, NPS +18 points. Tech: Figma, Framer, Storybook, Tailwind. Engagement: $55/hr, 6 weeks.
- `output/portfolio/eco-brand.pdf` — "E-commerce brand: Full identity refresh." Problem: Brand inconsistent across Shopify and social. Approach: Logo, color system, typography, component library, brand guidelines. Results: Brand consistency score 92% (up from 41%). Tech: Figma, Adobe Illustrator, BrandPad. Engagement: $50/hr, 8 weeks.
- `output/portfolio/nonprofit-web.pdf` — "Nonprofit: Website redesign." Problem: 60% mobile bounce rate, 2min avg session. Approach: Content audit, mobile-first redesign, accessibility overhaul. Results: Bounce rate dropped to 32%, avg session 4.5min, donations up 28%. Tech: Figma, Webflow, WCAG 2.1 AA. Engagement: $3k fixed, 4 weeks (direct/referral).

## Anti-Patterns

- **Fabricating results:** If metrics are not in `profile.md`, `article-digest.md`, or engagement `outcome` fields, do NOT invent them. Describe outcomes qualitatively. Fabricated metrics destroy trust when a prospect asks for details.
- **Including NDA'd work:** If a client is listed as "Confidential" in `data/clients.yml`, do NOT name them. Do NOT include identifying details (project name, specific dates, unique technical details that could identify the client). Mark the case study header accordingly.
- **Fudging metrics:** Rounding ambiguous numbers is acceptable ("~40% reduction") if the source says "about 40%." Inventing exact numbers from vague descriptions is not. Use qualifiers: "approximately," "estimated," "roughly."
- **Outdated rate card:** Always include "Valid from {date}" on the rate card. If the user hasn't updated rates in 6+ months, flag: "Your rate card rates haven't changed since {date}. Consider reviewing them."
- **Rate card without context:** A rate card is not just a price list. Always include payment terms and availability. A standalone price table looks like a commodity shop.
- **Case study as a feature list:** "Built a RAG pipeline with LangChain" is a feature, not a case study. Every case study must answer: What problem did the client have? How did you solve it? What was the measurable result?
- **Overloading the user:** If the user has 10+ past engagements, do not generate all case studies in one pass. Ask which they want to feature. Default to the 3 most recent or the 3 highest-value.
- **Generic writing:** Case studies should sound like the user wrote them. Apply the cached writing style from `_profile.md` `## Writing Style`. If no style is cached, scan `writing-samples/` first. Avoid corporate boilerplate like "leveraged strategic synergies."
- **Auto-generating for "Confidential" clients with unique tech stacks:** If the tech stack itself is identifying (e.g. a very specific combination of tools used by only one known company), consider omitting or generalizing it under NDA. Flag: "Tech stack generalized to protect client identity."

---

**System layer — auto-updatable.** Do not put user-specific portfolio content here. Store past engagements in `data/clients.yml` or `config/profile.yml`; hand-written case studies in `data/portfolio/`; rate preferences in `config/rates.yml` and `modes/_profile.md`.
