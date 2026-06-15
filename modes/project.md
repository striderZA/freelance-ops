# Mode: project — Portfolio Project ROI Evaluation

When the user has an idea for a portfolio project, case study, open-source tool, or content piece and needs to know whether it's worth their time. The goal is not "is this a good idea?" but "will this project help land paying clients in my target niches?"

The core question: **Given the user's niches and target clients, does this project generate more positioning value per hour invested than alternatives?**

Every hour spent on a portfolio project is an hour not spent on client work, lead outreach, or rest. This mode helps the user make that trade-off intentionally.

## Liveness Gate

No liveness check needed — this mode evaluates ideas, not live postings. Skip directly to evaluation.

## Step 0 — Context Load

Before evaluating, read:
1. `modes/_profile.md` — user's niches, narrative, writing style, existing project inventory
2. `config/profile.yml` — identity, target clients, rate targets, location policy
3. `profile.md` — skills, experience, existing proof points
4. `article-digest.md` (if exists) — detailed metrics and case studies (check if this project would duplicate coverage)
5. `writing-samples/` — for style calibration if generating output text
6. `data/portfolio/` (if exists) — existing portfolio projects to avoid duplication
7. `data/leads.md` — current pipeline to assess opportunity cost against active leads

Then determine which of the user's niches this project would serve. A project that serves 0 niches scores 0 on positioning. A project that serves multiple niches gets a bonus: add 0.3 to the final score (capped at 5.0) for each additional niche beyond the primary one, up to a max bonus of 0.6.

**If `_profile.md` has empty niches (`niches: []`),** flag this before proceeding. Fall back to scanning `config/profile.yml` for role/industry targets. If nothing is found, default to a "general AI/software consulting" framing with the caveat that scoring will be shallow.

## Step 1 — Project Classification

Classify the project into one of the following types. Classification affects which scoring dimensions matter most and what the delivery plan should look like.

| Type | Definition | Typical timeline | Primary value | Best scoring dimensions |
|------|-----------|-----------------|---------------|------------------------|
| **SaaS / web app** | A product the user builds and could sell or use as demo | 1-12 weeks | Demo + case study + potential revenue | Demo value, Niche signal |
| **Case study write-up** | Documentation of past client work or personal project | 2-5 days | Social proof + SEO + credibility | STAR story, Metrics, Niche signal |
| **Open-source tool** | A library, template, or utility published publicly | 1-6 weeks | Community credibility + inbound leads | Uniqueness, Lead gen path, Niche signal |
| **Content piece** | Blog post, tutorial, video, or talk | 1-10 days | Reach + authority + inbound | Lead gen path, Time to ship |
| **Proof-of-concept** | A throwaway experiment to test a technical approach | 1-7 days | Learning + confidence for client work | Time to ship, STAR story |
| **Template / starter kit** | A reusable scaffold for a common client need | 1-3 weeks | Faster delivery + consistent quality | Demo value, Time to ship, Niche signal |
| **Dashboard / analytics** | A visualization of something interesting | 3-14 days | Metrics storytelling + domain credibility | Metrics, Demo value |

## Step 2 — Scoring Matrix

Score the project on 7 dimensions (1-5). Each dimension has a rubric with concrete heuristics for every score level. Show the matrix as a table with per-dimension rationale.

### Dimension 1: Niche Signal (25%)

Does this project demonstrate skills the user sells to clients?

| Score | Criteria | Heuristic questions |
|-------|----------|---------------------|
| 5 | Directly demonstrates the user's primary niche skill | "Can I put this on my website and a prospect immediately understands what I do?" |
| 4 | Shows a core skill but not the full value proposition | "Does this prove technical competence but miss the business outcome?" |
| 3 | Adjacent skill — relevant but not core to the niche | "Would this help in a conversation about the niche, or only as a tangent?" |
| 2 | Tangentially related — shows general competence | "Is this something any developer could have built?" |
| 1 | Not relevant to any stated niche | "Does a client in my target niche care about this at all?" |

**Cross-niche bonus:** If the project serves 2+ of the user's niches, add 0.3 per additional niche (max 0.6 bonus, capped at 5.0).

### Dimension 2: Client Demo Value (20%)

Can a prospective client grasp the value quickly?

| Score | Criteria |
|-------|----------|
| 5 | Live URL, 2-min walkthrough, non-technical stakeholder understands value |
| 4 | Live demo but needs 5-min explanation or technical context |
| 3 | Screenshots / recording sufficient, no live demo possible |
| 2 | Code-only — client would need to clone and run |
| 1 | No visible output — conceptual or infrastructure-only |

