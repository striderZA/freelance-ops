# Mode: nurture — Lead Follow-up Cadence

## Purpose

Track and generate follow-up messages for leads in `data/leads.md` that are awaiting response after a proposal was submitted. Produces a cadence of follow-up messages (day 3, day 7, day 14) and maintains a history in `data/follow-ups.md`. Each message has a specific purpose — not just "checking in." The cadence respects the client's silence without becoming noise, and provides a clear off-ramp when the lead has gone cold.

## When to Use

- User says "follow up on lead #005" or "nurture my leads"
- User says "check who hasn't responded" or "who do I need to follow up with"
- User says "draft a follow-up for [client name]"
- User pastes a lead number and asks for the next cadence step
- User runs `/freelance-ops-nurture` with no arguments (runs full check on all proposed leads)

Do NOT use this mode for:
- Cold outreach to new contacts (use `modes/outreach.md`)
- Evaluating a new lead (use `modes/lead.md`)
- Drafting the initial proposal (use `modes/proposal.md`)
- Submitting a proposal (use `modes/pitch.md`)

## Data Sources

- `data/leads.md` — lead tracker (reads entries with status `Proposed` or `Negotiating`)
- `data/follow-ups.md` — follow-up history (created on first use)
- `reports/{num}-{client-slug}-{YYYY-MM-DD}.md` — lead evaluation reports for context
- `config/profile.yml` — user identity and name
- `config/rates.yml` — rate card for reference in value-add messages
- `profile.md` — proof points and portfolio highlights
- `modes/_shared.md` — professional writing rules, tone guidelines

## Output

The AI produces per-lead output in chat (no files written automatically):

1. **Lead context summary** — client, scope, proposal date, days since, current cadence position
2. **Next follow-up draft** — message body appropriate to the cadence position (day 3 / day 7 / day 14 / close-out)
3. **Cadence schedule** — what happens next if no response
4. **After user confirms sending:** append a row to `data/follow-ups.md` and optionally update the Notes column in `data/leads.md`

## Cadence — Day 3, 7, 14

The cadence is anchored to the proposal date (the date the lead entered `Proposed` status in `data/leads.md`).

| Day | Timing | Purpose | Type | Action if no response |
|-----|--------|---------|------|-----------------------|
| 3 | 3 days after proposal | Gentle nudge — confirm receipt | Email / platform message | Wait until day 7 |
| 7 | 7 days after proposal | Value-add — share insight or relevant update | Email / platform message | Wait until day 14 |
| 14 | 14 days after proposal | Polite close-out — release the lead | Email / platform message | Move to `Ghosted` |

**Why 3-7-14?** Freelance proposals have a shorter attention span than FTE applications. Clients evaluating freelancers often decide within the first week. Day 3 is a receipt check; day 7 is a value reminder; day 14 is the closing loop. Beyond 14 days without response, further follow-ups damage your professionalism.

### Per-cadence message framework

Each message has a distinct purpose. Never send a message that says "just checking in."

#### Day 3 — Gentle Nudge (followupCount === 0)

**Purpose:** Confirm the client received the proposal and is still evaluating. Low pressure, short, professional.

- 2-3 sentences max
- Reference the proposal (date and scope)
- Offer to answer questions or provide additional info
- Do NOT ask "did you get my proposal?" — assume they did

**Structure:**
1. **Reference:** "I sent over my proposal for [scope] on [date]."
2. **Offer:** "If any part needs clarification, happy to expand."
3. **Close:** "No rush — just wanted to make sure it landed."

#### Day 7 — Value-Add (followupCount === 1)

**Purpose:** Re-engage with something useful. Share a relevant insight, case study, article, or portfolio piece that maps to the client's problem. Demonstrate expertise without asking for a decision.

- 3-4 sentences max
- Lead with value, not with the ask
- Reference something specific to the client's industry or the lead scope
- Include a concrete proof point from `profile.md` or a previous project

**Structure:**
1. **Hook:** "Thought of your [specific aspect of their project] when I came across this."
2. **Value:** 1-2 sentences on why it's relevant (case study, insight, technique)
3. **Soft link back:** "If you'd like to discuss how this applies to your project, I'm available."

#### Day 14 — Polite Close-Out (followupCount === 2)

**Purpose:** Release the lead gracefully. Acknowledge they may have gone another direction, leave the door open for future work, and close the loop professionally. This is the last message in the cadence.

- 2-3 sentences
- Assume the decision has been made (they chose someone else, paused the project, or went internal)
- Do not ask for feedback (that pressures them)
- Leave a low-friction re-engagement path

**Structure:**
1. **Assumption:** "I assume you've found the right fit or the project is on hold for now."
2. **Open door:** "If anything changes, I'd be happy to help."
3. **Best wishes:** Short, warm closing.

