import type {
  ControlDefinition,
  CreditMap,
  ControlId,
  ScoringPolicy,
  Stage,
} from "./types";
import { STAGES } from "./types";

/**
 * The production-readiness policy, expressed as data the engine executes.
 *
 * Every number a leader sees in SignalTower traces back to this file. Changing
 * a weight here changes readiness scores, blocker severity, decision ranking
 * and the conversion forecast in one move, which is the point of keeping the
 * policy executable instead of writing it into a standard that drifts away
 * from the tooling that is supposed to enforce it.
 */

/** Position of a stage in the governed path to production. */
export const stageIndex = (stage: Stage): number => STAGES.indexOf(stage);

/** The stage an initiative is trying to reach next, or null at the end. */
export const nextStage = (stage: Stage): Stage | null =>
  STAGES[stageIndex(stage) + 1] ?? null;

/**
 * Readiness credit per evidence state.
 *
 * `in_progress` earns less than `partial` deliberately: work having started is
 * weaker evidence than an artifact that exists but is incomplete.
 */
export const DEFAULT_CREDIT: CreditMap = {
  missing: 0,
  in_progress: 0.35,
  partial: 0.6,
  approved: 1,
};

const CONTROLS: readonly ControlDefinition[] = [
  {
    id: "sponsor",
    label: "Accountable executive sponsor",
    shortLabel: "Sponsor",
    category: "Value",
    description:
      "A named executive who owns the business outcome and can authorise the change in how the work gets done.",
    weight: { Low: 1, Moderate: 1, High: 1.2, Restricted: 1.2 },
    gate: "Prioritized",
    remediation: {
      action: "Confirm the accountable executive sponsor in writing",
      effortDays: 2,
      owningFunction: "AI Portfolio Office",
    },
  },
  {
    id: "kpi-baseline",
    label: "KPI baseline and target",
    shortLabel: "KPI baseline",
    category: "Value",
    description:
      "A measured starting point and an agreed target, so realised value can be proven rather than asserted after launch.",
    weight: { Low: 1.2, Moderate: 1.2, High: 1.2, Restricted: 1.2 },
    gate: "Pilot",
    remediation: {
      action:
        "Measure the current-state baseline and agree a target with the sponsor",
      effortDays: 8,
      owningFunction: "Business Analytics",
    },
  },
  {
    id: "data-quality",
    label: "Data quality validated",
    shortLabel: "Data quality",
    category: "Data",
    description:
      "Source data profiled against the quality thresholds the use case depends on.",
    weight: { Low: 1, Moderate: 1.2, High: 1.4, Restricted: 1.5 },
    gate: "Control Review",
    remediation: {
      action: "Profile source data and remediate fields below threshold",
      effortDays: 15,
      owningFunction: "Data Governance Office",
    },
  },
  {
    id: "lineage",
    label: "Data lineage documented",
    shortLabel: "Lineage",
    category: "Data",
    description:
      "Every field the workflow consumes has a documented origin and a named data owner.",
    weight: { Low: 0.8, Moderate: 1.2, High: 1.5, Restricted: 1.8 },
    gate: "Control Review",
    remediation: {
      action:
        "Document lineage and assign data owners for the remaining fields",
      effortDays: 10,
      owningFunction: "Data Governance Office",
    },
  },
  {
    id: "security-review",
    label: "Security review",
    shortLabel: "Security",
    category: "Risk",
    description:
      "Architecture, access paths and prompt-injection exposure reviewed and signed off.",
    weight: { Low: 1, Moderate: 1.3, High: 1.6, Restricted: 2 },
    gate: "Control Review",
    remediation: {
      action: "Complete security architecture review and close findings",
      effortDays: 12,
      owningFunction: "Cybersecurity Architecture",
    },
  },
  {
    id: "privacy-review",
    label: "Privacy review",
    shortLabel: "Privacy",
    category: "Risk",
    description:
      "Privacy impact assessed for the personal data in scope, with a retention and minimisation position.",
    weight: { Low: 0.8, Moderate: 1.2, High: 1.5, Restricted: 1.8 },
    gate: "Control Review",
    remediation: {
      action: "Complete the privacy impact assessment",
      effortDays: 10,
      owningFunction: "Privacy Office",
    },
  },
  {
    id: "model-risk",
    label: "Model risk review",
    shortLabel: "Model risk",
    category: "Risk",
    description:
      "Independent review of model behaviour, limitations, validation evidence and failure modes.",
    weight: { Low: 0.7, Moderate: 1.4, High: 2, Restricted: 2.4 },
    gate: "Production Ready",
    remediation: {
      action: "Complete independent model risk review and validation evidence",
      effortDays: 20,
      owningFunction: "Model Risk Management",
    },
  },
  {
    id: "human-oversight",
    label: "Human-in-the-loop design",
    shortLabel: "Human oversight",
    category: "Operations",
    description:
      "A named reviewer, a defined override path, and logging of what the reviewer changed.",
    weight: { Low: 0.8, Moderate: 1.4, High: 1.8, Restricted: 2 },
    gate: "Production Ready",
    remediation: {
      action:
        "Define reviewer accountability, override path and override logging",
      effortDays: 8,
      owningFunction: "Business Control Owner",
    },
  },
  {
    id: "monitoring",
    label: "Monitoring plan",
    shortLabel: "Monitoring",
    category: "Operations",
    description:
      "Post-launch signals, thresholds, owners and the fallback procedure when quality degrades.",
    weight: { Low: 1, Moderate: 1.3, High: 1.5, Restricted: 1.8 },
    gate: "Production Ready",
    remediation: {
      action:
        "Define monitoring signals, thresholds, owners and fallback procedure",
      effortDays: 10,
      owningFunction: "AI Operations",
    },
  },
  {
    id: "value-tracking",
    label: "Value realisation tracking",
    shortLabel: "Value tracking",
    category: "Value",
    description:
      "An agreed mechanism to measure realised value against the baseline after launch.",
    weight: { Low: 1, Moderate: 1, High: 1, Restricted: 1 },
    gate: "Production",
    remediation: {
      action: "Instrument value tracking against the agreed KPI baseline",
      effortDays: 6,
      owningFunction: "Business Analytics",
    },
  },
  {
    id: "vendor-risk",
    label: "Vendor risk assessment",
    shortLabel: "Vendor risk",
    category: "Risk",
    description:
      "Third-party dependency assessed for concentration, data handling and exit.",
    // Only meaningful where a third party is actually in the path.
    appliesWhen: (initiative) => initiative.model.vendorDependency !== "None",
    weight: { Low: 0.6, Moderate: 1, High: 1.4, Restricted: 1.6 },
    gate: "Control Review",
    remediation: {
      action: "Complete vendor risk assessment and document the exit position",
      effortDays: 12,
      owningFunction: "Vendor Risk Management",
    },
  },
  {
    id: "agentic-controls",
    label: "Autonomy limits and rollback",
    shortLabel: "Agentic controls",
    category: "Risk",
    description:
      "Explicit tool allowlist, approval gates, blast-radius limits and a tested rollback path.",
    // Only meaningful where the workflow can act, not merely draft.
    appliesWhen: (initiative) => initiative.model.isAgentic,
    weight: { Low: 1, Moderate: 1.6, High: 2.2, Restricted: 2.6 },
    gate: "Pilot",
    remediation: {
      action:
        "Define autonomy limits, approval gates, blast radius and rollback plan",
      effortDays: 18,
      owningFunction: "Enterprise Data Controls",
    },
  },
];

export const DEFAULT_POLICY: ScoringPolicy = {
  version: "2026.09",
  credit: DEFAULT_CREDIT,
  controls: CONTROLS,
  ageSaturationDays: 180,
  systemicThreshold: 3,
};

export const controlById = (
  policy: ScoringPolicy,
  id: ControlId,
): ControlDefinition => {
  const control = policy.controls.find((candidate) => candidate.id === id);
  if (!control) throw new Error(`Unknown control: ${id}`);
  return control;
};
