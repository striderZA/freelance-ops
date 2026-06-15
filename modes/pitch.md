---
description: Submit a proposal on a freelance platform (Upwork, Toptal, Direct)
argument-hint: "[lead number, platform type, or proposal draft context]"
---

# Pitch Mode — Platform Proposal Submission

## Purpose

Guide the user through submitting a proposal on a freelance platform or directly to a client. The AI drafts field-by-field responses based on the lead evaluation and proposal draft already in the report. The user reviews every field before copy-pasting or clicking submit. The AI NEVER auto-submits — the human always clicks the final button. This mode covers Upwork, Toptal, Direct email, and other submission channels.

## When to Use

- The lead has been evaluated (report exists) and the user wants to submit a proposal
- User says "help me apply to this lead" or "write the proposal for [lead #]"
- User has a proposal draft from the lead evaluation and needs to adapt it for a specific platform
- User has the platform submission form open and needs field-by-field guidance
- User is sending a direct email proposal and wants a personalized draft

Do NOT use this mode for:
- Evaluating a lead (use `modes/lead.md`)
- Writing the initial proposal draft (use `modes/proposal.md`)
- Following up after submission (use `modes/nurture.md`)
- Screening a client call (use `modes/screening.md`)

## Inputs

- **Lead number** (e.g., `003`) — loads the corresponding report from `reports/`
- **Platform type** — `upwork`, `toptal`, `direct-email`, `contra`, `fiverr`, or `other`
- **Optional:** Form fields pasted by the user, or a Playwright snapshot of the submission page
- **From system (auto-read):**
  - `reports/{num}-{client-slug}-{YYYY-MM-DD}.md` — full evaluation, proposal draft, legitimacy tier, rate strategy
  - `profile.md` — canonical CV / bio for proof points
  - `article-digest.md` (if exists) — detailed case studies
  - `config/rates.yml` — rate floor and target rates
  - `config/profile.yml` — identity, location, contact info
  - `modes/_profile.md` — writing style, narrative, negotiation scripts
  - `modes/_shared.md` — professional writing rules, formatting conventions
  - `modes/blocks/lead-blocks.md` — proposal strategy from Block E
  - `data/leads.md` — existing tracker entry to update after submission

## Output

The AI produces a chat-based submission guide with:

1. **Lead context summary** — company, role, score, rate, legitimacy
2. **Platform-specific field map** — what each platform requires and how to fill it
3. **Draft per field** — ready for the user to review, edit, and copy-paste
4. **Submission checklist** — the user ticks off each item before hitting submit
5. **Tracker update instruction** — what to record after submitting

The AI does NOT output a file — the submission guide lives in chat. After the user confirms submission, the AI updates `data/leads.md` with the `Proposed` status.

## Workflow

### Step 0 — Load context

1. Identify the lead number from the user's input (ask if ambiguous).
2. Read the report from `reports/{num}-{client-slug}-{YYYY-MM-DD}.md`.
3. Extract: score, legitimacy tier, rate strategy, proposal draft, Block E (Proposal Strategy), client name, role title.
4. Read `profile.md` and `article-digest.md` for latest proof points.
5. Read `config/rates.yml` for the rate floor and target.
6. Read `config/profile.yml` for name, email, location, contact info.
7. Read `modes/_profile.md` for writing style and narrative voice.
8. Read `modes/_shared.md` for professional writing rules.
9. Read `data/leads.md` to confirm the lead exists and its current status.

### Step 1 — Identify platform

10. Ask the user which platform they are submitting on (if not already provided).
11. Load the platform-specific field template:
    - **Upwork:** Title, Cover letter, Rate (hourly/fixed), Portfolio attachments, Q&A questions, Availability
    - **Toptal:** Cover letter, Rate preference, Availability, Expertise tags, Portfolio links, Screening notes
    - **Direct email:** Subject line, Body (intro → context → credibility → approach → closing), Attachment (PDF CV/portfolio), Signature block
    - **Contra:** Cover letter, Rate, Tags, Portfolio items, Availability
    - **Fiverr:** Gig requirements (if invited), Custom offer fields: description, delivery time, revisions, price, extras
    - **Other:** Ask the user to paste the form fields or share a screenshot

### Step 2 — Draft each field

