---
name: freelance-ops
description: AI freelance pipeline command center -- evaluate leads, draft proposals, scan platforms, track from New to Paid
arguments: mode
user_invocable: true
user-invocable: true
argument-hint: "[scan | deep | pdf | latex | cover | lead | leads | proposal | pitch | outreach | screening | nurture | portfolio | apply | batch | tracker | pipeline | training | project | onboarding | patterns | followup | update]"
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
  /freelance-ops {lead}            → AUTO-PIPELINE: evaluate + proposal + tracker (paste text or URL)
  /freelance-ops lead              → Evaluate a single lead (Blocks A-F + G legitimacy)
  /freelance-ops leads             → Compare and rank multiple leads
  /freelance-ops proposal          → Draft a tailored proposal for a qualified lead
  /freelance-ops pitch             → Short pitch / opener (DM, cold email, intro)
  /freelance-ops outreach          → LinkedIn / cold outreach: find contacts + draft message
  /freelance-ops screening         → Screen a client: payment history, scam signals
  /freelance-ops nurture           → Re-engage past leads / warm the pipeline
  /freelance-ops portfolio         → Review a portfolio piece against your niches
  /freelance-ops interview-prep    → Generate client-specific kickoff / screening prep doc
  /freelance-ops onboarding        → Interactive onboarding interview (niches, rate card, proof points)
  /freelance-ops pdf               → PDF only, ATS-optimized profile / CV
  /freelance-ops latex             → Export profile as LaTeX/Overleaf .tex
  /freelance-ops cover             → Cover letter: standalone scope paste or /freelance-ops cover {slug}
  /freelance-ops training          → Evaluate course / cert against your niches
  /freelance-ops project           → Evaluate a portfolio project idea
  /freelance-ops tracker           → Lead pipeline status overview
  /freelance-ops apply             → Live application / proposal assistant (reads form + generates answers)
  /freelance-ops scan              → Scan platforms and discover new leads
  /freelance-ops batch             → Batch processing with parallel workers
  /freelance-ops patterns          → Analyze rejection / ghost patterns and improve targeting
  /freelance-ops followup          → Follow-up cadence tracker: flag overdue, generate drafts
  /freelance-ops update            → Update freelance-ops system files with diff preview + compat check

Inbox: add URLs to data/pipeline.md → /freelance-ops pipeline
Or paste a lead description directly to run the full pipeline.
```

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
