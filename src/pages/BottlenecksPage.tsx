import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/ChartCard";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { useCases } from "@/data/useCases";
import { cn } from "@/lib/cn";
import { formatCompactCurrency, formatDays } from "@/lib/format";
import { agingBuckets, getControlQueueLoad, getStageAgingHeatmap, getTopBlockers, getValueTrappedByBlocker } from "@/lib/metrics";

const heatClass = (count: number) =>
  cn(
    "rounded-md border px-3 py-4 text-center text-sm font-semibold transition",
    count === 0 && "border-slate-200 bg-slate-50 text-slate-300",
    count === 1 && "border-indigoTailored-100 bg-indigoTailored-50 text-indigoTailored-700",
    count === 2 && "border-indigoTailored-200 bg-indigoTailored-100 text-indigoTailored-800",
    count >= 3 && "border-indigoTailored-300 bg-indigoTailored-200 text-indigoTailored-900",
  );

export const BottlenecksPage = () => {
  const blockers = getTopBlockers(useCases);
  const valueByBlocker = getValueTrappedByBlocker(useCases);
  const heatmap = getStageAgingHeatmap(useCases);
  const queueLoad = getControlQueueLoad(useCases);
  const totalTrappedValue = valueByBlocker.reduce((total, item) => total + item.value, 0);

  return (
    <PageShell
      eyebrow="Bottleneck Drilldown"
      title="Where governed AI value gets trapped"
      description="Leadership can reduce repeated friction only when blockers, aging, control load, and trapped value are visible across the portfolio."
    >
      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Blocker Categories" description="Active blocker pattern across non-production initiatives.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockers} layout="vertical" margin={{ top: 8, right: 18, left: 22, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={132}
                  tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Value Trapped By Blocker" description="Annual opportunity currently held behind active blockers.">
          <div className="space-y-4">
            {valueByBlocker.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="text-slate-500">{formatCompactCurrency(item.value)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigoTailored-600" style={{ width: `${Math.max(12, (item.value / 4_200_000) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader title="Stage-Aging Heatmap" description="Rows are stages; columns are aging buckets; cells show use-case count." />
          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[170px_repeat(4,1fr)] gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div>Stage</div>
                {agingBuckets.map((bucket) => <div key={bucket} className="text-center">{bucket} days</div>)}
              </div>
              <div className="mt-2 space-y-2">
                {heatmap.map((row) => (
                  <div key={row.stage} className="grid grid-cols-[170px_repeat(4,1fr)] items-center gap-2">
                    <div className="text-sm font-semibold text-slate-700">{row.stage}</div>
                    {row.buckets.map((cell) => <div key={cell.bucket} className={heatClass(cell.count)}>{cell.count}</div>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader title="Control Queue Load" description="Open review work by control team." />
          <div className="mt-5 space-y-4">
            {queueLoad.map((item) => (
              <div key={item.name} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="text-2xl font-semibold text-indigoTailored-700">{item.count}</div>
                </div>
                <div className="mt-2 text-xs text-slate-500">Average queue age: {formatDays(item.avgAge)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader title="Recommended Systemic Fixes" description="The operating-model response to repeated bottlenecks." />
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            `${formatCompactCurrency(totalTrappedValue)} value trapped behind active control blockers`,
            "Create reusable human-in-the-loop template for internal copilots",
            "Stand up a lineage remediation sprint for priority data fields",
            "Define agentic approval gates before expanding autonomous workflows",
          ].map((item) => (
            <div key={item} className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800">{item}</div>
          ))}
        </div>
      </section>
    </PageShell>
  );
};
