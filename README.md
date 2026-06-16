# Freelance-Ops

![freelance-ops hero](docs/hero-banner.jpg)

*I built this because hunting freelance / contract work felt like a full-time job.
So I engineered the system I wish I had.*

Freelance-ops turns any AI coding CLI into a full freelance pipeline command center.
Instead of tracking leads in a spreadsheet, you get an AI-powered pipeline that:

- **Qualifies leads** with a structured A-F scoring system (6 weighted blocks)
- **Generates tailored proposals** -- research-backed, PDF-ready
- **Scans platforms** automatically (Upwork first; Toptal, Contra, Fiverr later)
- **Tracks your pipeline** from `New` -> `Paid` in a single source of truth
- **Warns on scam patterns** (advance fees, off-platform payment, fake clients)
- **Stores your rate card** and helps you defend it

> **Important: This is NOT a spray-and-proposal tool.** Freelance-ops is a filter.
> It helps you find the few leads worth your time. The system strongly recommends
> against proposing on anything scoring below 4.0/5. Your time is valuable, and so
> is the client's. Always review before sending.

## Quick Start

```bash
npx freelance-ops init    # one-shot install
cd freelance-ops
claude                    # or opencode / gemini / codex / qwen
```

On first launch, freelance-ops walks you through setup -- your niches, rate card,
and proof points -- by chatting. Nothing to edit by hand.

## Status

v0.3.0 — Plans 1–3 (foundation, core modes, portal scanner) complete. Plan 4 (freelance
pipeline, proposal generation, rate negotiation) in progress. See
`docs/superpowers/specs/2026-06-15-freelance-ops-fork-design.md` for full scope.

---

## Gemini CLI Integration

