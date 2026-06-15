---
description: Process all pending URLs from the pipeline inbox (batch evaluation)
argument-hint: ""
---

# Pipeline Mode

## Purpose

Process all pending URLs stored in `data/pipeline.md` (the inbox) in a single batch run. For each URL, fetch the full job description, run the full A–F evaluation with Block G legitimacy gate, produce a structured report in `reports/`, and register a tracker TSV entry in `batch/tracker-additions/`. The PDF gate is configurable via `config/profile.yml` → `auto_pdf_score_threshold` (default: 3.0). When 3+ URLs are pending, dispatch parallel subagents to maximize throughput.

## When to Use

- User has accumulated multiple job URLs and says "process the pipeline" or "run the inbox"
- User pastes multiple URLs in a single message
- User runs `/freelance-ops pipeline` (or the CLI's slash command resolves to this mode)
- User says "evaluate all pending offers" or "batch process my queue"

Do NOT use this mode for a single lead or URL (use `modes/lead.md`) or for batch-processing multiple URLs in headless mode (use `batch/batch-runner.sh` + `modes/batch.md`).

## Inputs

- **From system (auto-read):**
  - `data/pipeline.md` — the inbox of pending URLs with their metadata
  - `modes/blocks/lead-blocks.md` — A–F block scoring framework
  - `modes/_profile.md` — user niches, narrative, writing style, negotiation scripts
  - `modes/_shared.md` — scoring framework, grade boundaries, global rules
  - `profile.md` (or `cv.md`) — canonical CV/bio with skills, experience, proof points
  - `article-digest.md` (if exists) — detailed case studies and portfolio metrics
  - `config/rates.yml` — rate floor and target rates per niche
  - `config/profile.yml` — identity, location, role targets, auto_pdf_score_threshold
  - `data/leads.md` — dedup against existing tracker entries
  - `data/scan-history.tsv` (if URL-based) — reposting detection for Block G

## Output Format

### Report files

For each evaluated URL, write `reports/{num}-{client-slug}-{YYYY-MM-DD}.md` where `{num}` is the next sequential 3-digit zero-padded number (reserved atomically via `node reserve-report-num.mjs`), `{client-slug}` is the company/client name in lowercase with hyphens, and `{YYYY-MM-DD}` is the current date. Report format follows `modes/lead.md` output specification: Block A–F scores, Block G legitimacy tier, machine summary YAML, and extracted keywords.

### Tracker entries

For each evaluated URL, write a single TSV line to `batch/tracker-additions/{num}-{client-slug}.tsv` with 9 tab-separated columns:

```
{num}	{YYYY-MM-DD}	{client}	{role}	{status}	{score}/5	{pdf_emoji}	[{num}](reports/{num}-{slug}-{date}.md)	{notes}
```

- `status`: `Evaluated` (or `SKIP` if closed/dead or Block G `likely-scam`)
- `pdf`: `✅` if PDF was generated (score >= threshold), `❌` otherwise
- `notes`: one-line summary including legitimacy tier

### Pipeline file update

After processing each URL, move the line from `## Pending` to `## Processed`:

```markdown
- [x] #042 | https://example.com/job/123 | Acme Corp | Senior AI Engineer | 4.2/5 | ✅
- [!] #043 | https://example.com/job/456 | — | — | — | — (Error: 403 Forbidden)
```

## Workflow

### Step 0 — Read system files

1. Read `data/pipeline.md` — parse the `## Pending` section for `- [ ]` items
2. Read `modes/blocks/lead-blocks.md` — understand the A–F framework
3. Read `modes/_shared.md` — scoring weights, grade boundaries, global rules
4. Read `modes/_profile.md` — niches, narrative, writing style
5. Read `profile.md` and `article-digest.md` (if exists) — proof points
6. Read `config/rates.yml` — rate floor and target rates
7. Read `config/profile.yml` — identity details, `auto_pdf_score_threshold`

### Step 1 — Sync check (first time this session)

8. Run `node cv-sync-check.mjs` (alias for `profile-sync-check.mjs`). If warnings, notify the user and ask if they want to continue.

### Step 2 — Determine parallelism

9. Count pending `- [ ]` lines:
   - **0 pending:** Tell the user the inbox is empty. Stop.
   - **1–2 pending:** Process sequentially in this session.
   - **3+ pending:** Dispatch subagents for parallel processing. Split the URLs evenly (e.g., 6 URLs → 3 agents × 2 URLs each). Each subagent gets: the URL, a copy of the system context, and instructions to run steps 4–8 for their batch. Wait for all subagents to complete before proceeding.

### Step 3 — For each pending URL (sequential or subagent)

10. **Extract the URL** from the `- [ ]` line. The line may have extra metadata:
    ```
    - [ ] https://example.com/job/123 | Acme Corp | Senior AI Engineer
    ```
    Extract: URL, company (optional), role (optional).

11. **Check liveness** using Playwright (`browser_navigate` + `browser_snapshot`):
    - **Active:** title/role + real description or apply path visible → proceed
    - **Closed:** expired/404/redirect to generic page → mark `- [!]` with error and continue to next URL
    - If Playwright is unavailable (batch/headless mode), fall back to WebFetch → WebSearch. Mark report with `**Verification:** unconfirmed (batch mode)`.

12. **Verify dedup:** Read `data/leads.md` — if this exact client + role already exists, do NOT create a new entry. Update the existing row's score + notes instead. Append a note about the re-evaluation date.

13. **Run full lead evaluation** (as defined in `modes/lead.md` Steps 3–7):
    - Block G (Legitimacy) — gating check first
    - Blocks A–F scoring
    - Compute weighted score
    - Write report .md
    - Write tracker TSV

14. **PDF gate:** Read `auto_pdf_score_threshold` from `config/profile.yml` (default: `3.0`). If score >= threshold, generate PDF:
    - Read the report file
    - Run `node generate-pdf.mjs` with the report path
    - Mark PDF `✅` in the tracker entry and header
    - If score < threshold, write `**PDF:** not generated — run /freelance-ops pdf {company-slug} to create on demand` in the report header and mark PDF `❌`

15. **Update pipeline.md:** Replace `- [ ]` with the processed line format:
    ```
    - [x] #{num} | {url} | {company} | {role} | {score}/5 | PDF {✅/❌}
    ```
    For errors:
    ```
    - [!] | {url} — {Error message}
    ```

### Step 4 — Merge tracker additions

16. After all URLs are processed, run `node merge-tracker.mjs` to merge all TSV additions into `data/leads.md`. This prevents duplicate entries and normalizes report links.

### Step 5 — Summary

17. Display a summary table to the user:

```
| # | Company | Role | Score | PDF | Legitimacy | Notes |
|---|---------|------|-------|-----|------------|-------|
| 042 | Acme Corp | Sr AI Engineer | 4.2/5 | ✅ | verified | Strong match |
| 043 | Beta Inc | PM | 2.1/5 | ❌ | caution | Below threshold |
```

18. If any URLs remain in `## Pending` (e.g., errors the user needs to resolve), list them separately with the action needed.

## Intelligent JD Detection from URL

1. **Playwright (preferred):** `browser_navigate` + `browser_snapshot`. Works with all SPAs. NEVER run 2+ Playwright agents in parallel.
2. **WebFetch (fallback):** For static pages or when Playwright is unavailable.
3. **WebSearch (last resort):** Search secondary portals that index the JD.

**Special cases:**
- **LinkedIn:** May require login → mark `[!]` and ask the user to paste the text
- **PDF URLs:** Read directly with the Read tool
- **`local:jds/{file}` references:** Read the local file from `jds/` directory
- **Rate-limited (429):** Note the error and stop retrying. Mark `[!]`. Suggest the user paste text manually.

## Edge Cases

- **Empty pipeline:** Tell the user the inbox is empty. No work to do.
- **All URLs are dead:** Process each, mark as `[!]` with the error, show summary of dead links.
- **Duplicate entry exists (client+role in leads.md):** Do NOT create a new entry. Update existing row's score + notes. Add a re-evaluation date note to the tracker.
- **Score below threshold but user wants PDF:** The user can always run `/freelance-ops pdf {slug}` to generate on demand.
- **Subagent failure (3+ URLs):** If a subagent fails mid-batch, note the incomplete URLs in the summary and suggest re-running. Do not lose completed work.
- **Playwright unavailable:** Fall back to WebFetch → WebSearch. Mark report header `**Verification:** unconfirmed`.
- **Rate limit on platform:** Mark `[!]` with the rate-limit error. Suggest the user paste the JD text manually.
- **Mixed employment and freelance URLs:** If the pipeline mixes freelance leads and full-time job offers, detect and dispatch to the correct mode (lead.md for freelance, oferta.md for employment).
- **Pipeline file doesn't exist:** Create it with empty `## Pending` and `## Processed` sections. Tell the user the inbox is ready.

## Format of data/pipeline.md

```markdown
# Data Pipeline Inbox

## Pending
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [ ] https://example.com/gig/789
- [ ] local:jds/acme-cto.md

## Processed
- [x] #042 | https://jobs.example.com/123 | Acme Corp | AI PM | 4.2/5 | PDF ✅
- [x] #043 | https://example.com/gig/456 | Beta Inc | SA | 2.1/5 | PDF ❌
- [!] https://private.url/job — Error: login required
```

## Examples

### Example 1: 2 pending URLs (sequential)

**Input:** `data/pipeline.md` has 2 pending URLs.

**Pipeline state:** `auto_pdf_score_threshold` is not set (defaults to 3.0).

**Processing:**
- URL 1: Acme Corp — Sr AI Engineer. Score 4.2/5, Legitimacy: verified. PDF generated (4.2 >= 3.0). Report `reports/042-acme-corp-2026-06-15.md`.
- URL 2: Beta Inc — PM. Score 2.1/5, Legitimacy: caution. No PDF (2.1 < 3.0). Report `reports/043-beta-inc-2026-06-15.md`.

**Summary:**
```
| # | Company | Role | Score | PDF | Legitimacy | Notes |
|---|---------|------|-------|-----|------------|-------|
| 042 | Acme Corp | Sr AI Engineer | 4.2/5 | ✅ | verified | Strong match |
| 043 | Beta Inc | PM | 2.1/5 | ❌ | caution | Below threshold, proceed with caution |
```

### Example 2: All URLs dead

**Input:** 3 pending URLs, all expired.

**Processing:** Each is checked with Playwright → 404/redirect. Each marked `[!]` with error. No reports, no tracker entries.

**Output:** "All 3 URLs appear to be dead. No reports generated."

### Example 3: PDF gate tuning

**Pipeline state:** `config/profile.yml` sets `auto_pdf_score_threshold: 4.0`.

**Processing:** URL scores 3.8/5. No PDF generated. Report header shows: `**PDF:** not generated — run /freelance-ops pdf {company-slug} to create on demand`. User can generate later if they decide to apply.

## Anti-Patterns

- **Skipping liveness check:** Always verify the URL is active before evaluating. A dead URL wastes a report number and tracker entry.
- **Running Playwright in parallel across subagents:** Playwright is not thread-safe in this context. If parallelizing, only 1 subagent uses Playwright at a time, or use WebFetch for the others.
- **Editing applications.md directly:** Write TSV files to `batch/tracker-additions/` and run `node merge-tracker.mjs`. Never mutate the tracker manually for new entries.
- **Processing without reading the inbox structure:** Always parse `data/pipeline.md` properly. The `- [ ]` / `- [x]` / `- [!]` format is critical.
- **Forgetting to release the report number:** Every `node reserve-report-num.mjs` call must be paired with `node reserve-report-num.mjs --release {num}` after the report is written.
- **Skipping merge-tracker at the end:** Without the merge step, tracker TSV files accumulate in `batch/tracker-additions/` and the tracker never gets updated.
- **The 100% trap on one URL:** When processing 5+ URLs, don't spend 30 minutes on the first one. 80/20 rule applies — aim for consistent quality across the batch.
