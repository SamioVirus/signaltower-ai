# SignalTower design system

One committed direction: a modern briefing room. Warm paper, dark ink, editorial
typography, and diagrams that make a complicated situation legible.

Three qualities govern every decision:

- **Composed** — generous space between sections, disciplined alignment, few competing accents.
- **Observant** — blockers, changes and missing evidence are easy to distinguish.
- **Direct** — short labels, clear numbers, specific explanations.

Most of the screen stays neutral. A blocker earns its prominence.

---

## Colour

Every pairing below is contrast-tested by `npm run palette`, which runs inside
`npm run verify`. Change a value and the gate names what it broke.

### Light

| Role | Value | Applied to |
| --- | --- | --- |
| Canvas | `#F6F4EF` | Page background |
| Surface | `#FFFEFB` | Panels, tables, inputs |
| Sunken | `#EFEDE6` | Inset groups, quiet fills |
| Ink | `#20272B` | Headings, numbers, body |
| Secondary | `#4A545A` | Supporting prose |
| Muted | `#5F6B72` | Labels, captions |
| Graphite | `#202C31` | Navigation rail |
| Petrol | `#1D6270` | Interaction, selection, focus |
| Divider | `#DADFD9` | Structural separation |

### Dark

Selected, not inverted. Layered charcoal with warm-grey text.

| Role | Value |
| --- | --- |
| Canvas | `#14191B` |
| Surface | `#1B2225` |
| Ink | `#E9E7E1` |
| Accent (text) | `#6FB9C7` |
| Accent (filled) | `#1D6270` |

**The accent needs two steps.** A petrol light enough to read as text on
charcoal is too light to sit behind white button labels — the first cut measured
**2.07:1**. `--accent` is the readable step; `--accent-solid` is the fill, paired
with `--on-accent`. Never use `--accent` as a button background.

### Rules

- Petrol means interaction or selection. Nothing else.
- Muted green means satisfied. Amber means attention or incomplete. Brick red
  means blocked or failed. Slate means informational.
- **Status always carries a label or symbol.** Colour is never the only signal.
- **Status colours are reserved.** They never double as a chart series — the
  first cut had `--info` and chart series 1 set to the *same hex*, which turned a
  readiness meter into something that looked like a data mark. The gate now
  enforces ΔE ≥ 15 between every status and every series.
- **Petrol never appears inside a plot.** In-chart emphasis uses weight, opacity
  or annotation. A mark must never be mistaken for the interaction colour.

### Chart palette

Re-stepped for the warm surfaces. The previous steps were validated against a
cool near-white; on ivory the orange fell to 2.91:1 and the aqua to 2.56:1.

| Slot | Light | Dark |
| --- | --- | --- |
| 1 | `#33409B` | `#6F84E0` |
| 2 | `#B24A18` | `#E0793F` |
| 3 | `#12705A` | `#3FAE8C` |

Assigned in fixed order, never cycled: a series keeps its colour when a filter
removes its neighbours. Ordinal data (risk tiers, heatmap density) uses a
single-hue ramp instead, because those values are ordered.

---

## Typography

**Source Serif 4** for the landing headline. **Inter** for the entire working
interface. The serif appears once per page at most; tables, navigation, forms and
analysis stay in the sans stack.

| Role | Size |
| --- | --- |
| Landing headline | 64px desktop / 36px mobile |
| Page title | 28–32px |
| Section heading | 17px |
| Panel heading | 13px semibold |
| Primary metric | 28–32px, tabular figures |
| Body and tables | 14–15px |
| Labels and captions | 12–13px |

**11px is retired.** The previous interface had 54 instances of it, which made
too much of the screen read as metadata. The old `2xs` token now resolves to
12px, so any screen not yet migrated gets the floor for free.

Other rules:

- Sentence case for labels. Uppercase only for a short page eyebrow.
- Monospace only for real identifiers (`AI-001`) and code.
- Financial figures right-aligned; `font-variant-numeric: tabular-nums` on
  anything that changes.
- Prose capped at `max-w-measure` (68ch).
- Bold establishes hierarchy; it is not scattered through sentences.

---

## Surfaces

The change with the most impact. Ninety containers previously shared one
treatment — border, radius and shadow — so a metric tile carried the same weight
as a leadership decision.

There are three tiers, and a component must pick one:

| Tier | Treatment | For |
| --- | --- | --- |
| **Section** | No chrome. Structure from headings, spacing, thin rules. | Page groupings, introductions, metric strips |
| **Panel** | Paper white, hairline border, 8px radius, no shadow. | Tables, charts, grouped controls |
| **Floating** | Elevation. | Menus, dialogs, popovers only |

If something seems to want a fourth tier, it usually wants to be a Section with
better spacing.

Spacing scale: **4 · 8 · 12 · 16 · 24 · 32 · 48 · 64**.
Radii: **6px** controls, **8px** panels, **12px** dialogs.
Control heights: 32px small, 36px default.

---

## The mark

Three signal lines. Two run clear; the middle stops short and resumes at one
emphasised point. That gap is the product in a glyph — a sequence interrupted at
the checkpoint that has not cleared.

Drawn as SVG in `currentColor` so it survives being a favicon, a one-colour print
mark, or a nav glyph. `AI` stays a descriptor and does not compete with the name.

**The motif appears in exactly two places:** the mark and the gate diagram. A
third and fourth use would make it texture rather than a signature. The one
concession is `.signal-rule`, a hairline that introduces a finding.

---

## The gate diagram

The signature specimen, and the same geometry as the mark. Checkpoints down a
rail; the rail goes dashed at the first unmet gate.

Three states, distinguishable **without colour** — filled, ringed and hollow
nodes read differently in greyscale and at 200% zoom. Every node also carries
text, and each announces its state to assistive technology.

Being the *current* stage is a separate dimension from whether the gate is met,
because an initiative can sit in a stage whose gate it never cleared. That is
control debt, and the diagram exists to show it rather than hide it.

Gate requirements are cumulative, so the blocking list is enumerated once — at
the gate actually being attempted. Later gates show a count. Repeating the list
at every subsequent stage is the difference between a diagram and a wall of
duplicated text.

---

## Interaction

- Transitions 140–180ms, colour and opacity only. `prefers-reduced-motion`
  respected globally.
- One focus treatment: a 2px petrol outline with 2px offset, applied via
  `:focus-visible` — visible in both themes.
- Selected navigation carries a short accent stroke at the left edge.

The system must be understandable in a screenshot, without animation or a
tooltip to explain it.

---

## What must not regress

The redesign is protected by the existing suites, and these are load-bearing:

- `role="meter"` with `aria-valuenow` on the readiness bar
- `aria-sort` on sortable table headers
- Per-cell `sr-only` labels in the control matrix
- axe over all nine routes in both themes, failing the build on any violation

Run `npm run verify` for types, lint, palette, unit tests and build;
`npm run test:e2e` for behaviour and accessibility; `npm run proof` for the
three specimen screens.