freelance-ops supports [Gemini CLI](https://github.com/google-gemini/gemini-cli) natively, the same way it supports Claude Code and OpenCode. All 15 slash commands are available, using the same `modes/*.md` evaluation logic.

### Option A: Native Gemini CLI (Recommended)

```bash
# 1. Install Gemini CLI (requires Node.js 20+)
npm install -g @google/gemini-cli
# or: npx @google/gemini-cli --version

# 2. Run in the freelance-ops directory — on first launch, sign in with your
#    Google account (free) to authenticate
cd freelance-ops
gemini

# 3. Use slash commands just like Claude Code
/freelance-ops "Senior AI Engineer at Anthropic..."
/freelance-ops-evaluate --file ./jds/openai.txt
/freelance-ops-scan
/freelance-ops-pdf
/freelance-ops-tracker
```

The `GEMINI.md` file is auto-loaded as context. All 15 commands are defined in `.gemini/commands/*.toml`.

### Option B: Standalone API Script (No CLI install needed)

```bash
# 1. Get a free API key at https://aistudio.google.com/apikey
cp .env.example .env
# Edit .env, set GEMINI_API_KEY=your_key_here

# 2. Install dependencies
npm install

# 3. Evaluate a job description
node gemini-eval.mjs "We are looking for a Senior AI Engineer..."
node gemini-eval.mjs --file ./jds/my-job.txt
npm run gemini:eval -- "JD text here"
```

> **Free tier:** Both options work without billing. Native CLI uses Google OAuth; the API script uses `gemini-2.5-flash` (15 RPM, 1M tokens/day free).

## Usage

freelance-ops exposes 18 commands under a single slash:

**Starter flow:** paste lead → `/freelance-ops evaluate` → review report → `/freelance-ops propose` → `/freelance-ops tracker`

```
/freelance-ops                   → Show all commands / auto-detect pasted URL or lead
/freelance-ops evaluate          → Full evaluation pipeline (qualify + report + PDF + tracker)
/freelance-ops propose           → Generate tailored proposal PDF
/freelance-ops scan              → Scan platforms (Upwork, Toptal, Contra) for new leads
/freelance-ops pipeline          → Process pending leads from inbox
/freelance-ops batch             → Batch evaluate multiple leads
/freelance-ops tracker           → View pipeline status (New → Paid)
/freelance-ops outreach          → Client outreach message
/freelance-ops research          → Deep client / market research
/freelance-ops interview         → Interview preparation
/freelance-ops patterns          → Analyze win/loss patterns
/freelance-ops followup          → Follow-up cadence calculator
/freelance-ops rates             → Rate card management / negotiation
/freelance-ops contract          → Contract review checklist
/freelance-ops training          → Evaluate a course or certification
/freelance-ops project           → Evaluate a portfolio project
/freelance-ops update            → Update freelance-ops system
/freelance-ops help              → Full command reference
```

Or just paste a URL or description — freelance-ops auto-detects it and runs the full pipeline.

## How It Works

```
Lead discovered (Upwork / Toptal / Contra / referral)
        │
        ▼
┌────────────────┐
│  Qualify       │  A-F scoring: match, budget, timeline, risk
│  (Block A-F)   │
└───────┬────────┘
        │
┌───────▼────────┐
│  Propose       │  Tailored proposal, rate card, proof points
│                │
└───────┬────────┘
        │
┌───────▼────────┐
│  Contract      │  Scope, milestones, payment terms, IP clauses
└───────┬────────┘
        │
┌───────▼────────┐
│  Deliver       │  Tracked milestones, client comms
└───────┬────────┘
        │
┌───────▼────────┐
│  Invoice       │  Send invoice, track payment
└───────┬────────┘
        │
┌───────▼────────┐
│  Paid          │  Review, archive, add proof point
└────────────────┘
```

## Pre-configured Platforms

The scanner integrates with freelance platforms to discover leads:

- **Upwork** (v1) — RSS feed scanning via `node scan.mjs`
- **Toptal** — Talent directory matching
- **Contra** — Portfolio-based opportunity matching
- **Fiverr** (future) — Planned integration

Copy `config/platforms.example.yml` to `config/platforms.yml` to configure your search terms and filters.

## Dashboard TUI

The built-in terminal dashboard lets you browse your pipeline visually:

```bash
cd dashboard
go build -o freelance-dashboard .
./freelance-dashboard --path ..
```

Features: 6 filter tabs, 4 sort modes, grouped/flat view, lazy-loaded previews, inline status changes.

## Project Structure

```
freelance-ops/
├── AGENTS.md                    # Canonical agent instructions (all CLIs)
├── CLAUDE.md                    # Claude Code wrapper (imports AGENTS.md)
├── OPENCODE.md                  # OpenCode wrapper (imports AGENTS.md)
├── cv.md                        # Your CV (create this)
├── article-digest.md            # Your proof points (optional)
├── config/
│   ├── profile.example.yml      # Template for your profile
│   ├── profile.yml              # Your profile (create this)
│   ├── rates.example.yml        # Template for your rate card
│   ├── rates.yml                # Your rate card (create this)
│   ├── platforms.example.yml    # Template for platform config
│   └── platforms.yml            # Your platform config (create this)
├── modes/                       # 30+ skill modes (EN + 7 locales)
│   ├── _shared.md               # Shared context (customize this)
│   ├── _profile.md              # Your personalization (never overwritten)
│   ├── lead.md                  # Lead qualification
│   ├── proposal.md              # Proposal generation
│   ├── pitch.md                 # Pitch / outreach
│   ├── scan.md                  # Platform scanner
│   ├── screening.md             # Client screening
│   ├── nurture.md               # Lead nurturing
│   ├── oferta.md                # Offer evaluation
│   └── ...                      # onboarding, portfolio, contract, etc.
├── templates/
│   ├── proposal-template.html   # Proposal PDF template
│   ├── portfolio-template.html  # Portfolio showcase template
│   ├── cover-letter-template.html
│   ├── rate-card-template.html  # Rate card HTML template
│   ├── portals.example.yml      # Scanner config template
│   └── states.yml               # Canonical pipeline statuses
├── providers/
│   ├── upwork.mjs               # Upwork RSS feed provider
│   ├── manual.mjs               # Manual lead entry provider
│   ├── local-parser.mjs         # Local file parser
│   ├── _http.mjs                # Shared HTTP utilities
│   └── _types.js                # Shared type definitions
├── batch/
│   ├── batch-prompt.md          # Self-contained worker prompt
│   └── batch-runner.sh          # Orchestrator script
├── dashboard/                   # Go TUI pipeline viewer
├── data/                        # leads.md, pipeline.md, clients.yml
├── reports/                     # Evaluation reports (gitignored)
├── output/                      # Generated PDFs (gitignored)
├── fonts/                       # Space Grotesk + DM Sans
├── docs/                        # Setup, customization, architecture
├── examples/                    # Sample CV, report, proof points
└── scaffolder/                  # One-shot project scaffolding
```

## Tech Stack

![Claude Code](https://img.shields.io/badge/Claude_Code-000?style=flat&logo=anthropic&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white)
![Bubble Tea](https://img.shields.io/badge/Bubble_Tea-FF75B5?style=flat&logo=go&logoColor=white)

- **Agent**: Any AI coding CLI (Claude Code, OpenCode, Gemini, Codex, Qwen)
- **PDF**: Playwright + HTML templates (proposal, portfolio, rate card)
- **Scanner**: Upwork RSS feed + provider-based architecture
- **Dashboard**: Go + Bubble Tea + Lipgloss (Catppuccin Mocha theme)
- **Data**: Markdown tables + YAML config + TSV batch files

## Also Open Source

- **[cv-santiago](https://github.com/santifer/cv-santiago)** -- The portfolio website (santifer.io) with AI chatbot, LLMOps dashboard, and case studies. If you need a portfolio to showcase alongside your job search, fork it and make it yours.

## About the Author

I'm Santiago -- Head of Applied AI, former founder (built and sold a business that still runs with my name on it). I built freelance-ops to manage my own job search. It worked: I used it to land my current role.

My portfolio and other open source projects -> [santifer.io](https://santifer.io)

## Disclaimer

**freelance-ops is a local, open-source tool, NOT a hosted service.** By using this software, you acknowledge:

1. **You control your data.** Your CV, contact info, and personal data stay on your machine and are sent directly to the AI provider you choose (Anthropic, OpenAI, etc.). We do not collect, store, or have access to any of your data.
2. **You control the AI.** The default prompts instruct the AI not to auto-submit applications, but AI models can behave unpredictably. If you modify the prompts or use different models, you do so at your own risk. **Always review AI-generated content for accuracy before submitting.**
3. **You comply with third-party ToS.** You must use this tool in accordance with the Terms of Service of the career portals you interact with (Greenhouse, Lever, Workday, LinkedIn, etc.). Do not use this tool to spam employers or overwhelm ATS systems.
4. **No guarantees.** Evaluations are recommendations, not truth. AI models may hallucinate skills or experience. The authors are not liable for employment outcomes, rejected applications, account restrictions, or any other consequences.

See [LEGAL_DISCLAIMER.md](LEGAL_DISCLAIMER.md) for full details. This software is provided under the [MIT License](LICENSE) "as is", without warranty of any kind.

## Contributors

<a href="https://github.com/santifer/freelance-ops/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=santifer/freelance-ops" />
</a>

Got hired using freelance-ops? [Share your story!](https://github.com/santifer/freelance-ops/issues/new?template=i-got-hired.yml)

## License & Trademark

The code is licensed under [MIT](LICENSE). The "freelance-ops" name and
brand are governed by the [Trademark Policy](TRADEMARK.md), permissive
for community use, reserved for commercial product naming and
endorsement.

## Let's Connect

[![Website](https://img.shields.io/badge/santifer.io-000?style=for-the-badge&logo=safari&logoColor=white)](https://santifer.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/santifer)
[![X](https://img.shields.io/badge/X-000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/santifer)
[![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/8pRpHETxa4)
[![Email](https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:hi@santifer.io)
