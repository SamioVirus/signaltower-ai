/**
 * SignalTower domain model.
 *
 * Design rule: this file describes *observable evidence* only. Nothing here
 * stores a conclusion. Readiness scores, blockers, gate verdicts, decision
 * rankings and forecasts are all derived by the engine from the evidence
 * below, so that changing one artifact's state changes every downstream
 * number consistently. See `docs/architecture.md`.
 */

export const STAGES = [
  "Intake",
  "Prioritized",
  "Pilot",
  "Control Review",
  "Production Ready",
  "Production",
  "Monitoring",
] as const;

export type Stage = (typeof STAGES)[number];

export const RISK_TIERS = ["Low", "Moderate", "High", "Restricted"] as const;
export type RiskTier = (typeof RISK_TIERS)[number];

/**
 * The state of a single control artifact.
 *
 * `not_applicable` is materially different from `approved`: an inapplicable
 * control is removed from the denominator entirely rather than scored as a
 * free pass. See `readiness.ts`.
 */
export const EVIDENCE_STATES = [
  "missing",
  "in_progress",
  "partial",
  "approved",
  "not_applicable",
] as const;
export type EvidenceState = (typeof EVIDENCE_STATES)[number];

export const CONTROL_IDS = [
  "sponsor",
  "kpi-baseline",
  "data-quality",
  "lineage",
  "security-review",
  "privacy-review",
  "model-risk",
  "human-oversight",
  "monitoring",
  "value-tracking",
  "vendor-risk",
  "agentic-controls",
] as const;
export type ControlId = (typeof CONTROL_IDS)[number];

export type ControlCategory = "Value" | "Data" | "Risk" | "Operations";

export type DataClassification =
  "Public" | "Internal" | "Confidential" | "Restricted";
export type VendorDependency = "None" | "Low" | "Moderate" | "High";

export type BusinessFunction =
  | "Front Office / Corporate Banking"
  | "Risk / Credit"
  | "Compliance / Financial Crime"
  | "Corporate / Procurement"
  | "Operations"
  | "Legal / Compliance"
  | "Operations / KYC"
  | "Corporate Functions"
  | "Cybersecurity"
  | "Finance"
  | "Markets / Research"
  | "Data Governance";

/** A single piece of control evidence attached to an initiative. */
export interface EvidenceArtifact {
  state: EvidenceState;
  /** Team accountable for moving this artifact to `approved`. */
  owner: string;
  /** Days since this artifact last changed state. Drives ageing pressure. */
  ageDays: number;
  /** Short, factual note describing what exists today. */
  note: string;
}

export interface Kpi {
  metric: string;
  baseline: string;
  target: string;
  /** False when the initiative has no measured starting point yet. */
  isBaselined: boolean;
}

export interface InitiativeData {
  sources: string[];
  classification: DataClassification;
  /** 0-100 measured data-quality score for the sources above. */
  qualityScore: number;
}

export interface InitiativeModel {
  type: string;
  vendorDependency: VendorDependency;
  /** True when the workflow can take actions, not just produce text. */
  isAgentic: boolean;
  injectionControls: string;
}

export interface Initiative {
  id: string;
  name: string;
  description: string;
  businessFunction: BusinessFunction;
  stage: Stage;
  riskTier: RiskTier;
  /** Annual value at stake in USD, as estimated by the business sponsor. */
  annualValueUsd: number;
  /** Days the initiative has been sitting in its current stage. */
  stageAgeDays: number;
  sponsor: string;
  productOwner: string;
  controlOwner: string;
  deliveryTeam: string;
  intendedUsers: string;
  kpi: Kpi;
  data: InitiativeData;
  model: InitiativeModel;
  evidence: Record<ControlId, EvidenceArtifact>;
  postLaunchMetrics: string[];
}

export type Portfolio = readonly Initiative[];

/** How much readiness credit each evidence state earns, before weighting. */
export type CreditMap = Record<
  Exclude<EvidenceState, "not_applicable">,
  number
>;

export interface ControlDefinition {
  id: ControlId;
  label: string;
  shortLabel: string;
  category: ControlCategory;
  description: string;
  /**
   * Relative importance per risk tier. Model risk matters far more for a
   * Restricted workflow than a Low one, and the weighting says so in code
   * rather than in a policy document nobody runs.
   */
  weight: Record<RiskTier, number>;
  /** The stage by which this control must be `approved` to advance. */
  gate: Stage;
  /** Controls that only apply to some initiatives (vendor, agentic). */
  appliesWhen?: (initiative: Initiative) => boolean;
  remediation: {
    action: string;
    /** Working days of control-team effort to move missing -> approved. */
    effortDays: number;
    owningFunction: string;
  };
}

export interface ScoringPolicy {
  version: string;
  credit: CreditMap;
  controls: readonly ControlDefinition[];
  /** Ageing beyond this many days no longer increases blocker severity. */
  ageSaturationDays: number;
  /** A control blocking at least this many initiatives is a systemic issue. */
  systemicThreshold: number;
}
