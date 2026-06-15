# Mode: patterns -- Win/Loss Pattern Analysis

## Purpose

Analyze all tracked leads to find patterns in outcomes and surface actionable insights. Identifies what's working (niches, remote policies, score ranges, client types) and what's wasting time (geo-restricted roles, platform mismatches, low-score leads, recurring blocker types).

This mode helps answer questions like:
- Which niche has the highest conversion rate from evaluation to contract?
- Do global-remote leads convert better than geo-restricted ones?
- Is there a score threshold below which no lead ever converts?
- Which hard blockers recur most often?
- Are certain platforms producing more dead ends than viable leads?

## When to Use

Run this mode when:
- The user asks "why am I not converting more leads?" or "what's going wrong with my pipeline?"
- The user has at least 5 leads past the `New`/`Qualified` stage with clear outcomes
- The user explicitly says "analyze patterns" or "run pattern analysis"
- After a batch of evaluations, as a periodic health check on targeting strategy

Do NOT run this mode when:
- The tracker is empty or has only `New`/`Qualified` entries
- The user pastes a single lead URL or asks for evaluation (use `lead` or `auto-pipeline`)
- The user asks for a comparison of active options (use `leads`)

## Inputs

- `data/applications.md` — Lead tracker (analyze-patterns.mjs reads this file; if absent, falls back to `applications.md` in the project root)
- `reports/` — Individual evaluation reports, each containing a `## Machine Summary` section with YAML fields (archetype, hard_stops, soft_gaps, remote_policy, etc.)
- `config/profile.yml` — User profile (name, niches, rate floor)
- `modes/_profile.md` — User niches, positioning, exclusions (NEVER edited for system defaults)
- `config/platforms.yml` — Scanner config (for filter-update recommendations)

## Minimum Threshold

Before running any analysis, check: does `data/applications.md` have at least 5 entries with a status beyond `Evaluated` (i.e., any status other than `Evaluated`)?

Count entries whose status is one of: `Proposed`, `Negotiating`, `Contracted`, `In Progress`, `Delivered`, `Invoiced`, `Paid`, `Reviewed`, `Rejected`, `Ghosted`, `Withdrew`, `Disputed`, `SKIP`.

If fewer than 5, tell the user:

> "Not enough data yet -- {N}/5 leads have progressed beyond evaluation. Keep qualifying and proposing, and come back when you have more outcomes to analyze."

Exit gracefully without running the script or generating a report.

## Step 1 — Run Analysis Script

Execute:

```bash
node analyze-patterns.mjs
```

The script outputs structured JSON to stdout. Parse it fully.

### CLI Flags

| Flag | Effect |
|------|--------|
| `--summary` | Print human-readable tables instead of JSON |
| `--min-threshold N` | Override the minimum-outcomes threshold (default: 5) |
| `--self-test` | Run the Machine Summary parser self-test, then exit |

### JSON Output Fields

| Key | Contents |
|-----|----------|
| `metadata` | Total entries, date range, analysis date, counts by outcome (`positive`, `negative`, `self_filtered`, `pending`) |
| `funnel` | Count per normalized status stage (keys vary by tracker content) |
| `scoreComparison` | Per-outcome-group: average score, min score, max score, count |
| `archetypeBreakdown` | Per-archetype: total leads, count per outcome, conversion rate (%) — sorted by total descending |
| `blockerAnalysis` | Most frequent hard blocker types (geo-restriction, stack-mismatch, seniority-mismatch, onsite-requirement, other) with frequency and percentage of all leads |
| `remotePolicy` | Per-remote-policy bucket (global remote, regional remote, geo-restricted, hybrid/onsite, unknown): totals, outcomes, conversion rate |
| `companySizeBreakdown` | Per-size bucket (startup, scaleup, enterprise, unknown): totals, outcomes, conversion rate |
| `scoreThreshold` | Recommended minimum score (data-driven floor based on lowest-scoring positive outcome) plus reasoning |
| `techStackGaps` | Top 15 most frequent technology keywords found in hard-stop gaps of negative/self-filtered outcomes |
| `recommendations` | 0-5 actionable items, each with action text, reasoning, and impact level (`high` or `medium`) |

