import { evaluateGate, isProductionReady } from "./gates";
import { DEFAULT_POLICY, nextStage, stageIndex } from "./policy";
import type {
  ControlId,
  Initiative,
  Portfolio,
  ScoringPolicy,
  Stage,
} from "./types";

/**
 * Scenario modelling.
 *
 * A scenario is a set of remediations a leader is considering approving. The
 * engine applies them to a copy of the portfolio and re-derives everything, so
 * the question "what would this decision actually buy us?" is answered by the
 * same code that produced the current-state numbers rather than by a separate
 * spreadsheet that quietly disagrees.
 */

export interface RemediationAction {
  initiativeId: string;
  controlId: ControlId;
}

export interface Scenario {
  actions: RemediationAction[];
}

export const emptyScenario = (): Scenario => ({ actions: [] });

export const actionKey = (action: RemediationAction): string =>
  `${action.initiativeId}::${action.controlId}`;

export const hasAction = (
  scenario: Scenario,
  action: RemediationAction,
): boolean =>
  scenario.actions.some(
    (candidate) => actionKey(candidate) === actionKey(action),
  );

export const toggleAction = (
  scenario: Scenario,
  action: RemediationAction,
): Scenario =>
  hasAction(scenario, action)
    ? {
        actions: scenario.actions.filter(
          (candidate) => actionKey(candidate) !== actionKey(action),
        ),
      }
    : { actions: [...scenario.actions, action] };

/**
 * The furthest stage reachable from evidence alone.
 *
 * Evidence can carry an initiative to Production Ready. Going live is a
 * release decision with an operational tail, not another artifact, so the
 * simulation stops there rather than pretending approvals ship software.
 */
const MAX_SIMULATED_STAGE: Stage = "Production Ready";

/** Promote an initiative as far as its evidence now allows. */
export const advanceInitiative = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): Initiative => {
  if (isProductionReady(initiative)) return initiative;

  let current = initiative;
  for (;;) {
    const target = nextStage(current.stage);
    if (!target || stageIndex(target) > stageIndex(MAX_SIMULATED_STAGE))
      return current;
    if (!evaluateGate(current, target, policy).passed) return current;
    // A freshly promoted initiative has just entered its new stage.
    current = { ...current, stage: target, stageAgeDays: 0 };
  }
};

/**
 * Apply a scenario: mark the chosen controls approved, then let every
 * initiative advance as far as the gates now permit.
 */
export const applyScenario = (
  portfolio: Portfolio,
  scenario: Scenario,
  policy: ScoringPolicy = DEFAULT_POLICY,
): Initiative[] => {
  const byInitiative = new Map<string, Set<ControlId>>();
  for (const action of scenario.actions) {
    const set = byInitiative.get(action.initiativeId) ?? new Set<ControlId>();
    set.add(action.controlId);
    byInitiative.set(action.initiativeId, set);
  }

  return portfolio.map((initiative) => {
    const approved = byInitiative.get(initiative.id);
    if (!approved || approved.size === 0) return initiative;

    const evidence = { ...initiative.evidence };
    for (const controlId of approved) {
      const artifact = evidence[controlId];
      if (!artifact) continue;
      evidence[controlId] = { ...artifact, state: "approved", ageDays: 0 };
    }

    return advanceInitiative({ ...initiative, evidence }, policy);
  });
};

/** Total control effort the scenario commits, in working days. */
export const scenarioEffortDays = (
  portfolio: Portfolio,
  scenario: Scenario,
  policy: ScoringPolicy = DEFAULT_POLICY,
): number => {
  const byId = new Map(
    portfolio.map((initiative) => [initiative.id, initiative]),
  );
  return scenario.actions.reduce((total, action) => {
    const initiative = byId.get(action.initiativeId);
    if (!initiative) return total;
    const control = policy.controls.find(
      (candidate) => candidate.id === action.controlId,
    );
    return total + (control?.remediation.effortDays ?? 0);
  }, 0);
};
