import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartFrame, ChartLegend } from "@/components/domain/chart";
import {
  tooltipFormatter,
  tooltipLabel,
  useChartPalette,
  useChartTooltip,
} from "@/lib/chart-theme";
import { EvidenceBadge } from "@/components/domain/Indicators";
import { Page, PageHeader } from "@/components/ui/PageHeader";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Mono,
} from "@/components/ui/Primitives";
import { portfolio } from "@/data/portfolio";
import { deriveGaps } from "@/engine/blockers";
import { rankDecisions } from "@/engine/decisions";
import { compareStrategies } from "@/engine/forecast";
import { portfolioMetrics } from "@/engine/portfolio";
import { scoreInitiative } from "@/engine/readiness";
import {
  applyScenario,
  emptyScenario,
  hasAction,
  scenarioEffortDays,
  toggleAction,
} from "@/engine/scenario";
import type { Scenario } from "@/engine/scenario";
import { cn } from "@/lib/cn";
import {
  formatCompactCurrency,
  formatCount,
  formatDays,
  formatPercent,
} from "@/lib/format";

/**
 * Scenario simulator.
 *
 * Tick the remediations a leader is considering funding; the entire portfolio
 * re-derives through the same engine that produced the current-state numbers.
 * No separate model, no second set of assumptions to fall out of step.
 */
