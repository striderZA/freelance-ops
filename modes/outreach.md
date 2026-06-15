---
description: Cold outreach to potential direct clients (email, LinkedIn, Twitter)
argument-hint: "[target company name or linkedin profile url]"
---

# Outreach Mode — Cold Outreach to Direct Clients

## Purpose

Generate a personalized cold outreach message for a potential direct client. The mode researches the target company and individual, identifies a specific hook (a problem, opportunity, or signal from their work), and drafts a concise message with hook → relevant experience → specific call to action. The goal is to start a conversation, not close a deal in the first message. The user reviews, edits, and sends — the mode NEVER auto-sends.

## When to Use

- User wants to reach out to a specific company or person as a potential client
- User found a lead through research, conference, referral, or community signal
- User says "help me write a cold email to {company}" or "draft outreach for {name}"
- User wants to offer services to a company that isn't actively hiring freelancers
- User has a low-score lead but wants to pitch directly to the decision-maker as a warm alternative

Do NOT use this mode for:
- Applying to a job posting (use `modes/apply.md` or `modes/contacto.md`)
- Responding to an inbound lead or RFP (use `modes/proposal.md`)
- Following up after a sent proposal (use `modes/nurture.md`)
- Evaluating whether a lead is worth pursuing (use `modes/lead.md`)

## Inputs

- **From user (at minimum one):**
  - Target company name
  - Decision-maker name and title (if known)
  - LinkedIn profile URL or company website
  - Or: a description of the target and what the user can offer
- **From system (auto-read):**
  - `modes/_profile.md` — user's niches, narrative, writing style, negotiation scripts
  - `modes/_shared.md` — global rules, professional writing conventions, rate strategy
  - `config/profile.yml` — identity, name, email, location, role, portfolio URL, LinkedIn
  - `profile.md` — canonical bio with proof points and metrics
  - `article-digest.md` (if exists) — detailed case studies (overrides `profile.md` for metrics)
  - `config/rates.yml` — rate floor and target rates per niche
  - `data/clients.yml` — past and current client list for dedup and relationship context

## Output Format

The mode produces three things in chat (no file writes except tracker):

1. **Target Research Brief** — what was found about the company and person
2. **Outreach Message** — ready for the user to review, edit, and send
3. **Follow-up Cadence** — suggested timing and content for 1–3 follow-ups
4. **Client Record Update** — instructions for recording this outreach in `data/clients.yml`

### Target Research Brief

Present a compact research summary:

```markdown
## Research: {Company Name}

**Decision-maker:** {Name}, {Title} {confidence: confirmed / inferred}
**Channel:** {email / LinkedIn / Twitter / other}

**Company signals:**
- {Recent news, funding, product launch, hiring spree, or problem signal}
- {Tech stack or industry signal relevant to the user's niche}
- {Size, stage, location}

**Personal signals:**
- {Content they've posted, talks given, recent job change, mutual connections}
- {What they care about based on their work the user can help with}

**Hook opportunity:**
{1-sentence summary of why now is a good time to reach out}
```

### Outreach Message

Present the draft in the channel-appropriate format:

**Email format:**

```
Subject: {Specific subject line — not generic}

Hi {Name},

{Hook — specific observation about their company, product, or recent work}

{Relevant experience — 1-2 proof points with metrics, directly tied to the hook}

{Specific CTA — a concrete next step, not "let me know"}

Best,
{User Name}
{Title / Tagline}
{Portfolio URL}
```

**LinkedIn format (300 char limit for connection request):**

```
{Hook}. {Relevant credential}. {CTA}

---

*Characters: {N}/300*

Note: This goes in the connection request note field. After they accept, send the full message.
```

### Follow-up Cadence

```markdown
## Follow-up Cadence

**Day 3–5:** If no response, send a brief follow-up referencing the original message:
"Quick follow-up on my note earlier — happy to share relevant case studies if timing isn't right yet."

**Day 10–14:** Second follow-up with a value-add (article, case study, or relevant insight):
"Saw {article/insight} and thought of your work on {topic}. My thoughts: {1-sentence take}."

**Day 21–28:** Final follow-up. Close the loop gracefully:
"Last note from me — if the timing changes, my calendar is open. Wishing you a great Q{quarter}."

**After final follow-up:** Move to long-term nurture. Log the touch in `data/clients.yml`. Re-engage in 3 months with fresh context.
```

