---
description: Interactive onboarding interview — walk the user through setting up their profile
argument-hint: "[section-name] or blank for full onboarding"
---

# Mode: onboarding — Interactive Profile Setup

## Purpose

This mode runs an interactive onboarding interview that guides the user through populating their freelance-ops profile. It asks one question at a time, validates each answer, writes it to the appropriate file (`modes/_profile.md`, `config/profile.yml`, or `config/rates.yml`), and proceeds to the next topic. By the end, the system has everything it needs to score leads, generate CVs, and write proposals that sound like the user — not generic AI output. This covers the Step 2-5 flow described in `AGENTS.md` (profile, portals, tracker, getting to know the user).

## When to Use

- **First run** — the user runs `/freelance-ops` for the first time and `node doctor.mjs --json` returns `onboardingNeeded: true`
- **Re-configure** — the user says "let's redo my profile" or "reset everything"
- **Update specific section** — the user says "update my rates" or "change my exclusions" or "add a proof point"
- **Fill gaps** — `doctor.mjs` reports specific missing fields in profile.yml and no user data is in the files yet

Do NOT use this mode when the user pastes a job URL, asks for an evaluation, or starts any other task mode — the onboarding is a standalone setup flow.

## Inputs

- **From user (for new runs):** Nothing — the interview starts from scratch. The user just types answers to each question as it comes.
- **From user (for re-runs):** The section name to update, e.g. `rates`, `niches`, `exclusions`, `availability`, `positioning`, `proof-points`, `engagements`, `platforms`, `identity`, or `scripts`. The interview skips to that section.
- **From system (re-runs only):** Existing values from `modes/_profile.md`, `config/profile.yml`, `config/rates.yml` — so the user can see what they currently have before updating.

## Output Format

Populated files in the user's own data layer (never auto-overwritten):

| File | What gets written |
|------|-------------------|
| `modes/_profile.md` | Identity, niches, platforms, positioning, adaptive framing, proof points, past engagements, cross-cutting advantage, availability, exclusions, negotiation scripts, location policy |
| `config/profile.yml` | Candidate name, email, location, timezone, target roles, compensation bounds, narrative fields (headline, exit_story, superpowers, proof_points), location config, CV output format |
| `config/rates.yml` | Per-niche rate floors, per-platform rate floors, target rates — structured data for the scoring system |

The interview also produces a completion summary at the end:

> Profile setup complete. Here's what we configured:
> - Identity: [name], [location], [timezone]
> - [N] target niches configured with rates
> - [M] platforms configured
> - Positioning narrative ready
> - [P] proof points logged
> - [E] past engagements recorded
> - Availability: [hours] hrs/wk, [lead time] lead time
> - [X] exclusion categories set
> - [S] negotiation scripts customized

## Workflow

Follow these steps **in order**. Ask **exactly one question at a time**. Wait for the user's answer before proceeding. Do not present multiple questions in a single message.

### Phase 0 — Pre-flight

1. Run `node doctor.mjs --json` silently. Capture the JSON output.
2. Parse the output. If `cv.md` is in the `missing` array, do NOT proceed. Advise the user:
   > "I need your CV before I can set up the rest of the system. You can:
   > 1. Paste your CV here and I'll convert it to markdown
   > 2. Paste your LinkedIn URL and I'll extract the key info
   > 3. Tell me about your experience and I'll draft a CV for you
   >
   > Which do you prefer?"
   Then hand off to `modes/interview.md` for the CV interview. Do not return to onboarding until `doctor.mjs` reports cv.md present.
3. Read existing `modes/_profile.md` (if exists), `config/profile.yml` (if exists), and `config/rates.yml` (if exists). Store their parsed content in context for the interview.
4. Check if `modes/_profile.md` is in `missing` per doctor output. If so, copy `modes/_profile.template.md` → `modes/_profile.md` silently before starting — this ensures the user's customization file exists. The interview will fill it in.
5. If the user provided a section name argument, skip directly to that topic (see Section map for re-runs below). Read the current value from the relevant file, present it to the user concisely, and ask what they want to change. Do not re-interview on topics they didn't ask about.
6. If no argument provided and no existing files, start full onboarding from Topic 1.
7. If no argument provided but files already exist (re-configure), ask: "Your profile is already set up. Do you want to redo everything from scratch, or update a specific section? (identity, niches, platforms, positioning, proof-points, engagements, framing, availability, exclusions, scripts, location)" — respond accordingly.

