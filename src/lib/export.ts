import type { Portfolio, ScoringPolicy } from "@/engine/types";
import { deriveBlockers, deriveGaps } from "@/engine/blockers";
import { controlDebt, nextGate } from "@/engine/gates";
import { DEFAULT_POLICY } from "@/engine/policy";
import { scoreInitiative } from "@/engine/readiness";

/**
 * Export.
 *
 * A control tower nobody can get data out of is a dead end, so the derived
 * view is exportable in both a machine-readable and a spreadsheet-readable
 * form. The exports carry the derived fields, not the raw fixture: the point
 * is to hand over the conclusions with the evidence that produced them.
 */

export interface ExportRow {
  id: string;
  name: string;
  businessFunction: string;
  stage: string;
  riskTier: string;
  annualValueUsd: number;
  readinessScore: number;
  readinessBand: string;
  nextGate: string;
  blockingControls: string;
  outstandingControls: number;
  controlDebt: string;
  remediationEffortDays: number;
  stageAgeDays: number;
  owner: string;
}

export const toExportRows = (
  portfolio: Portfolio,
  policy: ScoringPolicy = DEFAULT_POLICY,
): ExportRow[] =>
  portfolio.map((initiative) => {
    const readiness = scoreInitiative(initiative, policy);
    const blockers = deriveBlockers(initiative, policy);
    const gaps = deriveGaps(initiative, policy);
    const debt = controlDebt(initiative, policy);

    return {
      id: initiative.id,
      name: initiative.name,
      businessFunction: initiative.businessFunction,
      stage: initiative.stage,
      riskTier: initiative.riskTier,
      annualValueUsd: initiative.annualValueUsd,
      readinessScore: readiness.score,
      readinessBand: readiness.band,
      nextGate: nextGate(initiative, policy)?.targetStage ?? "None",
      blockingControls: blockers
        .map((blocker) => blocker.control.label)
        .join("; "),
      outstandingControls: gaps.length,
      controlDebt: debt.map((control) => control.label).join("; "),
      remediationEffortDays: gaps.reduce(
        (total, gap) => total + gap.effortDays,
        0,
      ),
      stageAgeDays: initiative.stageAgeDays,
      owner: initiative.deliveryTeam,
    };
  });

/** RFC 4180 quoting: double the quotes, wrap anything that needs it. */
const csvCell = (value: string | number): string => {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const toCsv = (rows: ExportRow[]): string => {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]) as Array<keyof ExportRow>;
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => csvCell(row[header])).join(","),
    ),
  ];
  return lines.join("\r\n");
};

export const toJson = (
  portfolio: Portfolio,
  policy: ScoringPolicy = DEFAULT_POLICY,
): string =>
  JSON.stringify(
    {
      generatedBy: "SignalTower AI",
      policyVersion: policy.version,
      note: "Synthetic demonstration data. Derived fields are computed by the SignalTower engine.",
      initiatives: toExportRows(portfolio, policy),
    },
    null,
    2,
  );

/**
 * Trigger a client-side download.
 *
 * Kept in one place because revoking the object URL is easy to forget, and
 * leaking one per export is the kind of thing that never shows up in testing.
 */
export const downloadFile = (
  filename: string,
  contents: string,
  mimeType: string,
): void => {
  const blob = new Blob([contents], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