12. For each required field:
    - Read the proposal draft from the report (or the proposal draft from Block E if no full draft exists).
    - Adapt the language to the platform's style and character limits:
      - **Upwork:** 1st-person, direct, 2000-5000 char cover letter. Keep it skimmable. Bullet-proof points.
      - **Toptal:** Professional, slightly formal. Emphasize expertise and track record. 1000-3000 chars preferred.
      - **Direct email:** Professional but warm. Clear subject line. 3-4 paragraph body. Include a call to action.
      - **Contra:** Modern, casual-professional. 500-2000 chars. Portfolio-first.
      - **Fiverr:** Brief and punchy. 500-1500 chars. Focus on deliverables and timeline.
    - If the lead evaluation flagged gaps or risks, include a mitigation phrase in the relevant field.
    - Never invent metrics. Only use proof points from `profile.md` or `article-digest.md`.
    - Apply all writing rules from `_shared.md`: no em dashes, no buzzwords, active voice, concrete claims.
13. Present each draft to the user with a clear label and a copy-paste block.

**Format for field presentation:**

```markdown
### Field: [Field name] ([platform])

> [Draft response ready for review]
>
> *Character count: {N} / {limit if known}*

**Notes for review:**
- {specific guidance about this field}
- {what the user should personalize}
- {any red flags or gaps addressed}

---
```

14. For sensitive fields (rate, availability, work authorization), always ask for user confirmation rather than assuming. Show the recommended value from the report but let the user decide.

### Step 3 — Hand off for human review

15. After drafting all fields, present the complete submission checklist (see below).
16. Explicitly tell the user:
    > **I will NOT submit this for you. Review each field, make any edits, then click Submit yourself.**
17. Wait for the user's response. Do not proceed until the user confirms they have reviewed and submitted.

### Step 4 — Post-submission recording

18. Ask the user to confirm the proposal was submitted (date and any confirmation reference).
19. Update `data/leads.md`:
    - Change status from `Evaluated` to `Proposed`
    - Add the proposal date to notes
    - Add the proposal reference/confirmation if provided
20. Suggest the next step: `modes/nurture.md` for follow-up cadence after 5-7 days of no response.

## Submission Checklist

Present this checklist to the user before they submit:

- [ ] Review the proposal text — read it aloud or paste to a colleague
- [ ] Upload your portfolio / rate card — attach relevant work samples
- [ ] Upload your CV PDF — generated via `modes/pdf.md` if needed
- [ ] Set your bid (hourly or fixed) — confirm it matches your rate floor from `config/rates.yml`
- [ ] Review the platform's terms — especially payment protection, fees, and escrow
- [ ] Check for typos and formatting — read the proposal in the platform's editor, not just the draft
- [ ] Verify attachments — all files open correctly and are the right versions
- [ ] Click Submit (you do this) — I will not click it for you
- [ ] Note the proposal date in tracker — tell me the date and I'll update `data/leads.md`

## Edge Cases

- **No lead report exists:** The lead must be evaluated first. Ask the user to run `modes/lead.md` first. Refuse to draft a proposal without a report.
- **Lead score below 4.0:** Remind the user that the lead scored below the proposal threshold. Ask for explicit override before drafting. If the user insists, proceed but flag the score in the draft notes.
- **Block G = likely-scam:** Refuse to draft any proposal. Refer to the Block G findings in the report. If the user insists, flag that the legitimacy tier indicates scam patterns and the user accepts all risk.
- **Block G = caution:** Proceed with drafting but include caution flags in the submission notes. Advise the user to avoid sharing personal information until a contract is signed.
- **Platform UI changed:** If the user says "the fields don't match what you described," ask them to paste the actual field labels or share a screenshot so the AI can adapt.
- **Character limits:** If a platform has tight character limits (e.g., Upwork title: 80 chars), the AI respects them in the first draft. If the user needs a shorter version, ask for the limit and re-draft.
- **File upload fields:** The AI cannot upload files. Guide the user to attach the correct file (CV PDF from `output/`, portfolio files from `data/portfolio/`). Describe exactly which file to attach.
- **Multiple proposals for the same lead:** If the lead already has `Proposed` status in the tracker, ask if this is a revision or a duplicate submission. For revisions, preserve the original proposal date and add a revision note.
- **Toptal job marketplace:** Toptal's process is talent-team mediated. Draft the covering notes for the talent team rather than a direct client pitch. Adjust tone accordingly.
- **Direct email to a referral:** Warm introduction context changes the opening. Ask if the user was referred and by whom. Include the referrer's name in the subject line if permission was given.
- **Client provided a brief / RFP:** If the client shared a detailed brief or RFP document, ask the user to share it. The proposal should mirror the RFP structure directly.
- **User wants to revise before submitting:** Support iterative editing. The user can say "shorten the cover letter to 3 paragraphs" or "make it more technical" and the AI re-drafts.
- **Platform requires video introduction:** Some platforms (Upwork, Toptal) allow video. Note that the AI cannot record video. Suggest the user record a 60-90 second Loom or platform-native video introducing themselves.
- **Rate negotiation required:** If the lead's budget is below the user's floor, flag this in the rate field. Draft a rate justification paragraph the user can include.
- **Timezone / availability questions:** Read availability from `config/profile.yml`. If not set, ask the user directly — do not assume.
- **User is on mobile:** Drafts should be concise for mobile copy-paste. Offer to split long responses into smaller chunks.

