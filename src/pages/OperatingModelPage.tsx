import { Link } from "react-router-dom";

import { Page, PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Primitives";
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

      <Card className="border-accent-border bg-accent-soft">
        <CardBody>
          <p className="max-w-4xl text-sm leading-6 text-accent-text">
            Against this portfolio, the 90 days would start from{" "}
            <span className="font-semibold">
              {formatPercent(metrics.averageReadiness)} average readiness
            </span>
            , {formatCount(metrics.blockedCount, "initiative")} blocked at their
            next gate, and {formatCompactCurrency(metrics.blockedValueUsd)} of
            annual value waiting on control evidence.{" "}
            {systemic.length > 0
              ? `Phase two would begin with ${systemic.map((pattern) => pattern.control.label.toLowerCase()).join(" and ")}, the control blocking the most initiatives at once.`
              : "No control is currently systemic, so phase two would focus on the highest-value individual gaps."}
          </p>
        </CardBody>
      </Card>

      <section className="grid gap-5 xl:grid-cols-3">
        {PHASES.map((phase, index) => (
          <Card key={phase.period} as="article" className="flex flex-col">
            <CardHeader title={phase.title} description={phase.period} />
            <CardBody className="flex flex-1 flex-col">
              <p className="text-sm leading-6 text-secondary">
                {phase.summary}
              </p>
              <ol className="mt-5 flex-1 space-y-2.5">
                {phase.outcomes.map((outcome, outcomeIndex) => (
                  <li
                    key={outcome}
                    className="flex gap-3 text-sm leading-6 text-secondary"
                  >
                    <span
                      data-metric
                      className="shrink-0 font-mono text-2xs font-semibold text-accent"
                      aria-hidden="true"
                    >
                      {index + 1}.{outcomeIndex + 1}
                    </span>
                    {outcome}
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader title="Why this order" />
        <CardBody>
          <p className="max-w-4xl text-sm leading-6 text-secondary">
            Most AI governance programmes start by writing the standard and end
            up with a document that the tooling does not enforce and the
            delivery teams route around. This order inverts that: capture the
            evidence first so the gaps are observable, build the reusable
            controls the evidence says are actually blocking work, and only then
            argue about policy — with conversion data in hand. The scoring
            policy on the{" "}
            <Link
              to="/methodology"
              className="font-medium text-accent hover:underline"
            >
              Methodology
            </Link>{" "}
            page is a working example of the end state: a rule that executes
            rather than a rule that is merely published.
          </p>
        </CardBody>
      </Card>
    </Page>
  );
};
