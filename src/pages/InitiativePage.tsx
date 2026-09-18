import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CircleDot, X } from "lucide-react";

import {
  BandBadge,
  EvidenceBadge,
  ReadinessMeter,
  RiskBadge,
  StageBadge,
} from "@/components/domain/Indicators";
import { ScoreExplainer } from "@/components/domain/ScoreExplainer";
import { Page, PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, Mono } from "@/components/ui/Primitives";
import { portfolio } from "@/data/portfolio";
import { deriveBlockers, deriveGaps } from "@/engine/blockers";
import { controlDebt, evaluateGate, nextGate } from "@/engine/gates";
import { DEFAULT_POLICY, stageIndex } from "@/engine/policy";
import { scoreInitiative } from "@/engine/readiness";
import { STAGES } from "@/engine/types";
import { cn } from "@/lib/cn";
import { formatCompactCurrency, formatDays, formatPercent } from "@/lib/format";

/**
 * Evidence passport.
 *
 * Every initiative has one, addressable at /initiatives/:id. The previous
 * build shipped a single hardcoded passport, which meant eleven of twelve rows
 * in the table led nowhere.
 */
export const InitiativePage = () => {
  const { id } = useParams<{ id: string }>();
  const initiative = portfolio.find((candidate) => candidate.id === id);

  if (!initiative) return <Navigate to="/portfolio" replace />;

  const readiness = scoreInitiative(initiative);
  const blockers = deriveBlockers(initiative);
  const gaps = deriveGaps(initiative);
  const debt = controlDebt(initiative);
  const gate = nextGate(initiative);
  const index = portfolio.indexOf(initiative);
  const previous = portfolio[index - 1];
  const next = portfolio[index + 1];

  const remediationDays = gaps.reduce(
    (total, gap) => total + gap.effortDays,
    0,
  );
  const currentStageIndex = stageIndex(initiative.stage);

  return (
    <Page>
      <Link
        to="/readiness"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Readiness board
      </Link>

      <PageHeader
        eyebrow="Evidence passport"
        title={initiative.name}
        lede={initiative.description}
      >
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StageBadge stage={initiative.stage} />
          <RiskBadge risk={initiative.riskTier} />
          <BandBadge band={readiness.band} />
          <Mono>{initiative.id}</Mono>
          <span className="text-2xs text-muted">
            {initiative.businessFunction}
          </span>
        </div>
      </PageHeader>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader
            title="Gate ladder"
            description="A control gated at a stage must be approved before the initiative may enter it."
          />
          <CardBody>
            <ol className="space-y-2">
              {STAGES.map((stage, stageIdx) => {
                const verdict = evaluateGate(initiative, stage);
                const isCurrent = stage === initiative.stage;
                const isPast = stageIdx <= currentStageIndex;
                const Icon = verdict.passed ? Check : isPast ? X : CircleDot;

                return (
                  <li
                    key={stage}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2.5",
                      isCurrent
                        ? "border-accent-border bg-accent-soft"
                        : "border-subtle bg-surface-sunken",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                        verdict.passed
                          ? "bg-ok text-white"
                          : isPast
                            ? "bg-risk text-white"
                            : "bg-surface text-muted ring-1 ring-subtle",
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-primary">
                        {stage}
                        {isCurrent ? (
                          <span className="ml-2 text-2xs font-semibold uppercase tracking-wider text-accent-text">
                            Current
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-xs text-muted">
                        {verdict.required.length === 0
                          ? "No controls required at this gate"
                          : verdict.passed
                            ? `All ${verdict.required.length} required controls approved`
                            : `${verdict.blocking.length} of ${verdict.required.length} required controls outstanding: ${verdict.blocking
                                .map((control) =>
                                  control.shortLabel.toLowerCase(),
                                )
                                .join(", ")}`}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>

            {debt.length > 0 ? (
              <p className="mt-4 rounded-lg border border-warn/30 bg-warn-soft p-3 text-xs leading-5 text-warn-text">
                <span className="font-semibold">Control debt.</span> This
                initiative is sitting in {initiative.stage}, a stage that
                required{" "}
                {debt.map((control) => control.label.toLowerCase()).join(", ")}.
                That evidence was never approved, so the stage field overstates
                where it really is.
              </p>
            ) : null}
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardBody className="space-y-4">
              <ReadinessMeter
                score={readiness.score}
                band={readiness.band}
                size="lg"
              />
              <dl className="space-y-2.5 border-t border-subtle pt-4 text-sm">
                <Row
                  label="Annual value"
                  value={formatCompactCurrency(initiative.annualValueUsd)}
                />
                <Row
                  label="Next gate"
                  value={gate?.targetStage ?? "None — already live"}
                />
                <Row label="Blocking now" value={`${blockers.length}`} />
                <Row
                  label="Outstanding to production"
                  value={`${gaps.length}`}
                />
                <Row
                  label="Remediation effort"
                  value={formatDays(remediationDays)}
                />
                <Row
                  label="In current stage"
                  value={formatDays(initiative.stageAgeDays)}
                />
                <Row
                  label="Data quality"
                  value={formatPercent(initiative.data.qualityScore)}
                />
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Accountability" />
            <CardBody>
              <dl className="space-y-2.5 text-sm">
                <Row label="Executive sponsor" value={initiative.sponsor} />
                <Row label="Product owner" value={initiative.productOwner} />
                <Row label="Control owner" value={initiative.controlOwner} />
                <Row label="Delivery team" value={initiative.deliveryTeam} />
                <Row label="Intended users" value={initiative.intendedUsers} />
              </dl>
            </CardBody>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader
          title="How this score was produced"
          description={`Weighted control credit under policy ${DEFAULT_POLICY.version}. Weights vary by risk tier; inapplicable controls are removed from the denominator.`}
        />
        <CardBody>
          <ScoreExplainer initiative={initiative} readiness={readiness} />
        </CardBody>
      </Card>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Control evidence"
            description="What exists today, and who owns it."
          />
          <CardBody>
            <ul className="space-y-3">
              {DEFAULT_POLICY.controls.map((control) => {
                const artifact = initiative.evidence[control.id];
                const state = readiness.notApplicable.includes(control.id)
                  ? "not_applicable"
                  : artifact.state;

                return (
                  <li
                    key={control.id}
                    className="border-b border-subtle pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-primary">
                        {control.label}
                      </span>
                      <EvidenceBadge state={state} />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {artifact.note}
                    </p>
                    {state !== "not_applicable" ? (
                      <p className="mt-1 text-2xs text-muted">
                        {artifact.owner} · last moved{" "}
                        {formatDays(artifact.ageDays)} ago · gated at{" "}
                        {control.gate}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Business case" />
            <CardBody>
              <dl className="space-y-2.5 text-sm">
                <Row label="Target KPI" value={initiative.kpi.metric} />
                <Row
                  label="Baseline"
                  value={
                    initiative.kpi.isBaselined
                      ? initiative.kpi.baseline
                      : `${initiative.kpi.baseline} — value claims are not yet provable`
                  }
                />
                <Row label="Target" value={initiative.kpi.target} />
              </dl>
              <div className="mt-4 border-t border-subtle pt-4">
                <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
                  Post-launch metrics
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {initiative.postLaunchMetrics.map((metric) => (
                    <li
                      key={metric}
                      className="rounded-md bg-surface-sunken px-2 py-1 text-xs text-secondary ring-1 ring-subtle"
                    >
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Data and model" />
            <CardBody>
              <dl className="space-y-2.5 text-sm">
                <Row label="Model type" value={initiative.model.type} />
                <Row
                  label="Classification"
                  value={initiative.data.classification}
                />
                <Row
                  label="Vendor dependency"
                  value={initiative.model.vendorDependency}
                />
                <Row
                  label="Takes action"
                  value={
                    initiative.model.isAgentic
                      ? "Yes — agentic controls apply"
                      : "No"
                  }
                />
                <Row
                  label="Injection controls"
                  value={initiative.model.injectionControls}
                />
              </dl>
              <div className="mt-4 border-t border-subtle pt-4">
                <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
                  Data sources
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {initiative.data.sources.map((source) => (
                    <li
                      key={source}
                      className="rounded-md bg-surface-sunken px-2 py-1 text-xs text-secondary ring-1 ring-subtle"
                    >
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-5">
        {previous ? (
          <Link
            to={`/initiatives/${previous.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {previous.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/initiatives/${next.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-primary"
          >
            {next.name}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </nav>
    </Page>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
    <dt className="text-muted">{label}</dt>
    <dd className="text-right font-medium text-primary">{value}</dd>
  </div>
);