### Phase 1 — Identity (Topic 1)

6. Ask: "What's your full name?"
7. Wait for answer. Validate it's not empty or obviously fake. Write to `config/profile.yml` → `candidate.full_name` and `modes/_profile.md` → Identity section name field.
8. Ask: "What email should clients use to reach you?"
9. Validate it looks like an email (contains `@` and a domain). If not, ask: "That doesn't look like an email address — could you double-check?" Write to `config/profile.yml` → `candidate.email` and `modes/_profile.md`.
10. Ask: "Where are you based? (City and country)"
11. Extract city and country from the answer. Write to `config/profile.yml` → `candidate.location` (full string), `location.city`, `location.country` and `modes/_profile.md`.
12. Ask: "What's your timezone? (e.g. America/New_York, Europe/Berlin, Asia/Tokyo, or UTC offset like UTC+1)"
13. Accept any valid timezone format. If the answer is just "PST" or "CET", expand to the IANA name if you can infer it (PST → America/Los_Angeles, CET → Europe/Berlin). Write to `config/profile.yml` → `location.timezone` and `modes/_profile.md`.
14. Ask: "Got a LinkedIn URL you want linked? (Optional — you can skip)"
15. If they provide one, write to `config/profile.yml` → `candidate.linkedin`. Ask similarly for portfolio URL and GitHub handle. Each is optional — if they skip, leave the field empty.
16. Ask: "Do you have a phone number you want on your CV? Some roles require it. (Optional)"
17. If provided, write to `config/profile.yml` → `candidate.phone`. Validate it looks like a real phone number (digits, country code if applicable).
18. Confirm: "Great — I've saved your identity as **[name]**, **[location]**, **[timezone]**."

### Phase 2 — Target Niches & Rates (Topic 2)

15. Ask: "What freelance niches are you targeting? List them one per line, like:
    ```
    AI consulting / advisory
    LLM app / RAG build
    Web app development (Next.js / full-stack)
    ```
    Start with your primary niche. I'll ask about the rest one by one."

16. For each niche the user lists, ask ONE question at a time:
    - "For **[niche name]**, what's the minimum you'd accept per hour? (Your floor — never go below this.)"
    - Validate: must be a positive number. If they say "I don't know", use the fallback strategy (see Edge Cases).
    - "What's your target rate for **[niche name]**? (What you're aiming for in negotiations.)"
    - Validate: target must be >= floor. If not, explain the difference and ask which to correct.
    - "Describe what clients actually buy from you in this niche — one sentence. Like: 'Someone who turns an AI strategy into a 90-day plan.'"
    - If the description is too vague ("I build apps"), prompt for more: "What kind of apps? For whom? What outcome?"

17. After all niches are entered, write them to both:
    - `modes/_profile.md` → Target Niches table (markdown table format)
    - `config/rates.yml` → structured YAML entries with niche name, rate_floor, rate_target, description

18. Ask: "Do you have a hard system-wide minimum? A rate below which you won't accept any project, regardless of niche? If different from your lowest niche floor, tell me now."
19. If they provide one, write as the global floor in `config/rates.yml`. If they say "same as lowest niche floor", use that.
20. Confirm: "I've recorded [N] target niches. Your lowest floor is $[X]/hr across all of them. That'll be the system-wide hard floor for scoring and proposal filtering."

### Phase 3 — Platforms (Topic 3)

21. Ask: "Which platforms do you find clients on? Upwork, Toptal, Contra, LinkedIn, Direct/Referral — or others?"
22. For each platform the user listed, ask ONE question at a time:
    - "What's your profile URL on **[platform]**? (Skip if you don't have one yet — I'll leave it blank.)"
    - If they provide a URL, validate it looks like a proper URL. If not, accept but flag it as unverified.
    - "What's your minimum acceptable rate on **[platform]**? (Platforms take a cut — Upwork takes 10%, Toptal takes 0% from you. Your floor might be different per platform.)"
    - Validate: must be a positive number.
    - "What's your target rate on **[platform]**?"
    - Validate: target >= floor. If they say "same as niche rates", use the niche rates from Phase 2.
    - "Any notes about this platform? (e.g. 'competitive market', 'high-quality leads', 'slow payment')"