### Client Record Update

After the user confirms they sent the message, update `data/clients.yml`:

```yaml
clients:
  - name: {Company Name}
    contact: {Decision-maker Name}
    title: {Title}
    channel: {email / LinkedIn / other}
    date: {YYYY-MM-DD}
    status: contacted  # or: meeting-scheduled, proposed, active, dormant
    notes: {Outreach context, hook used, response if any}
```

If the company already exists in `data/clients.yml`, update the existing entry's status and notes rather than adding a duplicate.

## Workflow

Follow these steps in order. Do not skip or reorder.

### Step 0 — Read system files

1. Read `modes/_shared.md` — global rules, professional writing conventions, rate strategy.
2. Read `modes/_profile.md` — user's niches, narrative, writing style.
3. Read `config/profile.yml` — identity details, name, email, location, portfolio URL, LinkedIn.
4. Read `profile.md` and `article-digest.md` (if exists) — proof points, metrics, case studies.
5. Read `config/rates.yml` — current rate floor and target rates.
6. Read `data/clients.yml` — check if this company is already a past or current client.

### Step 1 — Capture target info

7. Determine what the user provided:
   - **Company name only:** Ask the user for more context (who at the company, what they want to offer). Proceed with research using what's available.
   - **Company + decision-maker name:** Strong starting point. Proceed to research.
   - **LinkedIn URL or personal website:** Strongest starting point. Use the profile for signals.
   - **Just a description:** Work with what the user gives. Note that research will be limited.
8. If a URL or company name is provided, use browser research to gather signals:
   - Company website: products, blog, recent news, team page, careers page
   - Decision-maker's LinkedIn or Twitter: recent posts, interests, background, mutual connections
   - Crunchbase, Product Hunt, or news: funding, launch, growth signals
9. If the user gave only a description (no searchable target), skip research and work directly with their context.

### Step 2 — Identify the hook

10. Extract the best hook from the research. Prioritize hooks in this order:
    - **Product signal:** A recent product launch, feature update, or public roadmap item that maps to the user's expertise
    - **Problem signal:** A public job posting, pain point in their blog, or customer complaint that the user can solve
    - **Growth signal:** A funding round, hiring spree, or expansion that creates new needs
    - **Content signal:** Something the decision-maker posted or wrote that the user has a relevant take on
    - **Mutual connection / referral:** "X suggested I reach out" (strongest signal, use if available)
11. If no strong hook exists, be honest. Ask the user: "I couldn't find a strong hook for {target}. Can you share any context about why you want to reach out to them? A specific project, referral, or observation would help me write a better message."
12. Never fabricate a hook. If the research is thin, write a more general message and flag the limitation.

### Step 3 — Select proof points

13. From `profile.md` and `article-digest.md`, identify the 1-2 proof points most relevant to the hook:
    - Highest overlap with the identified problem or opportunity
    - Strongest metrics (prefer quantified impact over description)
    - Most recent (prefer last 2 years)
    - Most relevant to the detected niche
14. For each proof point, extract: metric, context, relevance to the target.
15. If no directly relevant proof point exists, frame adjacent experience honestly. Don't fabricate relevance.

### Step 4 — Draft the outreach message

16. Write a first draft following the channel-specific rules below.

**Channel rules (all channels):**
- Maximum 3 sentences for LinkedIn connection note (300 chars)
- 3–5 paragraphs max for email (approx 100–200 words)
- NO corporate-speak: "leverage," "synergize," "circle back," "deep dive," "paradigm shift"
- NO "I'm passionate about..." — show don't tell
- NO "I've been following your work" unless you can name something specific
- NO asking for a job. You're offering a solution to a problem, not asking for employment.
- NO sharing phone number in the first message
- The CTA must be specific: "15-min call," "coffee next week," "case study I can share," not "let me know"