If the script returns `error` in its output, display the error message and exit without generating a report.

### How the Script Works (for accurate interpretation)

The script:

1. Reads every row from `data/applications.md`, parsing the table columns
2. Extracts the report path from each row's Report link column
3. For each report that exists, reads the `## Machine Summary` YAML block to extract archetype, gaps (hard_stops/soft_gaps), remote policy, seniority, and company size
4. Falls back to regex extraction from the report body when no Machine Summary exists
5. Normalizes each entry's status using a bilingual alias table (English + Spanish)
6. Classifies the outcome into one of four groups (see Outcome Classification below)
7. Computes:
   - Funnel distribution across all normalized statuses
   - Score statistics grouped by outcome
   - Archetype conversion rates
   - Blocker frequency (extracted from hard-stop gaps in reports)
   - Remote policy conversion (classified via keyword matching on the Remote field)
   - Company size conversion (classified via headcount ranges or keywords)
   - Tech stack gap frequency (extracted from gap descriptions in negative/self-filtered outcomes)
   - Score threshold analysis (lowest score among positive outcomes)
   - Actionable recommendations based on data thresholds

## Outcome Classification

The script classifies each tracked entry into one of four outcome groups. This determines which entries contribute to positive vs negative pattern detection.

### Mapping: Freelance-Ops States to Script Outcomes

| Outcome | Statuses in tracker | Script interprets as | Meaning |
|---------|---------------------|---------------------|---------|
| `positive` | `Proposed`, `Negotiating`, `Contracted`, `In Progress`, `Delivered`, `Invoiced`, `Paid`, `Reviewed` | `applied` / `responded` / `interview` / `offer` | Lead progressed toward or through paid work |
| `negative` | `Rejected`, `Ghosted`, `Withdrew`, `Disputed` | `rejected` / `discarded` | Lead ended without converting |
| `self_filtered` | `SKIP`, `Discarded` (when user-initiated) | `skip` | User chose not to pursue |
| `pending` | `New`, `Qualified`, `Evaluated` | `evaluated` | Still in pipeline, no outcome |

### Internal Status Normalization

The script normalizes status values through an internal alias table. If your tracker uses non-standard status variants, the entry will map to `pending` and won't contribute to pattern detection. The known aliases are:

- `Evaluada`, `Condicional`, `Hold`, `Evaluar`, `Verificar` → `evaluated`
- `Aplicado`, `Enviada`, `Aplicada`, `Sent` → `applied`
- `Respondido` → `responded`
- `Entrevista` → `interview`
- `Oferta` → `offer`
- `Rechazado`, `Rechazada` → `rejected`
- `Descartado`, `Descartada`, `Cerrada`, `Cancelada` → `discarded`
- `No aplicar`, `No_aplicar`, `Monitor`, `Geo blocker` → `skip`

Entry statuses not in this table pass through as-is. The outcome classification then checks the resulting normalized status against its rule set. If no rule matches, the outcome is `pending`.

## Step 2 — Generate Report

Write a full report to `reports/pattern-analysis-{YYYY-MM-DD}.md` (never overwrite an existing file with the same date).

### Report Structure

