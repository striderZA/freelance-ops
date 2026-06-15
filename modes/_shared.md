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

## Scoring System

The lead evaluation uses 6 blocks (A-F) with a global score of 1-5. Block G is a separate legitimacy tier (see `modes/blocks/lead-blocks.md`).

| Dimension | What it measures |
|-----------|-----------------|
| Match with profile | Skills, experience, proof points, portfolio alignment |
| Niche fit | How well the lead maps to the user's target niches (from _profile.md) |
| Rate strategy | Target rate (from `config/rates.yml`) vs market vs lead budget |
| Client / platform signals | Payment history, hire rate, repeat-hire pattern, country risk |
| Proposal angle | Differentiators, social proof, available proof points |
| Engagement & risk | Terms (IP, NDA, milestones, escrow, kill fee), red flags |
| **Global** | Weighted average of above |

**Score interpretation:**
- 4.5+ → Strong match, recommend proposing immediately
- 4.0-4.4 → Good match, worth proposing
- 3.5-3.9 → Decent but not ideal, propose only if specific reason
- Below 3.5 → Recommend against proposing (see Ethical Use in AGENTS.md)

**Score is NOT the only gate.** Block G (Legitimacy) is a separate tier that can hard-stop a proposal regardless of score:
- `verified` → proceed normally
- `caution` → proceed with eyes open; flag the specific concerns in the proposal
- `likely-scam` → DO NOT PROPOSE. The score is irrelevant.

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