23. After all platforms are entered, write to `modes/_profile.md` → Platforms table with columns: Platform, Profile URL, Rate floor, Target rate, Notes.
24. Also write cross-platform rate entries to `config/rates.yml` if it doesn't already have platform-specific rates.
25. Confirm: "I've recorded [M] platforms. Your highest platform floor is $[X]/hr ([platform])."

### Phase 4 — Positioning & Narrative (Topic 4)

22. Ask: "Write one sentence — what's your professional headline? This goes at the top of every CV. Example: 'ML Engineer turned AI product builder'"
23. Write to `config/profile.yml` → `narrative.headline`.
24. Ask: "What's your 'exit story'? The one thing that makes your career path unique. Example: 'Built and sold my SaaS after 5 years. Now focused on applied AI at scale.'"
25. Write to `config/profile.yml` → `narrative.exit_story`.
26. Ask: "What are your top 3-5 superpowers? Specific things you do better than most engineers. List them as short bullets:
    - End-to-end ML pipelines
    - Fast prototyping (idea to prod in 2 weeks)
    - Cross-functional communication"
27. Write to `config/profile.yml` → `narrative.superpowers`.
28. Ask: "Now write your positioning paragraph — the answer to 'What do you do, for whom, and why you?' Example: > I'm an AI engineer who helps product teams ship LLM-powered features that actually work in production — not demos, not slide decks."
29. Write to `modes/_profile.md` → Positioning Narrative section.

### Phase 5 — Proof Points (Topic 5)

32. Ask: "What are your strongest professional achievements? I need concrete, quantified proof points. Give me one at a time. Format like:

    Metric — Context — Source

    Example: 'Reduced API latency by 40% — refactored the retrieval pipeline for a legaltech RAG system, cutting P95 from 2.1s to 1.3s. Confidential.'

    Start with your favorite achievement."

33. After the user provides one, validate:
    - Does it have a metric? (number, percentage, dollar amount, time saved — if not, ask for one: "Can you put a number on that? Even an estimate helps.")
    - Does it have context? (who, what, result — if missing, ask: "What was the situation, and what did you build to make this happen?")
    - Is the metric specific? Vague claims like "improved performance" need a follow-up: "How did you measure improvement? e.g. latency, throughput, user satisfaction?"
34. Write the validated proof point to memory. Ask: "Got another one?" Loop until the user says no (or gives 10+ — then suggest saving extras for later).
35. Write all proof points to:
    - `modes/_profile.md` → Proof Points section (bullet format with metric, context, source)
    - `config/profile.yml` → `narrative.proof_points` array with name, url (if available), hero_metric

36. If the user has 5+ strong proof points, suggest: "You have enough material for an article digest. Want me to create `article-digest.md` with the full details for deeper reference during evaluations?"
37. Optional: Ask "Any articles, blog posts, or case studies you've published? Share any URLs." If provided, fetch the content via Playwright or WebFetch, extract key insights, and write to `article-digest.md`.

### Phase 6 — Past Engagements (Topic 6)

38. Ask: "Tell me about a past client engagement. One at a time. For each, I need:
    - Client name (or 'Confidential' if NDA)
    - Platform (Upwork / Toptal / Direct / Referral)
    - Scope — what you built or delivered in 1-2 sentences
    - Rate — e.g. $120/hr or $20k fixed
    - Duration — e.g. '3 months'
    - Outcome — e.g. 'Delivered on time, client extended twice'
    - Rating out of 5 (if available on-platform)
    
    Start with your most recent or most relevant engagement."

39. After the user provides one, validate:
    - Scope should be specific (not just "development work" — prompt: "What specifically did you build? What tech? What problem did it solve?")
    - Rate should be a number with currency. If they say "I don't remember", ask "Ballpark? Even a range helps."
    - Outcome should be substantive. If they say "it went well", prompt: "What went well specifically? On time? Under budget? Extended? Referrals?"