```markdown
# Pattern Analysis -- {YYYY-MM-DD}

**Leads analyzed:** {total}
**Date range:** {from} to {to}
**Outcomes:** {positive} positive, {negative} negative, {self_filtered} self-filtered, {pending} pending

---

## Conversion Funnel

Show each status present in the tracker with count and percentage of total.

| Stage | Count | % |
|-------|-------|---|
| New | X | X% |
| Qualified | X | X% |
| Proposed | X | X% |
| Negotiating | X | X% |
| Contracted | X | X% |
| Delivered | X | X% |
| Paid | X | X% |
| Rejected | X | X% |
| Ghosted | X | X% |
| Withdrew | X | X% |
| SKIP | X | X% |
| **Total** | **X** | **100%** |

Order stages from most-to-least advanced through the pipeline. Include a total row.

### Interpreting the Funnel

- A wide top (New/Qualified) with a narrow bottom (Contracted/Paid) is normal — expect 10-30% conversion per stage
- A large SKIP or Discarded count suggests filtering needs tightening
- A large Ghosted count suggests follow-up cadence may need adjustment

## Score vs Outcome

Examine whether your scoring system predicts outcomes well.

| Outcome | Avg Score | Min | Max | Count |
|---------|-----------|-----|-----|-------|
| Positive | X.X/5 | X.X | X.X | X |
| Negative | X.X/5 | X.X | X.X | X |
| Self-filtered | X.X/5 | X.X | X.X | X |
| Pending | X.X/5 | X.X | X.X | X |

If the average score for positive outcomes is close to or overlaps with the average for negative outcomes, the scoring model lacks predictive power for this data set.

## Archetype Performance

Show conversion rate by archetype. Archetypes come from the `## Machine Summary` YAML block in each evaluation report.

| Archetype | Total | Proposed+ | Contracted | Conversion Rate |
|-----------|-------|-----------|------------|-----------------|
| AI Platform Engineer | 12 | 8 | 3 | 25.0% |
| Full-Stack Developer | 8 | 4 | 1 | 12.5% |
| Data Infrastructure | 5 | 2 | 0 | 0.0% |

**Best:** AI Platform Engineer — 25% conversion (3 contracts from 12 leads)
**Worst:** Data Infrastructure — 0% conversion (0 contracts from 5 leads)

Highlight the best-performing archetype (highest conversion rate, minimum 2 leads) and the worst.

### Interpreting Archetype Performance

- Archetypes with high volume but zero conversion suggest a targeting mismatch
- Archetypes with low volume but high conversion may be worth investing in (more leads)
- Archetypes with high volume and high conversion are your core — double down

## Top Blockers

Frequency table of hard blocker types extracted from evaluation reports' `hard_stops` field and the Gaps table.

| Blocker Type | Frequency | % of All Leads |
|--------------|-----------|----------------|
| geo-restriction | 7 | 35% |
| stack-mismatch | 4 | 20% |
| seniority-mismatch | 2 | 10% |
| onsite-requirement | 2 | 10% |
| other | 3 | 15% |

### Interpreting Blockers

- A high geo-restriction percentage (>20%) means location filters in scanner config are too loose
- A high stack-mismatch percentage (>15%) means the scanner's keyword or title filters are catching the wrong roles
- A high onsite-requirement percentage suggests the scanner is pulling hybrid/office roles that don't match your remote preference

## Remote Policy Patterns

Shows conversion rate by how location-restricted the lead was.

| Policy | Total | Positive | Conversion Rate |
|--------|-------|----------|-----------------|
| Global remote | 8 | 4 | 50.0% |
| Regional remote | 6 | 2 | 33.3% |
| Geo-restricted | 5 | 0 | 0.0% |
| Hybrid/onsite | 3 | 1 | 33.3% |
| Unknown | 2 | 0 | 0.0% |

### Interpreting Remote Patterns

- 0% conversion on geo-restricted leads means those evaluations were wasted effort — tighten platform filters
- Global remote leads typically convert better but may have more competition

## Tech Stack Gaps

Most common missing skills found in hard-stop gaps of negative and self-filtered outcomes.

| Skill | Frequency |
|-------|-----------|
| Python | 5x |
| AWS | 4x |
| TypeScript | 3x |
| React | 3x |
| Kubernetes | 2x |

If a skill appears 3+ times, consider whether it's worth acquiring or whether the scanner should filter out roles requiring it.

## Recommended Score Threshold

The data-driven minimum score to pursue a lead.

> **Recommended threshold:** X.X/5
> **Reasoning:** No lead below X.X/5 progressed to a positive outcome across {N} total leads. Leads below this threshold were wasted evaluation effort.
> **Positive score range:** X.X — X.X

If there are zero positive outcomes, state: "No positive outcomes yet. Continue evaluating and collecting data."

## Recommendations

