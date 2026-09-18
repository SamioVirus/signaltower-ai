import { describe, expect, it } from "vitest";

import { DEFAULT_POLICY } from "@/engine/policy";
import {
  applicableControls,
  bandForScore,
  effectiveState,
  scoreInitiative,
  scorePortfolio,
} from "@/engine/readiness";
import type { ScoringPolicy } from "@/engine/types";

import {
  fullyApproved,
  makeInitiative,
  nothingDone,
  withEvidence,
} from "./factory";

describe("scoreInitiative", () => {
  it("scores a fully approved initiative at 100", () => {
    expect(scoreInitiative(fullyApproved()).score).toBe(100);
  });

  it("scores an initiative with no evidence at 0", () => {
    expect(scoreInitiative(nothingDone()).score).toBe(0);
  });

  it("places partial evidence between the two extremes", () => {
    const partial = scoreInitiative(
      withEvidence(nothingDone(), {
        sponsor: "approved",
        "kpi-baseline": "partial",
      }),
    ).score;

    expect(partial).toBeGreaterThan(0);
    expect(partial).toBeLessThan(100);
  });

  it("orders states by the credit they earn", () => {
    const base = nothingDone();
    const scoreFor = (
      state: "missing" | "in_progress" | "partial" | "approved",
    ) =>
      scoreInitiative(withEvidence(base, { "security-review": state })).score;

    expect(scoreFor("missing")).toBeLessThan(scoreFor("in_progress"));
    expect(scoreFor("in_progress")).toBeLessThan(scoreFor("partial"));
    expect(scoreFor("partial")).toBeLessThan(scoreFor("approved"));
  });

  describe("inapplicable controls", () => {
    it("excludes them from the denominator rather than granting a free pass", () => {
      // Identical evidence; one workflow is agentic and one is not. The
      // non-agentic one must not score higher merely because a control that
      // never applied to it is absent.
      const agentic = withEvidence(
        makeInitiative({
          model: { ...makeInitiative().model, isAgentic: true },
        }),
        { "agentic-controls": "approved" },
      );
      const plain = makeInitiative({
        model: { ...makeInitiative().model, isAgentic: false },
      });

      expect(scoreInitiative(agentic).score).toBe(100);
      expect(scoreInitiative(plain).score).toBe(100);
    });

    it("penalises an agentic workflow that lacks agentic controls", () => {
      const agentic = withEvidence(
        makeInitiative({
          model: { ...makeInitiative().model, isAgentic: true },
        }),
        { "agentic-controls": "missing" },
      );
      const plain = makeInitiative();

      expect(scoreInitiative(agentic).score).toBeLessThan(
        scoreInitiative(plain).score,
      );
    });

    it("ignores a stored state on a control that does not apply", () => {
      // A non-agentic initiative carrying a stale, missing agentic artifact
      // must score exactly as if the artifact were not there.
      const stale = withEvidence(makeInitiative(), {
        "agentic-controls": "missing",
      });
      expect(scoreInitiative(stale).score).toBe(100);
      expect(effectiveState(stale, DEFAULT_POLICY.controls[11])).toBe(
        "not_applicable",
      );
    });

    it("reports which controls were excluded", () => {
      const result = scoreInitiative(makeInitiative());
      expect(result.notApplicable).toContain("agentic-controls");
      expect(result.notApplicable).toContain("vendor-risk");
      expect(result.applicable).not.toContain("agentic-controls");
    });

    it("includes vendor risk once a third party is in the path", () => {
      const withVendor = makeInitiative({
        model: { ...makeInitiative().model, vendorDependency: "High" },
      });
      expect(scoreInitiative(withVendor).applicable).toContain("vendor-risk");
    });
  });

  describe("risk-tier weighting", () => {
    it("costs more to miss model risk on a high-risk initiative", () => {
      const low = withEvidence(makeInitiative({ riskTier: "Low" }), {
        "model-risk": "missing",
      });
      const high = withEvidence(makeInitiative({ riskTier: "High" }), {
        "model-risk": "missing",
      });

      expect(scoreInitiative(high).score).toBeLessThan(
        scoreInitiative(low).score,
      );
    });
  });

  describe("explainability", () => {
    it("has contributions that sum to the score", () => {
      const initiative = withEvidence(makeInitiative(), {
        "model-risk": "in_progress",
        lineage: "partial",
        monitoring: "missing",
      });
      const result = scoreInitiative(initiative);
      const summed = result.contributions.reduce(
        (total, contribution) => total + contribution.pointsEarned,
        0,
      );

      expect(summed).toBeCloseTo(result.score, 0);
    });

    it("has available points that sum to 100", () => {
      const result = scoreInitiative(nothingDone());
      const available = result.contributions.reduce(
        (total, contribution) => total + contribution.pointsAvailable,
        0,
      );

      expect(available).toBeCloseTo(100, 6);
    });

    it("sorts contributions by the points each one is costing", () => {
      const result = scoreInitiative(
        withEvidence(makeInitiative(), {
          "model-risk": "missing",
          sponsor: "partial",
        }),
      );
      const lost = result.contributions.map(
        (contribution) => contribution.pointsLost,
      );

      expect([...lost].sort((a, b) => b - a)).toEqual(lost);
      expect(result.contributions[0].controlId).toBe("model-risk");
    });
  });

  it("returns 0 rather than NaN when no control applies", () => {
    const emptyPolicy: ScoringPolicy = { ...DEFAULT_POLICY, controls: [] };
    const result = scoreInitiative(makeInitiative(), emptyPolicy);

    expect(result.score).toBe(0);
    expect(Number.isNaN(result.score)).toBe(false);
    expect(result.contributions).toHaveLength(0);
  });

  it("treats a missing evidence entry as missing, not as approved", () => {
    const initiative = makeInitiative();
    const evidence = { ...initiative.evidence };
    delete (evidence as Record<string, unknown>)["monitoring"];

    const result = scoreInitiative({ ...initiative, evidence });
    expect(result.score).toBeLessThan(100);
  });
});

describe("applicableControls", () => {
  it("drops controls whose predicate is false", () => {
    const ids = applicableControls(makeInitiative()).map(
      (control) => control.id,
    );
    expect(ids).not.toContain("vendor-risk");
    expect(ids).not.toContain("agentic-controls");
  });
});

describe("bandForScore", () => {
  it.each([
    [100, "Production ready"],
    [90, "Production ready"],
    [89, "Production candidate"],
    [80, "Production candidate"],
    [79, "Reviewable"],
    [60, "Reviewable"],
    [59, "Needs remediation"],
    [40, "Needs remediation"],
    [39, "Not ready"],
    [0, "Not ready"],
  ])("maps %i to %s", (score, band) => {
    expect(bandForScore(score)).toBe(band);
  });
});

describe("scorePortfolio", () => {
  it("keys results by initiative id", () => {
    const scores = scorePortfolio([
      makeInitiative({ id: "A" }),
      nothingDone({ id: "B" }),
    ]);

    expect(scores.get("A")?.score).toBe(100);
    expect(scores.get("B")?.score).toBe(0);
  });
});
