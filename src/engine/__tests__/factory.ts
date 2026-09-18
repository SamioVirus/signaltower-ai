import type {
  ControlId,
  EvidenceArtifact,
  EvidenceState,
  Initiative,
} from "@/engine/types";
import { CONTROL_IDS } from "@/engine/types";

/**
 * Test factory.
 *
 * Tests build initiatives from an explicit base so that each one states only
 * the evidence it cares about. Asserting engine behaviour against the shipped
 * fixture would couple the tests to demo content and make them fail whenever
 * the narrative changes.
 */

const artifact = (state: EvidenceState): EvidenceArtifact => ({
  state,
  owner: "Test Owner",
  ageDays: 30,
  note: "test artifact",
});

export const evidenceAll = (
  state: EvidenceState,
): Record<ControlId, EvidenceArtifact> =>
  Object.fromEntries(CONTROL_IDS.map((id) => [id, artifact(state)])) as Record<
    ControlId,
    EvidenceArtifact
  >;

export const makeInitiative = (
  overrides: Partial<Initiative> = {},
): Initiative => ({
  id: "T-001",
  name: "Test Initiative",
  description: "A synthetic initiative used by the engine tests.",
  businessFunction: "Operations",
  stage: "Pilot",
  riskTier: "Moderate",
  annualValueUsd: 1_000_000,
  stageAgeDays: 30,
  sponsor: "Test Sponsor",
  productOwner: "Test Product Owner",
  controlOwner: "Test Control Owner",
  deliveryTeam: "Test Delivery Team",
  intendedUsers: "Test users",
  kpi: {
    metric: "Cycle time",
    baseline: "10 hours",
    target: "5 hours",
    isBaselined: true,
  },
  data: {
    sources: ["Test source"],
    classification: "Internal",
    qualityScore: 80,
  },
  model: {
    type: "Test workflow",
    vendorDependency: "None",
    isAgentic: false,
    injectionControls: "None required",
  },
  evidence: evidenceAll("approved"),
  postLaunchMetrics: ["Test metric"],
  ...overrides,
});

/** An initiative with every applicable control approved. */
export const fullyApproved = (
  overrides: Partial<Initiative> = {},
): Initiative =>
  makeInitiative({ evidence: evidenceAll("approved"), ...overrides });

/** An initiative with no evidence at all. */
export const nothingDone = (overrides: Partial<Initiative> = {}): Initiative =>
  makeInitiative({ evidence: evidenceAll("missing"), ...overrides });

/** Copy an initiative with specific controls set to a state. */
export const withEvidence = (
  initiative: Initiative,
  states: Partial<Record<ControlId, EvidenceState>>,
): Initiative => {
  const evidence = { ...initiative.evidence };
  for (const [id, state] of Object.entries(states) as Array<
    [ControlId, EvidenceState]
  >) {
    evidence[id] = { ...evidence[id], state };
  }
  return { ...initiative, evidence };
};
