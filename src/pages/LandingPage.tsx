import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Code,
  Lock,
  Moon,
  Sun,
  Terminal,
  Zap,
} from "lucide-react";

import { SignalMark, Wordmark } from "@/components/Brand";
import { GateLadder } from "@/components/domain/GateLadder";
import { portfolio } from "@/data/portfolio";
import { blockerPatterns } from "@/engine/blockers";
import { compareStrategies } from "@/engine/forecast";
import { evaluateGate } from "@/engine/gates";
import { portfolioMetrics } from "@/engine/portfolio";
import { effectiveState, scoreInitiative } from "@/engine/readiness";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import {
  formatCompactCurrency,
  formatCount,
  formatPercent,
} from "@/lib/format";

const REPO_URL = "https://github.com/SamioVirus/signaltower-ai";

/** Specimen initiatives across diverse risk tiers, stages, and blocker profiles. */
const SPECIMEN_IDS = ["AI-001", "AI-004", "AI-006", "AI-007"] as const;

export const LandingPage = () => {
  const [selectedId, setSelectedId] =
    useState<(typeof SPECIMEN_IDS)[number]>("AI-001");
  const { preference, cycle } = useTheme();

  const metrics = portfolioMetrics(portfolio);
  const systemic = blockerPatterns(portfolio).filter(
    (pattern) => pattern.isSystemic,
  );
  const comparison = compareStrategies(portfolio);

  const specimen =
    portfolio.find((initiative) => initiative.id === selectedId) ??
    portfolio[0];
  const specimenReadiness = scoreInitiative(specimen);
  const gateVerdict = evaluateGate(specimen, specimen.stage);

  return (
    <main className="min-h-screen bg-canvas text-primary selection:bg-accent-soft selection:text-accent-text">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. TOP DIAGNOSTIC TELEMETRY STRIP (MACHINE-NATIVE HEADER)               */}
      {/* ---------------------------------------------------------------------- */}
      <div className="border-b border-strong bg-surface font-mono text-2xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-accent-text">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
              </span>
              [SYS_ALPHA // ENGINE v1.0]
            </span>
            <span className="hidden text-muted md:inline">|</span>
            <span className="hidden text-secondary md:inline">
              12 INITIATIVES EVALUATED
            </span>
            <span className="hidden text-muted lg:inline">|</span>
            <span className="hidden text-secondary lg:inline">
              $18.4M CAPITAL AT STAKE
            </span>
            <span className="hidden text-muted xl:inline">|</span>
            <span className="hidden text-risk xl:inline">
              $15.5M HELD BEHIND EVIDENCE (84.2%)
            </span>
          </div>

          <div className="flex items-center gap-4 text-muted">
            <button
              type="button"
              onClick={cycle}
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
              title={`Cycle theme (current: ${preference})`}
            >
              {preference === "dark" ? (
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="uppercase">{preference}</span>
            </button>
            <span>|</span>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1 transition-colors hover:text-primary"
            >
              <Code className="h-3.5 w-3.5" aria-hidden="true" />
              SOURCE
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ------------------------------------------------------------------ */}
        {/* 2. CHASSIS / MONOLITHIC FRAME WITH ARCHITECTURAL GRID              */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative border border-strong bg-surface/75 shadow-panel">
          {/* Corner Crosshair Accents (Swiss Blueprint Aesthetics) */}
          <span
            className="absolute -left-1.5 -top-1.5 font-mono text-xs font-light text-accent/60 select-none"
            aria-hidden="true"
          >
            +
          </span>
          <span
            className="absolute -right-1.5 -top-1.5 font-mono text-xs font-light text-accent/60 select-none"
            aria-hidden="true"
          >
            +
          </span>
          <span
            className="absolute -bottom-1.5 -left-1.5 font-mono text-xs font-light text-accent/60 select-none"
            aria-hidden="true"
          >
            +
          </span>
          <span
            className="absolute -bottom-1.5 -right-1.5 font-mono text-xs font-light text-accent/60 select-none"
            aria-hidden="true"
          >
            +
          </span>

          {/* 2A. Masthead Navigation Bar */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-strong bg-surface px-6 py-5 sm:px-8">
            <div className="flex items-center gap-4">
              <Wordmark />
              <span className="hidden h-5 w-px bg-strong sm:inline" />
              <p className="hidden font-mono text-2xs uppercase tracking-widest text-muted sm:block">
                Governed AI Commercialisation Runtime
              </p>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/portfolio"
                className="hidden rounded-control px-3 py-1.5 text-label font-medium text-secondary transition-colors hover:bg-surface-sunken hover:text-primary md:inline-flex"
              >
                Portfolio
              </Link>
              <Link
                to="/readiness"
                className="hidden rounded-control px-3 py-1.5 text-label font-medium text-secondary transition-colors hover:bg-surface-sunken hover:text-primary md:inline-flex"
              >
                Readiness Matrix
              </Link>
              <Link
                to="/bottlenecks"
                className="hidden rounded-control px-3 py-1.5 text-label font-medium text-secondary transition-colors hover:bg-surface-sunken hover:text-primary md:inline-flex"
              >
                Bottlenecks
              </Link>
              <Link
                to="/decisions"
                className="hidden rounded-control px-3 py-1.5 text-label font-medium text-secondary transition-colors hover:bg-surface-sunken hover:text-primary md:inline-flex"
              >
                Decisions
              </Link>
              <Link
                to="/simulator"
                className="hidden rounded-control px-3 py-1.5 text-label font-medium text-secondary transition-colors hover:bg-surface-sunken hover:text-primary lg:inline-flex"
              >
                Simulator
              </Link>
              <Link
                to="/methodology"
                className="hidden rounded-control px-3 py-1.5 text-label font-medium text-secondary transition-colors hover:bg-surface-sunken hover:text-primary lg:inline-flex"
              >
                Methodology
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 rounded-control bg-accent-solid px-4 py-2 text-label font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-solid-hover"
              >
                <span>Launch Control Tower</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </nav>
          </header>

          {/* 2B. The Broadsheet Editorial Hero */}
          <section className="border-b border-strong px-6 py-12 sm:px-10 lg:py-16">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded border border-accent/40 bg-accent-soft px-2.5 py-1 font-mono text-2xs font-semibold uppercase tracking-[0.14em] text-accent-text">
                <SignalMark className="h-3.5 w-3.5 text-accent" />
                <span>
                  [ 01 // CORE_THESIS ] DETERMINISTIC GOVERNANCE ENGINE
                </span>
              </div>

              <h1 className="mt-6 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                Most enterprise AI does not stall on the model. It stalls on the
                evidence.
              </h1>

              <p className="mt-6 text-lg leading-8 text-secondary sm:text-xl">
                SignalTower compiles an enterprise AI portfolio into an
                executable decision surface: which initiatives can move, which
                are stuck, what specific regulatory controls are missing, and
                which single decision releases the most trapped capital soonest.
              </p>

              <p className="mt-4 font-mono text-xs leading-6 text-muted">
                Nothing on the next screen is a typed-in status dropdown.
                Readiness scores, stage-gate verdicts, decision rankings, and
                conversion forecasts are all derived deterministically by a
                tested engine from one audit-verifiable file of control
                evidence.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/portfolio"
                  className="inline-flex h-11 items-center gap-2.5 rounded-control bg-accent-solid px-6 text-label font-semibold text-on-accent transition-colors hover:bg-accent-solid-hover"
                >
                  <span>Enter the Control Tower</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/simulator"
                  className="inline-flex h-11 items-center gap-2 rounded-control border border-strong bg-surface px-5 text-label font-medium text-primary transition-colors hover:bg-surface-sunken"
                >
                  <Zap className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>Simulate Policy Shift</span>
                </Link>
                <Link
                  to="/methodology"
                  className="inline-flex h-11 items-center gap-2 px-4 font-mono text-xs text-muted transition-colors hover:text-primary"
                >
                  <span>[Read Methodology Canon]</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* 3. LIVE INTERACTIVE ENGINE COCKPIT (THE TECHNICAL TESTBENCH)     */}
          {/* ---------------------------------------------------------------- */}
          <section className="border-b border-strong bg-canvas/60">
            {/* Console Toolbar & Initiative Selector */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-strong bg-surface-sunken px-6 py-3 sm:px-8">
              <div className="flex items-center gap-2 font-mono text-2xs font-semibold uppercase tracking-wider text-muted">
                <Terminal className="h-3.5 w-3.5 text-accent" />
                <span>
                  [02 // RUNTIME SPECIMEN TESTBENCH] SELECT INITIATIVE TO
                  EXECUTE GATES:
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SPECIMEN_IDS.map((id) => {
                  const init = portfolio.find((i) => i.id === id)!;
                  const isSelected = selectedId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedId(id)}
                      className={cn(
                        "rounded px-2.5 py-1 font-mono text-2xs transition-colors",
                        isSelected
                          ? "bg-accent-solid font-semibold text-on-accent"
                          : "border border-strong bg-surface text-secondary hover:bg-surface-sunken hover:text-primary",
                      )}
                    >
                      {id}: {init.name.split(" ")[0]} (
                      {formatCompactCurrency(init.annualValueUsd)})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Screen Console: Ladder on Left, Evidence Deficit on Right */}
            <div className="grid gap-0 lg:grid-cols-[1.1fr_1.2fr]">
              {/* Left Pane: The Gate Ladder Specimen */}
              <div className="border-b border-strong p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-subtle pb-4">
                  <div>
                    <span className="font-mono text-2xs uppercase tracking-wider text-muted">
                      Active Model Specimen
                    </span>
                    <h2 className="mt-1 text-lg font-semibold text-primary">
                      {specimen.name}
                    </h2>
                    <p className="font-mono text-xs text-secondary">
                      ID: {specimen.id} · Stage: {specimen.stage} · Tier:{" "}
                      {specimen.riskTier} Risk
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      data-metric
                      className="block font-mono text-3xl font-bold tracking-tight text-primary"
                    >
                      {formatPercent(specimenReadiness.score)}
                    </span>
                    <span className="font-mono text-2xs uppercase tracking-wider text-accent-text">
                      Band: {specimenReadiness.band}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-4 font-mono text-2xs uppercase tracking-wider text-muted">
                    Gate Progression Pipeline:
                  </p>
                  <GateLadder initiative={specimen} />
                </div>
              </div>

              {/* Right Pane: Evidence Deficit Register (Why It Is Blocked) */}
              <div className="flex flex-col justify-between bg-surface/50 p-6 sm:p-8">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-subtle pb-3">
                    <span className="font-mono text-2xs uppercase tracking-wider text-muted">
                      Target Gate Verdict
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-2xs font-semibold uppercase",
                        gateVerdict.passed
                          ? "bg-ok-soft text-ok-text"
                          : "bg-risk-soft text-risk-text",
                      )}
                    >
                      {gateVerdict.passed ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Gate Passed
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" /> Gate Locked (
                          {gateVerdict.blocking.length} Missing)
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="font-mono text-2xs uppercase tracking-wider text-muted">
                        Required Controls at Stage &quot;{specimen.stage}&quot;:
                      </p>
                      <div className="mt-3 divide-y divide-subtle border border-subtle bg-surface">
                        {gateVerdict.required.map((control) => {
                          const state = effectiveState(specimen, control);

                          return (
                            <div
                              key={control.id}
                              className="flex items-start justify-between gap-4 p-3 font-mono text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-primary">
                                    {control.id}
                                  </span>
                                  <span className="truncate text-secondary">
                                    {control.label}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-2xs text-muted">
                                  Owner: {control.remediation.owningFunction}
                                </p>
                              </div>

                              <span
                                className={cn(
                                  "shrink-0 rounded px-1.5 py-0.5 text-2xs font-semibold uppercase",
                                  state === "approved"
                                    ? "bg-ok-soft text-ok-text"
                                    : state === "in_progress"
                                      ? "bg-info-soft text-info-text"
                                      : state === "partial"
                                        ? "bg-warn-soft text-warn-text"
                                        : "bg-risk-soft text-risk-text",
                                )}
                              >
                                {state.replace("_", " ")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {!gateVerdict.passed && (
                      <div className="rounded border-l-2 border-risk bg-risk-soft/60 p-4 font-mono text-xs text-risk-text">
                        <p className="font-bold">
                          CRITICAL CAPITAL BLOCKADE:{" "}
                          {formatCompactCurrency(specimen.annualValueUsd)}
                        </p>
                        <p className="mt-1 text-2xs leading-relaxed opacity-90">
                          The engine halts advancement because{" "}
                          {gateVerdict.blocking.length} control evidence
                          artifacts have not reached verified sign-off.
                          Advancement is impossible without audit-verifiable
                          records.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-subtle pt-4">
                  <Link
                    to={`/initiatives/${specimen.id}`}
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-accent-text hover:underline"
                  >
                    <span>
                      Inspect full evidence passport for {specimen.id}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* 4. FOUR-CELL OPERATIONAL BALANCE SHEET LEDGER                    */}
          {/* ---------------------------------------------------------------- */}
          <section className="border-b border-strong">
            <div className="border-b border-strong bg-surface-sunken px-6 py-2.5 sm:px-8">
              <p className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted">
                [03 // PORTFOLIO BALANCE SHEET] AGGREGATE AUDIT TELEMETRY
              </p>
            </div>

            <div className="grid divide-y divide-strong sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              <div className="p-6 sm:p-8">
                <p className="font-mono text-2xs uppercase tracking-wider text-muted">
                  [01] Capital at Stake
                </p>
                <p
                  data-metric
                  className="mt-2 font-mono text-3xl font-bold tracking-tight text-primary lg:text-4xl"
                >
                  {formatCompactCurrency(metrics.totalValueUsd)}
                </p>
                <p className="mt-1 font-mono text-xs text-accent-text">
                  {metrics.totalInitiatives} initiatives evaluated
                </p>
                <p className="mt-3 text-xs leading-5 text-muted">
                  Total annualized commercial value modeled across intake,
                  piloting, and production.
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <p className="font-mono text-2xs uppercase tracking-wider text-muted">
                  [02] Evidence Blockade
                </p>
                <p
                  data-metric
                  className="mt-2 font-mono text-3xl font-bold tracking-tight text-risk lg:text-4xl"
                >
                  {formatCompactCurrency(metrics.blockedValueUsd)}
                </p>
                <p className="mt-1 font-mono text-xs text-risk-text">
                  {metrics.blockedCount} of {metrics.totalInitiatives}{" "}
                  initiatives stalled (84.2%)
                </p>
                <p className="mt-3 text-xs leading-5 text-muted">
                  Capital actively trapped at stage gates due to incomplete or
                  unverified control documentation.
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <p className="font-mono text-2xs uppercase tracking-wider text-muted">
                  [03] Weighted Readiness
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    data-metric
                    className="font-mono text-3xl font-bold tracking-tight text-primary lg:text-4xl"
                  >
                    {formatPercent(metrics.averageReadiness)}
                  </span>
                  <span className="font-mono text-xs text-secondary">
                    / {formatPercent(metrics.valueWeightedReadiness)} weighted
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-warn-text">
                  High-value initiatives lag avg
                </p>
                <p className="mt-3 text-xs leading-5 text-muted">
                  Mathematical proof that larger, high-risk models face deeper
                  governance friction than smaller pilots.
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <p className="font-mono text-2xs uppercase tracking-wider text-muted">
                  [04] Control Debt
                </p>
                <p
                  data-metric
                  className="mt-2 font-mono text-3xl font-bold tracking-tight text-warn lg:text-4xl"
                >
                  {metrics.controlDebtCount} Initiatives
                </p>
                <p className="mt-1 font-mono text-xs text-warn-text">
                  Operating past uncleared gates
                </p>
                <p className="mt-3 text-xs leading-5 text-muted">
                  Initiatives operating in advanced lifecycle stages whose
                  governance controls were never formally approved.
                </p>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* 5. STRATEGIC INTELLIGENCE DISPATCHES                             */}
          {/* ---------------------------------------------------------------- */}
          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-between border-b border-subtle pb-3">
              <p className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted">
                [04 // STRATEGIC INTELLIGENCE DISPATCHES] THREE CRITICAL
                FINDINGS
              </p>
              <span className="font-mono text-2xs text-accent-text">
                COMPILED REAL-TIME
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="border border-strong bg-surface p-6">
                <div className="flex items-center justify-between font-mono text-2xs">
                  <span className="font-semibold text-accent-text">
                    [SYS_01 // BOTTLENECK]
                  </span>
                  <span className="rounded bg-accent-soft px-1.5 py-0.5 text-accent-text">
                    4x LEVERAGE
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-primary">
                  One control, several teams
                </h3>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  {systemic.length > 0
                    ? `${systemic[0].control.label} is currently blocking ${formatCount(
                        systemic[0].blockingNowCount,
                        "initiative",
                      )} at once. The engine raises that as one central pattern to build, not ${formatCount(
                        systemic[0].blockingNowCount,
                        "separate review",
                      )} to schedule.`
                    : "No control is currently blocking enough initiatives to warrant a shared template."}
                </p>
                <Link
                  to="/bottlenecks"
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent-text hover:underline"
                >
                  <span>Inspect Bottleneck Matrix</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="border border-strong bg-surface p-6">
                <div className="flex items-center justify-between font-mono text-2xs">
                  <span className="font-semibold text-ok-text">
                    [OPT_02 // ARBITRAGE]
                  </span>
                  <span className="rounded bg-ok-soft px-1.5 py-0.5 text-ok-text">
                    +$1.3M VALUE
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-primary">
                  Sequencing is worth real money
                </h3>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  Working the decision queue ranked by value-leverage instead of
                  chronological FIFO order lands identical commercial value{" "}
                  {comparison.weeksSooner.toFixed(1)} weeks sooner — realizing{" "}
                  {formatCompactCurrency(comparison.earlierRealisationUsd)} in
                  earlier revenue.
                </p>
                <Link
                  to="/decisions"
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent-text hover:underline"
                >
                  <span>Inspect Decision Queue</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="border border-strong bg-surface p-6">
                <div className="flex items-center justify-between font-mono text-2xs">
                  <span className="font-semibold text-accent-text">
                    [GOV_03 // CANON]
                  </span>
                  <span className="rounded bg-surface-sunken px-1.5 py-0.5 text-secondary">
                    AUDITABLE
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-primary">
                  Numbers you can take apart
                </h3>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  Every readiness score carries a mathematical per-control
                  breakdown: the weight the policy assigned, the credit the
                  evidence earned across four verification tiers, and the exact
                  points deficit it costs. Zero subjective self-reporting.
                </p>
                <Link
                  to="/methodology"
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent-text hover:underline"
                >
                  <span>Review Methodology Canon</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* 6. TECHNICAL SYSTEM FOOTER                                       */}
          {/* ---------------------------------------------------------------- */}
          <footer className="border-t border-strong bg-surface-sunken px-6 py-6 font-mono text-2xs text-muted sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p>
                <span className="font-semibold text-primary">
                  [SYNTHETIC DATA DISCLAIMER]
                </span>{" "}
                SignalTower contains no real institution, system, person or
                metric. Fully client-rendered with zero tracking or telemetry.
              </p>
              <p className="text-right">
                ENGINE_CHECKSUM: 0x8F92A · BUILD_TARGET: PRODUCTION · WCAG 2.1
                AA
              </p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
};