40. Write the engagement to `modes/_profile.md` → Past Engagements table. Ask: "Got another?" Loop until the user says no.
41. Check each engagement against `data/clients.yml` for existing records. If a client is flagged as problematic, surface it neutrally: "I see [client] has a note in your records about [issue]. Want to include this engagement anyway?"
42. Write all engagements to `modes/_profile.md` → Past Engagements table with columns: Client, Platform, Scope, Rate, Duration, Outcome, Rating.

### Phase 7 — Adaptive Framing (Topic 7)

43. Start by reading back the user's niches. Say: "You told me your niches are: **[list them]**. Now, for each one, how should I frame your experience when a lead comes in?

    For **[first niche]**, which past engagement or proof point best demonstrates your capability here? And what's the key angle to emphasize — speed? depth? reliability?"

44. Take one niche at a time. For each, ask:
    - "For **[[niche]]** leads, which past engagement or proof point should I lead with?"
    - "What's the key angle to emphasize? (e.g. strategy, execution speed, production reliability, stakeholder communication)"
    - "Any specific proof point or article-digest entry to cite?"
45. Write each mapping to the Adaptive Framing table in `modes/_profile.md` with columns: If the lead is, Emphasize about you, Proof point sources.
46. After all niches are mapped, ask: "What's your 'cross-cutting advantage'? The one thing that makes you different in every niche — your signature move in proposals.

    Example: 'Builder who ships, with the receipts — adapts framing without losing proof of execution.'"
47. Write to `modes/_profile.md` → Cross-cutting Advantage section.

### Phase 8 — Availability (Topic 8)

48. Ask ONE sub-question at a time:
    - "How many hours per week can you realistically dedicate to new freelance work?"
    - Validate: positive number. If > 60, ask: "That's a lot — are you sure that's realistic? Freelance work includes admin, proposals, and communication outside billed hours."
    - "What timezone overlap works best for calls with clients? (e.g. '9am-12pm ET' or 'mornings in Europe, afternoons in US')"
    - "How much lead time do you need before starting a new engagement? (e.g. '1-2 weeks', 'available immediately', '4 weeks notice')"
    - "What's your current load? (e.g. '20h/wk committed through June, 15h/wk free' — be honest so I don't double-book you in evaluations)"
    - If current load is empty or vague, suggest: "Even 'between engagements, full availability' is fine."
49. Write all four fields to `modes/_profile.md` → Availability section.
50. Optional calculation: if they gave hours_per_week and current_load, subtract to get remaining capacity. If remaining is 0, warn: "You're fully committed right now. I'll flag new leads as 'unavailable until [end date]' unless you want to override."

### Phase 9 — Exclusions (Topic 9)

51. Ask: "Are there any deal-breakers I should automatically filter out? I'll go category by category — you can say 'skip' for any.

    First: **Industries** — any you won't work in? Common ones: adult, gambling, crypto (speculative), tobacco, weapons, fossil fuels, defense."

52. Take one category at a time in this order:
    - Industries
    - Compensation models (equity-only, exposure comp, revenue share, unpaid test tasks)
    - Client types (agencies hiding end-client, brokers, MLM/pyramid)
    - Geographies (jurisdictions with payment risk, sanctions lists)
    - Scope types (vague "build me an app like X", indefinite retainer)

53. For each category, if the user says "skip" or "nothing", leave it empty in the Exclusions table.
54. If the user says "the usual" or "standard exclusions", use the defaults from `modes/_profile.template.md`.
55. Write all exclusions to `modes/_profile.md` → Exclusions table with categories and their exclusions.

### Phase 10 — Negotiation Scripts (Topic 10)

56. Ask: "Let's customize your negotiation scripts for the scenarios that come up most. I'll go through each one — you can customize the wording, say 'skip' to use the system defaults, or say 'default' for my recommended wording if you're not sure.

    First up: **Rate pushback** — the client says 'Can you do $X/hr?' below your rate. My recommended default:

    > 'My floor for [niche] scopes like this is $X/hr (set in your profile). I'm happy to scope down to fit — for example, drop the dashboard and ship the API first, then add it as a follow-on. Want to explore that?'

    What do you want to use for this scenario?"

