# Architecture

How SignalTower is put together, and why. This is the document to read if you want to know whether
the engineering holds up rather than what the product claims.

## The central decision: evidence in, conclusions derived

The first version of this project stored conclusions:

```ts
{
  id: "AI-001",
  readinessScore: 71,               // a number somebody typed
  blockerCategory: "Data Lineage",  // a label somebody chose
  mainBlocker: "Data lineage incomplete for two upstream fields.",
}
```

That shape has three problems, and they compound:

1. **Nothing can be interrogated.** "Why 71?" has no answer in the code. A reviewer who asks it
   discovers the number is an assertion.
2. **Nothing recomputes.** Change the evidence and the score stays 71, because the score was never
   a function of the evidence.
3. **The application has no reason to exist.** If the answers are already in the file, the code is
   a rendering layer for somebody else's spreadsheet.

The current model stores only what could be observed in a real organisation:

```ts
{
  id: "AI-001",
  evidence: {
    lineage: {
      state: "missing",
      owner: "Data Governance Office",
      ageDays: 38,
      note: "Relationship score and coverage history have no documented data owner.",
    },
    // ...eleven more controls
  },
}
```

Readiness, band, blockers, gate verdicts, control debt, portfolio patterns, the decision queue and
the conversion forecast are all _derived_. The data file contains no scores and no blocker labels,
and a test enforces that the fixture stays consistent with the policy.

## Module boundaries

```
src/engine/     Pure domain logic. No React, no I/O, no clock, no randomness.
src/data/       The fixture. Evidence only.
src/lib/        Formatting, presentation mapping, export, chart theming.
src/hooks/      Theme preference, URL-synced state, dark-mode observation.
src/components/ ui/ is generic and presentational; domain/ knows the model.
src/pages/      One per route. Code-split.
```

The engine is the load-bearing boundary. Every export is a pure function of its arguments, which
gives three concrete properties:

- It is testable without a DOM, a server or a mock.
- It is deterministic, so the forecast and the decision ranking are reproducible.
- Business rules cannot leak into components, because components have nothing to leak into.

## The scoring policy is executable

[`src/engine/policy.ts`](../src/engine/policy.ts) is the governance standard expressed as data the
engine runs. Each control declares its weight _per risk tier_, the stage that gates it, and what
remediating it costs:

```ts
{
  id: "model-risk",
  weight: { Low: 0.7, Moderate: 1.4, High: 2, Restricted: 2.4 },
  gate: "Production Ready",
  remediation: { action: "...", effortDays: 20, owningFunction: "Model Risk Management" },
}
```

Changing a weight here changes readiness scores, blocker severity, decision ranking and the forecast
in one move. The Methodology page renders this same object, so the published policy cannot drift
away from the enforced one — a failure mode that a written standard has by construction.

## Scoring

```
score = round(100 × Σ(weightᵢ × creditᵢ) / Σ(weightᵢ))   over applicable controls
```

Two details carry most of the weight:

**Applicability is decided by the policy, not the data.** A control with an `appliesWhen` predicate
is evaluated against the initiative every time. A non-agentic workflow carrying a stale
`agentic-controls` artifact is scored as if that control does not exist, regardless of what the
fixture says.

**`not_applicable` is excluded from the denominator, not scored as a pass.** This is the edge case
the model turns on. Counting an inapplicable control as satisfied would reward a workflow for
lacking controls it never needed, and would make a simple text assistant outrank an agentic system
that had done the harder work. Several tests exist solely to hold this line.

Every score carries a contribution breakdown — weight, credit earned, and **points lost** per
control, sorted by cost. That last figure is the one a leader acts on.

## Gates and control debt

A control gated at stage _S_ must be `approved` before an initiative may enter _S_. Advancing
therefore requires every applicable control gated at or before the target.

Evaluating an initiative's gate against the stage it is _already in_ produces something a status
field can never show: **control debt** — evidence that was required to enter the current stage and
was never approved. Four of the twelve initiatives in the fixture carry it. The stage field says
they arrived; nothing else re-checks whether they qualified.

## Two horizons, deliberately

- `deriveBlockers` — what blocks the _next_ gate. The delivery team's question.
- `deriveGaps` — every control still outstanding before production, including ones that will not
  bite for two more gates. The control function's question.

