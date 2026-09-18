import {
  ageFactor,
  blockerPatterns,
  deriveBlockers,
  deriveGaps,
} from "./blockers";
import { DEFAULT_POLICY } from "./policy";
import { scoreInitiative } from "./readiness";
import type { ControlId, Initiative, ScoringPolicy } from "./types";

/**
 * Decision ranking.
 *
 * Two kinds of decision come out of the same evidence. An *initiative*
 * decision unblocks one workflow. A *systemic* decision builds the reusable
 * control pattern that several workflows are each independently waiting for,
 * and is usually the better buy: one piece of work, many unlocks.
 *
 * The ranking is deterministic and every input is shown to the reader, because
 * a leadership decision queue nobody can interrogate does not get used twice.
 */

export type DecisionKind = "initiative" | "systemic";

export interface DecisionExplanation {
  valueUnlockedUsd: number;
  effortDays: number;
  effortWeeks: number;
  confidence: number;
  urgency: number;
  leverage: number;
  /** Effort if every affected initiative remediated separately. */
  effortIfDoneSeparatelyDays: number;
}

export interface Decision {
  id: string;
  kind: DecisionKind;
  title: string;
  rationale: string;
  requiredDecision: string;
  owner: string;
  initiativeIds: string[];
  controlIds: ControlId[];
  valueUnlockedUsd: number;
  effortDays: number;
  horizon: string;
  score: number;
  explanation: DecisionExplanation;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * How likely remediation is to actually convert this initiative.
 *
 * Readiness is the best available proxy: an initiative already carrying most
 * of its evidence is far more likely to convert once the last gap closes than
 * one where this blocker is the first of many.
 */
export const confidenceFromReadiness = (score: number): number =>
  clamp(0.3 + 0.65 * (score / 100), 0.3, 0.95);

const horizonFor = (effortDays: number, urgency: number): string => {
  if (urgency >= 1.6 && effortDays <= 8) return "This week";
  if (effortDays <= 12) return "Within 2 weeks";
  if (effortDays <= 20) return "This month";
  return "This quarter";
};

/** Score a decision. Higher is a better use of the next unit of capacity. */
const decisionScore = (explanation: DecisionExplanation): number => {
  const valueMillions = explanation.valueUnlockedUsd / 1_000_000;
  const weeks = Math.max(explanation.effortWeeks, 0.2);
  return (
    (valueMillions *
      explanation.confidence *
      explanation.urgency *
      explanation.leverage) /
    weeks
  );
};

export const rankDecisions = (
  initiatives: readonly Initiative[],
  policy: ScoringPolicy = DEFAULT_POLICY,
): Decision[] => {
  const byId = new Map(
    initiatives.map((initiative) => [initiative.id, initiative]),
  );
  const decisions: Decision[] = [];

  // --- Systemic decisions: one control blocking several initiatives. --------
  const patterns = blockerPatterns(initiatives, policy);
  const systemicControlIds = new Set<ControlId>();

  for (const pattern of patterns.filter((candidate) => candidate.isSystemic)) {
    systemicControlIds.add(pattern.controlId);

    const affected = pattern.initiativeIds
      .map((id) => byId.get(id))
      .filter((initiative): initiative is Initiative => Boolean(initiative));

    const separately = affected.reduce(
      (total, initiative) =>
        total +
        (deriveGaps(initiative, policy).find(
          (blocker) => blocker.controlId === pattern.controlId,
        )?.effortDays ?? pattern.control.remediation.effortDays),
      0,
    );

    // Building the pattern once costs more than one instance, far less than N.
    const effortDays = Math.round(pattern.control.remediation.effortDays * 1.5);
    const urgency = clamp(
      affected.reduce(
        (worst, initiative) =>
          Math.max(worst, ageFactor(initiative.stageAgeDays, policy)),
        1,
      ),
      1,
      2,
    );
    const confidence =
      affected.reduce(
        (total, initiative) =>
          total +
          confidenceFromReadiness(scoreInitiative(initiative, policy).score),
        0,
      ) / Math.max(affected.length, 1);

    const explanation: DecisionExplanation = {
      valueUnlockedUsd: pattern.valueTrappedUsd,
      effortDays,
      effortWeeks: effortDays / 5,
      confidence,
      urgency,
      leverage: 1 + 0.15 * (pattern.count - 1),
      effortIfDoneSeparatelyDays: separately,
    };

    decisions.push({
      id: `systemic:${pattern.controlId}`,
      kind: "systemic",
      title: `Build a reusable ${pattern.control.shortLabel.toLowerCase()} pattern instead of ${pattern.count} one-off reviews`,
      rationale: `${pattern.control.label} is the blocking control on ${pattern.count} initiatives holding ${formatUsdShort(pattern.valueTrappedUsd)} of annual value. Each team is solving it separately, at roughly ${separately} days of control effort in total.`,
      requiredDecision: `Fund and assign an owner for a reusable ${pattern.control.shortLabel.toLowerCase()} template, then apply it across the affected initiatives.`,
      owner: pattern.control.remediation.owningFunction,
      initiativeIds: pattern.initiativeIds,
      controlIds: [pattern.controlId],
      valueUnlockedUsd: pattern.valueTrappedUsd,
      effortDays,
      horizon: horizonFor(effortDays, urgency),
      score: decisionScore(explanation),
      explanation,
    });
  }

  // --- Initiative decisions: clear the next gate for one workflow. ----------
  for (const initiative of initiatives) {
    const blockers = deriveBlockers(initiative, policy);
    if (blockers.length === 0) continue;

    // Controls already covered by a systemic decision are not re-proposed as
    // individual work; that would double-count the same remediation.
    const ownControls = blockers.filter(
      (blocker) => !systemicControlIds.has(blocker.controlId),
    );
    if (ownControls.length === 0) continue;

    const readiness = scoreInitiative(initiative, policy);
    const effortDays = ownControls.reduce(
      (total, blocker) => total + blocker.effortDays,
      0,
    );
    const urgency = clamp(ageFactor(initiative.stageAgeDays, policy), 1, 2);
    const lead = ownControls[0];

    const explanation: DecisionExplanation = {
      valueUnlockedUsd: initiative.annualValueUsd,
      effortDays,
      effortWeeks: effortDays / 5,
      confidence: confidenceFromReadiness(readiness.score),
      urgency,
      leverage: 1,
      effortIfDoneSeparatelyDays: effortDays,
    };

    const controlList = ownControls.map((blocker) =>
      blocker.control.shortLabel.toLowerCase(),
    );
    decisions.push({
      id: `initiative:${initiative.id}`,
      kind: "initiative",
      title: `${lead.action} for ${initiative.name}`,
      rationale: `${initiative.name} is ${readiness.score}% ready and has been in ${initiative.stage} for ${initiative.stageAgeDays} days. ${
        ownControls.length === 1
          ? `The only control still blocking the next gate is ${controlList[0]}.`
          : `Controls still blocking the next gate: ${controlList.join(", ")}.`
      }`,
      requiredDecision: `Assign an accountable owner and approve ${effortDays} days of control effort to clear the next gate.`,
      owner: lead.owner,
      initiativeIds: [initiative.id],
      controlIds: ownControls.map((blocker) => blocker.controlId),
      valueUnlockedUsd: initiative.annualValueUsd,
      effortDays,
      horizon: horizonFor(effortDays, urgency),
      score: decisionScore(explanation),
      explanation,
    });
  }

  return decisions.sort(
    (a, b) => b.score - a.score || a.title.localeCompare(b.title),
  );
};

/** Local short-form currency used inside generated rationale sentences. */
function formatUsdShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}