**After sending:** Update the lead status to `Ghosted` (terminal) unless the user explicitly wants to keep it as `Proposed`.

## Workflow

### Step 0 — Identify target leads

If the user provides a specific lead number (e.g., "nurture #005"):

1. Read `data/leads.md` and locate the entry with that number.
2. Check its status. Only `Proposed` and `Negotiating` leads can be nurtured. If the status is terminal (`Ghosted`, `Rejected`, `Withdrew`, `Contracted`, `In Progress`), tell the user:
   > "Lead #005 is already in terminal state '{status}'. Nurture mode only applies to leads awaiting response."
   Stop.

If the user runs `/freelance-ops-nurture` with no arguments:

1. Read `data/leads.md`.
2. Collect all entries with status `Proposed` or `Negotiating`.
3. If none found, tell the user:
   > "No active leads to nurture. Submit proposals first via `/freelance-ops-pitch` and come back when they're aging."
   Stop.

### Step 1 — Load lead context

For each lead to nurture:

4. Extract: lead number, client name, role/scope, platform, status, rate, score, report path (from `data/leads.md`).
5. Read `data/follow-ups.md` (if it exists) and filter rows where `App#` matches this lead number.
6. Determine where in the cadence the lead sits:
   - No follow-ups recorded → calculate days since proposal date from `data/leads.md`
     - 0-3 days since proposal → "Too early — wait until day 3." Skip this lead.
     - 3-6 days → Day 3 cadence position (gentle nudge)
     - 7-13 days → Day 7 cadence position (value-add)
     - 14+ days → Day 14 cadence position (close-out)
   - 1 follow-up recorded → calculate days since the last follow-up
     - 0-6 days since last follow-up → "Too early — wait 7 days between follow-ups." Skip.
     - 7-13 days since last follow-up → Day 7 cadence position
     - 14+ days since last follow-up → Day 14 cadence position
   - 2 follow-ups recorded → check last follow-up date
     - If last follow-up was < 3 days ago → "Too early — allow time before closing." Skip.
     - If last follow-up was ≥ 3 days ago → "This lead has had 2 follow-ups with no response. Recommend moving to `Ghosted`."
       Offer the day 14 close-out message or skip straight to terminal.
   - 3+ follow-ups recorded → hard stop:
     > "Lead #{num} has had {N} follow-ups with no response. Do not send another. Move to `Ghosted`."

**Time calculation:** Use current date minus proposal date (from tracker) or last follow-up date (from `data/follow-ups.md`). All dates are in YYYY-MM-DD format. If `data/follow-ups.md` does not exist, no follow-ups have been sent.

### Step 2 — Draft follow-up message

7. Read the lead's report from `reports/{num}-{client-slug}-{YYYY-MM-DD}.md` (or the path from `data/leads.md`). Extract:
   - Block A (Lead Summary): scope, deliverables, timeline, budget
   - Block B (Profile Match): top proof points mapped to the lead
   - Block E (Proposal Strategy): the hook and angle used in the proposal
   - Legitimacy tier from the report header
8. Read `config/profile.yml` for user name and identity.
9. Read `profile.md` for proof points to use in the value-add message (day 7).
10. Draft the message following the per-cadence framework above.
11. Apply professional writing rules from `_shared.md`:
    - No em dashes
    - No buzzwords (synergy, leverage, circle back, etc.)
    - Active voice
    - Concrete claims only — never invent metrics
    - Under 150 words per message
    - Include a subject line (if email channel)

**Channel detection:**
- If the platform is `Direct` or `Referral` → use email format (subject line, body)
- If the platform is `Upwork`, `Toptal`, `Contra`, `Fiverr` → use platform message format (no subject line, shorter)
- If unknown, default to platform message format and note "Adapt for your channel"

**Contact detection:**
- If `data/follow-ups.md` has a Contact for this lead, reuse it
- If no contact is known, use "Hi [Client Name]" or "Hi there" for platform messages
- For Direct leads with no known contact, suggest user run `/freelance-ops-outreach` to find the right person

### Step 3 — Present draft to user

Show the draft in this format:

```markdown
## Follow-up: {Client} — {Scope} (#{num})

**Status:** {days since proposal}d since proposal, {followupCount} follow-up(s) sent
**Cadence:** Day {3|7|14} — {Gentle Nudge|Value-Add|Polite Close-Out}
**Channel:** {Email / Platform / Direct Message}

**Subject:** {subject line, if email}

---

{draft body}

---

**Next steps if no response:**
- Wait {N} days → {next message type}
- Or update status to Ghosted
```

### Step 4 — Record follow-up

After the user confirms they sent the follow-up:

12. If `data/follow-ups.md` doesn't exist, create it:
    ```markdown
    # Follow-up History

    | # | App# | Date | Client | Scope | Channel | Contact | Notes |
    |---|------|------|--------|-------|---------|---------|-------|
    ```

