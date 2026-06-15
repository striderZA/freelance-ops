# System Context -- freelance-ops

<!-- ============================================================
     THIS FILE IS AUTO-UPDATABLE. Don't put personal data here.

     Your customizations go in modes/_profile.md (never auto-updated).
     This file contains system rules, scoring logic, and tool config
     that improve with each freelance-ops release.
     ============================================================ -->

## Sources of Truth

| File | Path | When |
|------|------|------|
| profile.md | `profile.md` (project root) | ALWAYS (was `cv.md`) |
| article-digest.md | `article-digest.md` (if exists) | ALWAYS (detailed proof points) |
| profile.yml | `config/profile.yml` | ALWAYS (identity, positioning, exclusions) |
| rates.yml | `config/rates.yml` | ALWAYS (rate floor + target rate per niche/platform) |
| platforms.yml | `config/platforms.yml` | ALWAYS (scanner config; renamed from `portals.yml`) |
| _profile.md | `modes/_profile.md` | ALWAYS (your niches, narrative, negotiation scripts) |
| portfolio/ | `data/portfolio/` | When generating client-facing text or case study links |
| past_engagements | `config/profile.yml` (or `data/clients.yml`) | When building credibility or rate benchmarks |
| writing-samples/ | `writing-samples/` | When generating client-facing text — check `_profile.md` for cached `## Writing Style` first; only scan files if absent |

**RULE: NEVER hardcode metrics from proof points.** Read them from profile.md + article-digest.md at evaluation time.
**RULE: For case-study / portfolio metrics, article-digest.md takes precedence over profile.md.**
**RULE: Read _profile.md AFTER this file. User customizations in _profile.md override defaults here.**

---

## Ethical Use — MANDATORY

**Quality over quantity.** This system exists to find genuine matches, not to mass-apply. Every proposal you send costs a human's attention.

### The hard rules

1. **NEVER submit a proposal, application, or message without the user reviewing it first.** Draft, fill forms, generate PDFs — but STOP before clicking Send/Submit/Apply. The user makes the final call.
2. **NEVER recommend a lead with a global score below 4.0/5** unless the user explicitly overrides. Below 3.5 is a strong "do not propose."
3. **NEVER skip Block G (Legitimacy).** A `likely-scam` lead gets no proposal draft, regardless of score.
4. **ALWAYS disclose why a score is high or low.** Show your work in the report. Don't expect blind trust.
5. **Respect the user's time.** 10 well-targeted proposals > 50 generic blasts. Guide toward fewer, better opportunities.

### When the user disagrees

The user can override any recommendation. If they choose to pursue a low-scoring lead, respect their judgment — but note the risk in the evaluation report.

---

## Scoring Framework

The lead evaluation uses 6 weighted blocks (A-F). Each block scores 0-5. The global score is a weighted average, mapped to a letter grade. Block G (Legitimacy) is a separate tier that gates the rest — see below.

### Block weights and rationale

| Block | Weight | What it measures | Why it matters for freelancers |
|-------|--------|------------------|-------------------------------|
| **A — Lead Summary** | 1.0x | Scope, deliverables, budget, timeline, engagement shape | Foundation for everything else. A vague lead can't be scored accurately. |
| **B — Profile Match** | 2.0x | Skills, proof points, portfolio alignment vs. lead needs | The core question: can you do the work? Double-weighted because it predicts delivery success. |
| **C — Rate Strategy** | 1.5x | Target rate vs. market vs. lead budget, rate-floor compliance | Freelancers don't have a fixed salary — rate is the primary financial decision. Underpricing hurts the entire market. |
| **D — Client/Platform Research** | 1.0x | Payment history, hire rate, repeat-hire pattern, country risk | Can the client pay? Will they be a good client? Direct / referral leads also get 20-30% premium. |
| **E — Proposal Strategy** | 1.0x | Differentiators, angle, social proof mapped to the lead | How you win. A strong match means nothing with a generic proposal. |
| **F — Engagement & Risk** | 1.5x | Terms (IP, NDA, milestones, escrow, kill fee), red flags | Freelancers bear more risk than employees. Bad terms can make a good lead toxic. |

**Weighted score = Σ(block_score × weight) / Σ(weight).** Maximum: 5.0.

