# Mode: tracker — Lead Tracker Dashboard

## Purpose

Read, filter, sort, and update the lead tracker (`data/leads.md`). Provides a chat-driven interface to view the current state of all leads — which are qualified, proposed, active, paid, or dead — without needing to open the markdown file directly. Read-only by default; updates require explicit user confirmation.

## When to Use

- User asks "what's the status of my leads" or "show me the tracker"
- User wants to see leads by status, platform, or score range
- User wants to update a lead's status, notes, or score
- User wants statistics (total leads, conversion rate, average score, pipeline breakdown)
- User pastes `/freelance-ops tracker` or equivalent slash command

Do NOT use this mode to evaluate new leads (use `modes/lead.md`), compare leads (use `modes/leads.md`), or process the pipeline (use `modes/pipeline.md`).

## Inputs

- **From user (optional):** Filter criteria, sort order, or an update request.
  - Filter by status: `status=Qualified`, `status=Negotiating`
  - Filter by platform: `platform=Upwork`
  - Filter by score range: `score>=4.0`, `score<3.0`
  - Filter by client: `client=Acme`
  - Sort: `sort=score`, `sort=-date` (descending), `sort=status`
  - Update: `update #5 status=Proposed`
  - Stats: `stats` or `summary`
- **From system (auto-read):**
  - `data/leads.md` — Canonical lead tracker (source of truth)
  - `templates/states.yml` — Canonical state definitions
  - `data/follow-ups.md` (if exists) — Follow-up history for context on active leads

## Output Format

### Tracker summary (default, no filters)

```
## Lead Tracker — {date}
{N} total leads

### Pipeline Overview
New: {N} | Qualified: {N} | Proposed: {N} | Negotiating: {N}
Contracted: {N} | In Progress: {N} | Delivered: {N} | Invoiced: {N}
Paid: {N} | Reviewed: {N}
Rejected: {N} | Ghosted: {N} | Withdrew: {N} | Disputed: {N}

**Conversion rate:** {X}% (Paid / total non-terminal)
**Average score:** {X.X}/5
**Active pipeline value:** ${estimate}

### Active Leads (non-terminal, sorted by score desc)
| # | Client | Role | Platform | Rate | Score | Status |
|---|--------|------|----------|------|-------|--------|
| 5 | Acme Corp | AI Chatbot | Upwork | $95/hr | 4.2/5 | Proposed |
| 3 | Beta Ltd | Data Pipeline | Direct | $130/hr | 4.6/5 | Negotiating |

### Terminal Leads (last 5)
| # | Client | Role | Platform | Status | Score | Notes |
|---|--------|------|----------|--------|-------|-------|
| 2 | Gamma Inc | ML Platform | Toptal | Rejected | 3.1/5 | Budget too low |
```

### Filtered output

Same format as above but scoped to matching rows. Include a header line:

```
### Leads matching: status=Qualified (3 results)
```

### Single-lead detail

When the user asks about a specific lead by number:

```
### Lead #5 — Acme Corp — AI Chatbot (4.2/5)

| Field | Value |
|-------|-------|
| Date | 2026-06-10 |
| Client | Acme Corp |
| Role | AI Chatbot for Customer Support |
| Platform | Upwork |
| Status | Proposed |
| Rate | $95/hr |
| Score | 4.2/5 |
| Notes | Proposal sent Jun 12, awaiting response |
| Report | [reports/005-acme-corp-2026-06-10.md](reports/005-acme-corp-2026-06-10.md) |
```

### Update confirmation dialog

When the user requests an update, show a diff before applying:

```
**Proposed update to Lead #5:**
- Status: Proposed → Negotiating
- Notes: (no change)

Apply this change? (yes/no)
```

Do NOT apply the change until the user explicitly confirms. After confirmation, edit `data/leads.md` directly and confirm:

```
**Updated Lead #5:**
- Status: Proposed → Negotiating
- Done.
```

## Workflow

Follow these steps in order.

### Step 0 — Parse user intent

1. Read `data/leads.md`. If it doesn't exist or is empty, inform the user: "Your lead tracker is empty. Evaluate your first lead to get started—paste a job URL or run `/freelance-ops scan`."
2. Categorize the user's request:
   - No args or `summary`/`stats` → show full tracker summary (Step 1)
   - Filter/sort args → apply filters (Step 2)
   - `show #N` or `detail #N` → show single lead detail (Step 3)
   - `update #N ...` or `set #N ...` → update flow (Step 4)
   - `help` → show available commands

### Step 1 — Full summary (default)

