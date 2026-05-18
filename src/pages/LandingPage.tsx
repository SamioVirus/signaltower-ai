import { ArrowRight, FileCheck2 } from "lucide-react";
import { Link } from "react-router-dom";

import { useCases } from "@/data/useCases";
import { formatCompactCurrency } from "@/lib/format";
import { getExecutiveDecisions, getPortfolioMetrics } from "@/lib/metrics";

export const LandingPage = () => {
  const metrics = getPortfolioMetrics(useCases);
  const decisions = getExecutiveDecisions(useCases);

  return (
    <main className="min-h-screen bg-navy text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-7">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-indigoTailored-500 text-sm font-bold">ST</div>
            <div>
              <div className="font-semibold tracking-tight">SignalTower AI</div>
              <div className="text-xs text-slate-400">Synthetic enterprise AI demo</div>
            </div>
          </Link>
          <Link
            to="/overview"
            className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigoTailored-300/40 hover:bg-white/5"
          >
            Open app
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="page-fade max-w-3xl">
            <div className="mb-5 inline-flex rounded-full border border-indigoTailored-300/20 bg-indigoTailored-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigoTailored-100">
              AI commercialization control tower
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Turn AI demand into governed production value.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              SignalTower AI helps regulated enterprises see which AI initiatives are ready for production, which are stuck,
              why they are stuck, and what leadership decision would unlock the most value fastest.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/overview"
                className="inline-flex items-center gap-2 rounded-md bg-indigoTailored-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigoTailored-950/20 transition hover:bg-indigoTailored-400"
              >
                View Control Tower
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/passport"
                className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-indigoTailored-300/50 hover:bg-white/5"
              >
                <FileCheck2 className="h-4 w-4" />
                See Evidence Passport
              </Link>
            </div>
            <p className="mt-7 text-sm text-slate-400">
              Built with synthetic data to demonstrate an enterprise AI operating model for regulated environments.
            </p>
          </div>

          <div className="page-fade rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
            <div className="grid gap-4">
              {[
                ["Portfolio signal", `${metrics.totalUseCases} initiatives`, "Governed pipeline from intake to monitoring"],
                ["Value at stake", formatCompactCurrency(metrics.totalValueAtStake), "Computed from synthetic use-case data"],
                ["Decision surface", `${decisions.length} actions`, "Ranked leadership choices for the week"],
              ].map(([label, value, detail]) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-indigoTailored-200">{label}</div>
                  <div className="mt-3 text-3xl font-semibold">{value}</div>
                  <div className="mt-2 text-sm text-slate-400">{detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
