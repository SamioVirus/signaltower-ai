import { describe, expect, it } from "vitest";

import { confidenceFromReadiness, rankDecisions } from "@/engine/decisions";

import { fullyApproved, makeInitiative, withEvidence } from "./factory";

const blockedOn = (
  id: string,
  control: "lineage" | "monitoring" | "security-review",
  annualValueUsd = 1_000_000,
) =>
  withEvidence(fullyApproved({ id, annualValueUsd, stage: "Pilot" }), {
    [control]: "missing",
  });

describe("confidenceFromReadiness", () => {
  it("rises with readiness", () => {
    expect(confidenceFromReadiness(20)).toBeLessThan(
      confidenceFromReadiness(80),
    );
  });

  it("stays inside its bounds", () => {
    expect(confidenceFromReadiness(0)).toBeGreaterThanOrEqual(0.3);
    expect(confidenceFromReadiness(100)).toBeLessThanOrEqual(0.95);
  });
});

describe("rankDecisions", () => {
  it("returns nothing for a portfolio with no blockers", () => {
    expect(
      rankDecisions([fullyApproved({ id: "A" }), fullyApproved({ id: "B" })]),
    ).toHaveLength(0);
  });

  it("is deterministic", () => {
    const portfolio = [
      blockedOn("A", "lineage"),
      blockedOn("B", "monitoring", 2_000_000),
    ];
    expect(rankDecisions(portfolio)).toEqual(rankDecisions(portfolio));
  });

  it("sorts by score, descending", () => {
    const scores = rankDecisions([
      blockedOn("A", "lineage", 4_000_000),
      blockedOn("B", "monitoring", 200_000),
      blockedOn("C", "security-review", 900_000),
    ]).map((decision) => decision.score);

    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("ranks a higher-value initiative above an identical lower-value one", () => {
    const decisions = rankDecisions([
      blockedOn("SMALL", "lineage", 100_000),
      blockedOn("BIG", "lineage", 5_000_000),
    ]);

    expect(decisions[0].initiativeIds).toContain("BIG");
  });

  describe("systemic decisions", () => {
    const systemicPortfolio = ["A", "B", "C"].map((id) =>
      blockedOn(id, "lineage"),
    );

    it("raises one systemic decision when a control blocks several initiatives", () => {
      const systemic = rankDecisions(systemicPortfolio).filter(
        (decision) => decision.kind === "systemic",
      );

      expect(systemic).toHaveLength(1);
      expect(systemic[0].controlIds).toEqual(["lineage"]);
      expect(systemic[0].initiativeIds).toHaveLength(3);
    });

    it("does not also raise the same work as individual decisions", () => {
      // The whole point is to buy the remediation once. Proposing it three
      // more times would double-count the same effort in the queue.
      const decisions = rankDecisions(systemicPortfolio);
      const individual = decisions.filter(
        (decision) => decision.kind === "initiative",
      );

      expect(individual).toHaveLength(0);
      expect(decisions).toHaveLength(1);
    });

    it("still raises individual decisions for the initiative's other blockers", () => {
      const portfolio = [
        ...systemicPortfolio,
        withEvidence(fullyApproved({ id: "D", stage: "Pilot" }), {
          lineage: "missing",
          "security-review": "missing",
        }),
      ];
      const decisions = rankDecisions(portfolio);
      const forD = decisions.find((decision) => decision.id === "initiative:D");

      expect(forD).toBeDefined();
      expect(forD?.controlIds).toEqual(["security-review"]);
      expect(forD?.controlIds).not.toContain("lineage");
    });

    it("costs less than remediating every initiative separately", () => {
      const systemic = rankDecisions(systemicPortfolio)[0];
      expect(systemic.effortDays).toBeLessThan(
        systemic.explanation.effortIfDoneSeparatelyDays,
      );
    });

    it("carries the summed value of everything it unblocks", () => {
      const portfolio = ["A", "B", "C"].map((id, index) =>
        blockedOn(id, "lineage", (index + 1) * 1_000_000),
      );
      const systemic = rankDecisions(portfolio)[0];

      expect(systemic.valueUnlockedUsd).toBe(6_000_000);
      expect(systemic.explanation.leverage).toBeGreaterThan(1);
    });
  });

  describe("explanation", () => {
    it("exposes every input that produced the score", () => {
      const decision = rankDecisions([blockedOn("A", "lineage")])[0];

      expect(decision.explanation.valueUnlockedUsd).toBeGreaterThan(0);
      expect(decision.explanation.effortDays).toBeGreaterThan(0);
      expect(decision.explanation.confidence).toBeGreaterThan(0);
      expect(decision.explanation.urgency).toBeGreaterThanOrEqual(1);
      expect(decision.explanation.leverage).toBeGreaterThanOrEqual(1);
    });

    it("keeps effortWeeks consistent with effortDays", () => {
      const decision = rankDecisions([blockedOn("A", "lineage")])[0];
      expect(decision.explanation.effortWeeks).toBeCloseTo(
        decision.explanation.effortDays / 5,
        6,
      );
    });
  });

  it("does not mutate the portfolio", () => {
    const portfolio = [blockedOn("A", "lineage"), blockedOn("B", "monitoring")];
    const snapshot = JSON.stringify(portfolio);
    rankDecisions(portfolio);

    expect(JSON.stringify(portfolio)).toBe(snapshot);
  });

  it("gives an older initiative more urgency than an identical fresh one", () => {
    const fresh = withEvidence(
      fullyApproved({ id: "FRESH", stage: "Pilot", stageAgeDays: 1 }),
      {
        lineage: "missing",
      },
    );
    const stale = withEvidence(
      fullyApproved({ id: "STALE", stage: "Pilot", stageAgeDays: 170 }),
      {
        lineage: "missing",
      },
    );

    const decisions = rankDecisions([fresh, stale]);
    const freshUrgency = decisions.find((d) => d.id === "initiative:FRESH")
      ?.explanation.urgency;
    const staleUrgency = decisions.find((d) => d.id === "initiative:STALE")
      ?.explanation.urgency;

    expect(staleUrgency).toBeGreaterThan(freshUrgency ?? 0);
  });

  describe("horizon", () => {
    it("is immediate for urgent, cheap work", () => {
      // sponsor costs 2 days; a long-stalled initiative is urgent.
      const initiative = withEvidence(
        fullyApproved({ id: "A", stage: "Intake", stageAgeDays: 200 }),
        { sponsor: "missing" },
      );
      expect(rankDecisions([initiative])[0].horizon).toBe("This week");
    });

    it("stretches out as the remediation gets more expensive", () => {
      // model-risk 20d + human-oversight 8d + monitoring 10d = 38 days.
      const initiative = withEvidence(
        fullyApproved({ id: "A", stage: "Control Review", stageAgeDays: 5 }),
        {
          "model-risk": "missing",
          "human-oversight": "missing",
          monitoring: "missing",
        },
      );
      expect(rankDecisions([initiative])[0].horizon).toBe("This quarter");
    });
  });

  it("describes sub-million value without rounding it to zero", () => {
    // The systemic rationale formats its own currency; small portfolios must
    // read as thousands rather than "$0.0M".
    const portfolio = ["A", "B", "C"].map((id) =>
      withEvidence(
        fullyApproved({ id, stage: "Pilot", annualValueUsd: 40_000 }),
        {
          lineage: "missing",
        },
      ),
    );
    const systemic = rankDecisions(portfolio).find(
      (decision) => decision.kind === "systemic",
    );

    expect(systemic?.rationale).toContain("$120K");
  });

  it("assigns a horizon to every decision", () => {
    const decisions = rankDecisions([
      blockedOn("A", "lineage"),
      makeInitiative({ id: "B", evidence: fullyApproved().evidence }),
    ]);

    for (const decision of decisions) {
      expect(decision.horizon).toBeTruthy();
    }
  });
});
