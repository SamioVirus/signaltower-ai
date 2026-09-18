import { nextGate, outstandingControls } from "./gates";
import { DEFAULT_POLICY } from "./policy";
import { effectiveState } from "./readiness";
import type {
  ControlDefinition,
  ControlId,
  Initiative,
  ScoringPolicy,
} from "./types";

/**
 * Blockers and gaps.
 *
 * A blocker is not a status somebody typed. It is a control that a stage gate
 * requires and that the evidence does not yet satisfy. Severity combines how
 * much the policy weights the control, how far the evidence falls short, and
 * how long it has been sitting there.
 *
 * Two horizons matter and they answer different questions:
 *
 * - `deriveBlockers` — what is stopping this initiative from taking its *next*
 *   step. This is the delivery team's question.
 * - `deriveGaps` — every control still missing before production, including
 *   ones that will not bite for another two gates. This is the control
 *   function's question, and it is the right basis for portfolio patterns and
 *   capacity planning. Scoping patterns to the next gate would hide the worst
 *   data-quality gap in the portfolio simply because that initiative has not
 *   reached the gate that checks it yet.
 */

export interface Blocker {
  initiativeId: string;
  control: ControlDefinition;
  controlId: ControlId;
  /** 0-1, how far short of approved the evidence falls. */
  shortfall: number;
  ageDays: number;
  /** Weighted, age-amplified severity. Comparable across initiatives. */
  severity: number;
  owner: string;
  action: string;
  effortDays: number;
  /** True when this control blocks the initiative's immediate next gate. */
  blocksNextGate: boolean;
}

/**
 * Ageing amplifies severity up to 2x at the saturation point, then stops.
 * Unbounded ageing would let one very old item dominate every ranking.
 */
export const ageFactor = (
  ageDays: number,
  policy: ScoringPolicy = DEFAULT_POLICY,
): number =>
  1 +
  Math.min(Math.max(ageDays, 0), policy.ageSaturationDays) /
    policy.ageSaturationDays;

const toBlocker = (
  initiative: Initiative,
  control: ControlDefinition,
  policy: ScoringPolicy,
  blocksNextGate: boolean,
): Blocker => {
  const state = effectiveState(initiative, control);
  const credit = state === "not_applicable" ? 1 : policy.credit[state];
  const shortfall = 1 - credit;
  const artifact = initiative.evidence[control.id];
  const ageDays = artifact?.ageDays ?? initiative.stageAgeDays;
  const weight = control.weight[initiative.riskTier];

  return {
    initiativeId: initiative.id,
    control,
    controlId: control.id,
    shortfall,
    ageDays,
    severity: weight * shortfall * ageFactor(ageDays, policy),
    owner: artifact?.owner ?? control.remediation.owningFunction,
    action: control.remediation.action,
    effortDays: control.remediation.effortDays,
    blocksNextGate,
  };
};

const bySeverity = (a: Blocker, b: Blocker): number =>
  b.severity - a.severity || a.control.label.localeCompare(b.control.label);

/** Controls blocking the initiative's immediate next gate. */
export const deriveBlockers = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): Blocker[] => {
  const gate = nextGate(initiative, policy);
  if (!gate) return [];
  return gate.blocking
    .map((control) => toBlocker(initiative, control, policy, true))
    .sort(bySeverity);
};

/** Every control still outstanding before production, next gate or later. */
export const deriveGaps = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): Blocker[] => {
  const gate = nextGate(initiative, policy);
  const blockingNow = new Set(
    gate?.blocking.map((control) => control.id) ?? [],
  );
  return outstandingControls(initiative, policy)
    .map((control) =>
      toBlocker(initiative, control, policy, blockingNow.has(control.id)),
    )
    .sort(bySeverity);
};

export const primaryBlocker = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): Blocker | null => deriveBlockers(initiative, policy)[0] ?? null;

export const isBlocked = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): boolean => deriveBlockers(initiative, policy).length > 0;

export interface BlockerPattern {
  controlId: ControlId;
  control: ControlDefinition;
  /** Initiatives this control is currently outstanding on. */
  initiativeIds: string[];
  count: number;
  /** How many of those it is blocking right now, at the next gate. */
  blockingNowCount: number;
  /** Annual value sitting behind this control across the portfolio. */
  valueTrappedUsd: number;
  totalSeverity: number;
  totalEffortDays: number;
  /** True once the control blocks enough initiatives to be worth fixing once. */
  isSystemic: boolean;
}

/**
 * Group outstanding controls by control across the portfolio.
 *
 * The portfolio view is what turns a queue of individual escalations into an
 * operating-model problem: one control outstanding on six initiatives is a
 * template that does not exist, not six unrelated delays.
 */
export const blockerPatterns = (
  initiatives: readonly Initiative[],
  policy: ScoringPolicy = DEFAULT_POLICY,
): BlockerPattern[] => {
  const byControl = new Map<ControlId, BlockerPattern>();

  for (const initiative of initiatives) {
    for (const gap of deriveGaps(initiative, policy)) {
      const existing = byControl.get(gap.controlId);
      if (existing) {
        existing.initiativeIds.push(initiative.id);
        existing.count += 1;
        existing.blockingNowCount += gap.blocksNextGate ? 1 : 0;
        existing.valueTrappedUsd += initiative.annualValueUsd;
        existing.totalSeverity += gap.severity;
        existing.totalEffortDays += gap.effortDays;
      } else {
        byControl.set(gap.controlId, {
          controlId: gap.controlId,
          control: gap.control,
          initiativeIds: [initiative.id],
          count: 1,
          blockingNowCount: gap.blocksNextGate ? 1 : 0,
          valueTrappedUsd: initiative.annualValueUsd,
          totalSeverity: gap.severity,
          totalEffortDays: gap.effortDays,
          isSystemic: false,
        });
      }
    }
  }

  return [...byControl.values()]
    .map((pattern) => ({
      ...pattern,
      // Systemic keys off how many initiatives the control is blocking *right
      // now*, not how many will eventually need it. Against the full gap
      // horizon almost every control clears a low threshold, and a signal that
      // fires on everything is not a signal. What earns a template is several
      // teams being stopped by the same control at the same time.
      isSystemic: pattern.blockingNowCount >= policy.systemicThreshold,
    }))
    .sort(
      (a, b) =>
        b.valueTrappedUsd - a.valueTrappedUsd ||
        b.count - a.count ||
        a.control.label.localeCompare(b.control.label),
    );
};
