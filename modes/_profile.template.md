# User Profile Context -- freelance-ops

<!-- ============================================================
     THIS FILE IS YOURS. It will NEVER be auto-updated.

     Customize everything here: your identity, niches, positioning,
     rate floor, proof points, past engagements, availability,
     exclusions, negotiation scripts.

     The system reads _shared.md (updatable) first, then this
     file (your overrides). Your customizations always win.
     ============================================================ -->

<!-- ============================================================
     YAML SCHEMA (for reference — this file is Markdown, but the
     fields below map to the YAML keys in config/profile.yml).

     The canonical storage for machine-readable data is profile.yml.
     This file holds the narrative, context, and instructions that
     the AI reads to frame proposals, evaluations, and outreach.

     name: string                  # Your full name
     email: string                 # Contact email
     location: string              # City, Country
     timezone: string              # e.g. America/New_York
     niches:
       - name: string             # e.g. AI consulting / advisory
         rate_min: number         # Your floor for this niche
         rate_target: number      # Your target for this niche
         description: string      # What clients buy from you
     platforms:
       - name: string             # e.g. Upwork, Toptal, Direct
         profile_url: string      # Link to profile (leave blank to skip)
         rate_floor: number       # Min acceptable on this platform
         target_rate: number      # Target on this platform
     positioning: string          # One paragraph: what you do, for whom, why you
     proof_points:
       - metric: string           # e.g. "Reduced API latency by 40%"
         context: string          # Brief context for the metric
         source: string           # Reference link or "N/A"
     past_engagements:
       - client: string           # Client name (or "Confidential")
         platform: string         # Upwork / Toptal / Direct / Referral
         scope: string            # What you built / delivered
         rate: string             # e.g. "$150/hr" or "$20k fixed"
         duration: string         # e.g. "3 months"
         outcome: string          # e.g. "Delivered on time, client extended"
         rating: number           # Platform rating out of 5 (if available)
     availability:
       hours_per_week: number     # Realistic capacity for new work
       timezone_overlap: string   # e.g. "9am-12pm ET"
       lead_time: string          # e.g. "1-2 weeks notice"
       current_load: string       # e.g. "20h/wk committed through June"
     exclusions:
       industries: string[]       # e.g. adult, gambling, crypto
       comp_models: string[]      # e.g. equity-only, revenue share
       client_types: string[]     # e.g. agencies hiding end-client
       geographies: string[]      # e.g. jurisdictions with payment risk
       scopes: string[]           # e.g. vague "build me an app like X"
     negotiation_scripts:
       rate_pushback: string      # Script for "can you do X/hour?"
       scope_creep: string        # Script for mid-engagement scope add
       late_payment: string       # Script for overdue invoices
       off_platform: string       # Script for "let's go direct"
       nda_ip: string             # Script for NDA / IP assignment
       what_is_your_rate: string  # Script for open-ended rate ask
     ============================================================ -->

## Your Identity

<!-- Your name, email, location, and timezone anchor everything.
     Leave blank to skip — the system will fall back to profile.yml. -->

- **Name:** [Your full name]
- **Email:** [your@email.com]
- **Location:** [City, Country]
- **Timezone:** [e.g. America/New_York, Europe/Berlin]

## Your Target Niches

<!-- Replace these with YOUR freelance niches. Each niche should
     include your minimum and target rates for that type of work.
     Leave blank to skip — the system will fall back to profile.yml.

     Examples:
     - AI consulting / fractional AI lead
     - LLM app / RAG build
     - Web app development (Next.js / full-stack)
     - Automation / integration (Zapier / n8n)
     - Data engineering
     Whatever you're optimizing for. -->

| Niche | Rate floor | Target rate | Description — what clients buy |
|-------|------------|-------------|--------------------------------|
| **AI consulting / advisory** | $XXX/hr | $XXX/hr | Someone who turns "we need an AI strategy" into a 90-day plan |
| **LLM app / RAG build** | $XXX/hr | $XXX/hr | Someone who ships a working LLM product, not a slide deck |
| **Agentic workflow** | $XXX/hr | $XXX/hr | Someone who builds reliable agent systems, not a demo |
| **Technical writing / docs** | $XXX/hr | $XXX/hr | Someone who makes the product legible to engineers |
| **Web app development** | $XXX/hr | $XXX/hr | Someone who takes an idea to a deployed SaaS in weeks |
| **Automation / integration** | $XXX/hr | $XXX/hr | Someone who kills the manual ops that drain the team |

