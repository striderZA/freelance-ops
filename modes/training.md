---
description: Evaluate a course or certification for freelance ROI — cost vs. rate, signal value, opportunity cost
argument-hint: "[course name or URL, optional cost]"
---

# Mode: training — Training & Course ROI Evaluation

## Purpose

Evaluate whether a course, certification, bootcamp, or learning investment makes financial and strategic sense for a freelancer. Unlike salaried employees who train to advance at one company, freelancers pay for training with billable hours they could have worked. The core question: **does this training earn back more than it costs, in either higher rates or more leads?** This mode produces a clear DO / DON'T DO / TIMEBOXED verdict with breakeven analysis, not a personality quiz.

## When to Use

| Trigger | Example |
|---------|---------|
| User wants to buy a course or cert and asks for a second opinion | "Should I get the AWS Solutions Arch cert?" |
| User is evaluating a costly bootcamp | "Is this $5k AI bootcamp worth it?" |
| User asks about free vs paid options for the same topic | "Free YouTube course vs $500 Udemy — which?" |
| User wants to compare two learning paths | "Coursera cert vs self-study — which is better ROI?" |
| Training is a prerequisite for a specific lead the user is pursuing | "Client wants someone with GCP cert — should I get it?" |

## Inputs

- **Course name** (required) — e.g., "AWS Certified Solutions Architect," "DeepLearning.AI TensorFlow Developer"
- **URL** (optional) — link to the course page for direct research
- **Cost** (optional) — if not provided, the system researches and estimates. Use the user's figure when given.
- **Time commitment** (optional) — weeks × hours/week. Defaults to a researched estimate if absent.
- **Lead context** (optional) — if the training is tied to a specific client or lead, note it for relevance scoring.

The system also reads (silently, at evaluation time):
- `config/rates.yml` — the user's rate floor and target rate per niche
- `modes/_profile.md` — current niches, narrative, skill gaps noted from past evaluations
- `profile.md` — existing certifications, education, and proof points
- `config/profile.yml` — target roles and location for relevance

## Output Format

Present the evaluation as a structured chat response (not a report file). Format:

```
## Training: {Course Name}

**Verdict:** DO / DON'T DO / TIMEBOXED

**Breakeven:** {X} billable hours at ${Y}/hr

### 6-Dimension Scorecard

| Dimension | Score (0-5) | Notes |
|-----------|-------------|-------|
| North Star alignment | X | {how it maps to target niche} |
| Client signal | X | {what clients think when they see it} |
| Time & effort | X | {weeks × hours/week} |
| Opportunity cost | X | {what billable work is displaced} |
| Quality & recency risk | X | {is content stale, too basic, weak brand} |
| Portfolio deliverable | X | {does it produce a demo artifact} |

**Overall score:** {X.X}/5

### Breakeven Analysis

- Cost: ${total cost}
- Hourly rate (target): ${rate}/hr → {cost/rate} breakeven hours
- Time investment: {W} weeks × {H} hrs/week = {total} hours
- Effective rate of training: ${cost / hours}/hr (negative earnings)
- **Recoup timeline:** {breakeven hours} hours of billable work at target rate

### Recommendation

{2-3 sentence verdict with clear action. If DO: suggest start date, weekly timebox,
and what to build alongside. If DON'T DO: suggest a better alternative. If TIMEBOUND:
max weeks and what to prioritize.}

### Next Steps

1. {action item 1}
2. {action item 2}
3. {action item 3}
```

## Workflow

### Step 0 — Gather course details

1. If the user provided a URL, fetch the course page — read syllabus, duration, price, instructor, reviews.
2. If the user provided only a name, research via WebSearch for: syllabus, typical duration, price range, market perception, reviews from professionals.
3. If the user provided cost, use it. Otherwise estimate from research (±20% as a range).
4. Normalize all findings into: course name, provider, cost, duration in hours, certificate type.

### Step 1 — Evaluate 6 dimensions

Score each dimension 0-5 independently. Do not let one dimension's score bleed into another.

