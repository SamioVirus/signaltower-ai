import { describe, expect, it } from "vitest";

import {
  ageFactor,
  blockerPatterns,
  deriveBlockers,
  deriveGaps,
  isBlocked,
  primaryBlocker,
} from "@/engine/blockers";
import { DEFAULT_POLICY } from "@/engine/policy";

import {
  fullyApproved,
  makeInitiative,
  nothingDone,
  withEvidence,
} from "./factory";

describe("ageFactor", () => {
  it("is 1 for fresh evidence", () => {
    expect(ageFactor(0)).toBe(1);
  });

  it("saturates at 2 and never exceeds it", () => {
    expect(ageFactor(DEFAULT_POLICY.ageSaturationDays)).toBe(2);
    expect(ageFactor(DEFAULT_POLICY.ageSaturationDays * 10)).toBe(2);
  });

  it("clamps negative ages to the floor", () => {
    expect(ageFactor(-40)).toBe(1);
  });

  it("increases monotonically up to saturation", () => {
    expect(ageFactor(30)).toBeLessThan(ageFactor(90));
    expect(ageFactor(90)).toBeLessThan(ageFactor(170));
  });
});

describe("deriveBlockers", () => {
  it("is empty when the next gate passes", () => {
    const initiative = fullyApproved();
    expect(deriveBlockers(initiative)).toHaveLength(0);
    expect(isBlocked(initiative)).toBe(false);
    expect(primaryBlocker(initiative)).toBeNull();
  });

  it("is empty at the end of the path", () => {
    expect(deriveBlockers(nothingDone({ stage: "Monitoring" }))).toHaveLength(
      0,
    );
  });

  it("only reports controls the next gate requires", () => {
    // In Pilot, model-risk is gated at Production Ready: not a blocker yet.
    const initiative = withEvidence(fullyApproved({ stage: "Pilot" }), {
      "model-risk": "missing",
    });
    expect(deriveBlockers(initiative)).toHaveLength(0);
  });

  it("sorts by severity, worst first", () => {
    const severities = deriveBlockers(
      nothingDone({ stage: "Control Review" }),
    ).map((blocker) => blocker.severity);
    expect([...severities].sort((a, b) => b - a)).toEqual(severities);
  });

  it("ranks a heavier control above a lighter one at equal shortfall and age", () => {
    const initiative = withEvidence(
      fullyApproved({ stage: "Control Review" }),
      {
        "model-risk": "missing",
        "value-tracking": "missing",
      },
    );
    // model-risk outweighs value-tracking at Moderate risk.
    expect(primaryBlocker(initiative)?.controlId).toBe("model-risk");
  });

  it("ranks older evidence above newer at equal weight and shortfall", () => {
    const base = withEvidence(fullyApproved({ stage: "Control Review" }), {
      "security-review": "missing",
      "privacy-review": "missing",
    });
    const initiative = {
      ...base,
      evidence: {
        ...base.evidence,
        "security-review": { ...base.evidence["security-review"], ageDays: 5 },
        "privacy-review": { ...base.evidence["privacy-review"], ageDays: 170 },
      },
    };

    const blockers = deriveBlockers(initiative);
    const security = blockers.find(
      (blocker) => blocker.controlId === "security-review",
    );
    const privacy = blockers.find(
      (blocker) => blocker.controlId === "privacy-review",
    );

    // Security carries the heavier weight, so age has to be doing the work
    // here: the much older privacy item must still come out ahead.
    expect(privacy?.severity).toBeGreaterThan(security?.severity ?? 0);
  });

  it("marks every next-gate blocker as blocking now", () => {
    expect(
      deriveBlockers(nothingDone({ stage: "Pilot" })).every(
        (blocker) => blocker.blocksNextGate,
      ),
    ).toBe(true);
  });
});

