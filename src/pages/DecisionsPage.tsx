import { Link } from "react-router-dom";
import { Layers, Target } from "lucide-react";

import { Page, PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Primitives";
import { portfolio } from "@/data/portfolio";
import { rankDecisions } from "@/engine/decisions";
import type { Decision } from "@/engine/decisions";
import {
  formatCompactCurrency,
  formatCount,
  formatDays,
  formatWeeks,
} from "@/lib/format";

export const DecisionsPage = () => {
  const decisions = rankDecisions(portfolio);
  const systemicCount = decisions.filter(
    (decision) => decision.kind === "systemic",
  ).length;

  return (
    <Page>
      <PageHeader
        eyebrow="Executive decisions"
        title="What should leadership unblock first?"
        lede="One ranked queue, derived from the same control evidence as everything else. Each card shows the maths that put it in that position, because a decision list nobody can interrogate does not get used twice."
      />

      <section className="border-b border-subtle pb-6 text-label leading-6 text-secondary">
        <p className="max-w-measure">
          Each decision scores as{" "}
          <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-2xs font-semibold text-primary">
            value in $m × confidence × urgency × leverage ÷ effort in weeks
          </code>
          . Confidence derives from readiness, urgency from queue ageing, and
          leverage from how many initiatives a single remediation unblocks.{" "}
          {systemicCount > 0
            ? `${formatCount(systemicCount, "decision")} in this queue ${systemicCount === 1 ? "is" : "are"} systemic: one remediation clearing the same control across multiple initiatives at once.`
            : "No systemic remediation currently qualifies."}
        </p>
      </section>

      <section className="divide-y divide-subtle rounded-panel border border-subtle bg-surface shadow-panel">
        {decisions.map((decision, index) => (
          <DecisionRow key={decision.id} decision={decision} rank={index + 1} />
        ))}
      </section>
    </Page>
  );
};

const DecisionRow = ({
  decision,
  rank,
}: {
  decision: Decision;
  rank: number;
}) => {
  const isSystemic = decision.kind === "systemic";

  return (
    <article className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            data-metric
            className="flex h-6 w-6 items-center justify-center rounded bg-accent-soft font-mono text-2xs font-bold text-accent-text"
          >
            {rank.toString().padStart(2, "0")}
          </span>
          <Badge
            className={
              isSystemic
                ? "bg-warn-soft text-warn-text ring-1 ring-warn/25"
                : "bg-neutral-soft text-neutral-text ring-1 ring-subtle"
            }
          >
            {isSystemic ? (
              <Layers className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Target className="h-3 w-3" aria-hidden="true" />
            )}
            {isSystemic ? "Systemic" : "Single initiative"}
          </Badge>
          <span className="text-2xs font-semibold uppercase tracking-wider text-muted">
            {decision.horizon}
          </span>
        </div>

        <h2 className="mt-3 text-base font-semibold leading-snug tracking-tight text-primary">
          {decision.title}
        </h2>
        <p className="mt-2 max-w-measure text-sm leading-6 text-secondary">
          {decision.rationale}
        </p>

        <div className="mt-4 border-l-2 border-accent pl-3.5 py-0.5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
            Decision required · Owner: {decision.owner}
          </p>
          <p className="mt-1 text-sm leading-6 text-primary">
            {decision.requiredDecision}
          </p>
        </div>

        {isSystemic ? (
          <div className="mt-3.5 border-l-2 border-ok bg-ok-soft/60 px-3.5 py-2 text-xs leading-5 text-ok-text">
            <span className="font-semibold">Leverage:</span>{" "}
            {decision.effortDays} days once, against roughly{" "}
            {decision.explanation.effortIfDoneSeparatelyDays} days if each team
            solves it separately — a saving of{" "}
            {decision.explanation.effortIfDoneSeparatelyDays -
              decision.effortDays}{" "}
            days of control capacity.
          </div>
        ) : null}

        <div className="mt-4">
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
            Initiatives affected
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {decision.initiativeIds.map((id) => {
              const initiative = portfolio.find(
                (candidate) => candidate.id === id,
              );
              return (
                <li key={id}>
                  <Link
                    to={`/initiatives/${id}`}
                    className="inline-block rounded bg-surface-sunken px-2 py-0.5 text-xs text-secondary ring-1 ring-subtle transition-colors hover:text-accent hover:ring-accent"
                  >
                    {initiative?.name ?? id}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex flex-col justify-between border-t border-subtle pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
            Value unlocked
          </p>
          <p
            data-metric
            className="mt-1 text-[2rem] font-semibold leading-none tracking-[-0.02em] text-primary"
          >
            {formatCompactCurrency(decision.valueUnlockedUsd)}
          </p>

          <dl className="mt-4 space-y-2 border-t border-subtle pt-3 text-sm">
            <Factor label="Effort" value={formatDays(decision.effortDays)} />
            <Factor
              label="Confidence"
              value={`${Math.round(decision.explanation.confidence * 100)}%`}
              hint="from readiness"
            />
            <Factor
              label="Urgency"
              value={`×${decision.explanation.urgency.toFixed(2)}`}
              hint="from ageing"
            />
            <Factor
              label="Leverage"
              value={`×${decision.explanation.leverage.toFixed(2)}`}
              hint="from reuse"
            />
            <Factor
              label="Duration"
              value={formatWeeks(decision.explanation.effortWeeks)}
            />
          </dl>
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-subtle pt-3">
          <span className="text-2xs font-semibold uppercase tracking-wider text-muted">
            Priority score
          </span>
          <span data-metric className="text-lg font-semibold text-accent">
            {decision.score.toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  );
};

const Factor = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="flex items-baseline justify-between gap-3">
    <dt className="text-muted">
      {label}
      {hint ? <span className="ml-1 text-2xs text-muted">({hint})</span> : null}
    </dt>
    <dd data-metric className="font-medium text-primary">
      {value}
    </dd>
  </div>
);
