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

v0.1.0 (Foundation). See `docs/superpowers/specs/2026-06-15-freelance-ops-fork-design.md`
for scope. Phase 1 (this release) delivers the fork skeleton, state machine, and CLI shells.
Phase 2+ adds the freelance content (modes, providers, templates, dashboard).

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

freelance-ops is a single slash command with multiple modes:

```
/freelance-ops                → Show all available commands
/freelance-ops {paste a JD}   → Full auto-pipeline (evaluate + PDF + tracker)
/freelance-ops scan           → Scan portals for new offers
/freelance-ops pdf            → Generate ATS-optimized CV
/freelance-ops cover          → Cover letter generator (paste JD or /freelance-ops cover {slug})
/freelance-ops batch          → Batch evaluate multiple offers
/freelance-ops tracker        → View application status
/freelance-ops apply          → Fill application forms with AI
/freelance-ops pipeline       → Process pending URLs
/freelance-ops contacto       → LinkedIn outreach message
/freelance-ops deep           → Deep company research
/freelance-ops training       → Evaluate a course/cert
/freelance-ops project        → Evaluate a portfolio project
```

Or just paste a job URL or description directly -- freelance-ops auto-detects it and runs the full pipeline.

## How It Works

```
You paste a job URL or description
        │
        ▼
┌──────────────────┐
│  Archetype       │  Classifies: LLMOps / Agentic / PM / SA / FDE / Transformation
│  Detection       │
└────────┬─────────┘
         │
┌────────▼─────────┐
│  A-F Evaluation  │  Match, gaps, comp research, STAR stories
│  (reads cv.md)   │
└────────┬─────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
 Report  PDF  Tracker
  .md   .pdf   .tsv
```

## Pre-configured Portals

The scanner comes with **45+ companies** ready to scan and **19 search queries** across major job boards. Copy `templates/portals.example.yml` to `portals.yml` and add your own:

**AI Labs:** Anthropic, OpenAI, Mistral, Cohere, LangChain, Pinecone
**Voice AI:** ElevenLabs, PolyAI, Parloa, Hume AI, Deepgram, Vapi, Bland AI
**AI Platforms:** Retool, Airtable, Vercel, Temporal, Glean, Arize AI
**Contact Center:** Ada, LivePerson, Sierra, Decagon, Talkdesk, Genesys
**Enterprise:** Salesforce, Twilio, Gong, Dialpad
**LLMOps:** Langfuse, Weights & Biases, Lindy, Cognigy, Speechmatics
**Automation:** n8n, Zapier, Make.com
**European:** Factorial, Attio, Tinybird, Clarity AI, Travelperk

**Job boards searched:** Ashby, Greenhouse, Lever, Wellfound, Workable, RemoteFront

By default `node scan.mjs` (a.k.a. `npm run scan`) trusts what each ATS feed returns. Some companies leave stale postings in their public API even after the role is closed, so those expired entries can leak into `pipeline.md`. Pass `--verify` to launch Playwright after the API pass and drop expired postings before they hit the pipeline:

```bash
node scan.mjs --verify          # zero-token discovery + Playwright liveness check
```

The verification is sequential and only runs against new offers (after dedup), so the cost stays bounded.

## Dashboard TUI

The built-in terminal dashboard lets you browse your pipeline visually:

```bash
cd dashboard
go build -o career-dashboard .
./career-dashboard --path ..
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
│   └── profile.example.yml      # Template for your profile
├── modes/                       # 15 skill modes
│   ├── _shared.md               # Shared context (customize this)
│   ├── oferta.md                # Single evaluation
│   ├── pdf.md                   # PDF generation
│   ├── cover.md                 # Cover letter generation
│   ├── scan.md                  # Portal scanner
│   ├── batch.md                 # Batch processing
│   └── ...
├── templates/
│   ├── cv-template.html         # ATS-optimized CV template
│   ├── portals.example.yml      # Scanner config template
│   └── states.yml               # Canonical statuses
├── batch/
│   ├── batch-prompt.md          # Self-contained worker prompt
│   └── batch-runner.sh          # Orchestrator script
├── dashboard/                   # Go TUI pipeline viewer
├── data/                        # Your tracking data (gitignored)
├── reports/                     # Evaluation reports (gitignored)
├── output/                      # Generated PDFs (gitignored)
├── fonts/                       # Space Grotesk + DM Sans
├── docs/                        # Setup, customization, architecture
└── examples/                    # Sample CV, report, proof points
```

## Tech Stack

![Claude Code](https://img.shields.io/badge/Claude_Code-000?style=flat&logo=anthropic&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white)
![Bubble Tea](https://img.shields.io/badge/Bubble_Tea-FF75B5?style=flat&logo=go&logoColor=white)

- **Agent**: Claude Code with custom skills and modes
- **PDF**: Playwright/Puppeteer + HTML template
- **Cover letters**: HTML template + Playwright (A4 PDF, same pipeline as CVs)
- **Scanner**: Playwright + Greenhouse API + WebSearch
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