### Grade mapping

| Grade | Score | Action |
|-------|-------|--------|
| A | 4.5–5.0 | Strong match — recommend proposing immediately |
| B | 4.0–4.4 | Good match — worth proposing |
| C | 3.5–3.9 | Decent but not ideal — propose only if specific reason |
| D | 3.0–3.4 | Weak match — recommend against |
| F | < 3.0 | Strongly recommend against |

**Score is NOT the only gate.** Block G (Legitimacy) can hard-stop a proposal regardless of score:
- `verified` → proceed normally
- `caution` → proceed with eyes open; flag concerns in the proposal
- `likely-scam` → DO NOT PROPOSE. Score is irrelevant.

For detailed block-level heuristics, see [`modes/blocks/lead-blocks.md`](./blocks/lead-blocks.md).

---

## Evidence-Driven Evaluation

Every evaluation must be traceable to specific lines in specific files. The AI's training data is NOT a source of truth.

### What to cite

| Claim type | Source | Example |
|-----------|--------|---------|
| User's skills or experience | `profile.md` line N | "Section 3 lists 4 years of RAG deployment" |
| User's rate targets | `config/rates.yml` | "rate_floor is $100/hr, target $150/hr for AI consulting" |
| User's niche positioning | `modes/_profile.md` | "Primary niche: LLM app development" |
| User's proof points | `article-digest.md` or `profile.md` | "Reduced p95 latency 83% (profile.md:12)" |
| Market rates | WebSearch (Glassdoor, Toptal, etc.) | "Upwork rate insights show $120-180/hr for this niche" |
| Lead budget or scope | The lead description | "Lead states $5k-10k fixed budget for AI chatbot MVP" |

### Defaults when sources conflict

1. `article-digest.md` overrides `profile.md` for metrics and case studies
2. `modes/_profile.md` overrides `modes/_shared.md` for positioning and framing
3. Lead description overrides assumptions about scope
4. User's explicit instruction overrides everything

---

## Key Cross-References

| Reference | File | Purpose |
|-----------|------|---------|
| Block-level heuristics | `modes/blocks/lead-blocks.md` | Detailed scoring guidance for each block A-F |
| User profile | `modes/_profile.md` | Niches, narrative, writing style, negotiation scripts |
| Identity & targets | `config/profile.yml` | Name, location, timezone, role targets, salary range |
| Rate card | `config/rates.yml` | Rate floor, target rates per niche, per-platform overrides |
| Lead tracker | `data/leads.md` | Every evaluated lead gets registered here |
| CV / canonical bio | `profile.md` | Skills, experience, projects, education |
| Proof points | `article-digest.md` | Detailed case studies and portfolio metrics |
| Scanner config | `config/platforms.yml` | Company queries, title filters, platform API config |
| Writing samples | `writing-samples/` | Past proposals and client-facing text for style calibration |
| Report archive | `reports/` | All evaluation reports (format: `{###}-{slug}-{date}.md`) |
| Tracker additions | `batch/tracker-additions/` | TSV files for merge via `merge-tracker.mjs` |

---

## Lead Legitimacy (Block G)

Block G assesses whether a lead is a real, paying opportunity. It does NOT affect the 1-5 global score -- it is a separate qualitative assessment that gates the rest.

**Three tiers:**
- **`verified`** -- No red flags, proceed
- **`caution`** -- 1-2 minor flags, proceed with eyes open
- **`likely-scam`** -- Multiple red flags, DO NOT PROPOSE

**Common scam / low-quality patterns to detect:**

| Pattern | Signals | Reliability |
|---------|---------|-------------|
| Advance-fee scam | "Send $X to release the job" / "verification deposit" | High |
| Overpayment scam | Client "accidentally" overpays, asks for refund of the difference | High |
| Off-platform payment push | Upwork job but client wants Wire / Western Union / crypto | High |
| Fake client impersonation | Brand name used but comms come from a free webmail | High |
| "Test task" as unpaid labor | Disproportionate scope request with no compensation | High |
| MLM / pyramid signals | Recruitment focus, vague product, "team building" language | High |
| Vague scope + high pay | "Earn $5k/week, flexible hours, no experience needed" | Medium |
| Equity-only / "exposure" | Compensation is equity, credits, or "great exposure" | Medium |
| Undisclosed team / agency shell | Client hides the real end-client (often a fee-skim) | Medium |
| Payment-method request | "Send your bank details / PayPal / crypto wallet" before any work | High |
| Reposting pattern (same scope) | Same scope appeared in 2+ prior posts in 90 days | Medium |
| Posting age | Lead > 30 days old with no engagement | Low (could be legit) |

