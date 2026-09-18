import { DEFAULT_POLICY, nextStage, stageIndex } from "./policy";
import { applicableControls, effectiveState, isApproved } from "./readiness";
import type {
  ControlDefinition,
  Initiative,
  ScoringPolicy,
  Stage,
} from "./types";
import { STAGES } from "./types";

/**
 * Stage gates.
 *
 * A control gated at stage S must be `approved` before an initiative may enter
 * S. Advancing therefore requires every applicable control gated at or before
 * the target stage, which is what makes "why can this not move?" answerable
 * without a meeting.
 */

export interface GateVerdict {
  targetStage: Stage;
  /** Applicable controls required at or before `targetStage`. */
  required: ControlDefinition[];
  satisfied: ControlDefinition[];
  /** Required controls that are not yet approved. */
  blocking: ControlDefinition[];
  passed: boolean;
}

export const gateRequirements = (
  initiative: Initiative,
  targetStage: Stage,
  policy: ScoringPolicy = DEFAULT_POLICY,
): ControlDefinition[] => {
  const target = stageIndex(targetStage);
  return applicableControls(initiative, policy).filter(
    (control) => stageIndex(control.gate) <= target,
  );
};

export const evaluateGate = (
  initiative: Initiative,
  targetStage: Stage,
  policy: ScoringPolicy = DEFAULT_POLICY,
): GateVerdict => {
  const required = gateRequirements(initiative, targetStage, policy);
  const blocking = required.filter(
    (control) => !isApproved(initiative, control),
  );
  const satisfied = required.filter((control) =>
    isApproved(initiative, control),
  );
  return {
    targetStage,
    required,
    satisfied,
    blocking,
    passed: blocking.length === 0,
  };
};

/** Gate verdicts for every stage, for a progress ladder. */
export const evaluateAllGates = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): GateVerdict[] =>
  STAGES.map((stage) => evaluateGate(initiative, stage, policy));

/** The gate an initiative is currently trying to clear, or null at the end. */
export const nextGate = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): GateVerdict | null => {
  const target = nextStage(initiative.stage);
  return target ? evaluateGate(initiative, target, policy) : null;
};

/**
 * Every applicable control still needed to reach production readiness,
 * regardless of which gate will ask for it.
 *
 * This is deliberately wider than `nextGate().blocking`. A control that only
 * bites two gates from now is invisible to the team in front of it but very
 * visible to whoever owns review capacity, and it is the right denominator
 * for portfolio-level pattern and capacity analysis.
 */
export const outstandingControls = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): ControlDefinition[] =>
  gateRequirements(initiative, "Production Ready", policy).filter(
    (control) => !isApproved(initiative, control),
  );

/**
 * Controls the initiative's *current* stage already required but which were
 * never approved: evidence the organisation skipped on the way in.
 *
 * This is control debt. It is invisible in a status-field dashboard because
 * the stage field says the initiative arrived, and nothing re-checks whether
 * it qualified.
 */
export const controlDebt = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): ControlDefinition[] =>
  evaluateGate(initiative, initiative.stage, policy).blocking;

export const hasControlDebt = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): boolean => controlDebt(initiative, policy).length > 0;

/** True once an initiative is live in production or being monitored. */
export const isLive = (initiative: Initiative): boolean =>
  stageIndex(initiative.stage) >= stageIndex("Production");

/** True once an initiative has cleared control review and can ship. */
export const isProductionReady = (initiative: Initiative): boolean =>
  stageIndex(initiative.stage) >= stageIndex("Production Ready");

/** Evidence states of every applicable control, for tabular display. */
export const evidenceMatrix = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): Array<{
  control: ControlDefinition;
  state: ReturnType<typeof effectiveState>;
}> =>
  applicableControls(initiative, policy).map((control) => ({
    control,
    state: effectiveState(initiative, control),
  }));
