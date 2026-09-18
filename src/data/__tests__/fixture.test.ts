import { describe, expect, it } from "vitest";

import { FEATURED_INITIATIVE_ID, portfolio } from "@/data/portfolio";
import { DEFAULT_POLICY } from "@/engine/policy";
import { controlApplies, scoreInitiative } from "@/engine/readiness";
import {
  CONTROL_IDS,
  EVIDENCE_STATES,
  RISK_TIERS,
  STAGES,
} from "@/engine/types";

/**
 * Fixture integrity.
 *
 * The demo data is content, and content drifts. These invariants make drift
 * fail the build instead of quietly producing a dashboard that says something
 * untrue: an evidence entry missing from an initiative, a control marked
 * inapplicable that the policy says applies, a value that cannot be a value.
 */

describe("portfolio fixture", () => {
  it("is not empty", () => {
    expect(portfolio.length).toBeGreaterThan(0);
  });

  it("has unique initiative ids", () => {
    const ids = portfolio.map((initiative) => initiative.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("features an initiative that exists", () => {
    expect(
      portfolio.some((initiative) => initiative.id === FEATURED_INITIATIVE_ID),
    ).toBe(true);
  });

  describe.each(
    portfolio.map((initiative) => [initiative.id, initiative] as const),
  )("%s", (_id, initiative) => {
    it("carries an evidence entry for every control", () => {
      for (const controlId of CONTROL_IDS) {
        expect(initiative.evidence[controlId]).toBeDefined();
      }
    });

    it("uses only valid evidence states", () => {
      for (const controlId of CONTROL_IDS) {
        expect(EVIDENCE_STATES).toContain(initiative.evidence[controlId].state);
      }
    });

    it("marks a control not_applicable exactly when the policy says it does not apply", () => {
      // The single most useful invariant here: it catches an initiative
      // whose model flags say one thing while its evidence says another.
      for (const control of DEFAULT_POLICY.controls) {
        const applies = controlApplies(control, initiative);
        const marked =
          initiative.evidence[control.id].state === "not_applicable";
        expect(marked).toBe(!applies);
      }
    });

    it("uses a valid stage and risk tier", () => {
      expect(STAGES).toContain(initiative.stage);
      expect(RISK_TIERS).toContain(initiative.riskTier);
    });

    it("has a plausible value at stake", () => {
      expect(initiative.annualValueUsd).toBeGreaterThan(0);
      expect(Number.isFinite(initiative.annualValueUsd)).toBe(true);
    });

    it("has non-negative ages", () => {
      expect(initiative.stageAgeDays).toBeGreaterThanOrEqual(0);
      for (const controlId of CONTROL_IDS) {
        expect(initiative.evidence[controlId].ageDays).toBeGreaterThanOrEqual(
          0,
        );
      }
    });

    it("has a data quality score within range", () => {
      expect(initiative.data.qualityScore).toBeGreaterThanOrEqual(0);
      expect(initiative.data.qualityScore).toBeLessThanOrEqual(100);
    });

    it("describes itself", () => {
      expect(initiative.name.length).toBeGreaterThan(0);
      expect(initiative.description.length).toBeGreaterThan(20);
      expect(initiative.data.sources.length).toBeGreaterThan(0);
      expect(initiative.postLaunchMetrics.length).toBeGreaterThan(0);
    });

    it("notes every applicable evidence artifact", () => {
      for (const control of DEFAULT_POLICY.controls) {
        if (!controlApplies(control, initiative)) continue;
        expect(initiative.evidence[control.id].note.length).toBeGreaterThan(10);
      }
    });

    it("names an owner for every outstanding artifact", () => {
      for (const control of DEFAULT_POLICY.controls) {
        if (!controlApplies(control, initiative)) continue;
        expect(initiative.evidence[control.id].owner.length).toBeGreaterThan(0);
      }
    });

    it("scores within range", () => {
      const { score } = scoreInitiative(initiative);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("flags an unbaselined KPI honestly", () => {
      if (!initiative.kpi.isBaselined) {
        // An initiative with no measured starting point cannot claim its
        // KPI baseline control is approved.
        expect(initiative.evidence["kpi-baseline"].state).not.toBe("approved");
      }
    });
  });

  it("keeps the portfolio spread across the delivery path", () => {
    const stages = new Set(portfolio.map((initiative) => initiative.stage));
    expect(stages.size).toBeGreaterThanOrEqual(4);
  });

  it("contains at least one live initiative and at least one blocked one", () => {
    expect(
      portfolio.some((initiative) => initiative.stage === "Production"),
    ).toBe(true);
    expect(portfolio.some((initiative) => initiative.stage === "Intake")).toBe(
      true,
    );
  });
});