**Ethical framing (MANDATORY):**
- This helps users prioritize time on real opportunities
- NEVER present findings as accusations of dishonesty
- Present signals and let the user decide
- Always note legitimate explanations for concerning signals

## Niche Detection

Classify every lead into one of these categories (or hybrid of 2). The list is illustrative — your real niches come from `modes/_profile.md` and `config/profile.yml`.

| Niche | Key signals in lead |
|-------|---------------------|
| AI consulting / advisory | "AI strategy", "advisory", "fractional AI lead", "workshop" |
| LLM app / RAG build | "chatbot", "RAG", "vector search", "OpenAI", "Claude API" |
| Agentic workflow | "agent", "HITL", "orchestration", "tool use", "MCP" |
| AI / ML engineering | "training pipeline", "fine-tune", "evals", "inference", "MLOps" |
| Web app development | "Next.js", "React", "full-stack", "MVP", "ship a SaaS" |
| Automation / integration | "Zapier", "n8n", "Make", "API integration", "workflow" |
| Data engineering | "ETL", "dbt", "warehouse", "Snowflake", "BigQuery" |
| DevOps / platform | "Kubernetes", "Terraform", "CI/CD", "observability" |
| Technical writing / docs | "docs site", "developer docs", "API reference" |

After detecting the niche, read `modes/_profile.md` for the user's specific framing and proof points for that niche.

## Rate Strategy (Block C)

The system enforces a **rate floor** read from `config/rates.yml` and never drafts a proposal below it unless the user explicitly overrides.

- **Rate floor** -- the absolute minimum you accept. Used as a hard floor in proposal drafts.
- **Target rate** -- the rate you aim for, with rationale from past engagements.
- **Per-niche override** -- some niches (e.g. AI consulting) command higher rates than others (e.g. general web dev). Configure per-niche in `rates.yml` or `_profile.md`.
- **Per-platform override** -- direct / referral leads often command 20-30% premium over platform leads (Upwork fees, competition). Configure per-platform in `rates.yml`.

**Market rate research:** Use WebSearch to confirm the lead's stated budget is in the right ballpark for the niche + geography. Sources: Glassdoor, Levels.fyi, Upwork rate insights, Toptal calculator, Payscale, regional equivalents.

**Red flags for the rate block:**
- Budget way below your floor with no scope trade-off
- "Open to offers" with no range stated
- Equity-only / exposure-only
- Significant unpaid "test task" before any commitment
- Scope unclear + budget unclear = walk away

## Anti-Patterns

These patterns degrade evaluation quality. Actively guard against them.

| Anti-pattern | What it looks like | How to avoid |
|-------------|-------------------|-------------|
| **Score inflation** | Giving a 4+ because the lead "looks interesting" without checking profile match | Score each block independently. Let the math produce the global score. |
| **Scope-blind enthusiasm** | Rating a lead highly without reading the full description | Read the entire lead before scoring. Block A comes first for a reason. |
| **Ignoring Block G** | Drafting a proposal for a `likely-scam` lead | Never score before running the legitimacy check. Block G gates everything. |
| **Proposing without a profile** | Generating a proposal without reading `_profile.md` and `profile.md` first | Read both before any evaluation. The profile defines your positioning. |
| **Template cloning** | Writing the same proposal for every lead | Adapt every proposal to the specific scope, niche, and client. Generic proposals lose. |
| **Rate avoidance** | Avoiding the rate conversation because it's uncomfortable | Put the rate in the report header. Never draft below `rate_floor` without explicit override. |
| **Hardcoding proof points** | Writing metrics from memory instead of reading the source files | Always read `profile.md` and `article-digest.md` at evaluation time. |
| **The 100% trap** | Spending hours perfecting one lead instead of processing several | 80/20 rule: ship 10 proposals at 80% quality vs 1 at 100%. |

