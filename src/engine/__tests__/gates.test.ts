import { describe, expect, it } from "vitest";

import {
  controlDebt,
  evaluateAllGates,
  evaluateGate,
  gateRequirements,
  hasControlDebt,
  isLive,
  isProductionReady,
  nextGate,
  outstandingControls,
} from "@/engine/gates";
import { stageIndex } from "@/engine/policy";
import { STAGES } from "@/engine/types";

import {
  fullyApproved,
  makeInitiative,
  nothingDone,
  withEvidence,
} from "./factory";

describe("gateRequirements", () => {
  it("grows monotonically as the target stage advances", () => {
    const initiative = makeInitiative();
    const counts = STAGES.map(
      (stage) => gateRequirements(initiative, stage).length,
    );

    for (let i = 1; i < counts.length; i += 1) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    }
  });

  it("does not require a control before the stage that gates it", () => {
    const initiative = makeInitiative();
    for (const stage of STAGES) {
      for (const control of gateRequirements(initiative, stage)) {
        expect(stageIndex(control.gate)).toBeLessThanOrEqual(stageIndex(stage));
      }
    }
  });

  it("excludes controls that do not apply to the initiative", () => {
    const ids = gateRequirements(makeInitiative(), "Production Ready").map(
      (control) => control.id,
    );
    expect(ids).not.toContain("agentic-controls");
  });

  it("includes agentic controls from the Pilot gate for an agentic workflow", () => {
    const agentic = makeInitiative({
      model: { ...makeInitiative().model, isAgentic: true },
    });
    const ids = gateRequirements(agentic, "Pilot").map((control) => control.id);
    expect(ids).toContain("agentic-controls");
  });
});

describe("evaluateGate", () => {
  it("passes when every required control is approved", () => {
    const verdict = evaluateGate(fullyApproved(), "Production Ready");
    expect(verdict.passed).toBe(true);
    expect(verdict.blocking).toHaveLength(0);
  });

  it("fails and names the blocking controls", () => {
    const initiative = withEvidence(fullyApproved(), { lineage: "partial" });
    const verdict = evaluateGate(initiative, "Control Review");

    expect(verdict.passed).toBe(false);
    expect(verdict.blocking.map((control) => control.id)).toEqual(["lineage"]);
  });

  it("treats partial evidence as not approved", () => {
    const initiative = withEvidence(fullyApproved(), {
      "security-review": "partial",
    });
    expect(evaluateGate(initiative, "Control Review").passed).toBe(false);
  });

  it("splits required controls into satisfied and blocking with no overlap", () => {
    const initiative = withEvidence(fullyApproved(), { monitoring: "missing" });
    const verdict = evaluateGate(initiative, "Production Ready");

    expect(verdict.satisfied.length + verdict.blocking.length).toBe(
      verdict.required.length,
    );
    const satisfiedIds = new Set(
      verdict.satisfied.map((control) => control.id),
    );
    expect(
      verdict.blocking.every((control) => !satisfiedIds.has(control.id)),
    ).toBe(true);
  });
});

describe("nextGate", () => {
  it("targets the stage after the current one", () => {
    expect(nextGate(makeInitiative({ stage: "Pilot" }))?.targetStage).toBe(
      "Control Review",
    );
  });

  it("returns null at the end of the path", () => {
    expect(nextGate(makeInitiative({ stage: "Monitoring" }))).toBeNull();
  });
});

describe("evaluateAllGates", () => {
  it("returns one verdict per stage", () => {
    expect(evaluateAllGates(makeInitiative())).toHaveLength(STAGES.length);
  });
});

describe("controlDebt", () => {
  it("is empty when the initiative qualified for the stage it is in", () => {
    expect(
      controlDebt(fullyApproved({ stage: "Control Review" })),
    ).toHaveLength(0);
    expect(hasControlDebt(fullyApproved({ stage: "Control Review" }))).toBe(
      false,
    );
  });

  it("detects evidence skipped on the way into the current stage", () => {
    // Sitting in Control Review without the lineage that entering it required.
    const initiative = withEvidence(
      fullyApproved({ stage: "Control Review" }),
      {
        lineage: "missing",
      },
    );

    expect(controlDebt(initiative).map((control) => control.id)).toContain(
      "lineage",
    );
    expect(hasControlDebt(initiative)).toBe(true);
  });

  it("does not count controls that a later stage will require", () => {
    // model-risk is gated at Production Ready, so an initiative in Pilot
    // without it carries no debt yet.
    const initiative = withEvidence(fullyApproved({ stage: "Pilot" }), {
      "model-risk": "missing",
    });

    expect(controlDebt(initiative)).toHaveLength(0);
  });
});

describe("outstandingControls", () => {
  it("is a superset of what blocks the next gate", () => {
    const initiative = nothingDone({ stage: "Intake" });
    const blocking = new Set(
      nextGate(initiative)?.blocking.map((control) => control.id) ?? [],
    );
    const outstanding = new Set(
      outstandingControls(initiative).map((control) => control.id),
    );

    for (const id of blocking) expect(outstanding.has(id)).toBe(true);
    expect(outstanding.size).toBeGreaterThan(blocking.size);
  });

  it("is empty once everything is approved", () => {
    expect(outstandingControls(fullyApproved())).toHaveLength(0);
  });
});

describe("stage predicates", () => {
  it.each([
    ["Intake", false, false],
    ["Pilot", false, false],
    ["Production Ready", true, false],
    ["Production", true, true],
    ["Monitoring", true, true],
  ] as const)("classifies %s", (stage, ready, live) => {
    const initiative = makeInitiative({ stage });
    expect(isProductionReady(initiative)).toBe(ready);
    expect(isLive(initiative)).toBe(live);
  });
});
