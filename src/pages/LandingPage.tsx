import { Link } from "react-router-dom";

import { portfolio } from "@/data/portfolio";
import { evaluateGate } from "@/engine/gates";
import { portfolioMetrics } from "@/engine/portfolio";
import { formatCompactCurrency } from "@/lib/format";

export const LandingPage = () => {
  const metrics = portfolioMetrics(portfolio);
  const waitingPercent = Math.round(
    (metrics.blockedValueUsd / metrics.totalValueUsd) * 100,
  );

  return (
    <div className="min-h-screen bg-[#f4f2ed] text-[#1b1a17] selection:bg-[#ddd8ce] dark:bg-[#15181b] dark:text-[#f4f2ed]">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                             */}
      {/* ------------------------------------------------------------------ */}
      <header className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-[22px]">
        <Link
          to="/"
          className="text-[15px] font-semibold tracking-[-0.02em] text-[#1b1a17] dark:text-[#f4f2ed]"
        >
          Signal Tower
        </Link>
        <nav className="flex items-center gap-7 text-[14px] text-[#6a655c] dark:text-[#9a958b]">
          <Link
            to="/portfolio"
            className="transition-colors hover:text-[#1b1a17] dark:hover:text-[#f4f2ed]"
          >
            Portfolio
          </Link>
          <Link
            to="/readiness"
            className="hidden transition-colors hover:text-[#1b1a17] dark:hover:text-[#f4f2ed] sm:inline"
          >
            Readiness
          </Link>
          <Link
            to="/bottlenecks"
            className="hidden transition-colors hover:text-[#1b1a17] dark:hover:text-[#f4f2ed] md:inline"
          >
            Bottlenecks
          </Link>
          <Link
            to="/decisions"
            className="hidden transition-colors hover:text-[#1b1a17] dark:hover:text-[#f4f2ed] md:inline"
          >
            Decisions
          </Link>
          <Link
            to="/methodology"
            className="transition-colors hover:text-[#1b1a17] dark:hover:text-[#f4f2ed]"
          >
            Method
          </Link>
          <Link
            to="/portfolio"
            className="bg-[#1e3a5f] px-3.5 py-2 text-[14px] font-medium text-white transition-opacity hover:opacity-90 dark:bg-[#2b4c77]"
          >
            Open
          </Link>
        </nav>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN WRAP                                                          */}
      {/* ------------------------------------------------------------------ */}
      <main className="mx-auto max-w-[1080px] px-8">
        <h1 className="mt-14 max-w-[16ch] font-display text-[clamp(34px,4.6vw,48px)] font-normal leading-[1.15] tracking-[-0.03em] sm:mt-14">
          Enterprise AI stalls on evidence, not on the model.
        </h1>

        {/* Figures */}
        <ul className="my-10 mb-14 flex flex-wrap gap-10 p-0 sm:gap-10">
          <li className="min-w-[7rem]">
            <b className="block font-display text-[28px] font-normal tracking-[-0.03em]">
              {metrics.totalInitiatives}
            </b>
            <span className="text-[13px] text-[#6a655c] dark:text-[#9a958b]">
              in review
            </span>
          </li>
          <li className="min-w-[7rem]">
            <b className="block font-display text-[28px] font-normal tracking-[-0.03em]">
              {formatCompactCurrency(metrics.totalValueUsd).toLowerCase()}
            </b>
            <span className="text-[13px] text-[#6a655c] dark:text-[#9a958b]">
              at stake
            </span>
          </li>
          <li className="min-w-[7rem]">
            <b className="block font-display text-[28px] font-normal tracking-[-0.03em] text-[#8a3b2a] dark:text-[#d96b52]">
              {formatCompactCurrency(metrics.blockedValueUsd).toLowerCase()}
            </b>
            <span className="text-[13px] text-[#6a655c] dark:text-[#9a958b]">
              held
            </span>
          </li>
          <li className="min-w-[7rem]">
            <b className="block font-display text-[28px] font-normal tracking-[-0.03em]">
              {waitingPercent}%
            </b>
            <span className="text-[13px] text-[#6a655c] dark:text-[#9a958b]">
              waiting
            </span>
          </li>
        </ul>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table
            id="portfolio"
            className="w-full border-collapse text-left text-[14px]"
          >
            <thead>
              <tr>
                <th className="border-b border-[#ddd8ce] pb-2.5 pr-4 text-[12px] font-normal text-[#6a655c] dark:border-[#2b2e32] dark:text-[#9a958b]">
                  Initiative
                </th>
                <th className="border-b border-[#ddd8ce] pb-2.5 pr-4 text-[12px] font-normal text-[#6a655c] dark:border-[#2b2e32] dark:text-[#9a958b]">
                  Stage
                </th>
                <th className="border-b border-[#ddd8ce] pb-2.5 pr-4 text-[12px] font-normal text-[#6a655c] dark:border-[#2b2e32] dark:text-[#9a958b]">
                  Capital
                </th>
                <th className="border-b border-[#ddd8ce] pb-2.5 pr-4 text-[12px] font-normal text-[#6a655c] dark:border-[#2b2e32] dark:text-[#9a958b]" />
                <th className="border-b border-[#ddd8ce] pb-2.5 pr-4 text-[12px] font-normal text-[#6a655c] dark:border-[#2b2e32] dark:text-[#9a958b]">
                  Waiting on
                </th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((initiative) => {
                const verdict = evaluateGate(initiative, initiative.stage);
                const isHeld = !verdict.passed;
                const waitingOnText = isHeld
                  ? verdict.blocking.map((c) => c.label).join(", ")
                  : "—";

                return (
                  <tr
                    key={initiative.id}
                    className="group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  >
                    <td className="border-b border-[#ddd8ce] py-4 pr-4 align-baseline dark:border-[#2b2e32]">
                      <Link
                        to={`/initiatives/${initiative.id}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {initiative.name}
                      </Link>
                    </td>
                    <td className="border-b border-[#ddd8ce] py-4 pr-4 align-baseline text-[#6a655c] dark:border-[#2b2e32] dark:text-[#9a958b]">
                      {initiative.stage}
                    </td>
                    <td className="border-b border-[#ddd8ce] py-4 pr-4 align-baseline font-mono whitespace-nowrap [font-variant-numeric:tabular-nums] dark:border-[#2b2e32]">
                      {formatCompactCurrency(
                        initiative.annualValueUsd,
                      ).toLowerCase()}
                    </td>
                    <td className="border-b border-[#ddd8ce] py-4 pr-4 align-baseline font-medium whitespace-nowrap dark:border-[#2b2e32]">
                      {isHeld ? (
                        <span className="text-[#8a3b2a] dark:text-[#d96b52]">
                          Held
                        </span>
                      ) : (
                        <span className="text-[#2c5a3d] dark:text-[#5ba373]">
                          Ready
                        </span>
                      )}
                    </td>
                    <td className="border-b border-[#ddd8ce] py-4 pr-4 align-baseline text-[#6a655c] dark:border-[#2b2e32] dark:text-[#9a958b]">
                      {waitingOnText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="mx-auto max-w-[1080px] px-8 py-16 text-[13px] text-[#6a655c] dark:text-[#9a958b]">
        Signal Tower · Synthetic portfolio demonstration
      </footer>
    </div>
  );
};