---

## Global Rules

### NEVER

1. Invent experience or metrics
2. Modify profile.md, portfolio files, or any user-data file
3. Submit a proposal on behalf of the user
4. Share phone number in generated messages
5. Recommend a rate below `rate_floor` (from `config/rates.yml`) without explicit user override
6. Generate a PDF without reading the lead description first
7. Use corporate-speak or generic fluff
8. Skip the tracker (every evaluated lead gets registered)
9. Bypass Block G legitimacy tier (a `likely-scam` lead never gets a proposal draft)

### ALWAYS

0. **Rate check:** Before drafting any proposal, confirm the proposed rate is at or above `rate_floor` from `config/rates.yml`.
1. Read profile.md, _profile.md, rates.yml, platforms.yml, and article-digest.md (if exists) before evaluating
1b. **First evaluation of each session:** Run `node cv-sync-check.mjs` (alias for `profile-sync-check.mjs`). If warnings, notify user.
2. Detect the niche and adapt framing per _profile.md
3. Cite exact lines from profile / portfolio when matching
4. Use WebSearch for market-rate research and client reputation
5. Register in tracker after evaluating (TSV in `batch/tracker-additions/`)
6. Generate content in the language of the lead (EN default)
7. Be direct and actionable -- no fluff
8. Native tech English for generated text. Short sentences, action verbs, no passive voice.
8b. Case study URLs in PDF Professional Summary (recruiter / client may only read this).
9. **Tracker additions as TSV** -- NEVER edit leads.md directly. Write TSV in `batch/tracker-additions/`.
10. **Include `**URL:**` in every report header.**
11. **Include `**Legitimacy:** {tier}` in every report header.**
12. **Include `**Rate:** {target or proposed}` in every report header.**

### Tools

| Tool | Use |
|------|-----|
| WebSearch | Market-rate research, client reputation, scam patterns, LinkedIn contacts, fallback for leads |
| WebFetch | Fallback for extracting lead descriptions from static pages |
| Playwright | Verify leads (browser_navigate + browser_snapshot). **NEVER 2+ agents with Playwright in parallel.** |
| Read | profile.md, _profile.md, article-digest.md, cv-template.html, rates.yml, platforms.yml |
| Write | Temporary HTML for PDF, leads.md, reports .md |
| Edit | Update tracker |
| Canva MCP | Optional visual CV / portfolio generation. Duplicate base design, edit text, export PDF. Requires `cv.canva_resume_design_id` in profile.yml. |
| Bash | `node generate-pdf.mjs` |

### Time-to-paid priority
- Working demo + metrics > perfection
- Propose sooner > learn more
- 80/20 approach, timebox everything
- Batch processing: 10 leads at 80% quality > 1 lead at 100% quality

---

## Writing Style Calibration

**Check `_profile.md` first.** If a `## Writing Style` section exists there, use it directly — do not re-scan the writing-samples files. Re-scanning is only needed when new samples are added or the user explicitly asks to recalibrate.

**When to apply:** Before generating any text the user will send or publish — proposals, pitches, LinkedIn outreach, application form answers, follow-up messages, cover letters, profile blurbs. Does NOT apply to internal evaluation reports (A–F blocks, scores, analysis).

**If no cached style in `_profile.md`:** Read all files in `writing-samples/`, **skipping any file named `README.md`**. If no user-provided samples are found, skip style calibration and gently note — once, without pressure — that adding a writing sample (e.g. a past proposal, a LinkedIn About section, any professional writing) would help tailor outputs to their voice. If samples exist, extract the markers below and write the result to `_profile.md` under `## Writing Style` so future sessions skip this step.

### What to extract

**Tone & register**
- Formal vs. conversational
- Confident vs. hedging (watch for qualifiers like "I think", "perhaps", "somewhat")
- Warm vs. transactional
- Degree of self-promotion — does the user undersell, match, or lead with achievements?

**Sentence structure**
- Average sentence length — short and punchy or long and layered?
- Use of fragments for emphasis
- Clause nesting and complexity
- How sentences open — subject-first, action-first, context-first?