57. Cycle through each scenario in order. For each, present the recommended default script first, then ask if they want to customize:
    - **Rate pushback** — client asks for lower rate
    - **"What's your rate?"** — open-ended before scoping
    - **Off-platform payment push** — client wants to go off-platform
    - **Scope creep mid-engagement** — client adds work mid-project
    - **Late payment** — overdue invoice follow-up
    - **NDA / IP assignment** — client requests NDA or IP assignment

58. For each scenario, if the user provides custom text, validate that it sounds like a real response (not just "default"). If it's very short, ask: "That's pretty brief — want to expand it at all, or keep it concise?"
59. Write accepted scripts to `modes/_profile.md` → Negotiation Scripts section with scenario headers and the script text in blockquotes.

### Phase 11 — Location Policy (Topic 11)

60. Ask ONE question at a time:
    - "Are you open to on-site work? If yes, how many days per week or month can you travel?"
    - If yes, write the specific availability. If no, write "Fully remote — no on-site availability."
    - "Do you require timezone overlap with clients? If so, how many hours per day?"
    - Accept ranges and specific windows (e.g. "minimum 3 hours overlap with US East Coast").
    - "Are there any jurisdictions where you can't legally work or receive payments? (e.g. sanctions lists, unregistered for VAT in certain countries)"
    - If they list specific countries, write them. If "not sure", note "Uncertain — recommend verifying before cross-border engagements."
61. Write to `modes/_profile.md` → Location Policy section with three fields: On-site availability, Timezone overlap requirement, Jurisdiction restrictions.

### Phase 12 — Confirmation & Next Steps

50. Summarize everything that was written. Present the completion summary (see Output Format section above).

51. Ask: "Want me to set up your job portals now? I can configure 45+ pre-loaded companies matching your target roles. It takes 2 minutes."

52. If yes: copy `templates/portals.example.yml` → `portals.yml`. Update `title_filter.positive` with the user's target role keywords. Run `node scan.mjs --dry-run` to verify the configuration parses.

53. If no: say "You can set up portals anytime by running `/freelance-ops scan` or editing `portals.yml` directly."

54. Create `data/applications.md` tracker if it doesn't exist:
    ```markdown
    # Applications Tracker

    | # | Date | Company | Role | Score | Status | PDF | Report | Notes |
    |---|------|---------|------|-------|--------|-----|--------|-------|
    ```

55. Run `node doctor.mjs --json` silently and confirm the system is green.

56. Final message:
    > "You're all set! What would you like to do next?
    > - **Paste a job URL** to evaluate it
    > - **Run /freelance-ops scan** to search portals
    > - **Run /freelance-ops pdf** to generate a CV
    > - **Run /freelance-ops** to see all commands
    >
    > Tip: Having a personal portfolio dramatically improves your job search. If you don't have one yet, my portfolio is also open source: github.com/santifer/cv-santiago — feel free to fork it."

### Section map for re-runs

When the user provides a section name as argument, jump directly to the topic:

| Argument | Phase | First question |
|----------|-------|----------------|
| `identity` | Phase 1 | Show current identity. "What's your full name?" |
| `niches` | Phase 2 | Show current niches. "List your target niches." |
| `platforms` | Phase 3 | Show current platforms. "Which platforms do you use?" |
| `positioning` | Phase 4 | Show current narrative. "Write your headline." |
| `proof-points` | Phase 5 | Show current proof points. "Add a new proof point." |
| `engagements` | Phase 6 | Show current engagements. "Tell me about a past engagement." |
| `framing` | Phase 7 | Show current adaptive framing. "How to frame for [niche]?" |
| `availability` | Phase 8 | Show current availability. "What's your availability?" |
| `exclusions` | Phase 9 | Show current exclusions. "Any deal-breakers?" |
| `scripts` | Phase 10 | Show current scripts. "Rate pushback script?" |
| `location` | Phase 11 | Show current policy. "Location policy?" |

For any re-run, read the existing file values, present them concisely, and only ask what the user wants to change. Do not re-interview them on topics they didn't ask about.

## Edge Cases