## Your Platforms

<!-- Where do you find clients? Each platform has different fees,
     competition levels, and client expectations. Profile URLs
     let the system link to your active profiles.

     Leave blank to skip — the system will use profile.yml defaults. -->

| Platform | Profile URL | Rate floor | Target rate | Notes |
|----------|-------------|------------|-------------|-------|
| Upwork | [upwork.com/freelancers/~...] | $XXX/hr | $XXX/hr | 10% fee, competitive |
| Toptal | [toptal.com/resume/...] | $XXX/hr | $XXX/hr | Curated, higher rates |
| Direct / Referral | N/A | $XXX/hr | $XXX/hr | No fee, premium |
| [Other] | [URL] | $XXX/hr | $XXX/hr | |

## Your Positioning Narrative

<!-- Replace with YOUR positioning. This is the one-paragraph answer
     to "What do you do, for whom, and why you?"

     This frames every proposal, pitch, and outreach message.
     Leave blank to skip — the system will use profile.yml. -->

> [I am a ... who helps ... by ... Unlike other freelancers, I ...]

Example:
> I'm an AI engineer who helps product teams ship LLM-powered features that actually work in production — not demos, not slide decks. Unlike most AI freelancers, I anchor every engagement in evaluation, observability, and user feedback loops. My clients get a system that improves after launch, not one that needs constant firefighting.

## Your Adaptive Framing

<!-- Map YOUR past engagements and proof points to each niche. Example:
     | LLM / RAG | My retrieval system for a legaltech client | data/portfolio/legaltech-rag |
     | Automation | My Zapier-to-n8n migration for a SaaS ops team | data/portfolio/ops-automation | -->

| If the lead is... | Emphasize about you... | Proof point sources |
|-------------------|------------------------|---------------------|
| AI consulting | Strategy, roadmaps, stakeholder communication | article-digest.md + proof_points |
| LLM / RAG | Production retrieval, evals, observability | past_engagements + article-digest.md |
| Agentic | Multi-agent orchestration, HITL, reliability | past_engagements + proof_points |
| Technical writing | Clarity, docs-as-code, audience-aware tone | past_engagements + writing-samples/ |
| Web app development | Ship-it speed, full-stack, MVP to prod | past_engagements + proof_points |
| Automation | Time saved, error reduction, ROI math | past_engagements + proof_points |

## Your Proof Points

<!-- 3-10 bullets with concrete metrics. These are the receipts
     that back up your positioning. Each one should be specific,
     quantified, and relevant to at least one niche.

     Leave blank to skip — the system will use article-digest.md. -->

- **[Metric]:** [Brief context — who, what, result]
  - *Source:* [Link or "Confidential"]

Examples:
- **Reduced API latency by 40%:** Refactored the retrieval pipeline for a legaltech RAG system, cutting P95 from 2.1s to 1.3s.
  - *Source:* Confidential
- **Shipped MVP in 6 weeks:** Built a multi-tenant SaaS platform for a fintech startup, from zero to production with 3 users in 6 weeks.
  - *Source:* NDA-protected
- **Automated 80% of manual ops:** Replaced a 15-step Zapier workflow with a custom n8n pipeline, saving 20h/week for a 12-person ops team.
  - *Source:* [portfolio link]
- **Drove 30% adoption increase:** Rewrote API docs for a developer tools platform, reducing time-to-first-call from 45min to 12min.
  - *Source:* [writing-samples/link]

## Your Past Engagements

<!-- These are your credibility and rate-benchmark assets. Each
     engagement serves as both a proof point and an anchor for
     your target rate.

     For each proposal, surface the 1-2 engagements that map
     strongest to the lead.

     Leave blank to skip — the system will use profile.yml. -->