3. Parse all rows from `data/leads.md`. Validate that each row has the right number of columns. Skip malformed rows with a warning.
4. Classify states: terminal states are Rejected, Ghosted, Withdrew, Disputed. All others are active/terminal-off-ramps.
5. Count leads per status. Calculate conversion rate as `Paid / (Paid + Rejected + Ghosted + Withdrew + Disputed)`.
6. Calculate average score (skip rows with `N/A` or empty score).
7. Estimate active pipeline value: sum rates for active leads that have a rate specified. If rate is hourly, note that it's a rough estimate.
8. Display the Pipeline Overview counts, conversion rate, average score, and estimated pipeline value.
9. Display the Active Leads table (non-terminal, sorted by score descending). If more than 15 active leads, suggest filtering.
10. Display the last 5 terminal leads.

### Step 2 — Filtering

When the user provides filter arguments:

11. Parse each filter argument:
    - `status=X` or `state=X` — match canonical status (case-insensitive, alias-resolved via `templates/states.yml`)
    - `platform=X` — exact or partial match on platform name
    - `score>=X`, `score>X`, `score<=X`, `score<X` — numeric comparison against score field
    - `client=X` — case-insensitive substring match on client name
    - `role=X` — case-insensitive substring match on role/scope
    - `rate>=X` — numeric comparison against rate
    - `sort=X` or `sort=-X` — sort by column, descending with `-` prefix
12. Apply filters in order. Multiple filters are ANDed.
13. Display results with a header indicating the filter and count.
14. If no rows match, say so and suggest relaxing filters.

### Step 3 — Single lead detail

15. Find the row by number (`#` column) or by client name if unambiguous.
16. Display the detail table with all columns.
17. If there's a report link, also show the report path.
18. If the lead is active, show follow-up count from `data/follow-ups.md` (if it exists).

### Step 4 — Updating a lead

19. When the user says `update #N field=value`:
    - Parse the requested field. Supported fields: `Status`, `Notes`, `Score`, `Rate`, `Platform`.
    - For `Status`: validate against canonical states in `templates/states.yml`. If the status is not recognized, list valid states and ask the user to choose.
    - Check if the status transition is valid: terminal states (Rejected, Ghosted, Withdrew, Disputed) should not transition back to active unless the user explicitly insists.
20. Show a diff of what will change. Do NOT modify the file yet.
21. Wait for user confirmation: "yes", "apply", "go ahead", or similar.
22. On confirmation, edit `data/leads.md` — update the corresponding cell(s) in the row.
23. Confirm the update was applied.
24. If the user says "no" or anything else, do not apply. Remind them they can re-request.

### Step 5 — Follow-up context

25. If `data/follow-ups.md` exists and the lead is active, check for follow-up history and append:

```
**Follow-ups:** {N} sent (last: {date})
Run `/freelance-ops followup` to manage follow-ups.
```

## Canonical States Reference

From `templates/states.yml`:

| State | Description |
|-------|-------------|
| `New` | Lead captured, not yet evaluated |
| `Qualified` | Evaluated and scored >= 4.0/5, ready to propose |
| `Proposed` | Proposal sent, awaiting response |
| `Negotiating` | In back-and-forth on terms, rate, or scope |
| `Contracted` | Contract signed / work order accepted |
| `In Progress` | Actively working on the engagement |
| `Delivered` | Work delivered, awaiting client acceptance |
| `Invoiced` | Invoice sent, awaiting payment |
| `Paid` | Payment received |
| `Reviewed` | Client review collected, engagement closed |
| `Rejected` | Client rejected proposal or terminated engagement |
| `Ghosted` | No response for >14 days, no follow-up planned |
| `Withdrew` | Candidate withdrew from opportunity |
| `Disputed` | Disagreement over scope, deliverables, or payment |

**Transition rules:**
- Active pipeline: New → Qualified → Proposed → Negotiating → Contracted → In Progress → Delivered → Invoiced → Paid → Reviewed
- Terminal exit from any active state: → Rejected | Ghosted | Withdrew | Disputed
- Terminal states should not transition back to active without explicit user override.

## Edge Cases

- **Empty tracker:** Show "Your lead tracker is empty. Evaluate your first lead to get started—paste a job URL or run `/freelance-ops scan`."
- **Malformed row (wrong column count):** Skip the row, add a warning. "Row #12 has {N} columns (expected 10). Skipping. You can fix it with `normalize-statuses.mjs`."
- **Non-canonical status:** Show the status as-is but flag it: "Lead #7 has non-canonical status 'Pending'. Valid statuses: {list}. Run `node normalize-statuses.mjs` to auto-fix."
- **Duplicate leads (same client + scope):** Flag the duplicates in the display. "Note: Leads #3 and #8 both reference Acme Corp / AI Chatbot. Consider deduplicating with `node dedup-tracker.mjs`."
- **Concurrent updates:** Warn that edits from other sessions may be lost. "Read `data/leads.md` again to check for concurrent edits before updating."
- **Missing score:** Treat as `N/A` in count, exclude from average calculation.
- **Missing rate:** Exclude from pipeline value estimate.
- **User requests invalid status transition:** Explain why it's invalid and offer alternatives. "Moving from Ghosted back to Proposed is unusual. Want to set it to New instead?"
- **Sort on non-existent column:** Default to sorting by `#` (insertion order).
- **Filter yields no results:** "No leads match `status=Negotiating`. Active leads: 3 Proposed, 2 Qualified."
- **User asks for a lead number that doesn't exist:** "Lead #42 not found. Highest number in tracker is #38."
- **Report link broken:** "Lead #7 links to `reports/007-acme-2026-06-10.md` but the file does not exist. Run `npm run verify` to run a full pipeline health check."
- **Multiple leads with same client name:** Show both with their numbers and ask to specify by number.