Scoping portfolio patterns to the next gate would hide the worst data-quality gap in the portfolio
purely because that initiative has not yet reached the gate that checks it. Scoping the "what is
blocking me" view to the full horizon would drown a delivery team in work it cannot start. Both
exist because they answer different questions.

## Systemic detection

A control is systemic when it blocks **three or more initiatives at their next gate at the same
time**. That threshold is against blocking-now rather than the full gap horizon for a specific
reason: with twelve initiatives and twelve controls, nearly every control is outstanding somewhere,
and a signal that fires on everything is not a signal. What earns a reusable template is several
teams being stopped by the same thing simultaneously.

When one fires, the engine stops proposing N separate reviews and proposes one pattern, costed at
1.5× a single instance against the N× it would otherwise take.

## Decision ranking

```
score = (value in $m × confidence × urgency × leverage) / effort in weeks
```

- **confidence** from readiness, as a proxy for conversion likelihood
- **urgency** from ageing, amplifying up to 2× and saturating at 180 days so one very old item
  cannot dominate every ranking
- **leverage** from how many initiatives one piece of work unblocks

Every input is exposed on the decision card. A ranking nobody can interrogate does not get used
twice.

## The forecast

A deterministic weekly queue simulation. Fixed control-team capacity is spent on the front of the
queue; both strategies get identical capacity and both finish one initiative before starting the
next. Only the ordering differs:

- **oldest-first** — what an unmanaged request queue does. Value and cost do not enter into it.
- **value-ranked** — highest annual value per _remaining day of effort to production readiness_.
  This is weighted shortest processing time, the rule that minimises value-weighted completion time
  on a single constrained resource, which is what a shared control function is.

Note what the ranked queue deliberately does **not** use: the decision score. That score divides by
the effort of the next decision, not the effort still left to reach production, so it happily
promotes an initiative with a cheap next step and sixty days of work behind it. Cheap to start is
not the same as close to landing. An earlier version of this model did use the decision score, and
lost to oldest-first on some scenarios — which was the model being wrong, not the strategy.

The ranked queue also gets a template-reuse discount on systemic controls, because a managed queue
notices it is solving the same control repeatedly and an unmanaged one does not. This assumption
favours the ranked queue and is the main reason it wins; it is stated as such on the Methodology
page rather than buried in a fudge factor.

## Interface

**Theming.** Semantic tokens in `src/styles.css`, light and dark, so the dark theme is a token swap
rather than a parallel set of hand-tuned classes. Charts are the exception: `var()` is not resolved
inside SVG presentation attributes such as `fill`, so chart colours are concrete values selected by
a `useIsDark()` observer on the root element.

**Chart palette.** Categorical slots assigned in fixed order and never cycled, so a series keeps its
colour when a filter removes its neighbours. Tiered data (risk tiers, heatmap density) uses a
single-hue ordinal ramp rather than categorical hues, because those values are ordered. Both sets
were validated for colour-vision separation, lightness band and surface contrast against both
surfaces.

**Accessibility.** Not asserted — tested. axe-core runs over all nine routes in both themes in CI
and fails the build on any WCAG 2.1 AA violation. The work that took: a text token that measured
4.44:1 where 4.5:1 was needed; a dark-theme accent light enough to read as text but too light behind
white button labels, which needed its own `--accent-solid` / `--on-accent` pair; and opacity
modifiers on already-muted text. `jsx-a11y` runs at lint time so regressions fail before a browser
is involved.

**Code splitting.** Routes are lazily loaded. The charting library is the largest dependency and
only three screens need it, so loading it up front made every visitor pay for pages they might never
open. Initial JS went from 754 kB to 293 kB.

## Testing strategy

| Layer             | What it covers                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Engine unit tests | Scoring edge cases, gate logic, severity ordering, ranking determinism, simulation invariants                                 |
| Fixture integrity | The demo data against its own invariants, so content drift fails the build                                                    |
| End-to-end        | Every route renders without console errors, derived values reach the screen, interaction recomputes, filters survive a reload |
| Accessibility     | axe-core over every route in both themes, both viewports                                                                      |

Engine tests build initiatives from an explicit factory rather than importing the shipped fixture.
Asserting engine behaviour against demo content couples the tests to the narrative and makes them
fail whenever the story changes — which is exactly when you most want them to be trustworthy.

Coverage thresholds are ratcheted to the level achieved (95% statements, 85% branches, 95%
functions), so a regression fails CI rather than drifting quietly downward.