| Client | Platform | Scope | Rate | Duration | Outcome | Rating |
|--------|----------|-------|------|----------|---------|--------|
| [Confidential legaltech] | Upwork | Built RAG retrieval pipeline, eval framework | $120/hr | 4 months | Extended twice, 2x scope | 5.0 |
| [SaaS ops startup] | Direct | n8n migration, 15 workflows | $8k fixed | 6 weeks | Shipped ahead of schedule | N/A |
| [Dev tools company] | Toptal | API documentation overhaul | $100/hr | 3 months | Client requested renewal | 4.9 |

## Your Cross-cutting Advantage

<!-- What's your "signature move"? What do you do that other
     freelancers can't? This is the one thing that makes you
     different in every niche. -->

Frame profile as **"Builder who ships, with the receipts"** — adapts framing to the niche without losing the underlying proof of execution.

## Your Availability

<!-- Honest signal: when can you actually start, and how many hours?
     Don't promise "available immediately" if you have 30 hours of
     committed work this week.

     Leave blank to skip — the system uses profile.yml. -->

- **Hours per week:** [e.g. 20] — realistic capacity for new leads
- **Timezone overlap:** [e.g. 9am-12pm ET] — when you're reachable for calls
- **Lead time:** [e.g. 1-2 weeks] — notice needed before kickoff
- **Current load:** [e.g. "20h/wk committed through June, 15h/wk free"]

## Your Exclusions

<!-- Deal-breakers. The system should not propose on these.
     Leave blank to skip — the system will use profile.yml. -->

| Category | Exclusions |
|----------|------------|
| **Industries** | adult, gambling, crypto (speculative), tobacco, weapons |
| **Comp models** | equity-only, "exposure" comp, revenue share, unpaid "test tasks" |
| **Client types** | agencies that hide the end-client, brokers, MLM / pyramid |
| **Rates** | anything below rate_floor (enforced automatically) |
| **Geographies** | jurisdictions where payment collection is risky |
| **Scopes** | vague "build me an app like X" with no clear scope, indefinite "retainer" with no defined deliverables |

## Your Negotiation Scripts

<!-- Adapt to YOUR situation, currency, geography. These scripts
     are the AI's default responses to common freelance objections.
     Customize them for your rate, market, and personality.

     Leave any blank to skip — the system falls back to built-in
     defaults. -->

**Rate pushback (client asks for a lower rate):**
> "My floor for [niche] scopes like this is $X/hr (set in your profile.yml). I'm happy to scope down to fit — for example, drop the dashboard and ship the API first, then add it as a follow-on. Want to explore that?"

**"What's your rate?" (open-ended, before scoping):**
> "Rate depends on scope. Once we've nailed the deliverables, I'll quote a fixed price (or an hourly range) tied to the actual work. For context, my [niche] engagements usually land between $X and $Y."

**Off-platform payment push (a major red flag on Upwork):**
> "I only work through the platform's payment system for the first engagement. It protects both of us. Once we've shipped one cycle cleanly, we can talk about going direct."

**Scope creep mid-engagement:**
> "That's outside the original scope. I'm happy to add it — let me quote the change order with a fresh estimate and timeline."

**Late payment (invoice overdue):**
> "I see invoice #[number] is now [X days] overdue. Per our agreement, payments are due within [terms]. Can you confirm when payment will be sent? If there's a blocker on your end, let me know — I'm happy to work through it."

**Client wants to add an NDA / IP assignment:**
> "Standard. I'll sign the platform's default NDA / IP terms, or a custom one of equal scope. I'm flexible on jurisdiction."

## Your Location Policy

<!-- Adapt to YOUR situation. Most freelance work is remote, but
     some clients want overlap or occasional on-site visits. -->

**In proposals:**
- Specify timezone overlap in plain text
- Reference any on-site availability you actually have (most freelancers: 0 days)
- Be honest about work hours — fake "24/7 availability" never works

**In evaluations (scoring):**
- A lead that requires 4h timezone overlap with their team is fine — just note it
- A lead that requires on-site presence 5 days/week without accommodation is a structural mismatch
- Payment-method or jurisdiction red flags → Block G caution / likely-scam regardless of score
