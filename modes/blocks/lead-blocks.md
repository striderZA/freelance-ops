# Lead Evaluation Blocks (6 blocks + Block G)

**Status:** STUB - detailed heuristics authored in Plan 2 / Plan 3.
**See:** docs/superpowers/specs/2026-06-15-freelance-ops-fork-design.md

The freelance-ops lead evaluation is structured as 6 weighted blocks (A-F) plus
a legitimacy tier (Block G) that gates the rest. Each block produces a 0-5
score; the final letter grade is the average.

## Block A -- Lead Summary

What the client wants. Scope, deliverables, budget or rate range, timeline,
engagement shape (hourly / fixed-price / milestone / retainer), who's hiring.

## Block B -- Profile Match

Your skills, proof points, and portfolio pieces vs. the lead's needs. Borrowed
in shape from the parent project's CV match block.

## Block C -- Rate Strategy

Target rate (hourly or fixed) given your `config/rates.yml`. Market rate check.
Red-flag detection: rate too low, scope-vs-rate mismatch, "exposure"
compensation, equity-only, speculative work.

## Block D -- Client / Platform Research

Client reputation, payment history (Upwork: hire rate, total spent, payment
verified, country), platform signals (repeat-hire pattern, interview-to-hire
ratio), prior freelancer reviews.

## Block E -- Proposal Strategy

Angle, differentiators, social proof. Identifies the 2-3 proof points from
your story bank that map strongest to the lead. Outputs the proposal skeleton.

## Block F -- Engagement & Risk

Terms (IP assignment, NDA, exclusivity, kill fee), payment terms (milestones,
escrow, net-N), red flags (off-platform request, upfront-payment demand, vague
scope, undisclosed team).

## Block G -- Legitimacy (TIER, not a score)

Freelance-specific scam detection. Output is a tier, not a 0-5:

- `verified` -- no red flags, proceed
- `caution` -- 1-2 minor flags, proceed with eyes open
- `likely-scam` -- DO NOT PROPOSE. Common patterns:
  - Advance-fee scam (asks for payment to release the job)
  - Overpayment scam (will "accidentally" overpay and ask for a refund)
  - Fake client impersonation (impersonates a known company)
  - MLM / pyramid signals (recruitment focus, vague product)
  - "Test task" as unpaid labor (large scope request, no compensation)
  - Off-platform payment push (Upwork job but wants to pay via Wire/Western Union)
  - Vague scope + high pay mismatch

## Report Header (machine-readable)

```yaml
**Legitimacy:** {verified|caution|likely-scam}
**Rate:** ${target_rate}/hr (or ${fixed_price})
**Score:** {X.X}/5
**URL:** {source_url}
```

(Full heuristics: Plan 2 for Blocks A-F, Plan 3 for Block G specifically.)