**Email structure:**

- **Subject:** Specific, not generic. "Quick thought on {their recent signal}" or "{Mutual connection} suggested I reach out"
- **Paragraph 1 (Hook):** Show you understand their situation. Reference something specific.
- **Paragraph 2 (Credibility):** 1-2 sentences of relevant experience with concrete result. Don't list everything — just the most relevant thing.
- **Paragraph 3 (CTA):** Specific ask. A 15-minute call. Permission to share a case study. A sample deliverable.
- **Signature:** Name, title/tagline, portfolio URL, LinkedIn. Email and phone only if the user confirms.

**LinkedIn structure:**

- **Connection note (300 chars):** "{Hook}. {Relevant credential}. {CTA}"
  - Example: "Love the new analytics dashboard your team shipped — the real-time view is impressive. I've built similar data products for fintech teams and have some ideas on user adoption patterns. Would love to connect."
- **Follow-up message (after they accept, optional):** The same 3-paragraph email structure, but shorter. LinkedIn DMs are read on mobile.

**Twitter/DM structure:**

- Shorter than email. 1-2 sentences. Hook + CTA. Ask permission to share more.
- Example: "Love the thread on X. We've solved {problem} for similar teams — happy to share a case study if useful."

17. Apply all writing style rules from `_shared.md`: no em dashes, no buzzwords, active voice, concrete claims only.

18. Present the draft to the user with:
    - Channel recommendation (email vs LinkedIn vs Twitter — based on what signal was found)
    - Character/word count
    - Specific notes on what to personalize

### Step 5 — Suggest follow-up cadence

19. Generate the follow-up cadence (see Output Format above) adapted to the channel:
    - **Email:** 3 follow-ups over 3-4 weeks, then long-term nurture
    - **LinkedIn:** 1 follow-up after connection accepted, then 1 after 2 weeks, then close
    - **Twitter:** 1 follow-up DM after 1 week if they engaged, otherwise let it go
20. Remind the user to track each follow-up in `data/clients.yml` with date and content.

### Step 6 — Hand off for human review

21. Present the full output to the user (research brief + message + cadence + record update).
22. Explicitly tell the user:
    > **I will NOT send this for you. Review, edit, and send yourself. After you send, tell me and I'll update the client record.**
23. If the user requests edits (shorten, change channel, adjust tone), update the draft and re-present.

### Step 7 — Post-send recording

24. After the user confirms they sent the message, update `data/clients.yml` with the outreach entry.
25. If the first follow-up timing has passed, remind the user about the cadence.
26. Suggest next mode: `modes/nurture.md` if the conversation progresses beyond first contact.

## Edge Cases

- **No public info found:** If research returns no useful signals (small company, no online presence, decision-maker has no public profiles), tell the user what was found and ask for context. Draft a more general message without a specific hook. Flag the lack of personalization.
- **No clear hook:** If the research doesn't reveal a specific problem or opportunity to latch onto, write a value-proposition-driven message instead of a hook-driven one. Example: "I help {type of companies} solve {problem} — here's how I did it for {similar company}."
- **Target is a competitor's client:** If the company already works with a known competitor, frame the outreach as complementary rather than competitive. "I see you work with {competitor} on {scope}. My focus is {adjacent scope} — there could be interesting overlap."
- **Target is already a client in `data/clients.yml`:** If the company is already in the client list with status `active` or `proposed`, stop and ask the user: "This company is already a client with status '{status}'. Are you reaching out about a new decision-maker or a new service?"
- **Decision-maker recently changed jobs:** If research shows the person just moved to a new company, the hook writes itself. "Congrats on the new role at {company} — with your move, I wanted to share how I've helped teams like yours with {niche}."
- **Mutual connection available:** If a mutual connection is found, suggest asking for a warm intro instead of cold outreach. Offer to draft the intro request message.
- **Reaching out without a specific offer:** If the user wants to reach out generally ("I'm available for freelance work"), frame the message around a specific trigger (recent company news, open role, tech stack match) rather than generic availability.
- **Company is too large / enterprise:** For large companies, target a specific department or team lead, not the C-suite. The hook should reference a specific team's challenge, not the company's overall strategy.
- **Company is a startup (<20 people):** Startups respond better to direct, casual messages. Drop the formality. The decision-maker is often the founder or CTO — reach them directly.
- **Non-English target:** If the target company operates in a non-English language, draft the outreach in their language. Use the same structure but translate / adapt the content. Check `modes/_profile.md` for language preferences.
- **User provides a terrible hook idea:** If the user suggests a hook that's too salesy, desperate, or misaligned ("just tell them I'm available"), explain why it won't work and offer a better alternative.
- **Multiple targets at the same company:** If the user wants to reach out to multiple people at the same company, suggest reaching out to only one person at a time. Coordinated outreach from multiple angles feels desperate.
- **Seasonal / timing sensitivity:** If the research shows the company is in a busy period (end of quarter, product launch, holiday season), note that response rates may be lower and suggest a later send date.

