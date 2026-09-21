import { Link } from "react-router-dom";
import { ArrowRight, Code } from "lucide-react";

import { SignalMark, Wordmark } from "@/components/Brand";
import { GateLadder } from "@/components/domain/GateLadder";
import { portfolio } from "@/data/portfolio";
import { blockerPatterns } from "@/engine/blockers";
import { compareStrategies } from "@/engine/forecast";
import { portfolioMetrics } from "@/engine/portfolio";
import { scoreInitiative } from "@/engine/readiness";
import {
  formatCompactCurrency,
  formatCount,
  formatPercent,
} from "@/lib/format";

const REPO_URL = "https://github.com/SamioVirus/signaltower-ai";

/** The initiative whose gates make the clearest specimen: blocked mid-ladder. */
const SPECIMEN_ID = "AI-001";

export const LandingPage = () => {
  const metrics = portfolioMetrics(portfolio);
  const systemic = blockerPatterns(portfolio).filter(
    (pattern) => pattern.isSystemic,
  );
  const comparison = compareStrategies(portfolio);
  const specimen =
    portfolio.find((initiative) => initiative.id === SPECIMEN_ID) ??
    portfolio[0];
  const specimenReadiness = scoreInitiative(specimen);

  const facts = [
    {
      value: `${metrics.totalInitiatives}`,
      label: "AI initiatives",
      detail: `${formatCompactCurrency(metrics.totalValueUsd)} of annual value at stake`,
    },
    {
      value: formatPercent(metrics.averageReadiness),
      label: "Average readiness",
      detail: `${formatPercent(metrics.valueWeightedReadiness)} once weighted by value`,
    },
    {
      value: `${metrics.blockedCount}`,
      label: "Blocked at the next gate",
      detail: `${formatCompactCurrency(metrics.blockedValueUsd)} held behind evidence`,
    },
    {
      value: `${metrics.controlDebtCount}`,
      label: "Carrying control debt",
      detail: "In a stage whose own gate never cleared",
    },
  ];

  return (
    <main className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 py-6">
          <Wordmark />
          <div className="flex items-center gap-2">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-9 items-center gap-2 rounded-control border border-strong px-3 text-label font-medium text-secondary transition-colors duration-150 hover:bg-surface-sunken hover:text-primary"
            >
              <Code className="h-4 w-4" aria-hidden="true" />
              Source
            </a>
            <Link
              to="/portfolio"
              className="inline-flex h-9 items-center gap-2 rounded-control bg-accent-solid px-4 text-label font-medium text-on-accent transition-colors duration-150 hover:bg-accent-solid-hover"
            >
              Open the control tower
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Asymmetric: the argument on the left, the evidence on the right. */}
        <section className="page-enter grid items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div>
            <p className="flex items-center gap-2 text-2xs font-medium uppercase tracking-[0.14em] text-accent-text">
              <SignalMark className="h-4 w-4 text-accent" />
              Governed AI commercialisation
            </p>

            <h1 className="font-display mt-5 text-display-sm text-primary sm:text-display lg:text-display-lg">
              Most enterprise AI does not stall on the model. It stalls on the
              evidence.
            </h1>

            <p className="mt-6 max-w-measure text-[1.0625rem] leading-7 text-secondary">
              SignalTower turns a portfolio of AI initiatives into a decision
              surface: which ones can move, which are stuck, what specifically
              is stopping them, and which single decision would release the most
              value soonest.
            </p>

            <p className="mt-4 max-w-measure text-label leading-6 text-muted">
              Nothing on the next screen is a typed-in status. Readiness,
              blockers, gate verdicts, the decision ranking and the conversion
              forecast are all derived by a tested engine from one file of
              control evidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <Link
                to="/portfolio"
                className="inline-flex h-11 items-center gap-2 rounded-control bg-accent-solid px-5 text-label font-medium text-on-accent transition-colors duration-150 hover:bg-accent-solid-hover"
              >
                View the portfolio
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/simulator"
                className="inline-flex h-11 items-center gap-2 rounded-control border border-strong px-5 text-label font-medium text-primary transition-colors duration-150 hover:bg-surface-sunken"
              >
                Run a what-if scenario
              </Link>
            </div>
          </div>

          {/* The product evidence: one initiative, mid-ladder, interrupted. */}
          <div className="rounded-panel border border-subtle bg-surface p-6 shadow-panel">
            <div className="flex items-baseline justify-between gap-3 border-b border-subtle pb-3">
              <div className="min-w-0">
                <p className="truncate text-label font-semibold text-primary">
                  {specimen.name}
                </p>
                <p className="mt-0.5 font-mono text-2xs text-muted">
                  {specimen.id}
                </p>
              </div>
              <p className="shrink-0 text-right">
                <span
                  data-metric
                  className="block text-2xl font-semibold text-primary"
                >
                  {formatPercent(specimenReadiness.score)}
                </span>
                <span className="block text-2xs text-muted">
                  {specimenReadiness.band}
                </span>
              </p>
            </div>

            <div className="pt-4">
              <GateLadder initiative={specimen} />
            </div>
          </div>
        </section>

        <section className="border-t border-subtle py-12">
          <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-2xs font-medium text-muted">
                  {fact.label}
                </dt>
                <dd>
                  <span
                    data-metric
                    className="mt-1.5 block text-[2rem] font-semibold leading-none tracking-[-0.02em] text-primary"
                  >
                    {fact.value}
                  </span>
                  <span className="mt-2 block text-2xs leading-5 text-muted">
                    {fact.detail}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid gap-8 border-t border-subtle py-12 md:grid-cols-3">
          <Finding
            title="One control, several teams"
            body={
              systemic.length > 0
                ? `${systemic[0].control.label} blocks ${formatCount(
                    systemic[0].blockingNowCount,
                    "initiative",
                  )} at once. The engine raises that as one pattern to build, not ${formatCount(
                    systemic[0].blockingNowCount,
                    "review",
                  )} to schedule.`
                : "No control is currently blocking enough initiatives to warrant a shared template."
            }
          />
          <Finding
            title="Sequencing is worth real money"
            body={`Working the ranked queue instead of the oldest ticket lands the same value about ${comparison.weeksSooner.toFixed(
              1,
            )} weeks sooner — roughly ${formatCompactCurrency(
              comparison.earlierRealisationUsd,
            )} of earlier realisation on this portfolio.`}
          />
          <Finding
            title="Numbers you can take apart"
            body="Every readiness score carries a per-control breakdown: the weight the policy assigned, the credit the evidence earned, and the points it is costing."
          />
        </section>

        <footer className="border-t border-subtle py-8">
          <p className="max-w-measure text-2xs leading-5 text-muted">
            <span className="font-medium text-secondary">
              Synthetic data only.
            </span>{" "}
            SignalTower contains no real institution, system, person or metric,
            and has no backend, authentication, API or tracking. The scenarios
            are composites of publicly discussed enterprise AI adoption patterns
            in regulated industries.
          </p>
        </footer>
      </div>
    </main>
  );
};

const Finding = ({ title, body }: { title: string; body: string }) => (
  <div>
    <div className="signal-rule mb-3" aria-hidden="true" />
    <p className="text-label font-semibold text-primary">{title}</p>
    <p className="mt-2 text-label leading-6 text-muted">{body}</p>
  </div>
);
