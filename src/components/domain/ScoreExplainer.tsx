import { EvidenceBadge } from "@/components/domain/Indicators";
import type { ReadinessResult } from "@/engine/readiness";
import type { Initiative } from "@/engine/types";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";

/**
 * Score explainer.
 *
 * A readiness number nobody can take apart is a number nobody trusts. This
 * shows, per control, the weight the policy assigned, the credit the evidence
 * earned, and the score points currently being lost — so "why are we 69%?"
 * has an answer that fits on one screen and survives being challenged.
 */
export const ScoreExplainer = ({
  initiative,
  readiness,
}: {
  initiative: Initiative;
  readiness: ReadinessResult;
}) => {
  const worstLoss = Math.max(
    ...readiness.contributions.map((row) => row.pointsLost),
    0.0001,
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">
          How each control contributes to the readiness score for{" "}
          {initiative.name}
        </caption>
        <thead>
          <tr className="border-b border-subtle text-2xs uppercase tracking-wider text-muted">
            <th scope="col" className="py-2 pr-4 font-semibold">
              Control
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Evidence
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-semibold">
              Weight
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-semibold">
              Earned
            </th>
            <th scope="col" className="w-40 py-2 text-right font-semibold">
              Points lost
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-subtle">
          {readiness.contributions.map((row) => (
            <tr key={row.controlId} className="align-middle">
              <th scope="row" className="py-2.5 pr-4 font-normal">
                <span className="block font-medium text-primary">
                  {row.control.label}
                </span>
                <span className="block text-2xs text-muted">
                  Gated at {row.control.gate} ·{" "}
                  {row.artifact?.owner ?? "Unassigned"}
                </span>
              </th>
              <td className="py-2.5 pr-4">
                <EvidenceBadge state={row.state} />
              </td>
              <td data-metric className="py-2.5 pr-4 text-right text-secondary">
                ×{row.weight.toFixed(1)}
              </td>
              <td data-metric className="py-2.5 pr-4 text-right text-secondary">
                {row.pointsEarned.toFixed(1)} / {row.pointsAvailable.toFixed(1)}
              </td>
              <td className="py-2.5">
                <div className="flex items-center justify-end gap-2">
                  <div
                    className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-sunken"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "h-full rounded-full",
                        row.pointsLost > 0 ? "bg-risk" : "bg-ok",
                      )}
                      style={{
                        width: `${(row.pointsLost / worstLoss) * 100}%`,
                      }}
                    />
                  </div>
                  <span
                    data-metric
                    className={cn(
                      "w-12 text-right font-semibold",
                      row.pointsLost > 0.05 ? "text-risk-text" : "text-muted",
                    )}
                  >
                    {row.pointsLost < 0.05
                      ? "—"
                      : `-${row.pointsLost.toFixed(1)}`}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-strong">
            <th
              scope="row"
              colSpan={3}
              className="py-3 text-left font-semibold text-primary"
            >
              Readiness
            </th>
            <td data-metric colSpan={2} className="py-3 text-right">
              <span className="text-lg font-semibold text-primary">
                {formatPercent(readiness.score)}
              </span>
              <span className="ml-2 text-xs text-muted">{readiness.band}</span>
            </td>
          </tr>
        </tfoot>
      </table>

      {readiness.notApplicable.length > 0 ? (
        <p className="mt-4 rounded-lg border border-subtle bg-surface-sunken p-3 text-xs leading-5 text-muted">
          <span className="font-semibold text-secondary">
            Excluded from the score:
          </span>{" "}
          {readiness.notApplicable
            .map((id) => DEFAULT_LABELS[id] ?? id)
            .join(", ")}
          . These controls do not apply to this initiative, so they are removed
          from the denominator rather than counted as passes.
        </p>
      ) : null}
    </div>
  );
};

const DEFAULT_LABELS: Record<string, string> = {
  "vendor-risk": "vendor risk assessment (no third party in the path)",
  "agentic-controls":
    "autonomy limits and rollback (the workflow takes no action)",
};
