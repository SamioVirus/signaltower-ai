import { Link } from "react-router-dom";
import { Layers, Target } from "lucide-react";

import { Page, PageHeader } from "@/components/ui/PageHeader";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui/Primitives";
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

      <Card>
        <CardHeader title="How the ranking works" />
        <CardBody>
          <p className="max-w-4xl text-sm leading-6 text-secondary">
            Each decision scores as{" "}
            <span className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-xs text-primary">
              value in $m × confidence × urgency × leverage ÷ effort in weeks
            </span>
            . Confidence comes from the initiative&rsquo;s readiness, urgency
            from how long it has been ageing, and leverage from how many
            initiatives a single piece of work would unblock.{" "}
            {systemicCount > 0
              ? `${formatCount(systemicCount, "decision")} in this queue ${systemicCount === 1 ? "is" : "are"} systemic: one remediation that clears the same control for several initiatives at once.`
              : "No systemic remediation currently qualifies."}
          </p>
        </CardBody>
      </Card>

      <section className="grid gap-4">
        {decisions.map((decision, index) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            rank={index + 1}
          />
        ))}
      </section>
    </Page>
  );
};

const DecisionCard = ({
  decision,
  rank,
}: {
  decision: Decision;
  rank: number;
}) => {
  const isSystemic = decision.kind === "systemic";

  return (
    <Card as="article">
      <CardBody className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-soft text-xs font-bold text-accent-text">
              {rank}
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

          <h2 className="mt-3 text-base font-semibold leading-6 tracking-tight text-primary">
            {decision.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">
            {decision.rationale}
          </p>

          <div className="mt-4 rounded-lg border border-subtle bg-surface-sunken p-3">
            <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
              Decision required
            </p>
            <p className="mt-1 text-sm leading-6 text-primary">
              {decision.requiredDecision}
            </p>
            <p className="mt-2 text-xs text-muted">Owner: {decision.owner}</p>
          </div>

          {isSystemic ? (
            <p className="mt-3 rounded-lg border border-ok/25 bg-ok-soft p-3 text-xs leading-5 text-ok-text">
              <span className="font-semibold">Leverage:</span>{" "}
              {decision.effortDays} days once, against roughly{" "}
              {decision.explanation.effortIfDoneSeparatelyDays} days if each
              team solves it separately — a saving of{" "}
              {decision.explanation.effortIfDoneSeparatelyDays -
                decision.effortDays}{" "}
              days of control capacity.
            </p>
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
                      className="inline-block rounded-md bg-surface-sunken px-2 py-1 text-xs text-secondary ring-1 ring-subtle transition hover:text-accent hover:ring-accent-border"
                    >
                      {initiative?.name ?? id}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-subtle bg-surface-sunken p-4">
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
            Value unlocked
          </p>
          <p
            data-metric
            className="mt-1 text-3xl font-semibold tracking-tight text-primary"
          >
            {formatCompactCurrency(decision.valueUnlockedUsd)}
          </p>

          <dl className="mt-4 space-y-2 border-t border-subtle pt-4 text-sm">
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

          <div className="mt-4 flex items-baseline justify-between border-t border-subtle pt-3">
            <span className="text-2xs font-semibold uppercase tracking-wider text-muted">
              Priority score
            </span>
            <span data-metric className="text-lg font-semibold text-accent">
              {decision.score.toFixed(2)}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
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
    <dd data-metric className="font-semibold text-primary">
      {value}
    </dd>
  </div>
);
