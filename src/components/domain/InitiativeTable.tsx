import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import {
  ReadinessMeter,
  RiskBadge,
  StageBadge,
} from "@/components/domain/Indicators";
import { Mono } from "@/components/ui/Primitives";
import { deriveBlockers } from "@/engine/blockers";
import { controlDebt } from "@/engine/gates";
import { scoreInitiative } from "@/engine/readiness";
import type { Initiative, Portfolio } from "@/engine/types";
import { cn } from "@/lib/cn";
import { formatCompactCurrency, formatDays } from "@/lib/format";

type SortKey = "name" | "stage" | "value" | "readiness" | "blockers" | "age";
type SortDirection = "asc" | "desc";

interface Row {
  initiative: Initiative;
  score: number;
  band: ReturnType<typeof scoreInitiative>["band"];
  blockerCount: number;
  primaryBlocker: string;
  debtCount: number;
}

const buildRows = (portfolio: Portfolio): Row[] =>
  portfolio.map((initiative) => {
    const readiness = scoreInitiative(initiative);
    const blockers = deriveBlockers(initiative);

    return {
      initiative,
      score: readiness.score,
      band: readiness.band,
      blockerCount: blockers.length,
      primaryBlocker: blockers[0]?.control.label ?? "Clear to advance",
      debtCount: controlDebt(initiative).length,
    };
  });

const COMPARATORS: Record<SortKey, (a: Row, b: Row) => number> = {
  name: (a, b) => a.initiative.name.localeCompare(b.initiative.name),
  stage: (a, b) => a.initiative.stage.localeCompare(b.initiative.stage),
  value: (a, b) => a.initiative.annualValueUsd - b.initiative.annualValueUsd,
  readiness: (a, b) => a.score - b.score,
  blockers: (a, b) => a.blockerCount - b.blockerCount,
  age: (a, b) => a.initiative.stageAgeDays - b.initiative.stageAgeDays,
};

const HEADERS: Array<{ key: SortKey; label: string; align?: "right" }> = [
  { key: "name", label: "Initiative" },
  { key: "stage", label: "Stage" },
  { key: "value", label: "Annual value", align: "right" },
  { key: "readiness", label: "Readiness" },
  { key: "blockers", label: "Blocking next gate" },
  { key: "age", label: "In stage", align: "right" },
];

/**
 * Sortable initiative table.
 *
 * Sorting is real column sorting with the state announced through
 * `aria-sort`, not a decorative chevron: a table of twelve rows that cannot be
 * reordered is the sort of detail that tells a reader how much of the rest to
 * trust.
 */
export const InitiativeTable = ({ portfolio }: { portfolio: Portfolio }) => {
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const rows = useMemo(() => {
    const sorted = [...buildRows(portfolio)].sort(COMPARATORS[sortKey]);
    return direction === "desc" ? sorted.reverse() : sorted;
  }, [portfolio, sortKey, direction]);

  const toggle = (key: SortKey) => {
    if (key === sortKey) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(key === "name" || key === "stage" ? "asc" : "desc");
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-subtle bg-surface">
      <table className="w-full min-w-[980px] text-left text-sm">
        <caption className="sr-only">
          All initiatives with derived readiness, blockers and ageing. Column
          headers sort.
        </caption>
        <thead className="bg-surface-sunken">
          <tr>
            {HEADERS.map((header) => {
              const active = sortKey === header.key;
              const Icon = !active
                ? ArrowUpDown
                : direction === "asc"
                  ? ArrowUp
                  : ArrowDown;

              return (
                <th
                  key={header.key}
                  scope="col"
                  aria-sort={
                    active
                      ? direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={cn(
                    "px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-muted",
                    header.align === "right" && "text-right",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(header.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded transition hover:text-primary",
                      active && "text-primary",
                      header.align === "right" && "flex-row-reverse",
                    )}
                  >
                    {header.label}
                    <Icon className="h-3 w-3" aria-hidden="true" />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-subtle">
          {rows.map((row) => (
            <tr
              key={row.initiative.id}
              className="transition hover:bg-surface-sunken"
            >
              <th scope="row" className="px-4 py-3 font-normal">
                <Link
                  to={`/initiatives/${row.initiative.id}`}
                  className="block font-medium text-primary hover:text-accent hover:underline"
                >
                  {row.initiative.name}
                </Link>
                <span className="mt-0.5 flex items-center gap-2">
                  <Mono>{row.initiative.id}</Mono>
                  <span className="text-2xs text-muted">
                    {row.initiative.businessFunction}
                  </span>
                </span>
              </th>
              <td className="px-4 py-3">
                <span className="flex flex-wrap items-center gap-1.5">
                  <StageBadge stage={row.initiative.stage} />
                  <RiskBadge risk={row.initiative.riskTier} />
                </span>
                {row.debtCount > 0 ? (
                  <span
                    className="mt-1.5 flex items-center gap-1 text-2xs font-medium text-warn-text"
                    title="Controls this stage required that were never approved"
                  >
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    {row.debtCount} control debt
                  </span>
                ) : null}
              </td>
              <td
                data-metric
                className="px-4 py-3 text-right font-semibold text-primary"
              >
                {formatCompactCurrency(row.initiative.annualValueUsd)}
              </td>
              <td className="w-44 px-4 py-3">
                <ReadinessMeter
                  score={row.score}
                  band={row.band}
                  size="sm"
                  showBand={false}
                />
                <span className="mt-1 block text-2xs text-muted">
                  {row.band}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "text-sm",
                    row.blockerCount > 0
                      ? "font-medium text-risk-text"
                      : "text-muted",
                  )}
                >
                  {row.primaryBlocker}
                </span>
                {row.blockerCount > 1 ? (
                  <span className="mt-0.5 block text-2xs text-muted">
                    +{row.blockerCount - 1} more
                  </span>
                ) : null}
              </td>
              <td data-metric className="px-4 py-3 text-right text-secondary">
                {formatDays(row.initiative.stageAgeDays)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