#### Dimension 1: North Star alignment

Does this training move the user toward their stated freelance niches?

| Score | Condition |
|-------|-----------|
| 5 | Directly required for the user's primary niche |
| 4 | Strongly relevant to primary niche but not required |
| 3 | Relevant to secondary niche or adjacent skill |
| 2 | Tangential — might help in edge cases |
| 1 | Mostly unrelated to stated niches |
| 0 | Opposite direction — pulls focus away |

Check niches from `modes/_profile.md` and `config/profile.yml`. Cross-reference course topics.

#### Dimension 2: Client signal

What do freelance clients and platforms think when they see this credential?

| Score | Condition |
|-------|-----------|
| 5 | Industry-recognized cert that commands rate premiums (AWS SA Pro, Google PCA, PMP) |
| 4 | Well-known cert that opens doors (AWS SA Associate, CKA, CISSP) |
| 3 | Known but not rate-moving — more of a checkbox (CompTIA, entry-level cloud) |
| 2 | Obscure or low-brand provider — little client awareness |
| 1 | No signal — clients don't know or don't care |
| 0 | Negative signal — degree-mill, bad reputation |

Platform badge systems (Upwork Skill Certs, Toptal screening) often matter more than standalone certs. Factor this in.

#### Dimension 3: Time & effort

Total time investment, realistic for a freelancer who could be billing?

| Score | Condition |
|-------|-----------|
| 5 | ≤ 20 hours — can complete in a week of evenings |
| 4 | 20-50 hours — 1-2 weeks of focused effort |
| 3 | 50-100 hours — feasible over a month with weekend work |
| 2 | 100-200 hours — requires significant schedule sacrifice |
| 1 | 200-500 hours — part-time commitment for months |
| 0 | > 500 hours — full-time study commitment |

#### Dimension 4: Opportunity cost

What else could the user do with the time and money?

| Score | Condition |
|-------|-----------|
| 5 | No better alternative — best path to the skill |
| 4 | Good option, but free/cheaper alternatives exist |
| 3 | Several comparable alternatives exist |
| 2 | Free alternatives cover 70%+ of the content |
| 1 | Content freely available in official docs or OSS repos |
| 0 | Paying for what the vendor gives away for free |

Key heuristic: **Can the user learn this by building a real client project?** If yes, opportunity cost is high. If the training teaches something not learnable on the job (compliance, advanced theory), cost is lower.

#### Dimension 5: Quality & recency risk

Is the content up to date? Provider reputable? Level appropriate?

| Score | Condition |
|-------|-----------|
| 5 | Authoritative source, updated within 6 months, appropriate level |
| 4 | Reputable provider, minor recency concerns |
| 3 | Unknown provider but good reviews, or known provider with outdated materials |
| 2 | Known provider with outdated materials, weak reviews |
| 1 | Questionable provider, no updates in 2+ years, complaints |
| 0 | Scam or degree-mill — no real educational value |

Tech courses age fast. A 2021 Kubernetes cert is nearly worthless by 2026. Always check the last update date.

#### Dimension 6: Portfolio deliverable

Does the course produce a demonstrable artifact the user can show clients?

| Score | Condition |
|-------|-----------|
| 5 | Production-quality portfolio piece AND a recognized credential |
| 4 | Recognized credential you can display (badge, cert URL) |
| 3 | Course project you can put on GitHub, but guided/template-based |
| 2 | Only a certificate of completion (no badge, no project) |
| 1 | No deliverable — just watched videos |
| 0 | Actively produces nothing useful |

For freelancers, demonstrable output matters more than credentials. A course producing a real project is worth more than one that only grants a cert.

### Step 2 — Calculate breakeven

Breakeven = total cost / hourly rate (target).

The total cost includes:
- Tuition / course fee
- Exam fees (for certs, often $150-$300 separate from course cost)
- Renewal / maintenance fees (annual recert costs)

Do NOT include opportunity cost (lost billable hours) in the breakeven — that is captured in the time & effort dimension. The breakeven answers: **how many extra billable hours must the user work, at their target rate, just to pay for this training?**

