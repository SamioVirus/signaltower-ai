import { ArrowUpRight, CalendarClock } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { useCases } from "@/data/useCases";
import { formatCompactCurrency } from "@/lib/format";
import { getExecutiveDecisions } from "@/lib/metrics";

export const DecisionsPage = () => {
  const decisions = getExecutiveDecisions(useCases);

  return (
    <PageShell
      eyebrow="Executive Decision View"
      title="What should leadership unblock this week?"
      description="A concise decision surface for the weekly AI commercialization operating review."
    >
      <section className="grid gap-4">
        {decisions.map((decision, index) => (
          <article key={decision.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-executive">
            <div className="grid gap-5 xl:grid-cols-[70px_1fr_260px]">
              <div className="grid h-14 w-14 place-items-center rounded-md bg-indigoTailored-50 text-xl font-semibold text-indigoTailored-700">
                {index + 1}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{decision.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{decision.whyItMatters}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <DecisionField label="Risk note" value={decision.riskNote} />
                  <DecisionField label="Required decision" value={decision.requiredDecision} />
                  <DecisionField label="Owner" value={decision.owner} />
                  <DecisionField label="Expected impact" value={decision.expectedImpact} />
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Value at stake</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{formatCompactCurrency(decision.valueAtStake)}</div>
                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-indigoTailored-700">
                  <CalendarClock className="h-4 w-4" />
                  {decision.deadline}
                </div>
                <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Decision ready <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
};

const DecisionField = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 text-sm text-slate-800">{value}</div>
  </div>
);