- **User gives a single word answer where a sentence is needed:** Ask a follow-up: "Can you expand on that a bit so I can write a proper profile entry?" If they insist on brevity, write what they gave and flag it in the completion summary as a draft that needs refinement.
- **User doesn't know a rate:** If they hesitate on rate floor/target, ask "What have you charged before? Even a ballpark is fine." If they truly have no baseline, suggest market rates for their niche: "For AI consulting, typical rates range $150-250/hr. Want to start at $150/hr and adjust later?" Write a comment in the rates file noting the rate is estimated and should be reviewed after the first engagement.
- **User wants to skip a topic entirely:** Allow it. Say "That's fine — we can skip **[topic]** for now. You can fill it in later by running `/freelance-ops onboarding [topic]`." Leave the section blank or with placeholder text in the file. Do not pressure them to complete it.
- **User gives contradictory answers (e.g. rate floor higher than target rate):** Flag it immediately: "Your floor ($180/hr) is higher than your target rate ($150/hr) for **[niche]**. Which one should I correct?" If they're confused, explain: "The floor is the minimum you'll accept. The target is what you're aiming for in negotiations. Target should be above floor so there's room to negotiate."
- **User changes their mind mid-interview:** Accept the most recent answer. Say: "Noted — I've updated that. Continuing with the next question." Do not go back to re-ask earlier questions unless they explicitly ask. Do not argue or question their change.
- **User provides a URL instead of text for a proof point:** Accept it. Extract the content via Playwright (`browser_navigate` + `browser_snapshot`) or WebFetch and summarize it back to the user: "I found [key metric/result]. Does this capture the achievement? Want to add anything?"
- **User answers in a non-English language (e.g. German for a DACH-focused user):** Write the answer in the user's language to `modes/_profile.md` but also ask for an English version for `config/profile.yml` if the primary system language is English. If the user has set `language.modes_dir: modes/de` in their profile, write everything in German and skip the English request.
- **User has very long answers:** Accept them. For proof points and past engagements, summarize the key elements back to the user for confirmation before writing. For positioning narrative, accept the full text.
- **User says "just use defaults for everything":** Write minimal entries to `modes/_profile.md` with the defaults from `_profile.template.md`. Set rates from `profile.example.yml`. Add a note at the top: "Auto-generated from defaults — user declined full interview. Customize by running `/freelance-ops onboarding [topic]`."
- **Re-run where a field already has detailed content:** Show a compressed summary (first 2 lines or key metric names). Ask: "Add to this, replace it, or keep it as is?" Never delete without explicit confirmation. If they say "replace", confirm once: "This will overwrite the existing content — sure?"
- **User provides a company name that triggers an existing red flag in the system:** If they name a past engagement with a known problematic client from `data/clients.yml`, surface the flag neutrally: "I see **[client]** is flagged in your client records with [issue]. Want to include them as a past engagement anyway, or skip?"
- **User gets interrupted mid-interview:** Handle their unrelated question first, then return: "Now, back to your profile — you were about to tell me your [current topic]."
- **User provides an invalid timezone string:** Accept it but note the ambiguity. Write the raw string and add a comment: "Timezone string not in IANA format — verify before timezone-sensitive scheduling." If you can confidently map it (e.g. "PST" → "America/Los_Angeles"), write both and note the conversion.
- **User says multiple things in one answer:** Parse out the relevant information and use it to skip forward if appropriate. For example, if you ask "What's your name?" and they say "I'm Alex, I'm in Berlin, and I do AI consulting," write name immediately, then ask "Great — you mentioned Berlin. I'll note your location as Berlin, Germany. Can you confirm the country?" to validate, then skip the location question since they already answered it.
- **User provides a platform that isn't in the standard list (e.g. "Freelancer.com", "Guru", "PeoplePerHour"):** Accept it. Ask the standard questions (URL, floor, target, notes). Write it to the Platforms table as-is. The system can evaluate any platform — the standard list is just for convenience.
- **User has a niche but no past engagements to cite for framing:** Skip the adaptive framing for that niche. Write "No past engagements yet — update after first project in this niche." The system will evaluate without the framing advantage but will not penalize the score.
- **User provides a rate in a different currency (EUR, GBP, CAD):** Accept it. Add a comment to the rates file specifying the currency. The system defaults to USD — note that currency conversion may affect scoring if the client's posting doesn't specify currency.
- **Visa/legal restrictions surface during location policy:** If the user says they need visa sponsorship or have work restrictions, note it in `config/profile.yml` → `location.visa_status`. Do not ask for personal details (passport info, immigration status specifics) — keep it to a single string that the user controls.
- **User requests to stop mid-interview:** Respect it immediately. Say "No problem — I'll save everything we've done so far. You can pick up where you left off by running `/freelance-ops onboarding [topic]` for any section you want to continue." Write all collected data to the files. Do not save a "partial" state marker — the next run reads existing files and asks about gaps.
- **User corrects a previous answer from later in the interview:** If they say "Actually, earlier I said my niche was X, but it's really Y," accept the correction and update the file. Say "Updated **[previous value]** to **[new value]** in your profile." Do not ask "why did you change your mind" or question the correction.

