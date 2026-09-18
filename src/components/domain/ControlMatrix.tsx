import { Link } from "react-router-dom";

import { DEFAULT_POLICY } from "@/engine/policy";
import { effectiveState } from "@/engine/readiness";
import { scoreInitiative } from "@/engine/readiness";
import type { Initiative, Portfolio } from "@/engine/types";
import { cn } from "@/lib/cn";
import { EVIDENCE_TONES } from "@/lib/evidence-display";
import { formatPercent } from "@/lib/format";

/**
 * Portfolio control matrix.
 *
 * Initiatives down, controls across, evidence state in the cell. One screen
 * that answers "where is this portfolio actually weak?" — the vertical stripes
 * are the systemic gaps, and they are the argument for building a control
 * pattern once rather than negotiating it twelve times.
 */
export const ControlMatrix = ({ portfolio }: { portfolio: Portfolio }) => {
  const controls = DEFAULT_POLICY.controls;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] border-separate border-spacing-0 text-left">
        <caption className="sr-only">
          Control evidence state for every initiative. Rows are initiatives,
          columns are controls.
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 bg-surface px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-muted"
            >
              Initiative
            </th>
            <th
              scope="col"
              className="px-2 py-3 text-right text-2xs font-semibold uppercase tracking-wider text-muted"
            >
              Ready
            </th>
            {controls.map((control) => (
              <th
                key={control.id}
                scope="col"
                title={`${control.label} — gated at ${control.gate}`}
                className="px-1 py-3 align-bottom"
              >
                {/* Rotated headers keep twelve columns legible without a
                    horizontal scroll on desktop. */}
                <span className="block h-24 w-8">
                  <span className="absolute origin-bottom-left translate-y-24 -rotate-45 whitespace-nowrap text-2xs font-semibold text-muted">
                    {control.shortLabel}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {portfolio.map((initiative: Initiative) => {
            const readiness = scoreInitiative(initiative);

            return (
              <tr key={initiative.id} className="group">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-t border-subtle bg-surface px-4 py-2 font-normal group-hover:bg-surface-sunken"
                >
                  <Link
                    to={`/initiatives/${initiative.id}`}
                    className="block max-w-[15rem] truncate text-sm font-medium text-primary hover:text-accent hover:underline"
                  >
                    {initiative.name}
                  </Link>
                  <span className="font-mono text-2xs text-muted">
                    {initiative.id}
                  </span>
                </th>
                <td
                  data-metric
                  className="border-t border-subtle px-2 py-2 text-right text-sm font-semibold text-primary group-hover:bg-surface-sunken"
                >
                  {formatPercent(readiness.score)}
                </td>
                {controls.map((control) => {
                  const state = effectiveState(initiative, control);
                  const tone = EVIDENCE_TONES[state];

                  return (
                    <td
                      key={control.id}
                      className="border-t border-subtle px-1 py-2 group-hover:bg-surface-sunken"
                    >
                      <span
                        className={cn(
                          "mx-auto block h-6 w-6 rounded",
                          state === "not_applicable"
                            ? "border border-dashed border-strong bg-transparent"
                            : tone.solid,
                        )}
                        title={`${initiative.name} — ${control.label}: ${tone.label}`}
                      >
                        <span className="sr-only">
                          {control.label}: {tone.label}
                        </span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        {(
          [
            "approved",
            "partial",
            "in_progress",
            "missing",
            "not_applicable",
          ] as const
        ).map((state) => (
          <li
            key={state}
            className="flex items-center gap-2 text-xs text-muted"
          >
            <span
              className={cn(
                "h-3 w-3 rounded",
                state === "not_applicable"
                  ? "border border-dashed border-strong"
                  : EVIDENCE_TONES[state].solid,
              )}
              aria-hidden="true"
            />
            {EVIDENCE_TONES[state].label}
          </li>
        ))}
      </ul>
    </div>
  );
};