describe("deriveGaps", () => {
  it("includes controls that only bite at a later gate", () => {
    const initiative = withEvidence(fullyApproved({ stage: "Pilot" }), {
      "model-risk": "missing",
    });

    expect(deriveBlockers(initiative)).toHaveLength(0);
    expect(deriveGaps(initiative).map((gap) => gap.controlId)).toEqual([
      "model-risk",
    ]);
    expect(deriveGaps(initiative)[0].blocksNextGate).toBe(false);
  });

  it("is a superset of the next-gate blockers", () => {
    const initiative = nothingDone({ stage: "Intake" });
    const blockers = new Set(
      deriveBlockers(initiative).map((blocker) => blocker.controlId),
    );
    const gaps = new Set(deriveGaps(initiative).map((gap) => gap.controlId));

    for (const id of blockers) expect(gaps.has(id)).toBe(true);
    expect(gaps.size).toBeGreaterThan(blockers.size);
  });

  it("is empty once everything is approved", () => {
    expect(deriveGaps(fullyApproved())).toHaveLength(0);
  });
});

describe("blockerPatterns", () => {
  const blockedOn = (id: string, control: "lineage" | "monitoring") =>
    withEvidence(fullyApproved({ id, stage: "Pilot" }), {
      [control]: "missing",
    });

  it("groups the same control across initiatives", () => {
    const patterns = blockerPatterns([
      blockedOn("A", "lineage"),
      blockedOn("B", "lineage"),
      blockedOn("C", "monitoring"),
    ]);

    const lineage = patterns.find((pattern) => pattern.controlId === "lineage");
    expect(lineage?.count).toBe(2);
    expect(lineage?.initiativeIds).toEqual(["A", "B"]);
  });

  it("sums the value sitting behind each control", () => {
    const patterns = blockerPatterns([
      withEvidence(fullyApproved({ id: "A", annualValueUsd: 1_000_000 }), {
        lineage: "missing",
      }),
      withEvidence(fullyApproved({ id: "B", annualValueUsd: 500_000 }), {
        lineage: "missing",
      }),
    ]);

    expect(patterns[0].valueTrappedUsd).toBe(1_500_000);
  });

  describe("systemic classification", () => {
    it("fires once enough initiatives are blocked right now", () => {
      // Three initiatives in Pilot, all blocked at the Control Review gate.
      const portfolio = ["A", "B", "C"].map((id) =>
        withEvidence(fullyApproved({ id, stage: "Pilot" }), {
          lineage: "missing",
        }),
      );
      const lineage = blockerPatterns(portfolio).find(
        (pattern) => pattern.controlId === "lineage",
      );

      expect(lineage?.blockingNowCount).toBe(3);
      expect(lineage?.isSystemic).toBe(true);
    });

    it("does not fire below the threshold", () => {
      const portfolio = ["A", "B"].map((id) =>
        withEvidence(fullyApproved({ id, stage: "Pilot" }), {
          lineage: "missing",
        }),
      );
      expect(
        blockerPatterns(portfolio).find(
          (pattern) => pattern.controlId === "lineage",
        )?.isSystemic,
      ).toBe(false);
    });

    it("does not fire on controls that are merely outstanding later", () => {
      // Three initiatives need model risk eventually, but none is blocked on
      // it now. A template is not yet the urgent call.
      const portfolio = ["A", "B", "C"].map((id) =>
        withEvidence(fullyApproved({ id, stage: "Pilot" }), {
          "model-risk": "missing",
        }),
      );
      const pattern = blockerPatterns(portfolio).find(
        (candidate) => candidate.controlId === "model-risk",
      );

      expect(pattern?.count).toBe(3);
      expect(pattern?.blockingNowCount).toBe(0);
      expect(pattern?.isSystemic).toBe(false);
    });
  });

  it("returns nothing for a clean portfolio", () => {
    expect(
      blockerPatterns([fullyApproved({ id: "A" }), fullyApproved({ id: "B" })]),
    ).toHaveLength(0);
  });

  it("sorts by value trapped, descending", () => {
    const values = blockerPatterns([
      withEvidence(fullyApproved({ id: "A", annualValueUsd: 100_000 }), {
        lineage: "missing",
      }),
      withEvidence(fullyApproved({ id: "B", annualValueUsd: 900_000 }), {
        monitoring: "missing",
      }),
    ]).map((pattern) => pattern.valueTrappedUsd);

    expect([...values].sort((a, b) => b - a)).toEqual(values);
  });
});

describe("initiative shape", () => {
  it("does not mutate the initiative it is given", () => {
    const initiative = makeInitiative();
    const snapshot = JSON.stringify(initiative);
    deriveBlockers(initiative);
    deriveGaps(initiative);
    blockerPatterns([initiative]);

    expect(JSON.stringify(initiative)).toBe(snapshot);
  });
});
