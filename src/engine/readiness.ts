import { DEFAULT_POLICY } from "./policy";
import type {
  ControlDefinition,
  ControlId,
  EvidenceArtifact,
  EvidenceState,
  Initiative,
  ScoringPolicy,
} from "./types";

export type ReadinessBand =
  | "Not ready"
  | "Needs remediation"
  | "Reviewable"
  | "Production candidate"
  | "Production ready";

/** One control's contribution to an initiative's readiness score. */
export interface ControlContribution {
  controlId: ControlId;
  control: ControlDefinition;
  artifact: EvidenceArtifact;
  /** Effective state: `not_applicable` when the control does not apply here. */
  state: EvidenceState;
  /** Credit earned for the state, 0-1. */
  credit: number;
  /** Weight for this initiative's risk tier. */
  weight: number;
  /** Score points this control actually contributed. */
  pointsEarned: number;
  /** Score points this control could contribute at full approval. */
  pointsAvailable: number;
  /** Score points currently being lost here. The number leaders act on. */
  pointsLost: number;
}

export interface ReadinessResult {
  score: number;
  band: ReadinessBand;
  /** Sorted by `pointsLost` descending: the cost-ordered remediation list. */
  contributions: ControlContribution[];
  applicable: ControlId[];
  notApplicable: ControlId[];
}

const NOT_APPLICABLE: EvidenceState = "not_applicable";

/**
 * Whether a control applies to this initiative.
 *
 * Applicability is decided by the policy, never by the stored evidence. A
 * non-agentic workflow carrying a stale `agentic-controls` artifact is still
 * scored as if that control does not exist.
 */
export const controlApplies = (
  control: ControlDefinition,
  initiative: Initiative,
): boolean => (control.appliesWhen ? control.appliesWhen(initiative) : true);

export const applicableControls = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): ControlDefinition[] =>
  policy.controls.filter((control) => controlApplies(control, initiative));

/** Effective state of a control, collapsing inapplicable controls. */
export const effectiveState = (
  initiative: Initiative,
  control: ControlDefinition,
): EvidenceState => {
  if (!controlApplies(control, initiative)) return NOT_APPLICABLE;
  return initiative.evidence[control.id]?.state ?? "missing";
};

export const isApproved = (
  initiative: Initiative,
  control: ControlDefinition,
): boolean => effectiveState(initiative, control) === "approved";

const BANDS: Array<{ min: number; band: ReadinessBand }> = [
  { min: 90, band: "Production ready" },
  { min: 80, band: "Production candidate" },
  { min: 60, band: "Reviewable" },
  { min: 40, band: "Needs remediation" },
  { min: 0, band: "Not ready" },
];

export const bandForScore = (score: number): ReadinessBand =>
  BANDS.find((entry) => score >= entry.min)?.band ?? "Not ready";

/**
 * Derive an initiative's readiness score from its evidence.
 *
 * The score is a weighted percentage of achievable control credit, where
 * weights come from the policy and vary by risk tier. Inapplicable controls
 * are excluded from the denominator rather than counted as passes, so a
 * non-agentic workflow is not rewarded for lacking agentic controls.
 */
export const scoreInitiative = (
  initiative: Initiative,
  policy: ScoringPolicy = DEFAULT_POLICY,
): ReadinessResult => {
  const applicable: ControlId[] = [];
  const notApplicable: ControlId[] = [];
  const rows: Array<
    Omit<ControlContribution, "pointsEarned" | "pointsAvailable" | "pointsLost">
  > = [];

  let weightTotal = 0;
  let weightEarned = 0;

  for (const control of policy.controls) {
    const state = effectiveState(initiative, control);
    if (state === NOT_APPLICABLE) {
      notApplicable.push(control.id);
      continue;
    }
    applicable.push(control.id);

    const weight = control.weight[initiative.riskTier];
    const credit = policy.credit[state];
    weightTotal += weight;
    weightEarned += weight * credit;

    rows.push({
      controlId: control.id,
      control,
      artifact: initiative.evidence[control.id],
      state,
      credit,
      weight,
    });
  }

  // Guard the degenerate case rather than emitting NaN into the UI.
  const ratio = weightTotal === 0 ? 0 : weightEarned / weightTotal;
  const score = Math.round(ratio * 100);

  const contributions: ControlContribution[] = rows
    .map((row) => {
      const pointsAvailable =
        weightTotal === 0 ? 0 : (row.weight / weightTotal) * 100;
      const pointsEarned = pointsAvailable * row.credit;
      return {
        ...row,
        pointsAvailable,
        pointsEarned,
        pointsLost: pointsAvailable - pointsEarned,
      };
    })
    .sort(
      (a, b) =>
        b.pointsLost - a.pointsLost ||
        a.control.label.localeCompare(b.control.label),
    );

  return {
    score,
    band: bandForScore(score),
    contributions,
    applicable,
    notApplicable,
  };
};

/** Readiness scores for a whole portfolio, keyed by initiative id. */
export const scorePortfolio = (
  initiatives: readonly Initiative[],
  policy: ScoringPolicy = DEFAULT_POLICY,
): Map<string, ReadinessResult> =>
  new Map(
    initiatives.map((initiative) => [
      initiative.id,
      scoreInitiative(initiative, policy),
    ]),
  );