Numbered list of recommendations generated by the analysis script, with impact labels.

1. **[HIGH]** Tighten location filters in config/platforms.yml -- 35% of leads hit a geo-restriction blocker
   Reasoning: 7 of 20 leads were location-restricted. These evaluations produced no positive outcomes.

2. **[HIGH]** Filter out roles requiring Python as primary stack -- 20% hit stack mismatch
   Reasoning: Core stack gaps (Python, AWS, TypeScript) are the most common technical blockers in negative outcomes.

3. **[MEDIUM]** Set minimum score threshold at 3.5/5 before generating proposals
   Reasoning: No positive outcomes below 3.5/5. Scores below this are wasted effort.

4. **[MEDIUM]** Double down on "AI Platform Engineer" roles (25% conversion rate)
   Reasoning: 3 of 12 leads in this archetype led to contracts — the highest conversion rate.

## Step 3 — Present Summary

After writing the report file, present the key findings as a concise chat summary.

Use this format:

```
## Pattern Analysis — {date}

Analyzed {total} leads from {from} to {to}

### Top Recommendations

1. [{impact}] {action}
   {reasoning}
2. [{impact}] {action}
   ...
{N}. [{impact}] {action}
   {reasoning}

### At a Glance

- **Conversion rate:** {N}% of leads with clear outcomes turned positive
- **Best niche:** {niche} ({N}% conversion across {N} leads)
- **Biggest blocker:** {blocker} ({N}% of all leads)
- **Score threshold:** {X}/5 is the data-driven cutoff
- **Worst remote policy:** {policy} ({N}% conversion across {N} leads)

Full report: `reports/pattern-analysis-{date}.md`

Want me to apply any of these recommendations?
```

If the script returned zero recommendations, present the at-a-glance section only and end with:

> "No strong patterns emerged yet. Keep evaluating leads — patterns become visible after 10+ outcomes."

## Step 4 — Offer to Apply Recommendations

Present the application options to the user:

> "Want me to apply any of these recommendations? I can:
> - Update `config/platforms.yml` to filter out geo-restricted or low-conversion roles
> - Set a score threshold in `modes/_profile.md` for proposal generation
> - Adjust niche targeting based on what's converting
> - Add tech stack exclusions for roles that consistently mismatch
> - Set a minimum-score policy in `config/profile.yml`
>
> Just say which ones, or 'all' to apply everything."

### Applying Changes

When the user agrees to specific recommendations:

- **Platform filter changes:** edit `config/platforms.yml` — change `title_filter.positive`, `title_filter.negative`, or `location_filter` keys
- **Niche targeting changes:** edit `modes/_profile.md` — update the `niches` list or `positioning_narrative` based on what's converting
- **Score threshold:** add to `config/profile.yml` under a `patterns.score_threshold` key:
  ```yaml
  patterns:
    score_threshold: 3.5
  ```
- **Tech stack exclusions:** add to `modes/_profile.md` under an `exclusions` key:
  ```yaml
  exclusions:
    tech_stacks:
      - Python-heavy
      - Kubernetes-primary
  ```
- **Remote policy changes:** edit `config/platforms.yml` — add `remote: global` or `remote: any` to filter out geo-restricted postings

**RULE:** Never edit `modes/_shared.md` for user-specific changes. User customizations always go in `modes/_profile.md` or `config/profile.yml`.

### When the User Disagrees

If the user says a recommendation doesn't apply or isn't useful, record their reasoning in `modes/_profile.md` under a `patterns.overrides` section so the system learns:

```yaml
patterns:
  overrides:
    - recommendation: "Tighten location filters"
      reason: "I'm willing to relocate for the right role"
      date: 2026-06-15
```

## Cadence

Run this mode periodically (monthly or after every 20 evaluations) to track whether targeting adjustments are improving conversion rates. Compare successive reports to measure:

- Is the geo-restriction percentage decreasing?
- Is the best-performing archetype's conversion rate improving?
- Is the score threshold rising (indicating more selective targeting)?
- Are tech stack gaps shifting as the user upskills or adjusts filters?