13. Append a row with:
    - `#` = next sequential number in the follow-ups table
    - `App#` = lead number from `data/leads.md`
    - `Date` = today's date
    - `Client` = client/company name
    - `Scope` = role/scope title
    - `Channel` = Email / Upwork / Toptal / Direct / Other
    - `Contact` = who it was sent to (or "Platform message" if no contact name)
    - `Notes` = brief note (e.g., "Day 3 gentle nudge", "Day 7 — shared case study on RAG pipelines")

14. Optionally update the Notes column in `data/leads.md` with "Follow-up {N} sent {YYYY-MM-DD} — {purpose}"

**IMPORTANT:** Only record follow-ups the user confirms they actually sent. Never record a draft as sent.

### Step 5 — Terminal transition

15. If the lead has reached the day 14 close-out message and the user confirms sending it, ask:
    > "Should I update lead #{num} status to `Ghosted`? This is the standard terminal state after 14 days with no response."
    - If yes: update `data/leads.md` status to `Ghosted`.
    - If no: leave as `Proposed` and note the user's preference.

## Edge Cases

### Client responded before the cadence due date

If the client responds at any point during the cadence, the nurture sequence stops. Update `data/leads.md` status to `Negotiating` (if discussing terms) or `Contracted` (if agreed). Do not send the scheduled follow-up. Suggest next step: screening call prep via `modes/screening.md` or contract drafting.

### Lead moved to terminal state during cadence

If between drafting and sending a check of `data/leads.md` shows the lead status changed (e.g., user updated it to `Rejected` or `Withdrew`), do NOT send the drafted message. Notify the user:
> "Lead #{num} status changed to '{new status}' since the draft was generated. Discarding draft."

### Very long silence (>30 days)

If a lead has been in `Proposed` status for >30 days with no response and no follow-ups sent, do not start the 3-7-14 cadence. Instead recommend:
> "This lead has been silent for {N} days. The standard 3-7-14 cadence no longer applies. Recommend updating status to `Ghosted` and moving on. If you want to send one last close-out message, I can draft it — but do not expect a response."

### Multiple leads to nurture

If the user runs `/freelance-ops-nurture` and multiple leads are actionable, process them sequentially. Show a summary dashboard first, then ask which lead to draft for:

```
Nurture Dashboard — {date}
{N} leads in Proposed/Negotiating status

| # | Client | Scope | Proposed | Days | Follow-ups | Cadence | Next Action |
|---|--------|-------|----------|------|------------|---------|-------------|
| 5 | Acme Corp | AI Chatbot | 2026-06-12 | 3 | 0 | Day 3 | Draft gentle nudge |
| 8 | Beta Ltd | Data pipeline | 2026-06-08 | 7 | 1 | Day 7 | Draft value-add |
| 12 | Gamma Inc | API integration | 2026-06-01 | 14 | 1 | Day 14 | Draft close-out |
```

Then let the user pick one or say "draft all" to go through each.

### No follow-ups.md exists yet

This is the first nurture session. Create `data/follow-ups.md` with the header row when the user confirms sending the first follow-up. Do not create an empty file preemptively.

### Lead was proposed but score was low (< 4.0)

If the lead's score is below 4.0 and the user still wants to follow up, note that this lead was below the recommendation threshold. Keep the follow-up brief and do not invest significant effort. Suggest the user consider deprioritizing.

### Block G = caution

If the lead's report has `Legitimacy: caution` tier, remind the user to avoid sharing sensitive information or agreeing to terms without a signed contract. Keep follow-ups professional but guarded. Include a note in the draft: "Caution tier — avoid sharing personal/financial details."

### Block G = likely-scam

If the lead somehow made it to `Proposed` state with a `likely-scam` legitimacy tier, do not draft any follow-up. Recommend immediately moving the lead to `Withdrew` and flag the scam signals from the original report. The user should not engage further.

### Rate was not to the user's liking but they proposed anyway

If the lead's rate in `data/leads.md` is below the user's floor from `config/rates.yml`, the value-add message (day 7) should not reference the rate or suggest a price change. Focus on scope and expertise. Rate negotiation happens before the proposal or during `Negotiating` status, not in follow-up messages.

### User wants to send earlier than the cadence

If the user says "I want to follow up now, it's only been 1 day," explain:
> "It's only been {N} day(s) since your proposal. The recommended first follow-up is at day 3. Sending earlier risks appearing desperate or impatient. Are you sure you want to send now?"
If the user insists, draft the day 3 message (gentle nudge) but mark the follow-up date so the next one is still 7 days after this one, not 7 days after the proposal.

### Client asks for more info in response to a follow-up

If the client replies to any follow-up asking for additional details, stop the cadence immediately. The lead is now active. Switch to `Negotiating` status and offer to draft a detailed response or schedule a screening call via `modes/screening.md`.

