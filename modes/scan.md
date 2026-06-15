# Mode: scan — Portal Scanner (Job Discovery)

Scans configured job portals, filters by title/location/salary relevance, and appends new offers to `data/pipeline.md` for subsequent evaluation.

## When the user runs `/freelance-ops scan`

Execute the scan workflow below. For most sessions, **Step 0** (`node scan.mjs`) covers everything — it runs all provider-based scans (local parsers + HTTP/API providers) in a single zero-token command. Only proceed to agent-driven levels (Steps 1–3) when `scan.mjs` reports companies it couldn't handle (see "Agent/WebSearch handoff" in its output).

## Step 0 — Zero-Token Scan (Preferred)

Always start here. Run:

```bash
node scan.mjs
```

Options:
- `--dry-run` — preview without writing to pipeline.md or scan-history.tsv
- `--company {name}` — scan a single company (partial match on name)
- `--verify` — after scan, check each new URL with Playwright; drop expired postings
- `--verify --headed-fallback` — retry anti-bot walls in a headed browser (needs a display)
- `--verify --throttle` — 5–10s jittered gap between verifications
- `--verify --throttle=8000` — custom base gap in ms
- `--rediscover-404` — when a tracked company's URL 404s, search for the moved role and re-verify before marking expired

`scan.mjs` reads `portals.yml` and:
1. Loads all providers from `providers/*.mjs`
2. Matches each tracked company / job board to the right provider (by `provider:` field, `parser.command` + `parser.script`, or URL auto-detection)
3. Fetches jobs from each provider with concurrency limit of 10
4. Applies `title_filter`, `location_filter`, and `salary_filter` from portals.yml
5. Deduplicates against `data/scan-history.tsv`, `data/pipeline.md`, and `data/applications.md`
6. Optionally verifies liveness with Playwright (`--verify`)
7. Appends new offers to `data/pipeline.md` under `## Pendientes`
8. Records all results in `data/scan-history.tsv` (including expired, dropped, and filtered)

### What scan.mjs does NOT cover

If `scan.mjs` output includes "Agent/WebSearch handoff" companies, those have no matching provider. Proceed to Steps 1–3 below for those companies only.

## Step 1 — Direct Playwright Navigation (Agent-driven)

For each company that `scan.mjs` could not handle **and** that has a `careers_url` in `portals.yml`:

1. `browser_navigate` to `careers_url`
2. `browser_snapshot` to read all visible job listings
3. Extract `{title, url, location}` for each listing

If the page has filters/departments, navigate to the relevant sections. Handle pagination if present.

## Step 2 — ATS API / Feed (Agent-driven)

For companies with a known ATS platform but no matching provider, fetch jobs directly:

- **Greenhouse**: `GET https://boards-api.greenhouse.io/v1/boards/{company}/jobs`
- **Ashby**: POST to `https://jobs.ashbyhq.com/api/non-user-graphql` with `operationName: ApiJobBoardWithTeams` and `variables.organizationHostedJobsPageName: {company}`
- **Lever**: `GET https://api.lever.co/v0/postings/{company}?mode=json`
- **BambooHR**: list `GET https://{company}.bamboohr.com/careers/list` → detail `GET https://{company}.bamboohr.com/careers/{id}/detail`
- **Teamtailor**: `GET https://{company}.teamtailor.com/jobs.rss`
- **Workday**: POST `{"appliedFacets":{},"limit":20,"offset":0,"searchText":""}` to `https://{company}.{shard}.myworkdayjobs.com/wday/cxs/{company}/{site}/jobs`

Normalize each job to `{title, url, company, location}`.

## Step 3 — WebSearch (Broad Discovery)

For general discovery (new companies not in `tracked_companies`), run the `search_queries` from `portals.yml` with `enabled: true`. Use WebSearch.

For each result, extract:
- **title**: text before ` @ `, ` | `, ` — `, or ` at `
- **company**: text after the delimiter
- **url**: the result URL

### Liveness verification (WebSearch results)

WebSearch results may be cached/expired. For each new URL from this level only:

1. `browser_navigate` to the URL
2. `browser_snapshot` to read content
3. Classify:
   - **Active**: job title + description + Apply control visible in main content area
   - **Expired**: page says "no longer available" / "position filled" / "expired"; or only navbar/footer visible (< ~300 chars content); or Greenhouse `?error=true` redirect
4. If expired → discard. If active → continue.

## Step 4 — Filter and Deduplicate

### Title filter

Apply `title_filter` from `portals.yml`:
- At least 1 keyword from `positive` must appear in the title (case-insensitive)
- 0 keywords from `negative` may appear
- `seniority_boost` keywords give priority but not mandatory

### Location filter (optional)

Apply `location_filter` from `portals.yml` if present:
- Empty/missing location → passes
- `block` keywords present → reject
- `always_allow` keywords present → pass (overrides block)
- `allow` empty → pass; non-empty → must match at least one keyword

### Salary filter (optional)

Apply `salary_filter` from `portals.yml` if present:
- No salary data → passes (conservative)
- Currency mismatch → reject
- Range overlap logic: reject only if job is completely outside user's min/max

### Dedup

Check against all 3 sources:
- `data/scan-history.tsv` — exact URL already seen
- `data/applications.md` — normalized company + role already evaluated
- `data/pipeline.md` — exact URL already in pending or processed

## Step 5 — Record Results

For each new verified offer that passes all filters, append to `data/pipeline.md`:

```
- [ ] {url} | {company} | {title}
```

Insert under `## Pendientes`. If `## Pendientes` section doesn't exist, create it before `## Procesadas`.

Also record in `data/scan-history.tsv`:

```
{url}\t{date}\t{source}\t{title}\t{company}\tadded\t{location}
```

Record filtered-by-title, duplicate, and expired offers in scan-history.tsv with respective statuses (`skipped_title`, `skipped_dup`, `skipped_expired`) so they are dedup-skipped on subsequent scans.

### Private URLs (behind login/paywall)

1. Save the JD in `jds/{company}-{role-slug}.md`
2. Add to pipeline: `- [ ] local:jds/{company}-{role-slug}.md | {company} | {title}`

## Output Summary

Present the user with a clean summary:

```text
Portal Scan — {YYYY-MM-DD}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Companies scanned:     N
Total jobs found:      N
Filtered by title:     N removed
Filtered by location:  N removed
Filtered by salary:    N removed
Duplicates:            N skipped
New offers added:      N

  + {company} | {title} | {location}

→ Run /freelance-ops pipeline to evaluate new offers.
```

If `scan.mjs` reported Agent handoff items, append:

```text
Manual scan needed for (no provider):
  • {company} — {query/URL}
```

## Managing portals.yml

- Always save `careers_url` when adding a new company
- Add new search queries as interesting portals or roles are discovered
- Deactivate noisy queries with `enabled: false`
- Adjust filter keywords as target roles evolve
- Verify `careers_url` periodically — companies change ATS platforms
- Prefer the company's corporate careers page URL over direct ATS endpoints (corporate URLs are more stable)

## Data files

| File | Role |
|------|------|
| `portals.yml` | Scanner configuration: tracked companies, job boards, search queries, filters |
| `data/scan-history.tsv` | Dedup history — every URL ever seen by the scanner, with status |
| `data/pipeline.md` | Pending and processed offers (dedup source for URLs) |
| `data/applications.md` | Evaluated applications (dedup source for company+role pairs) |
| `providers/*.mjs` | Plugin-based scanner backends (HTTP APIs, local parsers) |
