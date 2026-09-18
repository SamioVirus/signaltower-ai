import { describe, expect, it } from "vitest";

import { evidenceMatrix } from "@/engine/gates";
import {
  DEFAULT_POLICY,
  controlById,
  nextStage,
  stageIndex,
} from "@/engine/policy";
import { CONTROL_IDS, STAGES } from "@/engine/types";
import type { ControlId } from "@/engine/types";

import { makeInitiative } from "./factory";

describe("stage ordering", () => {
  it("indexes stages in delivery order", () => {
    expect(stageIndex("Intake")).toBe(0);
    expect(stageIndex("Monitoring")).toBe(STAGES.length - 1);
    expect(stageIndex("Pilot")).toBeLessThan(stageIndex("Production"));
  });

  it("walks forward one stage at a time", () => {
    expect(nextStage("Intake")).toBe("Prioritized");
    expect(nextStage("Production")).toBe("Monitoring");
  });

  it("returns null past the end of the path", () => {
    expect(nextStage("Monitoring")).toBeNull();
  });
});

describe("controlById", () => {
  it("finds every control the catalogue declares", () => {
    for (const id of CONTROL_IDS) {
      expect(controlById(DEFAULT_POLICY, id).id).toBe(id);
    }
  });

  it("throws rather than returning undefined for an unknown id", () => {
    expect(() =>
      controlById(DEFAULT_POLICY, "not-a-control" as ControlId),
    ).toThrow(/Unknown control/);
  });
});

describe("policy shape", () => {
  it("declares a control for every id, with no duplicates", () => {
    const ids = DEFAULT_POLICY.controls.map((control) => control.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ids)).toEqual(new Set(CONTROL_IDS));
  });

  it("gives every control a positive weight in every tier", () => {
    for (const control of DEFAULT_POLICY.controls) {
      for (const weight of Object.values(control.weight)) {
        expect(weight).toBeGreaterThan(0);
      }
    }
  });

  it("gives every control a remediation with a real cost and owner", () => {
    for (const control of DEFAULT_POLICY.controls) {
      expect(control.remediation.effortDays).toBeGreaterThan(0);
      expect(control.remediation.action.length).toBeGreaterThan(10);
      expect(control.remediation.owningFunction.length).toBeGreaterThan(0);
    }
  });

  it("weights model risk more heavily as the risk tier rises", () => {
    // The policy's central claim: tier changes what the evidence is worth.
    const modelRisk = controlById(DEFAULT_POLICY, "model-risk");
    expect(modelRisk.weight.Low).toBeLessThan(modelRisk.weight.Moderate);
    expect(modelRisk.weight.Moderate).toBeLessThan(modelRisk.weight.High);
    expect(modelRisk.weight.High).toBeLessThan(modelRisk.weight.Restricted);
  });
});

describe("evidenceMatrix", () => {
  it("returns one row per applicable control", () => {
    const rows = evidenceMatrix(makeInitiative());
    // The base initiative is neither agentic nor vendor-dependent.
    expect(rows).toHaveLength(CONTROL_IDS.length - 2);
    expect(rows.every((row) => row.state !== "not_applicable")).toBe(true);
  });

  it("widens once a conditional control applies", () => {
    const agentic = makeInitiative({
      model: {
        ...makeInitiative().model,
        isAgentic: true,
        vendorDependency: "High",
      },
    });
    expect(evidenceMatrix(agentic)).toHaveLength(CONTROL_IDS.length);
  });
});