## Examples

### Example 1: Full first-run onboarding

**User opens fresh freelance-ops install. doctor.mjs shows missing profile.yml and _profile.md. No portals.yml.**

Agent runs Phase 0: doctor.mjs → cv.md exists → copies _profile.template.md → starts Phase 1.

Agent: "What's your full name?"
User: "Alex Rivera"

Agent: "What email should clients use to reach you?"
User: "alex@example.com"

Agent: "Where are you based?"
User: "Berlin, Germany"

Agent: "What's your timezone?"
User: "Europe/Berlin"

Agent: "Got a LinkedIn URL? (Optional)"
User: "linkedin.com/in/alexrivera"

Agent: "Great — I've saved your identity as Alex Rivera, Berlin Germany, Europe/Berlin."

Phase 2: User lists "LLM app / RAG build", "AI consulting", "Automation / integration". For each, agent asks floor, target, description. User sets $120/hr floor across the board, $180/hr target. Descriptions are specific: "Someone who ships a working LLM product, not a slide deck" for RAG.

Phase 3: Platforms. User says "Upwork only — $100/hr floor, $150/hr target. High fees eat into the margin." Agent writes platforms table.

Phase 4: Positioning. Headline: "AI engineer who ships production RAG." Exit story: "Spent 8 years scaling ML at a fintech unicorn, then went independent." Superpowers: "Production RAG, observability, cross-functional communication."

Phase 5: Proof points. User gives 3:
- "Reduced API latency by 40% — refactored the retrieval pipeline for a legaltech RAG system. Confidential."
- "Shipped MVP in 6 weeks — multi-tenant SaaS from zero to production with 3 users."
- "Automated 80% of manual ops — replaced a 15-step Zapier with custom n8n pipeline."
Agent asks "Got another?" → User says no. Agent writes all three.

Phase 6: Past engagements. User gives 2:
- Confidential legaltech, Upwork, $120/hr, 4 months, "Extended twice, 2x scope", 5.0 rating
- SaaS startup, Direct, $8k fixed, 6 weeks, "Ahead of schedule", N/A

Phase 7: Adaptive framing. For RAG leads → emphasize production retrieval and evals, cite legaltech engagement. For consulting → strategy and roadmaps. For automation → ROI and time saved.

Phase 8: Availability. 20 hrs/wk, 9am-12pm CET overlap with US East Coast, 2-week lead time, "20h/wk committed through June, 15h/wk free after."

Phase 9: Exclusions. Excludes adult, gambling, crypto-speculative, equity-only comp, agencies hiding end-client.

Phase 10: Scripts. User keeps defaults for all except "rate pushback" where they customize: "My floor for this niche is $120/hr. Happy to scope down — want to explore that?"

Phase 11: Location. Fully remote, occasional CET overlap preferred, no jurisdiction restrictions.

Phase 12: Completion summary. Agent confirms system is green. Offers to set up portals with "RAG engineer", "LLM developer", "AI consultant" keywords. User accepts. Agent copies portals.example.yml, updates title_filter.positive, runs dry-run. Tracker created. Final message delivered.

### Example 2: Re-run for rates update

**User runs `/freelance-ops onboarding rates` after 6 months. Their current rates are $120-$150/hr but the market has shifted.**

Agent reads existing `config/rates.yml` and `modes/_profile.md`. Presents current state in one message:

"Current rates:
- AI consulting: floor $150/hr, target $200/hr
- LLM/RAG: floor $120/hr, target $180/hr
- Automation: floor $100/hr, target $150/hr

Which niche's rates do you want to update?"

User: "LLM/RAG — raise both by $30/hr."