**Hard rule:** If the project has no visual or interactive output, max score is 3. Clients don't buy what they can't see.

### Dimension 3: Metrics Potential (15%)

Can the project produce concrete numbers that impress clients?

| Score | Criteria |
|-------|----------|
| 5 | Clear before/after: latency, cost, accuracy, conversion — all measurable |
| 4 | Some measurable metrics but not a clean before/after story |
| 3 | Qualitative outcomes only (UX, architecture quality, maintainability) |
| 2 | Metrics are contrived — would need to invent benchmarks |
| 1 | No metrics possible — it's a library, config, or infrastructure |

**Hard rule:** If the user cannot name at least one metric during the evaluation, default to 2. Projects without metrics make weak case studies.

### Dimension 4: Uniqueness in Market (12%)

How differentiated is this from what already exists?

| Score | Criteria |
|-------|----------|
| 5 | Novel approach or combination — nobody in the niche has shown this |
| 4 | Few examples exist, and this has a meaningful twist |
| 3 | Common concept but well-executed — differentiation is in quality |
| 2 | Many similar projects — hard to stand out |
| 1 | Saturated space — 10+ mature alternatives, this adds nothing new |

**Heuristic:** Search the user's niche on GitHub, Product Hunt, and Google. If the top 3 results all do roughly the same thing, score ≤ 2.

### Dimension 5: Time to Ship (12%)

How fast can the user deliver something demo-able?

| Score | Criteria |
|-------|----------|
| 5 | 1 week or less, part-time evenings/weekends |
| 4 | 1-2 weeks |
| 3 | 2-4 weeks |
| 2 | 1-2 months |
| 1 | 3+ months |

**Adjustment:** If the user has active client work or pending leads in `data/leads.md`, deduct 1 point from the Time to Ship score. Shipping while billing takes longer.

### Dimension 6: STAR Story Richness (10%)

Will this project generate a story the user can tell in interviews and proposals?

| Score | Criteria |
|-------|----------|
| 5 | Rich narrative: trade-offs, failures, hard decisions, unexpected insights |
| 4 | Good story: key challenges overcome, clear architecture decisions |
| 3 | Decent story: implementation journey with some learning moments |
| 2 | Thin story: straightforward build, no real tension or insight |
| 1 | No story — just code or config with no narrative arc |

**Heuristic:** If the answer to "what was the hardest decision?" is "none, it was straightforward," score ≤ 2. Great STAR stories come from hard trade-offs, not smooth sailing.

### Dimension 7: Lead Generation Path (6%)

How will clients find this project?

| Score | Criteria |
|-------|----------|
| 5 | Multiple channels: SEO-friendly content + GitHub virality potential + sharable on LinkedIn/Twitter + demo for direct outreach |
| 4 | Strong single channel: e.g., SEO for a high-volume query, or a Product Hunt launch |
| 3 | Moderate: LinkedIn post + personal website + maybe some search traffic |
| 2 | Weak: can mention in proposals but no organic discovery |
| 1 | No discovery path: clients won't find it unless the user actively shows them |

**Hard rule:** Every BUILD verdict must include a distribution plan. If the user can't articulate how at least one client would discover this, deduct 1 point from the lead gen score.

### Weighted Score Calculation

**Weighted score = Σ(score × weight) / Σ(weight).** Maximum: 5.0.

Then apply the cross-niche bonus (0.3 per additional niche beyond the primary, max 0.6 bonus). Cap at 5.0.

### Grade Mapping

| Grade | Score | Verdict | What to do |
|-------|-------|---------|------------|
| A | 4.0-5.0 | **BUILD** | Commit to a timeline with weekly milestones. Produce Interview Pack. |
| B | 3.3-3.9 | **BUILD with caveats** | Good ROI but narrow scope or high effort. Evaluate the PIVOT suggestions first. If no pivot applies, build with a smaller scope. |
| C | 2.5-3.2 | **PIVOT** | The idea has merit but needs reframing. Provide 2-3 pivoted alternatives that score higher on niche signal or time to ship. |
| D | < 2.5 | **SKIP** | Negative ROI. Explain why in time-cost terms. Offer 1-2 better alternatives from the user's existing backlog or pipeline. |

## Step 3 — Interview Pack Assessment

For projects that score BUILD (A or B), define:

