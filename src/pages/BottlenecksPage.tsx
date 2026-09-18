import { Link } from "react-router-dom";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";

import { ChartFrame } from "@/components/domain/chart";
import {
  tooltipFormatter,
  useChartPalette,
  useChartTooltip,
} from "@/lib/chart-theme";
import { Page, PageHeader } from "@/components/ui/PageHeader";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui/Primitives";
import { portfolio } from "@/data/portfolio";
import { blockerPatterns } from "@/engine/blockers";
import {
  AGING_BUCKETS,
  controlQueueLoad,
  stageAgingHeatmap,
} from "@/engine/portfolio";
import { cn } from "@/lib/cn";
import { formatCompactCurrency, formatCount, formatDays } from "@/lib/format";

const heatTone = (count: number, max: number): string => {
  if (count === 0) return "border-subtle bg-surface-sunken text-muted";
  const intensity = count / Math.max(max, 1);
  if (intensity > 0.66)
    return "border-transparent bg-[var(--ordinal-4)] text-white";
  if (intensity > 0.33)
    return "border-transparent bg-[var(--ordinal-3)] text-white";
  return "border-transparent bg-[var(--ordinal-1)] text-slate-900";
};

export const BottlenecksPage = () => {
  const palette = useChartPalette();
  const chartTooltip = useChartTooltip();
  const patterns = blockerPatterns(portfolio);
  const queue = controlQueueLoad(portfolio);
  const heatmap = stageAgingHeatmap(portfolio);
  const maxCell = Math.max(
    ...heatmap.flatMap((row) => row.cells.map((cell) => cell.count)),
    1,
  );
  const totalTrapped = patterns.reduce(
    (total, pattern) => total + pattern.valueTrappedUsd,
    0,
  );
  const systemic = patterns.filter((pattern) => pattern.isSystemic);

  const chartData = patterns.slice(0, 8).map((pattern) => ({
    name: pattern.control.shortLabel,
    valueUsd: pattern.valueTrappedUsd,
    count: pattern.count,
  }));

  return (
    <Page>
      <PageHeader
        eyebrow="Bottleneck drilldown"
        title="Where governed value is trapped"
        lede="Repeated friction only becomes fixable once you can see which control is causing it, how much value sits behind that control, and which team is carrying the queue."
      />

      {systemic.length > 0 ? (
        <Card className="border-accent-border bg-accent-soft">
          <CardBody>
            <p className="text-sm font-semibold text-accent-text">
              {formatCount(systemic.length, "systemic bottleneck")} detected
            </p>
            <p className="mt-1.5 max-w-4xl text-sm leading-6 text-accent-text">
              A control counts as systemic once it is blocking three or more
              initiatives at their next gate simultaneously. That is the signal
              to build the control pattern once —{" "}
              {systemic
                .map(
                  (pattern) =>
                    `${pattern.control.label.toLowerCase()} (${pattern.blockingNowCount} blocked now, ${formatCompactCurrency(pattern.valueTrappedUsd)} behind it)`,
                )
                .join("; ")}
              .
            </p>
          </CardBody>
        </Card>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Value behind each control"
            description="Annual value of every initiative still needing this control before production."
          />
          <CardBody>
            <ChartFrame height={300}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(value: number) =>
                    formatCompactCurrency(value)
                  }
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: palette.axis }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={104}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: palette.axis }}
                />
                <Tooltip
                  {...chartTooltip}
                  formatter={tooltipFormatter<{ count: number }>(
                    (value, payload) => [
                      `${formatCompactCurrency(value)} across ${formatCount(payload?.count ?? 0, "initiative")}`,
                      "Value behind control",
                    ],
                  )}
                />
                <Bar
                  dataKey="valueUsd"
                  radius={[0, 5, 5, 0]}
                  fill={palette.series[0]}
                  maxBarSize={22}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartFrame>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Control patterns"
            description={`${formatCompactCurrency(totalTrapped)} of annual value is waiting on control evidence somewhere in the portfolio.`}
          />
          <CardBody>
            <ul className="space-y-3">
              {patterns.slice(0, 8).map((pattern) => (
                <li
                  key={pattern.controlId}
                  className="border-b border-subtle pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">
                        {pattern.control.label}
                      </span>
                      {pattern.isSystemic ? (
                        <Badge className="bg-warn-soft text-warn-text ring-1 ring-warn/25">
                          Systemic
                        </Badge>
                      ) : null}
                    </span>
                    <span
                      data-metric
                      className="text-sm font-semibold text-primary"
                    >
                      {formatCompactCurrency(pattern.valueTrappedUsd)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Outstanding on {formatCount(pattern.count, "initiative")},
                    blocking {pattern.blockingNowCount} right now ·{" "}
                    {pattern.totalEffortDays} days of control effort · owned by{" "}
                    {pattern.control.remediation.owningFunction}
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title="Stage ageing"
            description="Rows are stages, columns are how long initiatives have been sitting there."
          />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <caption className="sr-only">
                  Count of initiatives by stage and time in stage
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-2 pr-3 text-2xs font-semibold uppercase tracking-wider text-muted"
                    >
                      Stage
                    </th>
                    {AGING_BUCKETS.map((bucket) => (
                      <th
                        key={bucket}
                        scope="col"
                        className="px-2 py-2 text-center text-2xs font-semibold uppercase tracking-wider text-muted"
                      >
                        {bucket} days
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.map((row) => (
                    <tr key={row.stage}>
                      <th
                        scope="row"
                        className="py-1.5 pr-3 text-sm font-medium text-secondary"
                      >
                        {row.stage}
                      </th>
                      {row.cells.map((cell) => (
                        <td key={cell.bucket} className="px-1 py-1.5">
                          <span
                            data-metric
                            title={
                              cell.count > 0
                                ? cell.initiativeIds.join(", ")
                                : "No initiatives in this cell"
                            }
                            className={cn(
                              "block rounded-lg border py-2.5 text-center text-sm font-semibold",
                              heatTone(cell.count, maxCell),
                            )}
                          >
                            {cell.count}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Control queue load"
            description="Which review function is actually the constraint."
          />
          <CardBody>
            <ul className="space-y-3">
              {queue.map((entry) => (
                <li
                  key={entry.owningFunction}
                  className="rounded-lg border border-subtle bg-surface-sunken p-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-primary">
                      {entry.owningFunction}
                    </span>
                    <span
                      data-metric
                      className="text-lg font-semibold text-primary"
                    >
                      {entry.totalEffortDays}
                      <span className="ml-1 text-2xs font-normal text-muted">
                        days queued
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {formatCount(entry.openItems, "open item")} · average age{" "}
                    {formatDays(entry.averageAgeDays)} ·{" "}
                    {formatCompactCurrency(entry.valueTrappedUsd)} behind this
                    team
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-3xl text-sm leading-6 text-secondary">
            Bottlenecks are a sequencing problem before they are a capacity
            problem. The decision queue ranks the same evidence by what each
            unit of control effort would actually buy.
          </p>
          <Link
            to="/decisions"
            className="shrink-0 rounded-lg bg-accent-solid px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-solid-hover"
          >
            See the ranked decisions
          </Link>
        </CardBody>
      </Card>
    </Page>
  );
};