## Examples

### Example 1: Upwork submission

**Input:** "Submit proposal for lead #003, Upwork"

**Lead context:**
- Report: `reports/003-acme-corp-2026-06-15.md`
- Score: 4.1/5 — Grade B
- Legitimacy: verified
- Role: "AI Chatbot Developer — 4-week engagement, $95/hr"
- Rate floor: $75/hr, Target: $120/hr
- Proposal draft: RAG chatbot proof point, LangChain experience, 60% ticket reduction metric

**AI output (abbreviated):**

```markdown
## Submitting to Upwork — Acme Corp / AI Chatbot Developer

Based on Report 003 (4.1/5, Verified)

### Field: Title (Upwork)

> AI Chatbot Developer — LangChain, RAG, Next.js

*Character count: 55 / 80*

### Field: Cover Letter (Upwork)

> Hi [Client Name],
>
> I read your brief on the AI customer support chatbot and it maps directly to work I've delivered for a previous client. I built a RAG-powered chatbot using LangChain + Postgres that reduced ticket resolution time by 60% — the same stack you're describing.
>
> **Why me:**
> - Built production RAG pipelines with LangChain, Postgres, and OpenAI embeddings
> - Delivered a similar 4-week chatbot engagement for a Toptal client on time and under budget
> - Strong Next.js experience — the dashboard layer is straightforward with my existing component library
>
> **My approach:**
> Week 1: Data ingestion pipeline + embedding index setup
> Week 2: Core query flow + context retrieval
> Week 3: Dashboard + human-in-the-loop review UI
> Week 4: Testing, deployment, handoff
>
> I'm available to start next week. Happy to discuss in a brief call.
>
> Best,
> [User Name]

*Character count: 980 / 5000*

### Field: Rate (Upwork)

> Your budget shows $95/hr. My target rate is $110/hr for AI engagements. I'm open to $100/hr to align on value — does that work?

**Notes:** The lead budget is $95/hr, your floor is $75/hr, your target is $120/hr.
The draft opens at $100/hr as a compromise. Confirm the rate you want to bid.

### Field: Portfolio (Upwork)

Attach your CV PDF from `output/` and the RAG architecture case study from `data/portfolio/`.

---

### Checklist

- [ ] Review the proposal text
- [ ] Upload your portfolio / rate card
- [ ] Upload your CV PDF
- [ ] Set your bid — confirm $100/hr or your preferred rate
- [ ] Review Upwork's terms (sliding fee: 20% first $500, then 5%)
- [ ] Check for typos
- [ ] Verify attachments
- [ ] Click Submit (you do this)
```

### Example 2: Toptal submission

**Input:** "Submit proposal for lead #005, Toptal"

**Lead context:**
- Report: `reports/005-dataware-inc-2026-06-16.md`
- Score: 4.4/5 — Grade B+
- Legitimacy: verified
- Role: "Data Pipeline Architect — AWS + dbt + Airflow, 3-month engagement, $130/hr"
- Rate floor: $75/hr, Target: $120/hr

**AI output (abbreviated):**

```markdown
## Submitting to Toptal — DataWare Inc / Data Pipeline Architect

**Important:** Toptal uses a talent-team mediation model. This covering note goes to the
Toptal team, not the client directly. The team will match you based on expertise tags.

### Field: Covering Note (Toptal)

> Data architect with 7+ years building production data pipelines on AWS. I've delivered
> 3 end-to-end data platforms using dbt + Airflow + Snowflake/Redshift. Most recently,
> I built a real-time analytics pipeline processing 2M+ events/day that reduced reporting
> latency from 24h to 15min. Comfortable with Terraform, Docker, and CI/CD for data infra.

*Character count: 340 / 3000*

### Field: Expertise Tags (Toptal)

Select: AWS, dbt, Airflow, Data Engineering, Python, Terraform, Redshift, Snowflake, ETL

### Field: Rate Preference (Toptal)

The lead is $130/hr and your target is $120/hr. Set rate to $130/hr — this is within your range.

### Field: Availability (Toptal)

> Full-time (40h/week) starting within 2 weeks

---

### Checklist

- [ ] Review the covering note
- [ ] Set expertise tags to match the JD
- [ ] Confirm $130/hr rate
- [ ] Confirm availability
- [ ] Click Submit (you do this)
- [ ] Note date in tracker
```