export const SimulatorPage = () => {
  const [scenario, setScenario] = useState<Scenario>(emptyScenario);
  const palette = useChartPalette();
  const chartTooltip = useChartTooltip();

  const current = useMemo(() => portfolioMetrics(portfolio), []);
  const simulated = useMemo(
    () => portfolioMetrics(applyScenario(portfolio, scenario)),
    [scenario],
  );
  const simulatedPortfolio = useMemo(
    () => applyScenario(portfolio, scenario),
    [scenario],
  );
  const effortDays = scenarioEffortDays(portfolio, scenario);

  const forecast = useMemo(
    () => compareStrategies(simulatedPortfolio),
    [simulatedPortfolio],
  );
  const chartData = useMemo(
    () =>
      forecast.valueRanked.map((week, index) => ({
        week: week.week,
        ranked: week.valueUnlockedUsd,
        fifo: forecast.fifo[index]?.valueUnlockedUsd ?? 0,
      })),
    [forecast],
  );

  /** Pre-load the scenario with everything the decision queue recommends. */
  const applyTopDecisions = () => {
    const actions = rankDecisions(portfolio)
      .slice(0, 3)
      .flatMap((decision) =>
        decision.initiativeIds.flatMap((initiativeId) =>
          decision.controlIds.map((controlId) => ({ initiativeId, controlId })),
        ),
      )
      // Only propose remediations that are genuinely outstanding.
      .filter(
        (action) =>
          portfolio.find((initiative) => initiative.id === action.initiativeId)
            ?.evidence[action.controlId] !== undefined &&
          portfolio.find((initiative) => initiative.id === action.initiativeId)
            ?.evidence[action.controlId].state !== "approved",
      );

    setScenario({ actions });
  };

  const deltas = [
    {
      label: "Production ready",
      before: `${current.productionReadyCount}`,
      after: `${simulated.productionReadyCount}`,
      changed: simulated.productionReadyCount !== current.productionReadyCount,
    },
    {
      label: "Average readiness",
      before: formatPercent(current.averageReadiness),
      after: formatPercent(simulated.averageReadiness),
      changed:
        Math.round(simulated.averageReadiness) !==
        Math.round(current.averageReadiness),
    },
    {
      label: "Effort remaining",
      before: formatDays(current.outstandingEffortDays),
      after: formatDays(simulated.outstandingEffortDays),
      changed:
        simulated.outstandingEffortDays !== current.outstandingEffortDays,
    },
    {
      label: "Value not yet ready",
      before: formatCompactCurrency(current.valueNotReadyUsd),
      after: formatCompactCurrency(simulated.valueNotReadyUsd),
      changed: simulated.valueNotReadyUsd !== current.valueNotReadyUsd,
    },
    {
      label: "Control debt",
      before: `${current.controlDebtCount}`,
      after: `${simulated.controlDebtCount}`,
      changed: simulated.controlDebtCount !== current.controlDebtCount,
    },
  ];

  return (
    <Page>
      <PageHeader
        eyebrow="Scenario simulator"
        title="What would that decision actually buy?"
        lede="Approve remediations below and the whole portfolio re-derives: readiness, gate verdicts, blockers, stage promotions and the conversion forecast. Nothing here is a separate model — it is the same engine, run against modified evidence."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={applyTopDecisions}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Apply top 3 decisions
            </Button>
            <Button
              onClick={() => setScenario(emptyScenario())}
              disabled={scenario.actions.length === 0}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </Button>
          </div>
        }
      />

      <Card
        className={cn(scenario.actions.length > 0 && "border-accent-border")}
      >
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">
                {scenario.actions.length === 0
                  ? "No remediations selected"
                  : `${formatCount(scenario.actions.length, "remediation")} selected`}
              </p>
              <p className="mt-1 text-sm text-muted">
                {scenario.actions.length === 0
                  ? "Pick control evidence to approve, or load the decision queue's top three."
                  : `Committing ${formatDays(effortDays)} of control-team effort.`}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {deltas.map((delta) => (
              <div
                key={delta.label}
                className={cn(
                  "rounded-lg border p-3 transition",
                  delta.changed
                    ? "border-accent-border bg-accent-soft"
                    : "border-subtle bg-surface-sunken",
                )}
              >
                <dt className="text-2xs font-semibold uppercase tracking-wider text-muted">
                  {delta.label}
                </dt>
                <dd className="mt-1.5 flex items-center gap-2">
                  <span
                    data-metric
                    className="text-sm text-muted line-through decoration-1"
                  >
                    {delta.before}
                  </span>
                  <ArrowRight
                    className="h-3 w-3 shrink-0 text-muted"
                    aria-hidden="true"
                  />
                  <span
                    data-metric
                    className={cn(
                      "text-lg font-semibold",
                      delta.changed ? "text-accent-text" : "text-primary",
                    )}
                  >
                    {delta.after}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Conversion forecast under this scenario"
          description="Annualised value reaching production readiness, week by week, under two ways of ordering the same finite control capacity."
        />
        <CardBody>
          <ChartFrame height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                stroke={palette.grid}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: palette.axis }}
                label={{
                  value: "Weeks from now",
                  position: "insideBottom",
                  offset: -2,
                  style: { fontSize: 11, fill: palette.axis },
                }}
              />
              <YAxis
                tickFormatter={(value: number) => formatCompactCurrency(value)}
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fontSize: 11, fill: palette.axis }}
              />
              <Tooltip
                {...chartTooltip}
                cursor={{ stroke: palette.border, strokeWidth: 1 }}
                labelFormatter={tooltipLabel((week) => `Week ${week}`)}
                formatter={tooltipFormatter((value, _payload, seriesKey) => [
                  formatCompactCurrency(value),
                  seriesKey === "ranked"
                    ? "Value-ranked queue"
                    : "Oldest-first queue",
                ])}
              />
              <Line
                type="stepAfter"
                dataKey="ranked"
                stroke={palette.series[0]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: palette.surface }}
              />
              <Line
                type="stepAfter"
                dataKey="fifo"
                stroke={palette.series[1]}
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: palette.surface }}
              />
            </LineChart>
          </ChartFrame>

          <ChartLegend
            items={[
              { label: "Value-ranked queue", color: palette.series[0] },
              { label: "Oldest-first queue", color: palette.series[1] },
            ]}
          />

          <p className="mt-4 rounded-lg border border-subtle bg-surface-sunken p-3 text-xs leading-5 text-muted">
            On this scenario the ranked queue reaches the same value roughly{" "}
            <span className="font-semibold text-secondary">
              {forecast.weeksSooner.toFixed(1)} weeks sooner
            </span>
            , worth about{" "}
            <span className="font-semibold text-secondary">
              {formatCompactCurrency(forecast.earlierRealisationUsd)}
            </span>{" "}
            of earlier realisation. Both queues spend identical capacity; only
            the order differs. The model&rsquo;s assumptions are listed on the
            Methodology page.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Outstanding control evidence"
          description="Tick a control to model it being approved. Grouped by initiative, least ready first."
        />
        <CardBody className="space-y-5">
          {[...portfolio]
            .map((initiative) => ({ initiative, gaps: deriveGaps(initiative) }))
            .filter((row) => row.gaps.length > 0)
            .sort(
              (a, b) =>
                scoreInitiative(a.initiative).score -
                scoreInitiative(b.initiative).score,
            )
            .map(({ initiative, gaps }) => {
              const before = scoreInitiative(initiative).score;
              const after = scoreInitiative(
                simulatedPortfolio.find(
                  (candidate) => candidate.id === initiative.id,
                ) ?? initiative,
              ).score;

              return (
                <div key={initiative.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-primary">
                      {initiative.name} <Mono>{initiative.id}</Mono>
                    </p>
                    <p data-metric className="text-sm text-muted">
                      {formatPercent(before)}
                      {after !== before ? (
                        <>
                          {" → "}
                          <span className="font-semibold text-accent-text">
                            {formatPercent(after)}
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>

                  <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {gaps.map((gap) => {
                      const action = {
                        initiativeId: initiative.id,
                        controlId: gap.controlId,
                      };
                      const selected = hasAction(scenario, action);
                      const inputId = `remediate-${initiative.id}-${gap.controlId}`;

                      return (
                        <li key={gap.controlId}>
                          <label
                            htmlFor={inputId}
                            className={cn(
                              "flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition",
                              selected
                                ? "border-accent-border bg-accent-soft"
                                : "border-subtle bg-surface-sunken hover:border-strong",
                            )}
                          >
                            <input
                              id={inputId}
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                setScenario((current) =>
                                  toggleAction(current, action),
                                )
                              }
                              aria-label={`Approve ${gap.control.label} for ${initiative.name}`}
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-strong accent-[rgb(var(--accent))]"
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-primary">
                                {gap.control.label}
                              </span>
                              <span className="mt-1 flex flex-wrap items-center gap-1.5">
                                <EvidenceBadge
                                  state={
                                    initiative.evidence[gap.controlId]?.state ??
                                    "missing"
                                  }
                                />
                                <span className="text-2xs text-muted">
                                  {gap.effortDays}d
                                  {gap.blocksNextGate
                                    ? " · blocking now"
                                    : " · later gate"}
                                </span>
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
        </CardBody>
      </Card>
    </Page>
  );
};