1. **One-pager**: What the project is, the architecture at a high level, key metrics it will produce, how it feeds into proposals
2. **Demo plan**: What a live demo would look like — URL, walkthrough script key moments
3. **Postmortem prep**: What trade-offs and failures to document along the way (these become STAR story material)
4. **Client-facing artifact**: What the output is — case study, GitHub repo, live URL, video walkthrough

## Step 4 — 80/20 Delivery Plan

For BUILD verdicts, produce a week-by-week plan:

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| 1 | MVP with core metric shipped | 1 measurable result |
| 2 | Polish + interview pack | Demo-ready + one-pager |
| 3+ | Distribution + outreach | Case study published, 5 outreach messages |

If the project scores PIVOT, produce a PIVOT plan instead:

| Current idea | Pivot to | Why better |
|-------------|----------|------------|
| [original idea] | [pivoted idea] | Higher niche signal, faster time to demo, clearer metrics |

If the project scores SKIP, explain the time cost and recommend a better use of that time (reference `data/pipeline.md` pending leads, existing evaluations, or a different project idea).

## Step 5 — Recommendation Output

Format the final recommendation as:

```
# Project Evaluation: [Project Name]

**Status:** BUILD | BUILD-with-caveats | PIVOT | SKIP
**Target niches:** [niche 1], [niche 2]
**Classification:** [SaaS / case study / OSS / content / PoC / template / dashboard]
**Estimated effort:** [X] weeks part-time
**Weighted score:** [X.X]/5.0 ([Grade])
**ROI verdict:** [one-sentence summary]

## Scoring Breakdown

| Dimension | Score | Weight | Rationale |
|-----------|-------|--------|-----------|
| ... | X | XX% | ... |

## Positioning Rationale

Why this project helps (or doesn't help) the user's specific niches and target clients.

## Delivery Plan

[80/20 plan or PIVOT plan or skip explanation]

## Interview Pack

[One-pager, demo plan, postmortem prep, client-facing artifact — only for BUILD verdicts]
```

## Edge Cases

| Situation | Handling |
|-----------|----------|
| User has no niches defined in `_profile.md` | Flag that niches are empty — evaluation will be generic. Ask user to define niches first for a meaningful score. Default to "general AI/software consulting" as a fallback. |
| Project is too vague to score | Ask clarifying questions: what would it do, who is it for, what's the key metric? Score only when there's enough to evaluate. |
| User already has 3+ projects in flight | Flag project fatigue. Score the new idea against existing commitments. Recommend finishing one before starting another. |
| Project requires tech the user doesn't know | Score Learning Cost as an implicit dimension. Deduct 1 point per new major technology. Flag the time cost of ramping up. |
| Project idea is client work (NDA) | Note that NDA-bound work cannot be shown publicly. Recommend building a sanitized version, or building a public PoC of the same concept. |
| Project is already built (post-hoc evaluation) | Skip the BUILD decision. Evaluate how to package and distribute it: case study write-up, demo recording, open-sourcing, LinkedIn post. |
| Project evaluation conflicts with active lead | If the project targets a niche that already has a high-scoring lead in the pipeline, note the opportunity cost. The lead should get priority. |
| User requests evaluation of an existing project not in portfolio | Evaluate for packaging value only — don't score dimensions that require new development. Recommend distribution strategy. |

## Examples

### Example 1: SaaS side project — "AI proposal generator for freelancers"

User: Full-stack freelancer targeting AI consulting and web app niches. Proposes building a tool that generates client proposals from lead descriptions.

**Evaluation:** BUILD (A-, 4.1/5.0)

- **Niche signal (5):** Directly demonstrates LLM integration, prompt engineering, web app delivery — core skills in both target niches.
- **Client demo value (4):** Live URL, show "input lead URL → output proposal" in 30 seconds. Only loses a point because the output needs human review.
- **Metrics potential (3):** Time saved per proposal is measurable. Harder to measure quality improvement.
- **Uniqueness (3):** Several similar tools exist. Differentiator: the output follows the user's writing style (from writing-samples/).
- **Time to ship (4):** MVP with one template in 2 weeks. Polish + multiple templates in 4 weeks.
- **STAR story (4):** Rich architecture story: parsing for extraction, tone calibration, template system, handling edge cases.
- **Lead gen path (3):** Could open-source the template engine. Blog post about building it. Direct demo to client.

**Pivot suggestion:** Build the proposal engine as a private tool first. If it saves 5+ hours/week, consider packaging as a product.

### Example 2: Write up a past case study — "Client migration from proprietary AI to open-source LLM"

User: AI consultant who migrated a client from GPT-4 to a self-hosted open-source LLM, saving $12k/month in API costs. Has NDA permission to write a sanitized version.

