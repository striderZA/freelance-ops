---
name: freelance-ops
description: AI freelance pipeline command center -- evaluate leads, draft proposals, scan platforms, track from New to Paid
arguments: mode
user_invocable: true
user-invocable: true
argument-hint: "[scan | deep | pdf | latex | cover | lead | leads | proposal | pitch | outreach | screening | nurture | portfolio | apply | batch | tracker | pipeline | training | project | onboarding | patterns | followup | update | auto-pipeline]"
license: MIT
---

# freelance-ops -- Router

## Mode Routing

Determine the mode from `$mode`:

| Input | Mode |
|-------|------|
| (empty / no args) | `discovery` -- Show command menu |
| Lead text or URL (no sub-command) | **`auto`** (auto-pipeline) |
| `lead` | `lead` |
| `leads` | `leads` |
| `proposal` | `proposal` |
| `pitch` | `pitch` |
| `outreach` | `outreach` |
| `screening` | `screening` |
| `nurture` | `nurture` |
| `portfolio` | `portfolio` |
| `deep` | `deep` |
| `interview-prep` | `interview-prep` |
| `onboarding` | `onboarding` |
| `pdf` | `pdf` |
| `latex` | `latex` |
| `cover` | `cover` |
| `training` | `training` |
| `project` | `project` |
| `tracker` | `tracker` |
| `pipeline` | `pipeline` |
| `apply` | `apply` |
| `scan` | `scan` |
| `batch` | `batch` |
| `patterns` | `patterns` |
| `followup` | `followup` |
| `update` | `update` |

**Auto-pipeline detection:** If `$mode` is not a known sub-command AND contains lead text (keywords: "scope", "deliverables", "budget", "looking for", "need a freelancer", client name + scope) or a URL to a lead, execute `auto`.

If `$mode` is not a sub-command AND doesn't look like a lead, show discovery.

---

## Discovery Mode (no arguments)

Show this menu:

```
freelance-ops -- Command Center

Available commands:
  /freelance-ops {lead}            → AUTO-PIPELINE: auto-detect input and route to the right mode
  /freelance-ops lead              → Evaluate a freelance lead (paste a URL or JD text)
  /freelance-ops leads             → Compare and rank multiple freelance leads
  /freelance-ops proposal          → Generate a tailored proposal from an evaluated lead
  /freelance-ops portfolio         → Generate or update your rate card and portfolio case studies
  /freelance-ops pitch             → Submit a proposal on a freelance platform
  /freelance-ops screening         → Prepare for a client screening call
  /freelance-ops nurture           → Follow up on leads awaiting response
  /freelance-ops outreach          → Cold outreach to potential direct clients
  /freelance-ops pipeline          → Process pending URLs from the inbox
  /freelance-ops deep              → Deep client or company research
  /freelance-ops interview-prep    → Generate client-specific kickoff / screening prep doc
  /freelance-ops onboarding        → Interactive onboarding interview
  /freelance-ops pdf               → PDF only, ATS-optimized profile / CV
  /freelance-ops latex             → Export profile as LaTeX/Overleaf .tex
  /freelance-ops cover             → Cover letter: standalone scope paste or /freelance-ops cover {slug}
  /freelance-ops training          → Evaluate a course or certification
  /freelance-ops project           → Evaluate a portfolio project idea
  /freelance-ops tracker           → View and update the lead tracker
  /freelance-ops apply             → Live application / proposal assistant (reads form + generates answers)
  /freelance-ops scan              → Scan platforms for new freelance leads
  /freelance-ops batch             → Batch processing with parallel workers
  /freelance-ops patterns          → Analyze win/loss patterns across your leads
  /freelance-ops followup          → Follow-up cadence tracker: flag overdue, generate drafts
  /freelance-ops update            → Update freelance-ops system files with diff preview + compat check

Inbox: add URLs to data/pipeline.md → /freelance-ops pipeline
Or paste a lead description directly to run the full pipeline.
```

---

## Onboarding

When the user invokes `onboarding` mode (or if onboarding has never been completed), execute `modes/onboarding.md`. This conducts an interactive interview to capture:

- Target niche and specialization
- Rate card (hourly, fixed, retainer)
- Proof points and portfolio highlights
- Preferred platforms and client types
- Deal-breakers and red flags

The results are stored in `config/profile.yml`, `modes/_profile.md`, and optionally `article-digest.md`. Do not edit `modes/_shared.md` with user-specific content.

See `modes/onboarding.md` for the full interview flow.

---

## Context Loading by Mode

After determining the mode, load the necessary files before executing:

### Modes that require `_shared.md` + their mode file:
Read `modes/_shared.md` + `modes/{mode}.md`

Applies to: `auto`, `lead`, `leads`, `proposal`, `pitch`, `outreach`, `screening`, `nurture`, `pdf`, `apply`, `pipeline`, `scan`, `batch`

### Standalone modes (only their mode file):
Read `modes/{mode}.md`

Applies to: `tracker`, `deep`, `interview-prep`, `onboarding`, `latex`, `training`, `project`, `patterns`, `followup`, `cover`, `portfolio`

### Block framework reference:
The lead evaluation uses the 6-block A-F + G framework defined in `modes/blocks/lead-blocks.md`. Read it whenever scoring a lead.

### Modes delegated to subagent:
For `scan`, `apply` (with Playwright), and `pipeline` (3+ URLs): launch as Agent with the content of `_shared.md` + `modes/{mode}.md` injected into the subagent prompt.

```
Agent(
  subagent_type="general-purpose",
  prompt="[content of modes/_shared.md]\n\n[content of modes/{mode}.md]\n\n[invocation-specific data]",
  description="freelance-ops {mode}"
)
```

Execute the instructions from the loaded mode file.
