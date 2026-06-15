# User Profile Context -- freelance-ops

<!-- ============================================================
     THIS FILE IS YOURS. It will NEVER be auto-updated.

     Customize everything here: your niches, positioning,
     rate floor, proof points, negotiation scripts, exclusions.

     The system reads _shared.md (updatable) first, then this
     file (your overrides). Your customizations always win.
     ============================================================ -->

## Your Target Niches

<!-- Replace these with YOUR freelance niches. Examples:
     - AI consulting / fractional AI lead
     - LLM app / RAG build
     - Web app development (Next.js / full-stack)
     - Automation / integration (Zapier / n8n)
     - Data engineering
     Whatever you're optimizing for. -->

| Niche | Thematic axes | What clients buy |
|-------|---------------|------------------|
| **AI consulting / advisory** | AI strategy, fractional leadership, workshop | Someone who turns "we need an AI strategy" into a 90-day plan |
| **LLM app / RAG build** | Retrieval, evals, OpenAI/Anthropic, vector search | Someone who ships a working LLM product, not a slide deck |
| **Agentic workflow** | HITL, multi-agent, tool use, MCP | Someone who builds reliable agent systems, not a demo |
| **Technical writing / docs** | API reference, developer docs, docs-as-code | Someone who makes the product legible to engineers |
| **Web app development** | Next.js, full-stack, MVP, ship-it | Someone who takes an idea to a deployed SaaS in weeks |
| **Automation / integration** | Zapier, n8n, Make, custom scripts | Someone who kills the manual ops that drain the team |

## Your Adaptive Framing

<!-- Map YOUR past engagements and proof points to each niche. Example:
     | LLM / RAG | My retrieval system for a legaltech client | data/portfolio/legaltech-rag |
     | Automation | My Zapier-to-n8n migration for a SaaS ops team | data/portfolio/ops-automation | -->

| If the lead is... | Emphasize about you... | Proof point sources |
|-------------------|------------------------|---------------------|
| AI consulting | Strategy, roadmaps, stakeholder communication | article-digest.md + profile.md |
| LLM / RAG | Production retrieval, evals, observability | data/portfolio/ + article-digest.md |
| Agentic | Multi-agent orchestration, HITL, reliability | data/portfolio/ + profile.md |
| Technical writing | Clarity, docs-as-code, audience-aware tone | data/portfolio/ + writing-samples/ |
| Web app development | Ship-it speed, full-stack, MVP to prod | data/portfolio/ + profile.md |
| Automation | Time saved, error reduction, ROI math | data/portfolio/ + profile.md |

## Your Positioning Narrative

<!-- Replace with YOUR story. This frames every proposal. -->

Use the candidate's positioning from `config/profile.yml` to frame ALL content:
- **In proposals:** Open with the positioning paragraph, then lead-specific proof
- **In pitches:** One sentence version of the positioning
- **In outreach:** The "what you do, for whom, why you" distilled to a hook
- **In STAR stories:** Reference proof points from `data/portfolio/` and `article-digest.md`

## Your Cross-cutting Advantage

<!-- What's your "signature move"? What do you do that other freelancers can't? -->

Frame profile as **"Builder who ships, with the receipts"** — adapts framing to the niche without losing the underlying proof of execution.

## Your Rate Floor and Target

<!-- Where the system enforces the rate floor for Block C. -->

**The system reads these from `config/rates.yml` automatically. This section is for narrative + override notes.**

- **Rate floor:** the absolute minimum you accept. The system will never draft a proposal below this.
- **Target rate:** the rate you aim for, anchored in past engagement outcomes.
- **Per-niche override:** if certain niches command different rates (e.g. AI consulting > general dev), note it here.
- **Per-platform override:** direct / referral leads often take 20-30% premium over platform leads (fees, competition).

## Your Past Engagements

<!-- These are the receipts. Each one is a credibility + rate-benchmark asset. -->

Reference the engagements stored in `config/profile.yml` under `past_engagements` (or `data/clients.yml` for longer histories). For each proposal, surface the 1-2 engagements that map strongest to the lead.

## Your Portfolio / Case Studies

<!-- If you have live demos, dashboards, or public case studies:
     url: https://yoursite.dev/case-studies
     password: demo-2026
     when_to_share: "AI / LLM / agentic leads" -->

If you have live demos (check profile.yml), offer access in proposals for relevant leads. Most platforms allow a single private link; respect that.

## Your Availability

<!-- Honest signal: when can you actually start, and how many hours? -->

The system uses `config/profile.yml` → `availability` to draft realistic timelines. Don't promise "available immediately" if you have 30 hours of work committed this week.

- **Hours / week:** the realistic capacity you have for new leads
- **Timezone overlap:** when you're reachable for client calls
- **Lead time:** how much notice you need before kickoff (often 1-2 weeks)
- **Current load:** the engagements already on the books

## Your Exclusions

<!-- Deal-breakers. The system should not propose on these. -->

Configure in `config/profile.yml` → `exclusions`. Common patterns:
- **Industries:** adult, gambling, crypto (speculative), tobacco, weapons
- **Comp models:** equity-only, "exposure" comp, revenue share, unpaid "test tasks"
- **Client types:** agencies that hide the end-client, brokers, MLM / pyramid
- **Rates:** anything below `rate_floor` (enforced automatically)
- **Geographies:** jurisdictions where payment collection is risky
- **Scopes:** vague "build me an app like X" with no clear scope, indefinite "retainer" with no defined deliverables

## Your Negotiation Scripts

<!-- Adapt to YOUR situation, currency, geography. -->

**Rate pushback (client asks for a lower rate):**
> "My floor for this scope is $X (set in config/rates.yml). I'm happy to scope down to fit — for example, drop the dashboard and ship the API first, then add it as a follow-on. Want to explore that?"

**"What's your rate?" (open-ended, before scoping):**
> "Rate depends on scope. Once we've nailed the deliverables, I'll quote a fixed price (or an hourly range) tied to the actual work. For context, my [niche] engagements usually land between $X and $Y."

**Off-platform payment push (a major red flag on Upwork):**
> "I only work through the platform's payment system for the first engagement. It protects both of us. Once we've shipped one cycle cleanly, we can talk about going direct."

**Scope creep mid-engagement:**
> "That's outside the original scope. I'm happy to add it — let me quote the change order with a fresh estimate and timeline."

**Client wants to add an NDA / IP assignment:**
> "Standard. I'll sign the platform's default NDA / IP terms, or a custom one of equal scope. I'm flexible on jurisdiction."

## Your Location Policy

<!-- Adapt to YOUR situation. Most freelance work is remote, but some clients want overlap. -->

**In proposals:**
- Specify timezone overlap in plain text
- Reference any on-site availability you actually have (most freelancers: 0 days)
- Be honest about work hours — fake "24/7 availability" never works

**In evaluations (scoring):**
- A lead that requires 4h timezone overlap with their team is fine — just note it
- A lead that requires on-site presence 5 days/week without accommodation is a structural mismatch
- Payment-method or jurisdiction red flags → Block G caution / likely-scam regardless of score