Agent validates: "So LLM/RAG floor becomes $150/hr, target becomes $210/hr. Correct?"

User: "Yes."

Agent writes the update to both `config/rates.yml` and `modes/_profile.md`. Reads the file back to confirm the write was clean.

"Updated. Anything else?"
User: "Nope."

Agent confirms: "Rates updated. Your lowest floor across all niches is now $150/hr (was $100/hr)."

Agent does NOT ask about any other topics — the re-run is scoped to rates only.

### Example 3: Skip niche details

**User runs full onboarding but doesn't know their rates.**

Phase 2, agent asks for rate floor. User: "I have no idea. I'm new to freelancing."

Agent: "No problem. For AI consulting, typical rates in your area (Berlin) range €100-180/hr for independent contractors. Want to start with €120/hr as your floor and adjust after your first engagement?"

User: "Sure, that works."

Agent writes the rate with a YAML comment: `# estimated - review after first engagement`. Continues to next niche.

Later, Phase 5 at Proof Points. User says: "I don't have any quantified metrics yet. I've only done internal work."

Agent: "That's fine — we can leave proof points blank for now and add them after your first freelance engagement. I'll note 'pending first freelance engagement — update when available.' Let's move on."

Agent writes placeholder text in Proof Points section. Does not pressure the user.

Later, Phase 7 at Adaptive Framing. User has no past engagements for most niches.

Agent: "For niches without past engagements, I'll leave the framing blank. You can add it after your first project in each niche. The system will score leads based on the niche description alone — it won't penalize you for missing data."

Agent writes "No past engagements yet — update after first project" for each unmapped niche. Continues to next phase.

Completion: Agent summarizes what was completed (identity, niches with estimated rates, platforms, positioning, availability) and what was left as placeholder (proof points, adaptive framing). Offers to set up portals. User declines. Agent says: "You're all set with the basics. As you complete projects, come back and fill in the gaps. Just say '/freelance-ops onboarding proof-points' or any topic name."

## Anti-Patterns

- **Asking multiple questions in one message.** Rule is ONE question. Send "What's your name?" → receive → send "What's your email?" — not "What's your name, email, and location?" The user needs to feel guided step by step, not interrogated.
- **Flooding the user with all 11 phases at once.** Never list the entire interview structure upfront. Say "Let's start with your identity. What's your full name?" — not "We'll cover identity, niches, platforms, positioning, proof points, past engagements, adaptive framing, availability, exclusions, scripts, and location policy."
- **Requiring every field before proceeding.** The user can skip any topic. Write placeholder comments in the affected files. The system is designed to work with partial data (some fields fall back to defaults).
- **Editing `modes/_shared.md` with user-specific content.** All user data goes into `modes/_profile.md`, `config/profile.yml`, or `config/rates.yml`. Never write personalization to the shared system file.
- **Forgetting to validate before writing.** Rate floor > target rate? Check it. Contradictory location settings? Check them. Invalid timezone string? Accept but note it (the system has fallback behavior).
- **Writing directly to `profile.yml` without first reading existing values during re-runs.** Always present the current state before overwriting. The user may have custom fields they don't want to lose.
- **Proceeding when `cv.md` is missing.** The profile interview sets up the system configuration layer. If there's no CV, the system can't generate reports or CV PDFs. Delegate to `modes/interview.md` and wait.
- **Over-explaining the YAML schema.** The user doesn't need to understand the file format. They answer questions in English (or their language). The agent handles all file writing.
- **Asking the same question twice.** If the user provides their name and location during a "tell me about yourself" opening, extract those answers and skip the corresponding identity questions.
- **Presenting defaults as leading questions.** Don't say "Your niche is AI consulting, right?" — ask "What niches are you targeting?" and accept whatever they say.
- **Using jargon the user doesn't know.** Don't ask "What's your rate floor?" — ask "What's the minimum you'd accept per hour for this type of work?" Define terms naturally in the question itself.
- **Forcing the user to choose between `_profile.md` and `profile.yml`.** The agent handles both files transparently. The user answers questions; the agent writes to the correct files.
- **Skipping verification after writing.** After any file write, verify the content was written correctly using a read + parse. Especially important for YAML files where indentation errors break the system.

This file is part of the System Layer (auto-updatable).
