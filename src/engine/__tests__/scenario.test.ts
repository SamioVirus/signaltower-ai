import { describe, expect, it } from "vitest";

import { scoreInitiative } from "@/engine/readiness";
import {
  advanceInitiative,
  applyScenario,
  emptyScenario,
  hasAction,
  scenarioEffortDays,
  toggleAction,
} from "@/engine/scenario";

import { fullyApproved, nothingDone, withEvidence } from "./factory";

describe("toggleAction", () => {
  const action = { initiativeId: "A", controlId: "lineage" } as const;

  it("adds an action that is not present", () => {
    const scenario = toggleAction(emptyScenario(), action);
    expect(hasAction(scenario, action)).toBe(true);
    expect(scenario.actions).toHaveLength(1);
  });

  it("removes an action that is present", () => {
    const scenario = toggleAction(
      toggleAction(emptyScenario(), action),
      action,
    );
    expect(hasAction(scenario, action)).toBe(false);
    expect(scenario.actions).toHaveLength(0);
  });

  it("keeps actions for other initiatives distinct", () => {
    const scenario = toggleAction(toggleAction(emptyScenario(), action), {
      initiativeId: "B",
      controlId: "lineage",
    });

    expect(scenario.actions).toHaveLength(2);
  });

  it("does not mutate the scenario it is given", () => {
    const original = emptyScenario();
    toggleAction(original, action);
    expect(original.actions).toHaveLength(0);
  });
});

describe("applyScenario", () => {
  it("returns the portfolio unchanged for an empty scenario", () => {
    const portfolio = [nothingDone({ id: "A" })];
    expect(applyScenario(portfolio, emptyScenario())).toEqual(portfolio);
  });

  it("raises readiness when a control is approved", () => {
    const initiative = withEvidence(nothingDone({ id: "A" }), {});
    const before = scoreInitiative(initiative).score;

    const [after] = applyScenario([initiative], {
      actions: [{ initiativeId: "A", controlId: "security-review" }],
    });

    expect(scoreInitiative(after).score).toBeGreaterThan(before);
  });

  it("does not mutate the input portfolio", () => {
    const portfolio = [nothingDone({ id: "A" })];
    const snapshot = JSON.stringify(portfolio);

    applyScenario(portfolio, {
      actions: [{ initiativeId: "A", controlId: "lineage" }],
    });

    expect(JSON.stringify(portfolio)).toBe(snapshot);
  });

  it("ignores actions for initiatives that are not in the portfolio", () => {
    const portfolio = [nothingDone({ id: "A" })];
    const result = applyScenario(portfolio, {
      actions: [{ initiativeId: "GHOST", controlId: "lineage" }],
    });

    expect(result).toEqual(portfolio);
  });

  it("advances exactly one stage when only that gate is satisfied", () => {
    // lineage blocks Control Review; model-risk still blocks Production Ready.
    const initiative = withEvidence(
      fullyApproved({ id: "A", stage: "Pilot" }),
      {
        lineage: "missing",
        "model-risk": "missing",
      },
    );
    expect(initiative.stage).toBe("Pilot");

    const [after] = applyScenario([initiative], {
      actions: [{ initiativeId: "A", controlId: "lineage" }],
    });

    expect(after.stage).toBe("Control Review");
  });

  it("advances as far as the evidence allows, not just one stage", () => {
    const initiative = withEvidence(
      fullyApproved({ id: "A", stage: "Pilot" }),
      {
        lineage: "missing",
      },
    );

    const [after] = applyScenario([initiative], {
      actions: [{ initiativeId: "A", controlId: "lineage" }],
    });

    expect(after.stage).toBe("Production Ready");
  });

  it("resets the stage clock on promotion", () => {
    const initiative = withEvidence(
      fullyApproved({ id: "A", stage: "Pilot", stageAgeDays: 90 }),
      {
        lineage: "missing",
      },
    );

    const [after] = applyScenario([initiative], {
      actions: [{ initiativeId: "A", controlId: "lineage" }],
    });

    expect(after.stageAgeDays).toBe(0);
  });
});

describe("advanceInitiative", () => {
  it("promotes through several stages at once when the evidence allows", () => {
    const initiative = fullyApproved({ stage: "Intake" });
    expect(advanceInitiative(initiative).stage).toBe("Production Ready");
  });

  it("stops at Production Ready: going live is a release, not an artifact", () => {
    const initiative = fullyApproved({ stage: "Production Ready" });
    expect(advanceInitiative(initiative).stage).toBe("Production Ready");
  });

  it("leaves an already live initiative alone", () => {
    const initiative = fullyApproved({ stage: "Monitoring" });
    expect(advanceInitiative(initiative).stage).toBe("Monitoring");
  });

  it("does not promote when a gate fails", () => {
    const initiative = withEvidence(fullyApproved({ stage: "Pilot" }), {
      lineage: "missing",
    });
    expect(advanceInitiative(initiative).stage).toBe("Pilot");
  });

  it("terminates rather than looping on a fully approved initiative", () => {
    // Guards the promotion loop against an off-by-one that would spin forever.
    const initiative = fullyApproved({ stage: "Intake" });
    expect(() => advanceInitiative(initiative)).not.toThrow();
  });
});

describe("scenarioEffortDays", () => {
  it("is zero for an empty scenario", () => {
    expect(
      scenarioEffortDays([nothingDone({ id: "A" })], emptyScenario()),
    ).toBe(0);
  });

  it("sums the remediation effort of the chosen controls", () => {
    const total = scenarioEffortDays([nothingDone({ id: "A" })], {
      actions: [
        { initiativeId: "A", controlId: "sponsor" },
        { initiativeId: "A", controlId: "lineage" },
      ],
    });

    // sponsor 2d + lineage 10d, straight from the policy.
    expect(total).toBe(12);
  });

  it("skips actions for unknown initiatives", () => {
    expect(
      scenarioEffortDays([nothingDone({ id: "A" })], {
        actions: [{ initiativeId: "GHOST", controlId: "lineage" }],
      }),
    ).toBe(0);
  });
});
