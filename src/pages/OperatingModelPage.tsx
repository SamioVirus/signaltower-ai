import { CalendarDays } from "lucide-react";

import { PageShell } from "@/components/PageShell";

const phases = [
  {
    period: "Days 1-30",
    title: "Inventory and signal capture",
    summary: "Create a trusted view of active AI demand, ownership, value, data, and current review paths.",
    items: [
      "Map active AI initiatives",
      "Identify business sponsors",
      "Define use-case taxonomy",
      "Capture risk tiers and data sources",
      "Establish baseline metrics",
      "Create initial executive portfolio view",
    ],
  },
  {
    period: "Days 31-60",
    title: "Governance and acceleration templates",
    summary: "Turn repeated review work into reusable evidence patterns and risk-tiered paths.",
    items: [
      "Define AI Evidence Passport",
      "Create risk-tiered review paths",
      "Build templates for low and moderate-risk use cases",
      "Align data readiness requirements",
      "Select three production candidates",
      "Launch weekly executive decision review",
    ],
  },
  {
    period: "Days 61-90",
    title: "Production conversion",
    summary: "Move selected use cases through control review while tracking value and operating health.",
    items: [
      "Move selected use cases through control review",
      "Launch first production-ready workflow",
      "Track realized value",
      "Monitor production health",
      "Publish executive reporting rhythm",
      "Establish continuous improvement loop",
    ],
  },
];

export const OperatingModelPage = () => (
  <PageShell
    eyebrow="90-Day Operating Model"
    title="From AI inventory to governed production conversion"
    description="A static executive roadmap showing how the control tower becomes a repeatable operating model, not just a dashboard."
  >
    <section className="grid gap-5 xl:grid-cols-3">
      {phases.map((phase, index) => (
        <article key={phase.period} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-executive">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-indigoTailored-50 text-indigoTailored-700">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-indigoTailored-700">{phase.period}</div>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">{phase.title}</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{phase.summary}</p>
          <ol className="mt-6 space-y-3">
            {phase.items.map((item, itemIndex) => (
              <li key={item} className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <span className="font-semibold text-indigoTailored-700">{index + 1}.{itemIndex + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </section>
  </PageShell>
);