If breakeven exceeds 40 hours (one week of billable work), flag it. If it exceeds 160 hours (one month), the training needs a strong justification.

### Step 3 — Assign verdict

Map the 6-dimension average score and breakeven to a verdict:

| Average score | Breakeven | Verdict |
|---------------|-----------|---------|
| ≥ 3.5 | Any | DO — strong training investment |
| ≥ 3.0 | < 40 hrs | DO — solid value |
| ≥ 2.5 | < 20 hrs | TIMEBOUND — worth doing efficiently |
| ≥ 2.0 | < 10 hrs | TIMEBOUND — only if very cheap/quick |
| < 2.0 | Any | DON'T DO — redirect to better alternative |
| Any | > 160 hrs | DON'T DO — too expensive for the return (unless the cert unlocks a specific high-value lead) |

For TIMEBOUND verdicts, specify a max timebox (suggested: 2-4 weeks depending on the training) and list what to prioritize.

### Step 4 — Write recommendation

Write 2-3 clear, actionable sentences:
- If DO: "Take this course. Allocate X hours/week for Y weeks. It directly supports your Z niche."
- If DON'T DO: "Skip this. Instead, [specific alternative]. The [reason — cost, time, weak signal] doesn't justify it."
- If TIMEBOUND: "Do this, but cap it at X hours total. Prioritize [specific modules or certifications]."

Then list 3 concrete next steps the user can take immediately.

## Edge Cases

