# SignalTower AI Case Study

## Context

Regulated enterprises have many AI ideas. The harder problem is moving the right ideas from pilot activity into governed production value.

AI use cases often get stuck between business value, data readiness, governance, risk, controls, ownership, and production monitoring. A promising concept may have a clear sponsor and value case, but still be blocked by incomplete lineage, missing control evidence, unclear accountable owners, unresolved model-risk questions, or insufficient monitoring plans.

## Thesis

The bottleneck is pilot-to-production congestion, not lack of AI ideas.

In regulated environments, AI adoption depends on more than model experimentation. Leaders need to understand which initiatives are ready, which are not ready, why they are delayed, and which decision would release the most value without weakening control quality.

## Solution

SignalTower AI is an AI commercialization control tower. It is designed as an executive-facing portfolio layer for governed AI adoption.

The concept brings AI initiatives into a common operating view so business, technology, data, risk, and control stakeholders can evaluate readiness, identify repeated bottlenecks, and focus leadership attention on the decisions that matter.

## What The App Demonstrates

- Portfolio visibility across AI initiatives, stages, value at stake, readiness, risk, and blockers
- Readiness scoring across business, data, risk, controls, monitoring, and value-realization dimensions
- An Evidence Passport that shows the evidence required to move a use case toward production
- Bottleneck analysis that separates one-off project issues from repeated operating-model constraints
- Executive decision support that ranks the choices most likely to unlock value
- A 90-day operating model for inventory, governance templates, production conversion, and executive cadence

## Why It Matters

SignalTower AI helps leaders see which AI initiatives are ready, which are stuck, why they are stuck, and what decision unlocks the most value fastest.

That visibility changes the management conversation. Instead of treating every delayed AI use case as a separate escalation, leaders can see the shared constraints across the portfolio and decide where to add ownership, evidence, standards, or governance capacity.

## How It Is Built

The concept above would be easy to fake: a file of use cases each carrying a readiness score and a
blocker label, rendered into charts. SignalTower deliberately does not do that.

The data file records **control evidence only** — the state of each control artifact, who owns it,
how long it has sat there. Readiness scores, stage-gate verdicts, blockers, control debt, portfolio
patterns, the ranked decision queue and the conversion forecast are all derived by a pure, tested
engine from that evidence, under a scoring policy that is itself executable data.

Three consequences matter for the argument this case study makes:

- **The numbers can be challenged.** Each readiness score comes with a per-control breakdown showing
  what each control contributed and what it is costing. Governance metrics that cannot be
  interrogated do not survive contact with the people they govern.
- **Decisions can be modelled before they are made.** The simulator applies candidate remediations
  and re-derives the entire portfolio through the same engine, so "what would that buy us?" is
  answered by the system rather than a side spreadsheet.
- **The findings are not authored.** Control debt and systemic blockers emerged from the derivation.
  Nobody wrote them into the data, which is precisely why they are worth surfacing to leadership.

See [architecture.md](architecture.md) for the engineering detail and
[decisions/0001-evidence-first-data-model.md](decisions/0001-evidence-first-data-model.md) for why
the model was inverted.

## Synthetic-Data Boundary

This is a generic outside-in prototype using synthetic data only.

It does not use real company data, does not contain internal claims, and is not branded as or presented as any institution's tool. It is a portfolio demonstration of an operating-model concept for regulated enterprise AI commercialization.