## Examples

### Example 1: Show all Qualified leads

**User:** `show status=Qualified`

**Output:**
```
### Leads matching: status=Qualified (2 results)

| # | Client | Role | Platform | Rate | Score | Status |
|---|--------|------|----------|------|-------|--------|
| 8 | DataStream Inc | ETL Pipeline (6wk) | Upwork | $120/hr | 4.5/5 | Qualified |
| 12 | Webify | Platform Migration | Toptal | $140/hr | 4.3/5 | Qualified |

**Action:** Ready to propose to both. Run `/freelance-ops proposal #8` to draft a proposal for DataStream Inc.
```

### Example 2: Show all leads above 4.0

**User:** `score>=4.0`

**Output:**
```
### Leads matching: score>=4.0 (4 results)

| # | Client | Role | Platform | Rate | Score | Status |
|---|--------|------|----------|------|-------|--------|
| 8 | DataStream Inc | ETL Pipeline | Upwork | $120/hr | 4.5/5 | Qualified |
| 3 | Beta Ltd | Data Pipeline | Direct | $130/hr | 4.6/5 | Negotiating |
| 12 | Webify | Platform Migration | Toptal | $140/hr | 4.3/5 | Qualified |
| 5 | Acme Corp | AI Chatbot | Upwork | $95/hr | 4.2/5 | Proposed |

**Active pipeline value (est.):** $485/hr across 4 leads
```

### Example 3: Mark lead 5 as Negotiating

**User:** `update #5 status=Negotiating`

**Output:**
```
**Proposed update to Lead #5:**
- Status: Proposed → Negotiating

Apply this change? (yes/no)
```

**User:** `yes`

**Output:**
```
**Updated Lead #5:**
- Status: Proposed → Negotiating
- Done.

Reminder: Run `/freelance-ops followup` to set a follow-up cadence for this lead.
```

### Example 4: Tracker summary with stats

**User:** `summary`

**Output:**
```
## Lead Tracker — 2026-06-15
24 total leads

### Pipeline Overview
New: 2 | Qualified: 3 | Proposed: 4 | Negotiating: 1
Contracted: 1 | In Progress: 2 | Delivered: 0 | Invoiced: 1
Paid: 5 | Reviewed: 1
Rejected: 2 | Ghosted: 1 | Withdrew: 1 | Disputed: 0

**Conversion rate:** 56% (5 Paid / 9 terminal)
**Average score:** 3.8/5
**Active pipeline value (est.):** $510/hr across 11 active leads
```

## Anti-Patterns

- **Updating without confirmation:** Never apply status changes, score edits, or notes modifications without showing the diff and getting explicit user confirmation. The tracker is a permanent record — one wrong edit loses history.
- **Showing stale data after a filter:** Each view must re-read `data/leads.md` fresh. Do not cache the tracker in memory across commands. If the user cycles through filters, re-read the file each time.
- **Overwriting notes instead of appending:** When updating notes, append to existing notes rather than replacing them unless the user explicitly says "replace notes." Use a separator like `; ` or `| `.
- **Displaying all 50+ leads without filtering:** If the tracker has more than 15 leads, default to the summary view with counts and only the top active leads. Suggest filters: "20 active leads — try filtering by status or score to narrow down."
- **Accepting invalid states silently:** Every status update must validate against `templates/states.yml`. No free-text statuses. If a row already has a non-canonical status, flag it but do not auto-correct.
- **Assuming lead numbers are stable:** Lead numbers change if rows are inserted or deleted. Always re-read the file before updating. Use the `#` column as the identifier, not array index.
- **Editing `data/leads.md` structure:** Never change the column headers, add new columns, or reorder existing columns. The column schema is shared by `merge-tracker.mjs`, `dedup-tracker.mjs`, and `normalize-statuses.mjs`.
- **Ignoring concurrent edits:** If `data/leads.md` has been modified since last read (check mtime or hash), warn the user. "The tracker was modified externally. Reloading."
