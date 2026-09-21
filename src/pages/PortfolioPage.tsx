import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Stat, StatStrip } from "@/components/domain/Indicators";
import { InitiativeTable } from "@/components/domain/InitiativeTable";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  SectionTitle,
} from "@/components/ui/Primitives";
import { Page, PageHeader } from "@/components/ui/PageHeader";
import { portfolio } from "@/data/portfolio";
import { blockerPatterns } from "@/engine/blockers";
import { rankDecisions } from "@/engine/decisions";
import {
  portfolioMetrics,
  riskDistribution,
  stageDistribution,
} from "@/engine/portfolio";
import { ChartFrame } from "@/components/domain/chart";
import {
  tooltipFormatter,
  useChartPalette,
  useChartTooltip,
} from "@/lib/chart-theme";
import { downloadFile, toCsv, toExportRows, toJson } from "@/lib/export";
import { STAGE_SHORT } from "@/lib/evidence-display";
import {
  formatCompactCurrency,
  formatCount,
  formatDays,
  formatPercent,
} from "@/lib/format";

export const PortfolioPage = () => {
  const palette = useChartPalette();
  const chartTooltip = useChartTooltip();
  const metrics = portfolioMetrics(portfolio);
  const stages = stageDistribution(portfolio);
  const risks = riskDistribution(portfolio);
  const patterns = blockerPatterns(portfolio);
  const decisions = rankDecisions(portfolio).slice(0, 3);
  const worstPattern = patterns[0];

  return (
    <Page>
      <PageHeader
        eyebrow="Executive portfolio"
        title="AI commercialisation portfolio"
        lede="Demand, readiness, governance friction and the decisions that convert pilots into governed production value. Every figure is derived from control evidence, not entered as a status."
        action={
          <div className="flex gap-2">
            <Button
              onClick={() =>
                downloadFile(
                  "signaltower-portfolio.csv",
                  toCsv(toExportRows(portfolio)),
                  "text/csv",
                )
              }
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              CSV
            </Button>
            <Button
              onClick={() =>
                downloadFile(
                  "signaltower-portfolio.json",
                  toJson(portfolio),
                  "application/json",
                )
              }
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              JSON
            </Button>
          </div>
        }
      />

      <StatStrip>
        <Stat
          label="Initiatives"
          value={`${metrics.totalInitiatives}`}
          detail="Intake through monitoring"
        />
        <Stat
          label="Value at stake"
          value={formatCompactCurrency(metrics.totalValueUsd)}
          detail="Annual, as estimated by sponsors"
        />
        <Stat
          label="Production ready"
          value={`${metrics.productionReadyCount}`}
          detail={`${metrics.liveCount} already live`}
          tone="ok"
        />
        <Stat
          label="Blocked now"
          value={`${metrics.blockedCount}`}
          detail={`${formatCompactCurrency(metrics.blockedValueUsd)} behind the next gate`}
          tone="risk"
        />
        <Stat
          label="Control debt"
          value={`${metrics.controlDebtCount}`}
          detail="In a stage they never qualified for"
          tone="warn"
        />
        <Stat
          label="Average stage age"
          value={formatDays(metrics.averageStageAgeDays)}
          detail="Time sitting in the current stage"
        />
      </StatStrip>

      {/* The one sentence a leader should leave with. */}
      {worstPattern ? (
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-panel border-l-2 border-accent bg-accent-soft px-5 py-4">
          <p className="max-w-measure text-label leading-6 text-accent-text">
            <span className="font-semibold">
              Readiness is {formatPercent(metrics.averageReadiness)} on average,
              but {formatPercent(metrics.valueWeightedReadiness)} once weighted
              by value.
            </span>{" "}
            The larger bets are the less ready ones. The single widest gap is{" "}
            <span className="font-semibold">
              {worstPattern.control.label.toLowerCase()}
            </span>
            , outstanding on {formatCount(worstPattern.count, "initiative")} and
            blocking {worstPattern.blockingNowCount} of them right now.
          </p>
          <Link
            to="/bottlenecks"
            className="shrink-0 rounded-lg bg-accent-solid px-3.5 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-solid-hover"
          >
            See where value is trapped
          </Link>
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Stage funnel"
            description="Where AI demand sits on the governed path to production."
          />
          <CardBody>
            <ChartFrame height={260}>
              <BarChart
                data={stages}
                margin={{ top: 4, right: 8, left: -18, bottom: 4 }}
              >
                <XAxis
                  dataKey="name"
                  tickFormatter={(value: string) =>
                    STAGE_SHORT[value as keyof typeof STAGE_SHORT]
                  }
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: palette.axis }}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: palette.axis }}
                />
                <Tooltip
                  {...chartTooltip}
                  formatter={tooltipFormatter<{ valueUsd: number }>(
                    (value, payload) => [
                      `${value} · ${formatCompactCurrency(payload?.valueUsd ?? 0)}`,
                      "Initiatives",
                    ],
                  )}
                />
                <Bar
                  dataKey="count"
                  radius={[5, 5, 0, 0]}
                  fill={palette.series[0]}
                  maxBarSize={56}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartFrame>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Risk mix"
            description="Tier drives how heavily controls are weighted."
          />
          <CardBody>
            <div className="relative">
              <ChartFrame height={170}>
                <PieChart>
                  <Pie
                    data={risks}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={2}
                    stroke={palette.surface}
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {risks.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={palette.ordinal[index % palette.ordinal.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                </PieChart>
              </ChartFrame>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p
                    data-metric
                    className="text-2xl font-semibold text-primary"
                  >
                    {metrics.totalInitiatives}
                  </p>
                  <p className="text-2xs uppercase tracking-wider text-muted">
                    Initiatives
                  </p>
                </div>
              </div>
            </div>

            <ul className="mt-4 space-y-1.5">
              {risks.map((entry, index) => (
                <li
                  key={entry.name}
                  className="flex items-center justify-between gap-3 text-sm text-secondary"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          palette.ordinal[index % palette.ordinal.length],
                      }}
                      aria-hidden="true"
                    />
                    {entry.name}
                  </span>
                  <span data-metric className="font-medium text-primary">
                    {entry.count} · {formatCompactCurrency(entry.valueUsd)}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      <section>
        <SectionTitle
          title="Top decisions this week"
          description="Ranked by value unlocked, confidence, urgency and leverage, divided by the effort it takes."
          action={
            <Link
              to="/decisions"
              className="text-sm font-semibold text-accent hover:underline"
            >
              All {rankDecisions(portfolio).length} decisions →
            </Link>
          }
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {decisions.map((decision, index) => (
            <Card key={decision.id} as="article" className="flex flex-col">
              <CardBody className="flex flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-soft text-2xs font-bold text-accent-text">
                    {index + 1}
                  </span>
                  <span className="text-2xs font-semibold uppercase tracking-wider text-muted">
                    {decision.kind === "systemic" ? "Systemic" : "Initiative"} ·{" "}
                    {decision.horizon}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold leading-6 text-primary">
                  {decision.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                  {decision.rationale}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-subtle pt-3">
                  <div>
                    <dt className="text-2xs uppercase tracking-wider text-muted">
                      Value
                    </dt>
                    <dd
                      data-metric
                      className="text-sm font-semibold text-primary"
                    >
                      {formatCompactCurrency(decision.valueUnlockedUsd)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-wider text-muted">
                      Effort
                    </dt>
                    <dd
                      data-metric
                      className="text-sm font-semibold text-primary"
                    >
                      {formatDays(decision.effortDays)}
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          title="All initiatives"
          description="Sort by any column. Readiness, blockers and control debt are computed per row."
        />
        <InitiativeTable portfolio={portfolio} />
      </section>
    </Page>
  );
};