## Examples

### Example 1: Startup outreach (seed-stage SaaS)

**Input:** "Draft cold outreach to Acme SaaS. They just raised a $3M seed round for their AI-powered project management tool. I want to offer AI consulting / chatbot building."

**Research findings:**
- Acme SaaS raised $3M seed round 3 weeks ago (TechCrunch)
- Job postings for 2 senior engineers on their careers page — they're scaling the team
- CTO posted on LinkedIn: "Hiring for Q3 — looking for engineers who can move fast"
- Product is a PM tool with AI features (roadmap mentions "AI assistant" under development)
- Decision-maker: CTO Jane Smith — confirmed via LinkedIn

**Draft:**

```markdown
## Research: Acme SaaS

**Decision-maker:** Jane Smith, CTO (confirmed: LinkedIn)
**Channel:** Email (jane@acmesaas.com — inferred from pattern)

**Company signals:**
- Raised $3M seed round 3 weeks ago — scaling aggressively
- Hiring 2 senior engineers (careers page)
- Product roadmap includes "AI assistant" feature
- Current team: 12 people, engineering-heavy

**Personal signals:**
- CTO's LinkedIn post: "Hiring for Q3 — looking for engineers who can move fast"
- Background: previously led engineering at a B2B SaaS company
- No public AI/ML experience in their background

**Hook opportunity:**
Their roadmap calls for an AI assistant, their CTO has no AI background, and they just raised — they need experienced AI help to hit their roadmap without slowing down core product development.

---

Subject: Quick thought on your AI assistant roadmap

Hi Jane,

Congrats on the seed round — impressive momentum. I noticed your product roadmap includes an AI assistant, and I wanted to share a quick thought.

I've built three production AI assistants in the last 18 months, including a RAG-powered chatbot that reduced support ticket resolution time by 60% for a SaaS company similar to your stage. Given your team is focused on scaling the core product, I wanted to offer myself as a fractional AI resource — I'd own the AI assistant end-to-end so your engineers stay on product.

Open to a 15-minute call to share how I've approached this for other B2B SaaS teams?

Best,
[User Name]
AI Consultant & Engineer
portfolio.example.com

---

## Follow-up Cadence

**Day 5:** "Quick follow-up on my note about the AI assistant. Happy to share a case study if timing isn't right yet."

**Day 14:** "Saw your team's latest feature release — looks great. Still open to a quick chat on AI assistant strategy when you're ready."

**Day 28:** "Last note from me. If the AI roadmap shifts priority, my door is open. Wishing you a strong Q3 launch."

**Client record to add:**
- name: Acme SaaS
- contact: Jane Smith
- title: CTO
- channel: email
- date: {today}
- status: contacted
- notes: Seed stage PM tool, AI assistant roadmap, offered fractional AI engineering
```

### Example 2: Mid-size company outreach

**Input:** "Draft outreach to MidCorp, ~200 employees, e-commerce platform. They're migrating from a legacy monolith to microservices and I do backend architecture / Node.js."

