# 1. Store evidence, derive conclusions

- **Status:** Accepted
- **Date:** 2026-09-17
- **Supersedes:** the conclusion-first fixture used in the initial build

## Context

The first version stored per-initiative conclusions directly: a `readinessScore`, a
`blockerCategory`, a `mainBlocker` sentence, and a hand-written list of executive decisions. The UI
rendered them into charts.

It demonstrated well and was fast to build. It also had no answer to the first question a technical
reviewer asks, which is "where does this number come from?" The honest answer was that somebody
typed it. A reader who opened `useCases.ts` found that the control tower computed nothing, and two
of the six metrics were the same value under different labels.

That is not only a credibility problem. It is a design dead end:

- The scoring policy could never be interrogated, because there was no policy — only outputs.
- Nothing could be simulated, because nothing was a function of anything.
- There was no reason for tests to exist. Testing that a constant equals itself is theatre.

## Decision

Store only **observable evidence** — the state of each control artifact, its owner, its age, and a
factual note on what exists today. Derive everything else in a pure, dependency-free engine:
readiness and its per-control breakdown, stage-gate verdicts, blockers, control debt, portfolio
patterns, the ranked decision queue and the conversion forecast.

Express the scoring policy itself as executable data — weights per risk tier, the gating stage, and
the remediation cost per control — so that changing a weight changes every downstream number in one
move, and so the published methodology can be rendered from the object the engine actually runs.

## Consequences

**Gained**

- Every figure can be taken apart. The Evidence Passport shows what each control contributed and
  what it is costing, so a readiness score can be challenged rather than merely believed.
- Simulation becomes a natural capability instead of a feature to build. Flipping evidence and
  re-running the same engine _is_ the what-if.
- Tests have real subjects: applicability rules, gate monotonicity, severity ordering, ranking
  determinism, scheduling behaviour.
- Findings emerge that were not authored — control debt, and systemic controls blocking several
  initiatives simultaneously. Neither existed in the hand-written version because nobody thought to
  write them.

**Paid**

- The fixture is longer and more tedious to author: twelve controls per initiative with owner, age
  and note, rather than one score.
- Derived numbers cannot be tuned for narrative. When the engine first ran, the flagship
  initiative's top blocker was model risk rather than the lineage the existing case study described.
  The evidence was corrected to match the story it was always meant to tell — but the engine, not
  the prose, now decides.
- The demo data can drift out of agreement with the policy. Mitigated by a fixture-integrity test
  suite, most usefully the invariant that a control is marked `not_applicable` exactly when the
  policy says it does not apply.

## Alternatives considered

**Keep scores, add a validator.** Rejected: a validator that checks a typed-in score against derived
evidence is the derivation, with an extra step and a second source of truth to disagree with.

**Derive scores but keep authored blockers and decisions.** Rejected for the same reason in
miniature. The interesting findings — one control blocking four initiatives at once, four
initiatives in stages they never qualified for — are exactly the ones a human author does not
notice, which is the whole argument for deriving them.