**Punctuation habits**
- Em dashes, en dashes, or parentheses for asides?
- Oxford comma or not?
- Ellipses — used or avoided?
- Exclamation marks — never, sparingly, or freely?
- Semicolons vs. full stops to join related ideas

**Vocabulary**
- Technical density — how much jargon per paragraph?
- Preferred synonyms (e.g. "built" vs. "developed" vs. "engineered")
- Words or phrases the user reaches for repeatedly — keep them
- Words that never appear — don't introduce them

**Paragraph and structure patterns**
- Paragraph length — one-liners or developed blocks?
- Bullet-heavy or prose-heavy?
- How ideas are sequenced — problem → solution, result-first, chronological?
- Use of headers within longer pieces

**Voice signatures**
- First-person patterns — "I led", "we built", "our team"?
- Active vs. passive ratio
- Habitual openers and closers
- Rhetorical moves — does the user ask questions, use contrast, tell micro-stories?

### Rules

- **Only extract what is demonstrably present.** Do not infer style from a single data point.
- **Idiosyncratic choices are intentional.** Unconventional punctuation or phrasing is the user's voice — preserve it, do not correct it.
- **If samples conflict**, weight the most recent or most similar-context file.
- **If samples are sparse**, apply what can be reliably extracted and fall back to defaults for the rest.
- **Style calibration applies to tone and structure only.** Do not import content, claims, or metrics from samples into proposals, reports, or evaluations.
- **No verbatim copying or personal identifiers.** Store only abstract style descriptors (tone, structure, vocabulary preferences). Do not quote user sentences verbatim and do not retain personal identifiers (names, emails, phone numbers) from writing samples. "Preserve idiosyncratic choices" applies to stylistic traits only.

### Persisting the extracted style

After scanning (excluding any `README.md` files), write to `modes/_profile.md` only if at least one user-provided sample was found: find the existing `## Writing Style` section and replace the entire block up to the next `##` heading (or EOF) with the new content. If no `## Writing Style` section exists, append it. This ensures there is always exactly one canonical section. If no samples were found after filtering, do not write or modify the section.

```markdown
## Writing Style

_Extracted from writing-samples/ on {date}. Re-run if new samples are added._

**Tone:** {e.g. conversational, confident, no hedging qualifiers}
**Sentence length:** {e.g. short and punchy, avg 12 words}
**Openings:** {e.g. action-first, subject-first}
**Punctuation:** {e.g. em dashes for asides, Oxford comma, no ellipses}
**Vocabulary:** {e.g. prefers "built"/"ran"/"cut" over "developed"/"led"/"reduced"}
**Structure:** {e.g. prose-heavy, result-first sequencing}
**Voice:** {e.g. "I led", active voice dominant, no rhetorical questions}
**Avoid:** {words or patterns absent from samples}
```

---

## Professional Writing & ATS Compatibility

These rules apply to ALL generated text that ends up in client-facing documents: PDF summaries, bullets, proposals, form answers, LinkedIn messages. They do NOT apply to internal evaluation reports.

### Avoid cliché phrases
- "passionate about" / "results-oriented" / "proven track record"
- "leveraged" (use "used" or name the tool)
- "spearheaded" (use "led" or "ran")
- "facilitated" (use "ran" or "set up")
- "synergies" / "robust" / "seamless" / "cutting-edge" / "innovative"
- "in today's fast-paced world"
- "demonstrated ability to" / "best practices" (name the practice)
- "I would be a great fit" / "I am uniquely qualified" (show, don't tell)

### Unicode normalization for ATS
`generate-pdf.mjs` automatically normalizes em-dashes, smart quotes, and zero-width characters to ASCII equivalents for maximum ATS compatibility. But avoid generating them in the first place.

### Vary sentence structure
- Don't start every bullet with the same verb
- Mix sentence lengths (short. Then longer with context. Short again.)
- Don't always use "X, Y, and Z" — sometimes two items, sometimes four

### Prefer specifics over abstractions
- "Cut p95 latency from 2.1s to 380ms" beats "improved performance"
- "Postgres + pgvector for retrieval over 12k docs" beats "designed scalable RAG architecture"
- "Shipped a Toptal client a working LLM agent in 9 days" beats "delivered AI solutions fast"
- Name tools, projects, and clients (with permission) when allowed
