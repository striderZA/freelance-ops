---
description: Deep-dive research on a freelance client or company
argument-hint: "[client name, Upwork profile URL, company domain, or LinkedIn URL]"
---

# Deep Client Research Mode

## Purpose

This mode performs structured deep-dive research on a prospective freelance client or company. Given a client name, platform handle, company domain, or LinkedIn URL, it produces a research report covering identity and background, reputation and payment history, recent activity, red flags and risks, and a clear verdict. This is the research engine behind Block D of `modes/lead.md` — use it when the standard lead evaluation flags insufficient client data, or as a standalone pre-engagement check before high-value proposals, screening calls, or long-term contracts.

## When to Use

- Before proposing on a high-value lead (>$X,XXX total engagement value)
- When Block D of a lead evaluation flags insufficient client info or ambiguous signals
- When the client feels "off" — too good to be true, vague, or too eager
- Before a screening call with a potential long-term client or retainer engagement
- When you have a client name or company name from an inbound inquiry and want to vet them before responding
- When evaluating a platform client (Upwork, Toptal, Contra, Fiverr) who has little visible history
- When a client asks you to sign an NDA before discussing scope — research them first
- Before entering a subcontracting arrangement where the agency's reputation matters
- Standalone research: user says "research this client for me" without a lead evaluation

Do NOT use this mode for full-time employment company research (use `modes/oferta.md` with the interview-prep sub-flow). Do NOT use this mode when `modes/lead.md` Block D already provides sufficient signal for a decision.

## Inputs

- **From user (any of these):**
  - Client name (person or company)
  - Upwork profile URL or handle
  - Company domain name
  - LinkedIn company or person URL
  - Toptal / Contra / Fiverr profile URL
  - Email domain (for phishing/scam checks)
- **From system (auto-read):**
  - `modes/_profile.md` — user's niches, rate preferences, writing style
  - `modes/_shared.md` — global rules, report formatting conventions
  - `config/profile.yml` — identity, location, role targets
  - `data/clients.yml` (if exists) — past client engagement history, payment notes, relationship quality flags
  - `data/leads.md` — check if this client has existing tracker entries
  - `data/scan-history.tsv` — check if this client has reposted the same scope multiple times

## Output Format

Chat response with these sections. Do NOT write a report file unless the user specifically asks — this mode delivers results directly to the user so they can decide how to proceed. If the user says "save this" or "add to a file," write the research to `reports/{client-slug}-deep-{YYYY-MM-DD}.md`.

### 1. Identity

Who they are, what they do, where they operate. Cover:

- Company name, domain, headquarters location
- Whether they are a direct client, agency, staffing firm, or intermediary
- LinkedIn company page existence and follower count
- Business registration / legal entity (check SEC filings, Companies House, Crunchbase, OpenCorporates)
- Industry, niche, typical engagement size
- Key individuals: founder, CTO, hiring manager (if identifiable)
- Platform presence (Upwork, Toptal, etc.) — handles, account age, total spent, hire count

### 2. Reputation

Payment history, platform signals, reviews, industry standing:

- **Upwork signals (if applicable):** Job Success Score, total spent, hire rate, repeat-hire ratio, payment verification status, client's own review feedback from freelancers
- **Toptal signals (if applicable):** Client history, engagement length, payment reliability
- **Other platform signals:** Fiverr levels, Contra badges, Freelancer reviews
- **Web presence:** Company website quality, blog, case studies
- **Glassdoor / Indeed / Comparably:** Employee reviews about the company (not freelancer reviews — different signal)
- **Better Business Bureau / Trustpilot / Sitejabber:** Complaints from customers or contractors
- **LinkedIn recommendations:** Endorsements from past collaborators
- **Past client engagement (from `data/clients.yml`):** Were they a good payer? Reasonable scope managers? Any disputes?

### 3. Recent Activity

Signs of current business health and hiring intent:

- Currently hiring freelancers? Check active postings on Upwork, LinkedIn, We Work Remotely
- Recent funding rounds or leadership changes (Crunchbase, TechCrunch)
- New product launches, website redesign, or market expansion
- Recent legal filings, lawsuits, or regulatory actions
- Social media activity (LinkedIn posts, Twitter/X, company blog)
- Same scope reposted multiple times in scan-history.tsv — possible churn or unclear requirements

### 4. Red Flags

Concrete concerns with evidence, organized by severity:

| Severity | Signal | Evidence |
|----------|--------|----------|
| Critical | Known scam pattern | Name matches scam database / phishing list |
| Critical | Off-platform payment push | Client requested wire/crypto/gift cards |
| High | No verifiable web presence | Domain registered 30 days ago, no LinkedIn |
| High | Negative freelancer reviews | Pattern of non-payment, scope creep, ghosting |
| High | Mismatched identity | Name on Upwork ≠ name on contract ≠ domain WHOIS |
| Medium | Very new account + high-value job | Upwork account <90 days old, posting $10k+ projects |
| Medium | Poor English in a high-paying role | Senior role description with grammar errors |
| Medium | Vague company description | "We are a leading provider of solutions..." — no specifics |
| Low | No social media presence | Acceptable for small brick-and-mortar businesses |
| Low | Generic email domain | Gmail/Yahoo for an established company is suspicious |

### 5. Verdict

One of three clear recommendations:

- **Proceed** — Client is verified, reputable, and actively hiring. No significant concerns.
- **Ask for more info** — Ambiguous signals. Recommend requesting specific clarifications (references, portfolio of past engagements, LinkedIn connections). List what to ask.
- **Decline** — Multiple or critical red flags. Strongly recommend against engagement. Include a summary of why.

## Workflow

Follow these steps in order. Do not skip or reorder.

### Step 0 — Read system files

1. Read `data/clients.yml` (if exists) — check if this client already has a record. If they do and their status is `good-payer` / `reliable`, skip deep research unless the user explicitly wants it. If their status is `problematic` / `dispute`, surface that immediately.
2. Read `modes/_profile.md` — understand the user's niche and common client types.
3. Read `modes/_shared.md` — understand report format and global rules.
4. Read `config/profile.yml` — confirm the user's identity context.

### Step 1 — Classify the input