**Research findings:**
- MidCorp is a 200-person e-commerce company
- Blog post from CTO 2 months ago: "Our migration journey from Rails monolith to Node.js microservices"
- Engineering team is 25 people
- They're hiring for 2 senior backend roles (LinkedIn) — could mean the migration is straining the team
- Decision-maker: CTO Mark Johnson

**Draft:**

```markdown
## Research: MidCorp

**Decision-maker:** Mark Johnson, CTO (confirmed: LinkedIn)
**Channel:** Email or LinkedIn

**Company signals:**
- 200 employees, e-commerce
- 25-person engineering team
- Active migration: Rails monolith → Node.js microservices (CTO's blog)
- Hiring 2 senior backend engineers — migration is likely straining capacity
- Stack: Node.js, Postgres, AWS, Docker, Kubernetes

**Personal signals:**
- CTO wrote a detailed blog about the migration architecture
- Active on Twitter discussing microservices patterns
- Background: previously led platform engineering at a larger e-commerce company

**Hook opportunity:**
Their migration is active, they're hiring for capacity (not just new features), and the CTO is personally invested in the architecture — they need experienced help who can hit the ground running.

---

Subject: Your microservices migration — additional hands?

Hi Mark,

Read your blog post on the Rails-to-Node.js migration — great write-up. The service decomposition approach you outlined (domain-first, data-per-service) is exactly how I've approached similar migrations.

I've led two monolith-to-microservices migrations in the last 3 years: one for a fintech platform (12 services, 18-month timeline) and one for a logistics company (8 services, 12-month timeline). In both cases I worked alongside the existing engineering team to keep feature velocity up during the migration. I'm available as a fractional backend architect — 20-30 hours/week — to accelerate the migration without adding permanent headcount overhead.

Happy to jump on a call to discuss your current architecture and where I could add the most value.

Best,
[User Name]
Backend Architect / Node.js
portfolio.example.com

---

## Follow-up Cadence

**Day 5:** "Following up on my note about the migration. I'd be happy to do a 30-minute architecture review of one of your service boundaries — no commitment needed."

**Day 14:** "Saw that you're hiring for senior backend engineers — if the migration timeline is putting pressure on the team, I'm still available as a fractional resource."

**Day 28:** "Last note from me. If your migration timeline shifts or you need a second pair of eyes on a specific service, let me know. Best of luck with the build."

**Client record to add:**
- name: MidCorp
- contact: Mark Johnson
- title: CTO
- channel: email
- date: {today}
- status: contacted
- notes: Monolith-to-microservices migration, offered fractional backend architecture
```

### Example 3: Non-tech company with tech need

**Input:** "Draft outreach to a traditional manufacturing company — 500 people, family-owned, old systems. They're drowning in spreadsheets for inventory and order management. I do custom internal tools / automation."

**Research findings:**
- 500-person family-owned manufacturing company (3rd generation)
- No engineering blog, no tech LinkedIn presence
- Glassdoor reviews mention "outdated systems" and "too many manual processes"
- Company LinkedIn mentions "digital transformation" in their 2024 year-in-review post
- Decision-maker: COO Sarah Chen (based on org chart found on website — likely the person who would own operational tech)

**Draft:**