| Case | Handling |
|------|----------|
| Free course | Evaluate normally. Breakeven is $0. Focus on opportunity cost (dimension 4) and time investment (dimension 3). Free ≠ worth doing. |
| Course is part of a bundle / subscription | Use the proportional cost. If the user already has the subscription (e.g., LinkedIn Learning, Pluralsight), cost = $0 for marginal courses. |
| Course has no fixed price (Pay What You Want) | Note the range. Evaluate at the median price. If the result is TIMEBOUND at median, note it becomes DO at the lower price point. |
| User provides only a URL and no context | Extract course name and details from the URL. Ask for cost if not found. Proceed with the evaluation — do not stall on missing details. |
| User asks about a cert they already hold (recertification) | Skip the 6 dimensions for the original cert. Focus on: cost of recert, time for recert study, whether the cert has depreciated since original issue. |
| Training is mandatory for a compliance requirement (HIPAA, SOC2, PCI) | Override — the training is necessary regardless of score. Note "compliance requirement" in the verdict and still provide the ROI analysis for transparency. |
| Training requires a prerequisite the user doesn't have | Flag the prerequisite and its own time/cost. Include it in the breakeven analysis. Suggest doing the prerequisite first or finding a combined track. |
| Course is in a language the user doesn't speak fluently | Flag language risk. Suggest confirming the language of instruction and materials. If the cert exam is in a different language, note additional risk. |
| Course content overlaps heavily with existing skills | Downgrade dimension 1 (North Star — low marginal value). If the user already knows 80%+, the training is mostly review. |
| Training is a full degree program (Master's, MBA) | Evaluate as training. But note that degrees are fundamentally different from courses — they carry multi-year commitment, structural life change, and different signaling. Add a note: "This is a degree program, not a course. The ROI calculus is fundamentally different. Consider dedicated career counseling." |
| No cost information available anywhere | Default to "unknown cost — cannot calculate breakeven." Note in the report. Score on the 5 other dimensions. The verdict caveat: "pending cost data." |
| Training promises a job or income guarantee | Treat with extreme skepticism. Score dimension 5 (quality) at 0 if job guarantees are prominent — they are a hallmark of predatory programs. Do not factor the guarantee into breakeven. |

## Examples

### Example 1: AWS Certified Solutions Architect — Associate

User says: "Should I get the AWS SAA cert? Cloud freelancer, DevOps work. $150 exam, no course needed — I use AWS daily."

**Verdict:** DO | **Breakeven:** $200 / $100 = 2 billable hours

**Scores:** North Star 5, Signal 4, Time 5, Opp Cost 4, Quality 4, Portfolio 4 → **4.3/5**

**Recommendation:** Do this. The $200 total cost (exam + practice tests) is trivial at a $100/hr rate. The cert can justify a $10-20/hr premium on cloud contracts. Study from AWS Skill Builder (free) + TD Dojo practice tests ($20). Schedule 3 weeks out.

**Next steps:**
1. Create AWS Skill Builder account, start free exam prep
2. Buy practice tests — score 85%+ on 3 full exams before booking
3. Schedule the exam 3 weeks out at Pearson VUE

### Example 2: $500 "AI Prompt Engineering Mastery" Bootcamp

User says: "I found this $500, 8-week AI bootcamp that teaches prompt engineering. Worth it?"

**Verdict:** DON'T DO

**Scores:**
- North Star alignment: 2 — prompt engineering is a small slice of AI freelancing
- Client signal: 1 — no recognized cert; clients want shipped products, not course completions
- Time & effort: 2 — 40 hours for content consumable in 5 hours of reading
- Opportunity cost: 1 — Anthropic docs, OpenAI cookbook, DSPy tutorials are free and more current
- Quality & recency: 2 — bootcamp likely recorded; AI changes weekly
- Portfolio deliverable: 1 — no cert, no project a client would care about

**Overall:** 1.5/5 | **Breakeven:** $500 / $50 = 10 billable hours | Effective rate: $12.50/hr

**Recommendation:** Skip this. The content is free from AI vendors directly. Build a small customer support bot with prompt chaining instead — 10 hours of building teaches more than 40 hours of watching, and you get a portfolio piece.

**Next steps:**
1. Read Anthropic and OpenAI prompting guides (free, 2 hours)
2. Build and deploy a customer support bot with prompt chaining
3. Put it in your portfolio as a live demo

### Example 3: Free YouTube Course vs $500 Instructor-Led Course

User says: "Pay $500 for the instructor-led Node.js course, or use the free YouTube playlist?"

**Verdict:** Depends on rate. At > $50/hr → DO (paid). At < $50/hr → TIMEBOUND (free).

**Analysis:** Both produce the same GitHub project. The paid version saves ~15-20 hours of searching for tutorials. At $100/hr, that's $1,500-2,000 saved vs $500 cost — net positive. At $30/hr, the saving is only $450-600 — barely break-even.

**Next steps (if paying):** Verify syllabus for your framework version. Timebox 3 weeks × 6 hrs/week. Build a real project alongside.

**Next steps (if free):** Curate 5-10 tutorials updated within 12 months. Build the same project. Set the same 3-week timebox.

## Anti-Patterns

| Anti-pattern | What it looks like | How to avoid |
|-------------|-------------------|-------------|
| **Cert collection** | Chasing certs for their own sake | Evaluate by client-signal dimension. If clients don't care, skip it. |
| **Tuition blindness** | Assuming expensive = good quality | Price is not a proxy for quality. Free vendor docs often beat paid third-party courses. |
| **FOMO enrollment** | "Deal ends in 48 hours!" or "Only 5 seats left!" | Legitimate training doesn't use scarcity tactics. Score quality at 1 or 0. |
| **Ignoring the output** | Judging by syllabus, not deliverable | Always ask: what will I have at the end to show a client? |
| **Degree reflex** | Completing every module, taking perfect notes | Skip what you know. Watch at 2x. Only do exercises that produce portfolio artifacts. |
| **Platform lock-in** | Overvaluing certs from your current stack | Diversifying into other platforms adds more client value than another cert on your existing stack. |
| **Recert neglect** | Ignoring renewal costs | Factor recert fees into breakeven over a 3-year horizon. |
| **Credentialism** | Believing the cert alone wins clients | Certs don't close deals. Case studies and shipped projects do. |
| **Scope creep** | "This course covers X, Y, and Z — perfect!" | Narrow, deep courses that produce one excellent project beat broad surveys. |