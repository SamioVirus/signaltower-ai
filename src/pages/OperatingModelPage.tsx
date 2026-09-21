import { Link } from "react-router-dom";
import { Check } from "lucide-react";

import { Page, PageHeader } from "@/components/ui/PageHeader";
import { Callout, Panel } from "@/components/ui/Primitives";
import { portfolio } from "@/data/portfolio";
import { blockerPatterns } from "@/engine/blockers";
import { portfolioMetrics } from "@/engine/portfolio";
import {
  formatCompactCurrency,
  formatCount,
  formatPercent,
} from "@/lib/format";

const PHASES = [
  {
    step: "01",
    period: "Days 1–30",
    title: "Inventory and evidence capture",
    summary:
      "Stop guessing what is in flight. Record the control evidence that exists today, per initiative, with an owner and a date against each artifact.",
    outcomes: [
      "Every active AI initiative has a named executive sponsor",
      "Control evidence recorded as state, not as a RAG status",
      "Risk tier assigned, and the controls it implies made explicit",
      "Value at stake estimated by the sponsor, not by the delivery team",
      "Baseline readiness derived rather than self-reported",
    ],
  },
  {
    step: "02",
    period: "Days 31–60",
    title: "Reusable control patterns",
    summary:
      "Find the controls several teams are each solving separately and build them once. This is where the throughput comes from; individual escalations do not compound.",
    outcomes: [
      "Systemic blockers identified from the evidence, not from anecdote",
      "Reusable templates built for the controls with the widest reach",
      "Risk-tiered review paths agreed so low-risk work stops queueing behind high-risk work",
      "A weekly decision review that works a ranked queue",
      "Three production candidates selected on evidence",
    ],
  },
  {
    step: "03",
    period: "Days 61–90",
    title: "Conversion and proof",
    summary:
      "Convert the selected candidates, then prove the value against the baseline rather than restating the business case.",
    outcomes: [
      "Selected initiatives cleared through control review",
      "First governed production release with monitoring live from day one",
      "Realised value measured against the recorded KPI baseline",
      "Control debt tracked and paid down rather than accumulated",
      "Policy weights revisited with evidence from actual conversions",
    ],
  },
];

export const OperatingModelPage = () => {
  const metrics = portfolioMetrics(portfolio);
  const systemic = blockerPatterns(portfolio).filter(
    (pattern) => pattern.isSystemic,
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Operating model"
        title="From inventory to governed conversion in 90 days"
        lede="A control tower is only worth building if it changes how decisions get made. This is the operating rhythm the rest of the application is designed to support."
      />

      <Callout title="Baseline against this portfolio">
        The 90 days would start from{" "}
        <span className="font-semibold">
          {formatPercent(metrics.averageReadiness)} average readiness
        </span>
        , {formatCount(metrics.blockedCount, "initiative")} blocked at their
        next gate, and {formatCompactCurrency(metrics.blockedValueUsd)} of
        annual value waiting on control evidence.{" "}
        {systemic.length > 0
          ? `Phase two would begin with ${systemic.map((pattern) => pattern.control.label.toLowerCase()).join(" and ")}, the control blocking the most initiatives at once.`
          : "No control is currently systemic, so phase two would focus on the highest-value individual gaps."}
      </Callout>

      <section aria-label="90-day execution roadmap">
        <div className="grid gap-6 xl:grid-cols-3">
          {PHASES.map((phase) => (
            <Panel
              key={phase.period}
              as="article"
              className="flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-baseline justify-between border-b border-subtle pb-4">
                  <span
                    data-metric
                    className="font-mono text-2xl font-bold tracking-tight text-accent"
                  >
                    {phase.step}
                  </span>
                  <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-2xs font-semibold uppercase tracking-wider text-muted">
                    {phase.period}
                  </span>
                </div>

                <h2 className="mt-4 text-base font-semibold leading-snug text-primary">
                  {phase.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  {phase.summary}
                </p>

                <div className="mt-6 border-t border-subtle pt-4">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
                    Key commitments
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {phase.outcomes.map((outcome) => (
                      <li
                        key={outcome}
                        className="flex items-start gap-2.5 text-sm leading-5 text-secondary"
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                          <Check className="h-2.5 w-2.5" aria-hidden="true" />
                        </span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section className="border-t border-subtle pt-8">
        <div className="signal-rule mb-4" aria-hidden="true" />
        <h2 className="text-base font-semibold text-primary">
          Why this sequence
        </h2>
        <p className="mt-2 max-w-measure text-sm leading-6 text-secondary">
          Most AI governance programmes start by writing the standard and end up
          with a document that the tooling does not enforce and the delivery
          teams route around. This sequence inverts that: capture the evidence
          first so the gaps are observable, build the reusable controls the
          evidence says are actually blocking work, and only then argue about
          policy — with conversion data in hand. The scoring policy on the{" "}
          <Link
            to="/methodology"
            className="font-medium text-accent hover:underline"
          >
            Methodology
          </Link>{" "}
          page is a working example of the end state: a rule that executes
          rather than a rule that is merely published.
        </p>
      </section>
    </Page>
  );
};