5. Determine what kind of input the user provided:
   - **Company name only** — "Research Acme Corp" → WebSearch for company info
   - **Domain name** — "acmecorp.com" → check website, WHOIS, company registration
   - **Upwork URL** — "upwork.com/freelancers/..." (wait, that's a freelancer URL; client URL is different) or job posting URL → extract client name from posting
   - **LinkedIn URL** — company or person → extract from LinkedIn
   - **Person name** — "John Smith" → check LinkedIn, Upwork, company association
   - **Email domain** — "@acmecorp.com" → check for phishing patterns, domain age
6. If multiple inputs are available (e.g., name + domain + LinkedIn), use all of them for cross-referencing.

### Step 2 — Gather publicly available information

7. **WebSearch the company name + domain:**
   - Search `"{company name}" freelance review` or `"{company name}" Upwork client`
   - Search `"{company name}" scam` or `"{company name}" lawsuit`
   - Search `"{company name}" Glassdoor` or `"{company name}" employee review`
   - Search `"{company name}" funding` or `"{company name}" Crunchbase`
   - Search `"{company name}" site:reddit.com` for unfiltered community opinions

8. **Check the company website (via Playwright `browser_navigate` + `browser_snapshot`):**
   - About page, team page, case studies, blog
   - Check domain registration age via WHOIS lookup (note: use WebSearch "whois {domain}" or a free WHOIS tool)
   - Check for SSL certificate issues, broken pages, template content
   - Note the quality: custom design vs template, contact info, physical address

9. **Check LinkedIn (via WebSearch `site:linkedin.com/company {company name}`):**
   - Company size, industry, headquarters
   - Recent posts and engagement
   - Employee count trajectory (growing, shrinking, stable)

10. **Check platform presence (if applicable):**
    - Upwork: search for the client by name on Upwork or via the job posting
    - Toptal: similar — limited public data, note what's available
    - Contra / Fiverr / Freelancer: check profile page, reviews, completion rate

11. **Check business registration (optional, for high-value leads >$25k):**
    - Use WebSearch `"{company name}" Companies House` (UK)
    - Use WebSearch `"{company name}" SEC filing` (US public companies)
    - Use WebSearch `"{company name}" OpenCorporates`
    - Note the legal entity name, registration number, jurisdiction

### Step 3 — Cross-reference with local data

12. Check `data/clients.yml` — any past engagement with this client? Notes on payment behavior, communication quality, scope changes?
13. Check `data/leads.md` — has this client posted multiple leads? Pattern of reposting (churn indicator)?
14. Check `data/scan-history.tsv` — has the same or similar scope appeared multiple times in scan results? If 3+ reposts in 90 days, flag as a potential scope-confusion or churn signal.
15. Check `output/` for any past proposals or PDFs sent to this client.

### Step 4 — Produce the verdict

16. Evaluate all collected signals and assign severity flags.
17. Formulate the verdict:
    - **Proceed** — all signals positive or neutral, client verifiable, no red flags
    - **Ask for more info** — some signals are ambiguous; recommend specific clarifications
    - **Decline** — critical or multiple high-severity flags present
18. Present the research to the user with the section format described above.

### Step 5 — Offer to record (optional)

19. If the user decides to proceed, ask: "Want me to save this client record to `data/clients.yml` for future reference?"
20. If yes, add an entry to `data/clients.yml` with: name, domain, platform handles, research date, verdict, and any notes.

## Ethical Research Rules

- **Do not impersonate.** Conduct all research as a freelancer performing due diligence. Do not pretend to be a potential customer, journalist, or investigator.
- **Cite sources.** Every signal needs a source. "The company has no LinkedIn page" is not a statement of fact without attempting to find it.
- **Distinguish fact from inference.** "The domain was registered 30 days ago" is a fact. "This might be a shell company" is an inference — label it as such.
- **Present red flags neutrally.** Use the signal/evidence framework. Let the user decide what weight to assign each flag.
- **No doxxing or deep personal research.** Stick to professional and publicly available business information. Do not research individuals beyond what's relevant to their professional capacity as a client.
- **Respect NDA ambiguity.** If the client has a legitimate NDA (e.g., works with Apple, defense contractors), limited public information about them is expected. Note this in the verdict.
- **No automated scraping.** All web access should be manual/fetch-based within acceptable use. Do not build scrapers.

## Edge Cases

- **Client is very private (no public info):** Note the lack of info as a signal in Red Flags. Provide a neutral verdict ("Ask for more info") with recommended questions the user can ask to verify legitimacy. Some legitimate clients have no web presence (e.g., solo consultants, very small businesses, government contractors bound by NDA).
- **Name collision (common name):** Differentiate by collecting more input (username, platform handle, company affiliation). If ambiguity persists, report all candidates and ask the user to clarify.
- **Client already in `data/clients.yml` as known good/bad:** Surface the existing record immediately. Do not duplicate research. Offer to update the record if the user has new information.
- **Client uses a P.O. box or virtual office address:** This is common for small businesses and remote companies. Flag it as a Medium signal only if combined with other flags (new domain, no reviews, no LinkedIn). Alone, it's Low.
- **Large company research (e.g., "Acme Corp" with 10,000 employees):** Focus on the specific department or team that is hiring. A large company's overall reputation is less relevant than the specific manager/budget/department. Note this in the report.
- **Client is an agency / staffing firm:** Flag this clearly in the Identity section. Research the agency itself AND try to identify the end-client. Note that the agency may add a markup layer, filter communication, and control scope.
- **Client requests NDA before scope discussion:** This is common for funded startups working on stealth products. Accept a mutual NDA if the company is verifiable. If the company is unverifiable, flag as Medium concern.
- **Client is a government entity:** Research is often public (RFPs, procurement records, awarded contracts). Payment cycles are longer but reliable. Flag procurement complexity in the Verdict.
- **Client name is only a first name + generic Gmail:** This is a High signal unless they have a verifiable platform presence (good Upwork history, established LinkedIn). Recommend asking for a company name or LinkedIn before proceeding.
- **Multiple users report the same client on Reddit/forums:** If a client has negative reviews on r/Upwork, r/freelance, or similar, include them in the report with a link. Note that one-sided stories need corroboration.
- **Client is a known company but the contact person is not verifiable:** The company itself may be legitimate, but the individual reaching out may not have authority to hire. Flag as Medium concern. Recommend asking the individual to use their company email for communication.
- **Cross-border client with no local presence:** If the client is in a different country with no verifiable local presence, flag currency risk, timezone mismatch, and legal enforcement difficulty. This is not inherently a red flag — many legitimate cross-border engagements exist — but include practical considerations.

## Examples

### Example 1: Verified good client

**Input:** "Research Acme Software Solutions — they reached out on Upwork for a 3-month AI consulting engagement at $150/hr. The contact is Sarah Chen, CTO. She has a LinkedIn profile."

**Expected research:**
- **Identity:** Acme Software Solutions, acmesoft.com — 50-200 employees, headquartered in Austin, TX. Founded 2018. Series B ($15M from A16Z). Sarah Chen is indeed CTO with 15+ years experience. Company builds SaaS for supply chain logistics.
- **Reputation:** Upwork account is 3 years old, $200k+ total spend, 95% JSS, 12 previous freelancers hired — 8 repeat engagements. No negative reviews. Glassdoor 4.2/5 (42 reviews). Company publishes engineering blog with regular updates.
- **Recent Activity:** Posted 3 job openings in the last 30 days (2 full-time, 1 freelance). Recently closed Series B (Jan 2026). Blog shows active product development. Sarah Chen has posted 2 LinkedIn articles in the last month about AI in logistics. No reposting pattern in scan-history.tsv.
- **Red Flags:** None detected. All signals positive or neutral.
- **Verdict:** **Proceed.** This is a well-funded, established company with a track record of hiring freelancers and paying well. The CTO is actively engaged in the technical community.

### Example 2: No public info client

**Input:** "Research 'James Wilson' — he emailed me directly about building a mobile app. No company name. He says he's a 'consultant.' Email is from Gmail."

**Expected research:**
- **Identity:** Cannot determine. "James Wilson" is a common name. The Gmail address yields no company affiliation. No known company name to research. Likely an individual consultant or intermediary.
- **Reputation:** No platform presence to check. No web presence. No record in data/clients.yml.
- **Recent Activity:** Unknown. Cannot verify.
- **Red Flags:**
  - Medium: No company name, no domain-based email — communication is personal, not professional
  - Medium: Individual consultant clients often have less defined scope, slower payment, and higher budget risk than established companies
  - Note: This is not inherently suspicious — many legitimate clients start with a personal email. But the lack of information makes it impossible to verify.
- **Verdict:** **Ask for more info.** Recommended questions for the user to ask: "Can you share your company name or LinkedIn profile?" "What organization are you building this app for?" "Do you have past projects I can review?" "Can we discuss on a video call?"

### Example 3: Likely scam / serious red flags

**Input:** "Research 'Global Solutions Inc.' — they posted a job on Upwork for a 'Full-Stack Developer' with '$10k/week' for what looks like a standard CRUD app. The client account is 5 days old. They want me to move to Telegram and accept payment via Wire transfer."

**Expected research:**
- **Identity:** "Global Solutions Inc." — no matching company found on LinkedIn, Crunchbase, or Google. Domain globalsolutions-inc.com was registered 3 days ago with privacy WHOIS. No physical address beyond "123 Main St, USA." No employees on LinkedIn.
- **Reputation:** Upwork account is 5 days old. Zero hire history. Zero total spend. No payment verification. No reviews. No web presence beyond a single-page template website with Lorem ipsum placeholder text.
- **Recent Activity:** Same job appears to have been posted and taken down twice in the last week (check scan-history.tsv). No other activity.
- **Red Flags:**
  - Critical: Off-platform payment push (Telegram + Wire transfer) — irreversible, untraceable
  - High: Domain registered 3 days ago — transient, cannot be held accountable
  - High: No verifiable company — cannot be found on any business registry
  - High: Unrealistic pay ($10k/week for CRUD app) — classic lure
  - High: Account age 5 days with zero history — throwaway profile
  - Medium: Same scope reposted multiple times — churn signal
  - Medium: Template website with Lorem ipsum — no real business
- **Verdict:** **Decline.** Multiple critical and high-severity red flags consistent with known advance-fee and overpayment scam patterns. Do not engage. Do not communicate on Telegram. Do not accept Wire transfers from this client. Report the Upwork posting if the platform supports it.

## Anti-Patterns

- **Single-source confidence:** Relying on one source (e.g., only checking the website) and calling it comprehensive research. Cross-reference at least 3 independent sources before drawing conclusions.
- **Confirmation bias:** Finding positive signals and stopping early. Actively look for negative signals with the same energy as positive ones.
- **Ignoring local data:** Conducting full web research without first checking `data/clients.yml`. The user may already have experience with this client. Always check local data first.
- **Verdict without evidence:** "This client seems fine" — a verdict must cite the sources and signals that support it. Every verdict needs a chain of evidence.
- **False equivalence:** Treating "no negative reviews" the same as "positive reviews." Absence of evidence is not evidence of absence — especially for new or private clients.
- **Over-researching low-value leads:** Spending 30 minutes researching a $500 client. The depth of research should scale with the potential engagement value. For low-value leads (<$2k), a quick check of platform signals is sufficient.
- **Privacy line crossing:** Researching a client's personal social media, family members, or non-professional activities. Stick to professional and business-relevant information only.
- **Fear-mongering:** Presenting normal business practices (P.O. box, NDA request, cross-border engagement) as red flags without context. A red flag is a deviation from normal patterns, not a normal pattern itself.
- **Skipping Step 0:** Jumping straight to WebSearch without checking `data/clients.yml` first. If the user already has a record, save the research time.
- **Incomplete cross-referencing:** Checking LinkedIn but not Crunchbase, or checking the website but not WHOIS. Each source adds a dimension of verification.
- **Relying on Reddit/forums as primary source:** Community posts can be biased, exaggerated, or fabricated. Use them as leads for further investigation, not as conclusive evidence.

## Research Depth by Engagement Value

| Engagement Value | Time Budget | Sources to Check |
|-----------------|-------------|------------------|
| <$2k | 5 min | Platform history only (Upwork JSS, reviews) |
| $2k-$10k | 15 min | Platform + LinkedIn + WebSearch |
| $10k-$50k | 30 min | Full stack: platform, LinkedIn, Crunchbase, WHOIS, WebSearch, Reddit, Glassdoor |
| $50k+ / retainer | 60 min | Full stack + business registry, SEC filings (if public), reference calls if possible |

This is a guideline, not a rule. If any source produces a critical red flag, escalate regardless of time budget.

## Length target: 250-400 lines. This file is part of the System Layer (auto-updatable).
