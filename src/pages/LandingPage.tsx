import { Link } from "react-router-dom";
import { ArrowRight, Code, FlaskConical, ShieldCheck } from "lucide-react";

import { portfolio } from "@/data/portfolio";
import { blockerPatterns } from "@/engine/blockers";
import { compareStrategies } from "@/engine/forecast";
import { rankDecisions } from "@/engine/decisions";
import { portfolioMetrics } from "@/engine/portfolio";
import {
  formatCompactCurrency,
  formatCount,
  formatPercent,
} from "@/lib/format";

const REPO_URL = "https://github.com/SamioVirus/signaltower-ai";

export const LandingPage = () => {
  const metrics = portfolioMetrics(portfolio);
  const decisions = rankDecisions(portfolio);
  const systemic = blockerPatterns(portfolio).filter(
    (pattern) => pattern.isSystemic,
  );
  const comparison = compareStrategies(portfolio);

  const headline = [
    {
      value: `${metrics.totalInitiatives}`,
      label: "AI initiatives",
      detail: `${formatCompactCurrency(metrics.totalValueUsd)} of annual value at stake`,
    },
    {
      value: formatPercent(metrics.averageReadiness, 0),
      label: "Average readiness",
      detail: `${formatPercent(metrics.valueWeightedReadiness, 0)} once weighted by value`,
    },
    {
      value: `${metrics.blockedCount}`,
      label: "Blocked at the next gate",
      detail: `${formatCompactCurrency(metrics.blockedValueUsd)} held behind control evidence`,
    },
    {
      value: `${metrics.controlDebtCount}`,
      label: "Carrying control debt",
      detail: "Sitting in a stage whose own gate they never cleared",
    },
  ];

  return (
    <main className="min-h-screen bg-canvas">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-lg bg-accent-solid text-xs font-bold text-on-accent"
              aria-hidden="true"
            >
              ST
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight text-primary">
                SignalTower AI
              </span>
              <span className="block text-2xs text-muted">
                Synthetic portfolio demonstration
              </span>
            </span>
          </span>

          <div className="flex items-center gap-2">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-lg border border-subtle px-3 py-2 text-sm font-medium text-secondary transition hover:bg-surface-sunken hover:text-primary"
            >
              <Code className="h-4 w-4" aria-hidden="true" />
              Source
            </a>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-solid px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-solid-hover"
            >
              Open the control tower
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <section className="page-enter flex flex-1 flex-col justify-center py-14">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-2xs font-semibold uppercase tracking-[0.14em] text-accent-text">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Governed AI commercialisation
          </p>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight text-primary sm:text-6xl">
            Most enterprise AI does not stall on the model. It stalls on the
            evidence.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-secondary">
            SignalTower turns a portfolio of AI initiatives into a decision
            surface: which ones can move, which are stuck, what specifically is
            stopping them, and which single decision would unlock the most value
            soonest.
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
            Nothing on the next screen is a typed-in status. Readiness scores,
            blockers, gate verdicts, the decision ranking and the conversion
            forecast are all derived by a tested engine from one file of control
            evidence.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-solid px-5 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-solid-hover"
            >
              View the portfolio
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 rounded-lg border border-strong px-5 py-3 text-sm font-semibold text-primary transition hover:bg-surface-sunken"
            >
              <FlaskConical className="h-4 w-4" aria-hidden="true" />
              Run a what-if scenario
            </Link>
          </div>

          <dl className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {headline.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-subtle bg-surface p-5 shadow-card"
              >
                <dt className="text-2xs font-semibold uppercase tracking-wider text-muted">
                  {item.label}
                </dt>
                <dd>
                  <span
                    data-metric
                    className="mt-2 block text-3xl font-semibold tracking-tight text-primary"
                  >
                    {item.value}
                  </span>
                  <span className="mt-1.5 block text-xs leading-5 text-muted">
                    {item.detail}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Finding
              title="One control, several teams"
              body={
                systemic.length > 0
                  ? `${systemic[0].control.label} is blocking ${formatCount(
                      systemic[0].blockingNowCount,
                      "initiative",
                    )} at once. The engine raises that as a template to build, not ${formatCount(
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
              title="Decisions, not dashboards"
              body={`${formatCount(
                decisions.length,
                "ranked decision",
              )}, each showing the value, effort, confidence and urgency that produced its position.`}
            />
          </div>
        </section>

        <footer className="border-t border-subtle pt-6 text-xs leading-6 text-muted">
          <p>
            <span className="font-semibold text-secondary">
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
  <div className="rounded-xl border border-subtle bg-surface-sunken p-5">
    <p className="text-sm font-semibold text-primary">{title}</p>
    <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
  </div>
);
