import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FilterX } from "lucide-react";

import { ControlMatrix } from "@/components/domain/ControlMatrix";
import {
  BandBadge,
  EvidenceBadge,
  ReadinessMeter,
  RiskBadge,
  StageBadge,
} from "@/components/domain/Indicators";
import { Page, PageHeader } from "@/components/ui/PageHeader";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Mono,
  SectionTitle,
  Select,
} from "@/components/ui/Primitives";
import { portfolio } from "@/data/portfolio";
import { deriveBlockers, deriveGaps } from "@/engine/blockers";
import { controlDebt } from "@/engine/gates";
import { DEFAULT_POLICY } from "@/engine/policy";
import { scoreInitiative } from "@/engine/readiness";
import { RISK_TIERS, STAGES } from "@/engine/types";
import type { RiskTier, Stage } from "@/engine/types";
import { useClearUrlState, useUrlState } from "@/hooks/useUrlState";
import { formatCompactCurrency, formatCount, formatDays } from "@/lib/format";

const ALL = "All";
const BANDS = [
  ALL,
  "Not ready",
  "Needs remediation",
  "Reviewable",
  "Production candidate",
  "Production ready",
] as const;

const FILTER_KEYS = ["stage", "risk", "band", "control"];

export const ReadinessPage = () => {
  const controlOptions = useMemo(
    () =>
      [
        ALL,
        ...DEFAULT_POLICY.controls.map((control) => control.label),
      ] as const,
    [],
  );

  const [stage, setStage] = useUrlState<Stage | typeof ALL>("stage", ALL, [
    ALL,
    ...STAGES,
  ]);
  const [risk, setRisk] = useUrlState<RiskTier | typeof ALL>("risk", ALL, [
    ALL,
    ...RISK_TIERS,
  ]);
  const [band, setBand] = useUrlState<(typeof BANDS)[number]>(
    "band",
    ALL,
    BANDS,
  );
  const [control, setControl] = useUrlState<string>(
    "control",
    ALL,
    controlOptions,
  );
  const clearFilters = useClearUrlState(FILTER_KEYS);

  const rows = useMemo(
    () =>
      portfolio
        .map((initiative) => ({
          initiative,
          readiness: scoreInitiative(initiative),
          blockers: deriveBlockers(initiative),
          gaps: deriveGaps(initiative),
          debt: controlDebt(initiative),
        }))
        .filter((row) => {
          if (stage !== ALL && row.initiative.stage !== stage) return false;
          if (risk !== ALL && row.initiative.riskTier !== risk) return false;
          if (band !== ALL && row.readiness.band !== band) return false;
          if (
            control !== ALL &&
            !row.gaps.some((gap) => gap.control.label === control)
          )
            return false;
          return true;
        })
        .sort((a, b) => a.readiness.score - b.readiness.score),
    [band, control, risk, stage],
  );

  const isFiltered =
    stage !== ALL || risk !== ALL || band !== ALL || control !== ALL;

  return (
    <Page>
      <PageHeader
        eyebrow="Production readiness"
        title="What is the evidence, and what is missing?"
        lede="Readiness is a weighted percentage of the control evidence each initiative actually needs. Filters are held in the URL, so any view here is a link you can send to the person who owns the gap."
      />

      <Card>
        <CardHeader
          title="Portfolio control matrix"
          description="Twelve controls across every initiative. Vertical stripes are the systemic gaps — the ones worth solving once."
        />
        <CardBody>
          <ControlMatrix portfolio={portfolio} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Filters"
          action={
            isFiltered ? (
              <Button size="sm" onClick={clearFilters}>
                <FilterX className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </Button>
            ) : undefined
          }
        />
        <CardBody className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Select
            label="Stage"
            value={stage}
            options={[ALL, ...STAGES]}
            onValueChange={setStage}
          />
          <Select
            label="Risk tier"
            value={risk}
            options={[ALL, ...RISK_TIERS]}
            onValueChange={setRisk}
          />
          <Select
            label="Readiness band"
            value={band}
            options={BANDS}
            onValueChange={setBand}
          />
          <Select
            label="Outstanding control"
            value={control}
            options={controlOptions}
            onValueChange={setControl}
          />
        </CardBody>
      </Card>

      <section>
        <SectionTitle
          title={`${formatCount(rows.length, "initiative")}, least ready first`}
          description="Each card shows what the next gate is waiting for and what this stage should already have had."
        />

        {rows.length === 0 ? (
          <EmptyState
            title="No initiative matches these filters"
            description="Nothing in the portfolio has that combination of stage, risk, readiness band and outstanding control."
            action={<Button onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <div className="grid gap-4">
            {rows.map(({ initiative, readiness, blockers, debt }) => (
              <Card key={initiative.id} as="article">
                <CardBody className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StageBadge stage={initiative.stage} />
                      <RiskBadge risk={initiative.riskTier} />
                      <BandBadge band={readiness.band} />
                      <Mono>{initiative.id}</Mono>
                    </div>

                    <h3 className="mt-3 text-base font-semibold tracking-tight text-primary">
                      <Link
                        to={`/initiatives/${initiative.id}`}
                        className="hover:text-accent hover:underline"
                      >
                        {initiative.name}
                      </Link>
                    </h3>
                    <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
                      {initiative.description}
                    </p>

                    <div className="mt-4">
                      <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
                        Blocking the next gate
                      </p>
                      {blockers.length === 0 ? (
                        <p className="mt-2 text-sm text-ok-text">
                          Clear to advance. No outstanding control at this gate.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-1.5">
                          {blockers.slice(0, 4).map((blocker) => (
                            <li
                              key={blocker.controlId}
                              className="flex flex-wrap items-center gap-2 text-sm"
                            >
                              <EvidenceBadge
                                state={
                                  initiative.evidence[blocker.controlId]
                                    ?.state ?? "missing"
                                }
                              />
                              <span className="font-medium text-primary">
                                {blocker.control.label}
                              </span>
                              <span className="text-muted">
                                · {blocker.owner} ·{" "}
                                {formatDays(blocker.ageDays)} old
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {debt.length > 0 ? (
                      <p className="mt-4 rounded-lg border border-warn/30 bg-warn-soft px-3 py-2 text-xs leading-5 text-warn-text">
                        <span className="font-semibold">Control debt:</span>{" "}
                        entering {initiative.stage} required{" "}
                        {debt
                          .map((item) => item.label.toLowerCase())
                          .join(", ")}
                        , which was never approved.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-4 rounded-lg border border-subtle bg-surface-sunken p-4">
                    <ReadinessMeter
                      score={readiness.score}
                      band={readiness.band}
                      size="lg"
                    />
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted">Annual value</dt>
                        <dd data-metric className="font-semibold text-primary">
                          {formatCompactCurrency(initiative.annualValueUsd)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted">In stage</dt>
                        <dd data-metric className="font-semibold text-primary">
                          {formatDays(initiative.stageAgeDays)}
                        </dd>
                      </div>
                    </dl>
                    <Link
                      to={`/initiatives/${initiative.id}`}
                      className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-strong bg-surface px-3 py-2 text-sm font-semibold text-primary transition hover:bg-surface-sunken"
                    >
                      Evidence passport
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
};