## Examples

### Example 1: Day 3 — Gentle Nudge

**Context:**
- Lead #005 — Acme Corp, AI Chatbot (4wk, $95/hr)
- Proposed: 2026-06-12 (3 days ago)
- Platform: Upwork
- No follow-ups sent yet

**AI draft:**

```
## Follow-up: Acme Corp — AI Chatbot (#005)

**Status:** 3d since proposal, 0 follow-up(s) sent
**Cadence:** Day 3 — Gentle Nudge
**Channel:** Upwork message

---

Hi there,

I sent over my proposal for the AI chatbot project on June 12th. If any part of my approach needs clarification — tech stack, timeline, or how I handle the data ingestion pipeline — happy to expand on it.

No rush — just wanted to make sure it landed.

Best,
[User Name]
```

### Example 2: Day 7 — Value-Add

**Context:**
- Lead #008 — Beta Ltd, Data pipeline (8wk, $130/hr)
- Proposed: 2026-06-08 (7 days ago)
- Platform: Direct (email)
- Follow-ups sent: 1 (day 3 nudge, no response)

**AI draft:**

```
## Follow-up: Beta Ltd — Data Pipeline (#008)

**Status:** 7d since proposal, 1 follow-up(s) sent
**Cadence:** Day 7 — Value-Add
**Channel:** Email

**Subject:** Quick thought on the data pipeline — Beta Ltd

---

Hi [Client Name],

I was reviewing a similar data pipeline project I delivered recently — processing 2M+ events/day with dbt + Airflow on AWS. We reduced reporting latency from 24h to under 15 minutes using incremental modeling and real-time streaming.

If you're considering how the pipeline would handle growth beyond the initial scope, I'm happy to share the architecture decisions that made that possible.

Best,
[User Name]
```

### Example 3: Day 14 — Polite Close-Out

**Context:**
- Lead #012 — Gamma Inc, API integration (6wk, $8k fixed)
- Proposed: 2026-06-01 (14 days ago)
- Platform: Toptal
- Follow-ups sent: 2 (day 3 nudge, day 7 value-add)

**AI draft:**

```
## Follow-up: Gamma Inc — API Integration (#012)

**Status:** 14d since proposal, 2 follow-up(s) sent
**Cadence:** Day 14 — Polite Close-Out
**Channel:** Toptal message

---

Hi there,

I assume you've found the right fit for the API integration work or the project is on hold for now. Either way, I appreciate the opportunity to present my approach.

If anything changes or a related need comes up, feel free to reach out.

Best,
[User Name]

---

**Note:** After sending this, update lead #012 to Ghosted.
```

## Anti-Patterns

- **Sending all three messages regardless of response.** The cadence is a framework, not a script. If the client replies at any point, stop. Do not send the next scheduled message because "it's on the calendar."
- **"Just checking in" as a message.** Every follow-up must have a purpose. "Checking in" says nothing and wastes the client's attention. If you have nothing to say, wait until you do.
- **Ignoring the cadence intervals.** Sending follow-ups every day or every 2 days is spam. Respect the 3-7-14 gap. Silence is not a signal to send more — it is a signal that the cadence is working as designed.
- **Escalating tone across messages.** If the client does not reply to day 3, do not make day 7 more aggressive. The tone stays professional and warm across all three messages. The close-out is gracious, not passive-aggressive.
- **Sending a follow-up to a client who is clearly reviewing your proposal.** If the client said "reviewing, will get back to you," do not send the day 3 nudge. Wait for their timeline. Update the cadence to start from their response date.
- **Using the same template for every lead.** Each follow-up must reference something specific to that client's project. Copy-paste messages are obvious and damage credibility.
- **Burning bridges with the close-out.** The freelance world is small. A client who ghosts you for one project may reach out for another a year later. The close-out message leaves the door open. Never express frustration or disappointment.
- **Recording drafts as sent.** Only log follow-ups the user confirms they actually sent. Premature recording corrupts the cadence timing for the next session.
- **Nurturing leads that should be in terminal state.** If the user has already decided to move on, update the status to `Ghosted` or `Withdrew`. Nurture mode should not process terminal leads.
- **Ignoring the score threshold.** Low-scoring leads (< 4.0) that the user proposed anyway should receive minimal follow-up effort. A single day 3 nudge is sufficient; skip day 7 and day 14. Do not invest value-add effort in weak leads.
- **Offering discounts in follow-ups.** Never lead with a price reduction in a follow-up message. It signals that your initial rate was inflated and undermines future negotiation. Rate adjustments belong in the negotiation phase, not in the cadence.
- **Over-engineering the message.** A follow-up is 2-4 sentences. Do not write a second proposal. The original proposal was the pitch — the follow-up is a gentle tap on the shoulder.
