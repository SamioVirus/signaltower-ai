import { AlertTriangle, Banknote, Blocks, CheckCircle2, Clock3, FileCheck2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/ChartCard";
import { KpiCard } from "@/components/KpiCard";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { UseCaseTable } from "@/components/UseCaseTable";
import { useCases } from "@/data/useCases";
import { formatCompactCurrency, formatDays, formatPercent } from "@/lib/format";
import {
  getExecutiveDecisions,
  getPortfolioMetrics,
  getRiskDistribution,
  getStageDistribution,
  getTopBlockers,
  getValueTrappedByBlocker,
} from "@/lib/metrics";

const indigoScale = ["#312e81", "#4338ca", "#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];

const stageLabels: Record<string, string[]> = {
  Intake: ["Intake"],
  Prioritized: ["Prioritized"],
  Pilot: ["Pilot"],
  "Control Review": ["Control", "Review"],
  "Production Ready": ["Production", "Ready"],
  Production: ["Production"],
  Monitoring: ["Monitoring"],
};

interface StageTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}

const StageTick = ({ x = 0, y = 0, payload }: StageTickProps) => {
  const lines = stageLabels[payload?.value ?? ""] ?? [payload?.value ?? ""];

  return (
    <g transform={`translate(${x},${y + 8})`}>
      {lines.map((line, index) => (
        <text key={line} x={0} y={index * 13} textAnchor="middle" fill="#475569" fontSize={11} fontWeight={600}>
          {line}
        </text>
      ))}
    </g>
  );
};

export const OverviewPage = () => {
  const metrics = getPortfolioMetrics(useCases);
  const stageDistribution = getStageDistribution(useCases);
  const riskDistribution = getRiskDistribution(useCases);
  const blockers = getTopBlockers(useCases);
  const trappedValue = getValueTrappedByBlocker(useCases);
  const trappedValueByBlocker = new Map(trappedValue.map((item) => [item.name, item.value]));
  const totalActiveBlockers = blockers.reduce((total, blocker) => total + blocker.count, 0);
  const totalTrappedValue = trappedValue.reduce((total, item) => total + item.value, 0);
  const maxTrappedValue = Math.max(...trappedValue.map((item) => item.value), 1);
  const riskTotal = riskDistribution.reduce((total, item) => total + item.count, 0);
  const decisions = getExecutiveDecisions(useCases).slice(0, 3);

  return (
    <PageShell
      eyebrow="Executive Portfolio"
      title="AI commercialization portfolio"
      description="A boardroom view of demand, readiness, governance friction, and the leadership decisions that unlock production value."
      thesis="Which AI initiatives are ready, which are stuck, and what leadership should unblock next."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Total AI initiatives" value={`${metrics.totalUseCases}`} detail="Synthetic portfolio inventory" icon={<Blocks className="h-5 w-5" />} />
        <KpiCard label="Value at stake" value={formatCompactCurrency(metrics.totalValueAtStake)} detail="Computed annual opportunity" icon={<Banknote className="h-5 w-5" />} />
        <KpiCard label="Production-ready" value={`${metrics.productionReadyCount}`} detail="Ready, production, or monitoring" icon={<CheckCircle2 className="h-5 w-5" />} />
        <KpiCard label="Blocked initiatives" value={`${metrics.blockedCount}`} detail="Active blocker before production" icon={<AlertTriangle className="h-5 w-5" />} />
        <KpiCard label="Average stage aging" value={formatDays(metrics.averageStageAging)} detail="Across all initiatives" icon={<Clock3 className="h-5 w-5" />} />
        <KpiCard label="Evidence completeness" value={formatPercent(metrics.evidenceCompleteness)} detail="Average readiness evidence" icon={<FileCheck2 className="h-5 w-5" />} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-[1.35fr_0.8fr_0.85fr]">
        <ChartCard
          title="Portfolio Stage Funnel"
          description="Where AI demand sits in the governed path to production."
          className="xl:col-span-2 2xl:col-span-1"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageDistribution} margin={{ top: 8, right: 8, left: -24, bottom: 22 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" interval={0} height={48} tick={<StageTick />} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "#eef2ff" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#4f46e5" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Risk Tier Distribution" description="Risk profile across the AI portfolio.">
          <div className="grid items-center gap-3 md:grid-cols-[1fr_0.9fr] xl:grid-cols-1">
            <div className="relative h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={3}
                    isAnimationActive={false}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={indigoScale[index % indigoScale.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-2xl font-semibold tracking-tight text-slate-950">{riskTotal}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Use cases</div>
                </div>
              </div>
            </div>
            <div className="grid gap-2 text-sm">
              {riskDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: indigoScale[index] }} />
                    {item.name}
                  </span>
                  <span className="font-semibold text-slate-950">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Common Active Blockers" description="Repeated friction across the portfolio.">
          <div className="mb-4 rounded-md border border-indigoTailored-100 bg-indigoTailored-50 px-3 py-2 text-xs leading-5 text-indigoTailored-900">
            {totalActiveBlockers} active blockers are holding {formatCompactCurrency(totalTrappedValue)} in annual opportunity before production.
          </div>
          <div className="space-y-3.5">
            {blockers.map((blocker) => (
              <div key={blocker.name}>
                <div className="mb-1.5 flex items-start justify-between gap-3 text-sm">
                  <span>
                    <span className="block font-semibold text-slate-800">{blocker.name}</span>
                    <span className="block text-xs text-slate-500">{blocker.count} initiative{blocker.count === 1 ? "" : "s"}</span>
                  </span>
                  <span className="text-right text-xs font-semibold text-slate-600">
                    {formatCompactCurrency(trappedValueByBlocker.get(blocker.name) ?? 0)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-indigoTailored-600"
                    style={{ width: `${Math.max(12, ((trappedValueByBlocker.get(blocker.name) ?? 0) / maxTrappedValue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader title="Leadership Actions This Week" description="A focused operating review starts with the few decisions that can unlock the most governed value." />
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {decisions.map((decision) => (
            <div key={decision.title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-950">{decision.title}</div>
              <div className="mt-3 text-xs text-slate-500">{decision.requiredDecision}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Initiative Table" description="All headline values and status indicators are computed from the centralized synthetic data file." />
        <UseCaseTable useCases={useCases} />
      </section>
    </PageShell>
  );
};