```markdown
## Research: Traditional Manufacturing Co.

**Decision-maker:** Sarah Chen, COO (inferred: company website org chart)
**Channel:** Email (sarah@company.com — inferred from pattern)

**Company signals:**
- 500 employees, family-owned manufacturing, 3rd generation
- Glassdoor: "outdated systems," "manual processes," "too many spreadsheets"
- LinkedIn post: "digital transformation in 2025" — they know they need to modernize
- No in-house engineering team (no tech job postings found)
- Decision-maker is COO — operations person, not technical

**Personal signals:**
- Sarah's background: operations management, MBA, 15 years in manufacturing
- No public technical background
- She likely feels the spreadsheet pain daily but doesn't know what to ask for

**Hook opportunity:**
They know they need to modernize ("digital transformation" is on their radar), the pain is real (spreadsheets everywhere, manual processes), but there's no one internally who can build the solution. The hook is framed as operational efficiency — not tech.

---

Subject: Cutting the spreadsheets — a thought on operational efficiency

Hi Sarah,

I noticed your team highlighted digital transformation as a 2025 priority, and I had a thought on where that could have the biggest impact quickly.

I specialize in building custom internal tools for manufacturing and operations teams — replacing spreadsheets with simple, connected systems that the non-technical team can actually use. For a recent manufacturing client with a similar profile (400 employees, family-owned), I built an order-to-inventory tracking system that cut their manual data entry time by 85% and eliminated their weekly reconciliation spreadsheets entirely. The team was up and running in 2 days with no training.

Would you be open to a 20-minute call to see if a similar approach could help your team?

Best,
[User Name]
Internal Tools & Automation
portfolio.example.com

---

## Follow-up Cadence

**Day 5:** "Quick follow-up on my note about internal tools. Happy to share the case study I mentioned — 2-minute read."

**Day 14:** "I put together a one-page overview of how a manufacturing company cut spreadsheet time by 85%. Happy to share if useful."

**Day 28:** "Last note from me. If operational efficiency becomes a priority down the line, I'd love to help. Wishing you a great quarter."

**Client record to add:**
- name: Traditional Manufacturing Co.
- contact: Sarah Chen
- title: COO
- channel: email
- date: {today}
- status: contacted
- notes: Spreadsheet-heavy ops, offered custom internal tools / automation
```

## Anti-Patterns

- **No research before drafting:** Reaching out without looking at the company or person's recent signals. A generic message wastes the first impression. Always research first.
- **Generic subject lines:** "Introduction" or "Freelance services" or "Quick question" — these get deleted unread. The subject line must be specific to the target.
- **Writing a novel:** Cold outreach is not a proposal. Keep email to 3-4 short paragraphs, LinkedIn to 300 chars for the connection note. The goal is a conversation, not a full pitch.
- **Selling before listening:** Leading with "I do X, here's my rate, let's work together." Instead, lead with a specific observation about their situation. Show you understand before you offer.
- **Desperation language:** "I'm available immediately," "I really need the work," "I can start tomorrow." This signals you're not selective and undermines your rate.
- **Faking the hook:** Making up a specific observation because the user wants one. If research is thin, write an honest message. "I saw {company} is in {industry}. I've been helping companies like yours with {niche}."
- **Mass-blast approach:** Sending the same template to 50 companies with only the name swapped. Every signal can be detected. Personalized outreach to 5 good-fit companies beats 50 templates.
- **Overpromising in the first message:** "I'll build you a complete AI platform in 2 weeks" or "I can cut your costs by 90%." Cold outreach is for starting a conversation, not making promises you can't verify.
- **Asking for too much in the CTA:** "Can you hop on a 3-hour strategy session?" or "Share your database credentials so I can do an audit." The CTA should be low-friction: 15-minute call, case study share, or a coffee.
- **Skipping the follow-up:** Most responses come after a follow-up, not the first message. If the user doesn't plan to follow up, they should know the odds are against them.
- **Cold outreach to replace an active client relationship:** If the target company already works with someone the user knows, don't poach. Instead, find an adjacent need that doesn't compete.
- **Channel mismatch:** Sending a long email to a Twitter-heavy tech founder, or a LinkedIn connection request to a traditional manufacturing COO who never uses LinkedIn. Match the channel to the person.
- **No client record:** Sending outreach without recording it in `data/clients.yml`. Without tracking, the user won't remember who they contacted, when, or what they said. Every outreach gets recorded.
- **Asking for a job in disguise:** "I noticed you're hiring for X role — I'm looking for freelance work." This is an application pretending to be outreach. If they need an employee, apply properly. If they need a freelancer, offer a specific service.
- **Ignoring the rate conversation:** First message is too early for rate. But if the user's rate is high for the target industry (e.g., $200/hr for a bootstrapped startup), note it in the draft and suggest framing around value, not rate.

## Length target: 250–400 lines. This file is part of the System Layer (auto-updatable).