**Evaluation:** BUILD (A, 4.6/5.0)

- **Niche signal (5):** Exactly what AI consulting clients want to see — cost optimization, migration expertise, open-source competency.
- **Client demo value (5):** Blog post format. Client reads it in 5 minutes. Clear before/after.
- **Metrics potential (5):** $12k/month savings, latency comparison, accuracy comparison. Concrete numbers.
- **Uniqueness (4):** Real migration case studies are rare. Most content is theoretical.
- **Time to ship (5):** 2-3 days to write, format, and publish. NDA scrubbing takes 1 day.
- **STAR story (5):** Complex trade-off: accuracy drop vs cost savings. Decision framework, testing methodology, client buy-in process.
- **Lead gen path (4):** SEO for "GPT-4 to open-source migration cost savings." LinkedIn post with key numbers. Include in every AI consulting proposal.

**Delivery plan:**
- Day 1: Outline + NDA scrubbing + client approval request
- Day 2: Draft + metrics verification
- Day 3: Polish + publish on LinkedIn + personal blog + include in `article-digest.md`

### Example 3: Open-source tool — "Yet another React state management library"

User: Full-stack freelancer targeting general web app development. Proposes building a new state management library.

**Evaluation:** SKIP (D, 1.9/5.0)

- **Niche signal (1):** State management is a solved problem with 10+ mature libraries. Does not align with user's target niches.
- **Client demo value (2):** Developers would need to try it to understand the value. Non-technical clients won't care.
- **Metrics potential (1):** Bundle size, render performance — marginal improvements over existing options.
- **Uniqueness (1):** Extremely saturated space. New entries need 100x differentiation or a major ecosystem shift.
- **Time to ship (1):** Minimum viable library: 6 weeks. Documentation, examples, comparison benchmarks: 10+ weeks.
- **STAR story (2):** Story is "I solved a technical problem I gave myself." No client context, no real trade-offs.
- **Lead gen path (1):** GitHub stars are the main metric. Extremely hard to gain traction without a major backer or viral post.

**Alternative recommendation:** Instead of building a new library, build an opinionated starter kit for the user's most common project type (Next.js + Tailwind + Prisma + basic auth + Stripe integration). Same technical challenge (architecture, DX, documentation) but generates direct value: faster project starts, consistent quality across client work, and a concrete deliverable to show potential clients.

## Anti-Patterns

| Anti-pattern | What it looks like | How to avoid |
|-------------|-------------------|-------------|
| **Shiny object syndrome** | Scoring every idea 4+ because it's technically interesting | Anchor every score to "does this help land my target clients?" If the answer is no, score it 1 on niche signal. |
| **Effort blindness** | Recommending a 3-month project because it "could be huge" | Time to ship has a 12% weight for a reason. Long projects must compensate with extremely high niche signal and demo value. |
| **No niche anchoring** | Evaluating without reading _profile.md first | Step 0 is mandatory. Without niches, the evaluation is meaningless. |
| **Building before selling** | Recommending BUILD with no distribution plan | Every BUILD must include how clients discover it. No discovery path = hobby, not portfolio. |
| **Perfect-project paralysis** | Over-scoring hypothetical completeness while ignoring shipping effort | Use the 80/20 plan. If the MVP takes more than 2 weeks, scope it down. |
| **Stale proof points** | Duplicating what's already in article-digest.md or profile.md | Check existing proof points first. Marginal value of another case study in the same niche is low. |
| **Tech-forward, client-backward** | Scoring high on technical elegance without checking if clients care | Ask: "Has a client ever asked for this?" If the answer is never, it's a personal project, not a portfolio investment. |
| **NDA as excuse** | Rejecting a project because "it's client work and I can't share it" | Most client work can be sanitized. Specific numbers can be normalized ($12k → "mid-five figures"). Architecture patterns are shareable. Generic frameworks are shareable. |
| **The one-project fallacy** | Thinking one project will transform the pipeline | Portfolio is cumulative. A 3-week project that generates 2 leads is better than a 6-month project that generates 5 leads — because you could ship two 3-week projects in the same time. |

## Global Rules Applied

- **Read source files first.** Never evaluate without reading `_profile.md`, `config/profile.yml`, and `article-digest.md`.
- **Cite your sources.** Every score must be traceable to specific lines.
- **Be direct.** No fluff. The user is deciding whether to invest weeks of their time.
- **80/20 rule.** Timebox the evaluation itself — under 5 minutes of reading + 2 minutes of scoring.