### Example 3: Direct email proposal

**Input:** "Draft a direct email for lead #008, I'll send it from my own inbox"

**Lead context:**
- Report: `reports/008-innovate-labs-2026-06-18.md`
- Score: 4.6/5 — Grade A
- Role: "AI Automation Consultant — 6-month retainer, $15k/month"
- Source: Referral from former colleague at Innovate Labs

**AI output (abbreviated):**

```markdown
## Direct Email Draft — Innovate Labs / AI Automation Consultant

### Subject Line

> AI automation for Innovate Labs — intro from [Referrer Name]

### Body

Hi [Client Contact Name],

[Referrer Name] suggested I reach out — they thought our work on AI
automation would be relevant to what you're building at Innovate Labs.

I've been building production AI systems for the past 5 years. Most recently:
- Led an automation engagement that reduced manual processing by 80% for a
  fintech client, saving $240k/year in operational costs
- Built a multi-agent workflow system that handles 500+ daily support tickets
  with 92% first-response accuracy
- Designed a document intelligence pipeline extracting structured data from
  10k+ PDFs/month with 97% field accuracy

I'd love to discuss how these approaches could apply to Innovate Labs'
automation goals. Are you free for a 15-min call next week?

Best,
[User Name]
[Your Title / Tagline]
[Your Website / LinkedIn]
[Your Phone (optional)]

### Attachments

Attach: `output/cv-user-name-2026-06-18.pdf` (generated via `modes/pdf.md`)
Attach: `data/portfolio/automation-case-study.pdf` (if exists)

---

### Checklist

- [ ] Personalize the greeting with the client's name
- [ ] Confirm [Referrer Name] is comfortable being mentioned
- [ ] Review and edit the body
- [ ] Attach CV PDF and case study
- [ ] Send from your email client (I do not send emails)
- [ ] Note date in tracker
- [ ] Set follow-up reminder via `modes/nurture.md` (5-7 days)
```

## Anti-Patterns

- **Auto-submit:** NEVER auto-submit a proposal. NEVER fill a form and trigger submit. The human must always click the final button. Stop before the submit action.
- **Skip review on low-value leads:** Every proposal deserves human review. A lead being "quick to apply for" is not an excuse to skip the checklist. Low-value leads often have hidden costs (scope creep, difficult clients).
- **Assuming rate without confirmation:** Always confirm the rate the user wants to bid, even if the report recommends a specific number. The user may have new information or a negotiation strategy.
- **One-size-fits-all proposals:** Every platform has its own tone, format, and expectations. Upwork cover letters are not Toptal covering notes. Adapt the draft to the channel.
- **Inventing metrics:** Never fabricate numbers, timelines, or results. If a proof point doesn't have a metric from `profile.md`, describe the work qualitatively. The user can add metrics later.
- **Skipping the liveness check:** Before drafting, confirm the posting is still active by checking the report's Block G or asking the user to verify. Submitting to a closed posting wastes everyone's time.
- **Writing too much:** Platform proposals are read on screens, often on mobile. Brevity wins. 3-5 bullet-pointed proof points beat a wall of text every time.
- **Ignoring the rate discussion:** Avoidance is not strategy. If the user's rate floor is above the lead's budget, address it in the proposal. A clear rate justification paragraph builds trust.
- **Ghosting after submission:** Proposal submission is not the end. Always suggest setting a follow-up cadence — 5-7 days silence → nurture mode. The user should track the next action.
- **Over-promising scope in the proposal:** The proposal draft from the evaluation is a starting point. Adding extra deliverables to "win" the bid leads to scope creep. The proposal should match the evaluated scope.
- **Platform fees not accounted for:** Upwork takes 20% of the first $500 with a client, then 5%. Contra takes 0% (in 2025). Factor platform fees into the bid rate. Flag fee structure in the rate field notes.
- **No backup file:** If the platform editor crashes, the user loses their work. Suggest drafting in a local editor and pasting in, or keeping the AI draft as backup.
